import * as React from 'react';
import { Box, Stack, Button, Typography, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Icon, DatePicker } from 'components/ui/Core';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';
import { EventFilters } from './components/EventFilters';
import { EventList } from './components/EventList';
import { VitalsGraph } from './components/VitalsGraph';
import { CollapsiblePane } from 'components/ui/CollapsiblePane';
import { getComponentHistory, getFlowsheetHistory } from 'util/helpers';

const CATEGORIES = [
  { id: 'flowsheets', label: 'Flowsheets', icon: 'grid_on', color: '#25584e' },
  { id: 'ldas', label: 'LDAs', icon: 'search', color: '#25584e' },
  { id: 'mar', label: 'MAR', icon: 'vaccines', color: '#891abd' },
  { id: 'mar_scheduled', label: 'Scheduled', icon: 'vaccines', color: '#891abd', parent: 'mar' },
  { id: 'mar_continuous', label: 'Continuous', icon: 'vaccines', color: '#891abd', parent: 'mar' },
  { id: 'mar_prn', label: 'PRN', icon: 'vaccines', color: '#891abd', parent: 'mar' },
  { id: 'narrator', label: 'Narrator Events', icon: 'location_on', color: '#25584e' },
  { id: 'notes', label: 'Notes', icon: 'description', color: '#b42563' },
  { id: 'notes_staff', label: 'Staff Progress', icon: 'description', color: '#b42563', parent: 'notes' },
  { id: 'orders', label: 'Orders', icon: 'content_paste_go', color: '#1a73e8' },
  { id: 'patient_movement', label: 'Patient Movement', icon: 'swap_horiz', color: '#2150c8' },
  { id: 'results', label: 'Results', icon: 'science', color: '#5f3bc9' },
  { id: 'results_lab', label: 'Lab', icon: 'science', color: '#5f3bc9', parent: 'results' },
  { id: 'results_imaging', label: 'Imaging', icon: 'science', color: '#5f3bc9', parent: 'results' },
  { id: 'results_cardiac', label: 'Cardiac', icon: 'science', color: '#5f3bc9', parent: 'results' },
  { id: 'transfusions', label: 'Transfusions', icon: 'water_drop', color: '#c62828' },
];

