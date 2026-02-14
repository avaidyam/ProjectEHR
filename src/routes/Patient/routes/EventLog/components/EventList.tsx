import * as React from 'react';
import { List, Popover, Typography } from '@mui/material';
import { Box, Stack, Icon, Label, Button, Divider } from 'components/ui/Core';
import { useSplitView } from 'components/contexts/SplitViewContext';

/**
 * Formats a date for display in the component popover (MM/DD/YY HHmm format)
 * @param {string} date - The ISO date string to format
 * @returns {string} - Formatted date string
 */
function formatComponentDate(date: any) {
  try {
    const d = Temporal.PlainDateTime.from(date);
    const month = String(d.month).padStart(2, '0');
    const day = String(d.day).padStart(2, '0');
    const year = String(d.year).slice(-2);
    const hours = String(d.hour).padStart(2, '0');
    const minutes = String(d.minute).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}${minutes}`;
  } catch {
    return '';
  }
}
const ComponentPopover = ({ item, historyData }: { item: any; historyData: any }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const isAbnormal = item.flag === 'H' || item.flag === 'L';
  const componentName = item.name || item.label;
  const history = historyData?.[componentName] || { encounter: [], chart: [] };

  return (
    <>
      <Label
        variant="caption"
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        onMouseLeave={() => setAnchorEl(null)}
        sx={{
          mr: 1,
          color: isAbnormal ? 'error.main' : 'text.secondary',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          fontWeight: isAbnormal ? 'bold' : 'normal',
        }}
      >
        {componentName}: <Box component="span" sx={{ color: isAbnormal ? 'error.main' : 'text.primary', fontWeight: 'bold' }}>{item.value}</Box> {item.unit}
      </Label>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        disableRestoreFocus
        sx={{ pointerEvents: 'none', ml: 1 }}
        slotProps={{
          paper: {
            sx: {
              p: 0,
              minWidth: 220,
              maxHeight: 400,
              boxShadow: '0px 2px 10px rgba(0,0,0,0.15)',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'visible',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: 20,
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid white',
                filter: 'drop-shadow(-2px 0px 1px rgba(0,0,0,0.1))',
              },
            },
            onMouseEnter: (e: any) => setAnchorEl(e.currentTarget),
            onMouseLeave: () => setAnchorEl(null),
          }
        }}
      >
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* Header */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ px: 1.5, py: 1 }}>
            {componentName}
          </Typography>

          {/* This Encounter Section */}
          {history.encounter.length > 0 && (
            <Box sx={{ bgcolor: 'action.disabledBackground' }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, display: 'block', px: 1.5, pt: 0.5 }}
              >
                This Encounter
              </Typography>
              {history.encounter.map((entry: any, idx: number) => (
                <Stack
                  key={`enc-${idx}`}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ px: 1.5, py: 0.25 }}
                >
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {entry.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatComponentDate(entry.date)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          {/* Chart Section */}
          {history.chart.length > 0 && (
            <Box>
              {history.chart.map((entry: any, idx: number) => (
                <Stack
                  key={`chart-${idx}`}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ px: 1.5, py: 0.25 }}
                >
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {entry.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatComponentDate(entry.date)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};


const EventItem = ({ event, categories, componentHistory, flowsheetHistory }: { event: any; categories: any[]; componentHistory: any; flowsheetHistory: any }) => {
  const { openTab } = useSplitView();

  const filter = categories.find((f: any) => f.id === event.category);
  const color = filter?.color ?? '#9e9e9e';
  const icon = filter?.icon ?? 'help_outline';

  let timeString = event.timestamp;
  try {
    const zdt = Temporal.Instant.from(event.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId());
    timeString = `${String(zdt.hour).padStart(2, '0')}${String(zdt.minute).padStart(2, '0')}`;
  } catch { /* keep original */ }

  const handleClick = () => {
    const category = event.category?.toLowerCase();
    if (category === 'notes' || category === 'notes_staff') {
      openTab("Note", { data: event.data }, "side", false);
    } else if (category === 'results_lab' || category === 'results_imaging' || category === 'results_cardiac') {
      openTab("Report", { data: event.data }, "side", false);
    } else if (category === 'flowsheets') {
      openTab("Flowsheet", {}, "main", true);
    }
  };

  return (
    <Stack direction="row" sx={{ overflow: "none" }}>
      <Stack direction="column" alignItems="center" sx={{ p: 0.5, pl: 1 }}>
        <Label variant="caption" sx={{ color: 'text.primary', fontWeight: 'bold', mr: 1 }}>
          {timeString}
        </Label>
      </Stack>
      <Stack direction="column" alignItems="center" sx={{ p: 0.5, pl: 1 }}>
        <Icon sx={{ color: event.tag === 'Abnormal' ? 'error.main' : color, fontSize: 18 }}>
          {event.tag === 'Abnormal' ? "error_outline" : icon}
        </Icon>
      </Stack>
      <Stack direction="column" sx={{ flex: 1, overflow: 'hidden', borderBottom: '1px solid #e0e0e0', pr: 1 }}>
        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            size="small"
            onClick={handleClick}
            endIcon={<Icon sx={{ color: '#777' }}>description</Icon>}
            sx={{
              flexShrink: 0,
              color: color,
              fontWeight: 'bold',
              textTransform: 'none',
              minWidth: 0,
              p: 0.5,
              mr: 0.5,
              '& .MuiButton-startIcon': { mr: 0.5 }
            }}
          >
            {event.title}
          </Button>
          <Label variant="caption" color="text.secondary" noWrap sx={{ overflowX: "auto" }}>
            {event.details}
          </Label>
          <Box sx={{ flexGrow: 1 }} />
          <Label variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0 }}>
            {event.author}
          </Label>
        </Stack>
        <Stack direction="row" sx={{ pl: 2, flexWrap: 'wrap', overflowX: 'auto' }}>
          {(event.subItems ?? []).map((item: any, index: number) => {
            const historyData = event.category === 'flowsheets' ? flowsheetHistory : componentHistory;
            return <ComponentPopover key={index} item={item} historyData={historyData} />;
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

const formatDateHeader = (dateKey: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  try {
    const pd = Temporal.Instant.from(dateKey).toZonedDateTimeISO('UTC');
    const currentYear = Temporal.Now.plainDateISO().year;
    const base = `${months[pd.month - 1]} ${pd.day}`;
    return pd.year !== currentYear ? `${base}, ${pd.year}` : base;
  } catch {
    return dateKey;
  }
};

const getDateKey = (timestamp: string) => {
  try {
    return Temporal.Instant.from(timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate().toString();
  } catch {
    return 'Unknown';
  }
};

const DateHeader = ({ date, dateKey }: { date: string; dateKey: string }) => (
  <Box
    data-date={dateKey}
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 1,
      bgcolor: 'action.disabledBackground',
      px: 1.5,
      py: 0.5,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Label variant="body2" sx={{ fontWeight: 'bold' }}>
      {date}
    </Label>
  </Box>
);

export const EventList = ({ events, categories, componentHistory, flowsheetHistory }: { events: any[]; categories: any[]; componentHistory: any; flowsheetHistory: any }) => {
  const groupedEvents = events.reduce((groups: Record<string, any[]>, event: any) => {
    const dateKey = getDateKey(event.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, any[]>);

  const sortedDateKeys = Object.keys(groupedEvents).sort((a: string, b: string) => {
    try {
      return Temporal.Instant.compare(Temporal.Instant.from(b), Temporal.Instant.from(a));
    } catch {
      return 0;
    }
  });

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {sortedDateKeys.map((dateKey) => {
        const dateLabel = formatDateHeader(dateKey);
        return (
          <Box key={dateKey}>
            <DateHeader date={dateLabel} dateKey={dateKey} />
            {groupedEvents[dateKey].map((event) => (
              <EventItem
                key={event.id}
                event={event}
                categories={categories}
                componentHistory={componentHistory}
                flowsheetHistory={flowsheetHistory}
              />
            ))}
          </Box>
        );
      })}
    </List>
  );
};
