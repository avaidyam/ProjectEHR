import React, { useState, useMemo, useRef } from 'react';
import { Box, Stack, Button, Typography, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Icon } from 'components/ui/Core';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import { EventFilters } from './components/EventFilters';
import { EventList } from './components/EventList';
import { VitalsGraph } from './components/VitalsGraph';
import { CollapsiblePane } from './components/CollapsiblePane';

export const EventLog = () => {
  const eventListRef = useRef(null);
  const { useEncounter } = usePatient();
  const [notes] = useEncounter().notes();
  const [labs] = useEncounter().labs();
  const [imaging] = useEncounter().imaging();
  const [flowsheets] = useEncounter().flowsheets();
  const [flowsheetDefs] = useDatabase().flowsheets();
  const [providers] = useDatabase().providers();

  // Helper to look up provider name by ID
  const getProviderName = (providerId) => {
    const provider = (providers || []).find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const [selectedFilters, setSelectedFilters] = useState([
    'flowsheets', 'ldas', 'mar', 'mar_scheduled', 'mar_continuous', 'mar_prn',
    'narrator', 'notes', 'notes_staff_progress', 'patient_movement',
    'results', 'results_ekg', 'results_imaging', 'results_lab', 'transfusions'
  ]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Normalize Data
  const events = useMemo(() => {
    const allEvents = [];

    // Process Labs
    (labs || []).forEach(item => {
      allEvents.push({
        id: item.id || `lab - ${Math.random()} `,
        category: 'results_lab',
        title: item.test,
        timestamp: item.date, // ISO string expected
        details: `${item.status}`,
        tag: item.abnormal ? 'Abnormal' : undefined,
        author: getProviderName(item.provider) ?? "Unknown",
        subItems: []
      });
    });

    // Process Imaging
    (imaging || []).forEach(item => {
      allEvents.push({
        id: item.id || `img - ${Math.random()} `,
        category: 'results_imaging',
        title: item.test,
        timestamp: item.date,
        details: `${item.status} | ${item.acuity ?? 'Normal'} `,
        tag: item.abnormal ? 'Abnormal' : undefined,
        author: getProviderName(item.provider) ?? "Unknown",
        subItems: []
      });
    });

    // Process Notes
    (notes || []).forEach(item => {
      allEvents.push({
        id: item.id || `note - ${Math.random()} `,
        category: 'notes',
        title: item.summary,
        timestamp: item.serviceDate,
        details: `${item.status}`,
        author: getProviderName(item.authorName) ?? "Unknown",
        subItems: []
      });
    });

    // Process Flowsheets (Vitals)
    const flowsheetGroups = {};
    (flowsheets || []).forEach(item => {
      const timeKey = item.date;

      // Look up group definition
      const groupDef = (flowsheetDefs || []).find(g => g.id === item.flowsheet);
      const groupName = groupDef ? groupDef.name : item.flowsheet;

      if (!flowsheetGroups[timeKey]) {
        flowsheetGroups[timeKey] = {
          id: item.id,
          category: 'flowsheets',
          title: groupName,
          timestamp: item.date,
          details: '',
          author: 'Nurse, RN',
          subItems: []
        };
      }
      Object.keys(item).forEach(key => {
        if (['id', 'date', 'flowsheet'].includes(key)) return;
        let rowLabel = key;
        if (groupDef && groupDef.rows) {
          const rowDef = groupDef.rows.find(r => r.name === key);
          if (rowDef) rowLabel = rowDef.label;
        }
        flowsheetGroups[timeKey].subItems.push({
          label: rowLabel,
          value: item[key]
        });
      });
    });

    Object.values(flowsheetGroups).forEach(group => {
      if (group.subItems.length > 0) {
        allEvents.push(group);
      }
    });

    return allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [notes, labs, imaging, flowsheets, flowsheetDefs]);

  // Transform Flowsheets for VitalsGraph
  const vitalsGraphData = useMemo(() => {
    // Expected: [{ time: Date, hr: number, bpSys: number, bpDia: number, temp: number, spo2: number }]
    // flowsheets data: [{ date: string, bp: "120/80", hr: 72, temp: 37, spo2: 98 }]

    return (flowsheets || []).map(entry => {
      let bpSys = null;
      let bpDia = null;
      if (entry.bp && entry.bp.includes('/')) {
        const parts = entry.bp.split('/');
        bpSys = parseInt(parts[0], 10);
        bpDia = parseInt(parts[1], 10);
      }

      return {
        time: new Date(entry.date),
        hr: entry.hr ? parseFloat(entry.hr) : null,
        temp: entry.temp ? parseFloat(entry.temp) : null,
        spo2: entry.spo2 ? parseFloat(entry.spo2) : null,
        bpSys,
        bpDia
      };
    }).sort((a, b) => a.time - b.time);
  }, [flowsheets]);

  const filteredEvents = events.filter(e => selectedFilters.includes(e.category.toLowerCase()));

  // Get available date keys from events for date picker
  const availableDateKeys = useMemo(() => {
    const dateSet = new Set();
    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp);
      if (!isNaN(date.getTime())) {
        dateSet.add(date.toISOString().split('T')[0]);
      }
    });
    return Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));
  }, [filteredEvents]);

  // Find closest available date and scroll to it
  const handleDateChange = (newDate) => {
    if (!newDate || !availableDateKeys.length) return;

    // Convert dayjs to native Date if needed
    const targetDate = newDate.toDate ? newDate.toDate() : new Date(newDate);
    const targetTime = targetDate.getTime();
    let closestDate = availableDateKeys[0];
    let closestDiff = Math.abs(new Date(availableDateKeys[0]).getTime() - targetTime);

    for (const dateKey of availableDateKeys) {
      const diff = Math.abs(new Date(dateKey).getTime() - targetTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestDate = dateKey;
      }
    }

    // Find and scroll to the date header element
    const container = eventListRef.current;
    if (container) {
      const dateHeader = container.querySelector(`[data-date="${closestDate}"]`);
      if (dateHeader) {
        dateHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
          <DatePicker
            value={selectedDate}
            slotProps={{
              textField: { size: 'small', sx: { width: 150 } },
            }}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              handleDateChange(newDate);
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon>vertical_align_top</Icon>}
            onClick={() => {
              setSelectedDate(dayjs());
              eventListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
          <Box ref={eventListRef} sx={{ height: '100%', width: '100%', overflowY: 'auto', pr: 1 }}>
            <EventList events={filteredEvents} />
          </Box>
        </Stack>
        <CollapsiblePane width={400} side="right">
          <VitalsGraph data={vitalsGraphData} />
        </CollapsiblePane>
      </Stack>
    </Stack>
  );
};