export const EventLog = () => {
  const eventListRef = React.useRef<HTMLDivElement>(null);
  const { useEncounter, useChart } = usePatient();
  const [notes] = useEncounter().notes();
  const [labs] = useEncounter().labs();
  const [imaging] = useEncounter().imaging();
  const [flowsheets] = useEncounter().flowsheets();
  const [orders] = useEncounter().orders();
  const [flowsheetDefs] = useDatabase().flowsheets();
  const [providers] = useDatabase().providers();

  // Generate component history for popover display
  const componentHistory = React.useMemo(() => {
    return getComponentHistory(labs!);
  }, [labs]);

  // Generate flowsheet history for popover display
  const flowsheetHistory = React.useMemo(() => {
    return getFlowsheetHistory(flowsheets!, flowsheetDefs);
  }, [flowsheets, flowsheetDefs]);

  // Helper to look up provider name by ID
  const getProviderName = (providerId: Database.Provider.ID) => {
    const provider = (providers || []).find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const [selectedFilters, setSelectedFilters] = React.useState([
    'flowsheets', 'ldas', 'mar', 'mar_scheduled', 'mar_continuous', 'mar_prn',
    'narrator', 'notes', 'notes_staff', 'orders', 'patient_movement',
    'results', 'results_cardiac', 'results_imaging', 'results_lab', 'transfusions'
  ]);
  const [selectedDate, setSelectedDate] = React.useState(Temporal.Now.instant().toString() as Database.JSONDate);

  // Normalize Data
  const events = React.useMemo(() => {
    const allEvents: any[] = [];

    // Process Labs
    (labs || []).forEach(item => {
      allEvents.push({
        id: item.id || `lab - ${Math.random()} `,
        category: 'results_lab',
        title: item.test,
        timestamp: item.date, // ISO string expected
        details: `${item.status}`,
        tag: item.abnormal ? 'Abnormal' : undefined,
        author: getProviderName(item.provider!) ?? "Unknown",
        data: item,
        subItems: (item.components ?? []).map(x => ({ label: x.name, value: x.value }))
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
        data: item,
        subItems: []
      });
    });

    // Process Notes
    (notes || []).forEach(item => {
      allEvents.push({
        id: item.id,
        category: 'notes',
        title: item.summary,
        timestamp: item.serviceDate,
        details: `${item.status}`,
        author: getProviderName(item.author) ?? "Unknown",
        data: item,
        subItems: []
      });
    });

    // Process Flowsheets (Vitals)
    const flowsheetGroups: Record<string, any> = {};
    (flowsheets || []).forEach(item => {
      const timeKey = item.date as string;

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
          data: item,
          subItems: []
        };
      }
      Object.keys(item).forEach((key: string) => {
        if (['id', 'date', 'flowsheet'].includes(key)) return;
        let rowLabel = key;
        if (groupDef && groupDef.rows) {
          const rowDef = groupDef.rows.find((r: any) => r.name === key);
          if (rowDef) rowLabel = rowDef.label;
        }
        flowsheetGroups[timeKey].subItems.push({
          label: rowLabel,
          value: item[key]
        });
      });
    });

    Object.values(flowsheetGroups).forEach((group: any) => {
      if (group.subItems.length > 0) {
        allEvents.push(group);
      }
    });

    // Process Orders
    (orders || []).forEach((item: any) => {
      allEvents.push({
        id: item.id || `order - ${Math.random()}`,
        category: 'orders',
        title: `${item.name} | ${item.dose}`,
        timestamp: item.date,
        details: item.priority ?? "New Order",
        author: getProviderName(item.provider) ?? "Unknown",
        data: item,
        subItems: []
      });
    });

    return allEvents.sort((a: any, b: any) => Temporal.Instant.from(b.timestamp).epochMilliseconds - Temporal.Instant.from(a.timestamp).epochMilliseconds);
  }, [notes, labs, imaging, flowsheets, flowsheetDefs, providers, orders]);

  // Transform Flowsheets for VitalsGraph
  const vitalsGraphData = React.useMemo(() => {
    return (flowsheets || []).map((entry: any) => ({
      time: Temporal.Instant.from(entry.date),
      temp: entry.temp,
      hr: entry.hr,
      sbp: entry.sbp,
      dbp: entry.dbp,
      rr: entry.rr,
      spo2: entry.spo2,
    })).sort((a, b) => Temporal.Instant.compare(a.time, b.time));
  }, [flowsheets]);

  const filteredEvents = events.filter((e: any) => {
    const category = e.category.toLowerCase();
    return selectedFilters.some((filter: string) =>
      category === filter || category.startsWith(filter + '_')
    );
  });

  // Get available date keys from events for date picker
  const availableDateKeys = React.useMemo(() => {
    const dateSet = new Set<string>();
    filteredEvents.forEach((event: any) => {
      try {
        const date = Temporal.Instant.from(event.timestamp);
        dateSet.add(date.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate().toString());
      } catch { }
    });
    return Array.from(dateSet).sort((a: string, b: string) => Temporal.Instant.compare(Temporal.Instant.from(b), Temporal.Instant.from(a)));
  }, [filteredEvents]);

  // Find closest available date and scroll to it
  const handleDateChange = (newDate: any) => {
    if (!newDate || !availableDateKeys.length) return;
    const targetDate = Temporal.Instant.from(newDate).toZonedDateTimeISO('UTC')
    let closestDate = availableDateKeys[0];
    let closestDiff = Math.abs(Temporal.Instant.from(availableDateKeys[0]).toZonedDateTimeISO('UTC').until(targetDate, { largestUnit: 'days' }).days);

    for (const dateKey of availableDateKeys) {
      const diff = Math.abs(Temporal.Instant.from(dateKey).toZonedDateTimeISO('UTC').until(targetDate, { largestUnit: 'days' }).days);
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
            convertString
            value={selectedDate}
            slotProps={{
              textField: { size: 'small', sx: { width: 150 } },
            }}
            onChange={(newDate: any) => {
              setSelectedDate(newDate);
              handleDateChange(newDate);
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon>vertical_align_top</Icon>}
            onClick={() => {
              setSelectedDate(Temporal.Now.instant().toString() as Database.JSONDate);
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
            categories={CATEGORIES}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </CollapsiblePane>
        <Stack sx={{ flex: 1, overflow: 'hidden' }}>
          <Box ref={eventListRef} sx={{ height: '100%', width: '100%', overflowY: 'auto' }}>
            <EventList
              events={filteredEvents}
              categories={CATEGORIES}
              componentHistory={componentHistory}
              flowsheetHistory={flowsheetHistory}
            />
          </Box>
        </Stack>

        <CollapsiblePane width={400} side="right">
          <VitalsGraph data={vitalsGraphData} />
        </CollapsiblePane>
      </Stack>
    </Stack>
  );
};
