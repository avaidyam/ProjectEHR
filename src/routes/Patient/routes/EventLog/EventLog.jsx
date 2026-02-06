import React, { useState } from 'react';
import { Box, Stack, Button, Typography, Divider, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';
import { Icon } from 'components/ui/Core';
import { EventFilters } from './components/EventFilters';
import { EventList } from './components/EventList';
import { VitalsGraph } from './components/VitalsGraph';
import { CollapsiblePane } from './components/CollapsiblePane';

// Mock Data Generation
const generateMockEvents = () => {
  const now = new Date();

  const getRelativeDate = (hoursAgo = 0) => {
    const d = new Date(now);
    d.setHours(d.getHours() - hoursAgo);
    return d.toISOString();
  };

  return [
    {
      id: 1,
      category: 'results_lab',
      title: 'CBC w/diff',
      timestamp: getRelativeDate(0.5), // 30 mins ago
      details: 'Final | Collected: ' + getRelativeDate(1.25),
      tag: 'Abnormal',
      subItems: [
        { name: 'WBC', value: '6.08', unit: 'K/uL', history: [{ date: 'Yesterday', value: '5.9' }, { date: '2 days ago', value: '6.1' }] },
        { name: 'RBC', value: '4.08', unit: 'M/uL', history: [{ date: 'Yesterday', value: '4.1' }, { date: '2 days ago', value: '4.0' }] },
        { name: 'HGB', value: '11.6', unit: 'g/dL', history: [{ date: 'Yesterday', value: '11.8' }, { date: '2 days ago', value: '12.0' }] },
      ]
    },
    {
      id: 2,
      category: 'flowsheets',
      title: 'Vitals',
      timestamp: getRelativeDate(1), // 1 hour ago
      details: '',
      subItems: [
        { label: 'BP', value: '120/80' },
        { label: 'HR', value: '72' },
        { label: 'Temp', value: '37.0°C' },
      ]
    },
    {
      id: 3,
      category: 'mar_scheduled',
      title: 'Aspirin 81mg',
      timestamp: getRelativeDate(2), // 2 hours ago
      details: 'Given | Dose 81mg Oral',
    },
    {
      id: 4,
      category: 'notes',
      title: 'Progress Note',
      timestamp: getRelativeDate(2.5), // 2.5 hours ago
      details: 'Signed | Service: Cardiology',
    },
    {
      id: 5,
      category: 'results_lab',
      title: 'BMP',
      timestamp: getRelativeDate(24), // Yesterday
      details: 'Final | Collected: ' + getRelativeDate(25),
      subItems: [
        { name: 'Sodium', value: '138', unit: 'mmol/L', history: [{ date: '2 days ago', value: '139' }] },
        { name: 'Potassium', value: '4.2', unit: 'mmol/L', history: [{ date: '2 days ago', value: '4.1' }] },
      ]
    }
  ];
};

const MOCK_VITALS_DATA = [
  { time: new Date('2024-04-21T08:00:00'), hr: 72, bpSys: 120, bpDia: 80, temp: 37.0, spo2: 98 },
  { time: new Date('2024-04-21T09:00:00'), hr: 75, bpSys: 122, bpDia: 82, temp: 37.1, spo2: 97 },
  { time: new Date('2024-04-21T10:00:00'), hr: 70, bpSys: 118, bpDia: 78, temp: 36.9, spo2: 99 },
  { time: new Date('2024-04-21T11:00:00'), hr: 78, bpSys: 125, bpDia: 85, temp: 37.2, spo2: 96 },
  { time: new Date('2024-04-21T12:00:00'), hr: 74, bpSys: 121, bpDia: 81, temp: 37.0, spo2: 98 },
];

export const EventLog = () => {
  const [selectedFilters, setSelectedFilters] = useState([
    'flowsheets', 'ldas', 'mar', 'mar_scheduled', 'mar_continuous', 'mar_prn',
    'narrator', 'notes', 'notes_staff_progress', 'patient_movement',
    'results', 'results_ekg', 'results_imaging', 'results_lab', 'transfusions'
  ]);
  const [events] = useState(generateMockEvents());

  const filteredEvents = events.filter(e => selectedFilters.includes(e.category.toLowerCase()));

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">View by:</Typography>
          <ToggleButtonGroup exclusive disabled value="time" size="small">
            <ToggleButton value="time">Time</ToggleButton>
            <ToggleButton value="category">Category</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Divider orientation="vertical" flexItem variant="middle" />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">Event Data:</Typography>
          <TextField
            disabled
            variant="outlined"
            size="small"
            value={new Date().toLocaleDateString()}
            sx={{ width: 120 }}
            InputProps={{
              endAdornment: <Icon sx={{ fontSize: 16, ml: 1 }}>calendar_today</Icon>,
            }}
          />
          <Button
            disabled
            variant="outlined"
            size="small"
            startIcon={<Icon>vertical_align_top</Icon>}
          >
            Go to Now
          </Button>
        </Stack>
        <Box flexGrow={1} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">Graph Data:</Typography>
          <ToggleButtonGroup
            disabled
            value="1shift"
            exclusive
            size="small"
          >
            <ToggleButton value="1shift">1 Shift</ToggleButton>
            <ToggleButton value="2shifts">2 Shifts</ToggleButton>
            <ToggleButton value="24hours">24 Hours</ToggleButton>
            <ToggleButton value="36hours">36 Hours</ToggleButton>
          </ToggleButtonGroup>
          <Button
            disabled
            variant="outlined"
            size="small"
            endIcon={<Icon>arrow_drop_down</Icon>}
          >
            More Options
          </Button>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <CollapsiblePane width={280} side="left">
          <EventFilters
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </CollapsiblePane>
        <Stack sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
          <Box sx={{ height: '100%', width: '100%', overflowY: 'auto', pr: 1 }}>
            <EventList events={filteredEvents} />
          </Box>
        </Stack>
        <CollapsiblePane width={350} side="right">
          <VitalsGraph data={MOCK_VITALS_DATA} />
        </CollapsiblePane>
      </Stack>
    </Stack>
  );
};
