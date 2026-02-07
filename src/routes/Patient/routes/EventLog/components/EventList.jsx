import React, { useState } from 'react';
import { List, Popover, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { Box, Stack, Icon, Label, Button } from 'components/ui/Core';

// Helper to get color by category
const getCategoryColor = (category) => {
  const colors = {
    'flowsheets': '#4caf50',
    'results_lab': '#2196f3',
    'results_imaging': '#2196f3',
    'mar_scheduled': '#e91e63',
    'notes': '#ff9800',
    'default': '#9e9e9e',
  };
  return colors[category] || colors['default'];
};

const getCategoryIcon = (category) => {
  const icons = {
    'flowsheets': 'grid_on',
    'ldas': 'search',
    'mar': 'vaccines',
    'mar_scheduled': 'vaccines',
    'mar_continuous': 'vaccines',
    'mar_prn': 'vaccines',
    'narrator': 'location_on',
    'notes': 'description',
    'notes_staff_progress': 'description',
    'patient_movement': 'swap_horiz',
    'results': 'science',
    'results_cardiac': 'science',
    'results_imaging': 'science',
    'results_lab': 'science',
    'transfusions': 'water_drop',
    'default': 'help_outline',
  };
  return icons[category] || icons['default'];
};

const EventItem = ({ event }) => {
  const color = getCategoryColor(event.category);
  const icon = getCategoryIcon(event.category);
  const dateObj = new Date(event.timestamp);
  const timeString = isNaN(dateObj.getTime())
    ? event.timestamp
    : `${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}`;

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
      <Stack direction="column" sx={{ flex: 1, overflow: 'hidden', borderBottom: '1px solid #e0e0e0' }}>
        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            size="small"
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
          {(event.subItems ?? []).map((item, index) => (
            <Label key={index} variant="caption" sx={{ mr: 1, color: 'text.secondary', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {item.name || item.label}: <Box component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>{item.value}</Box> {item.unit}
            </Label>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
// Helper to format date as "Mon DD" or "Mon DD, YYYY" if not current year
const formatDateHeader = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  const base = `${months[date.getMonth()]} ${date.getDate()}`;
  return dateYear !== currentYear ? `${base}, ${dateYear}` : base;
};

// Helper to get date key for grouping (YYYY-MM-DD)
const getDateKey = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().split('T')[0];
};

const DateHeader = ({ date, dateKey }) => (
  <Box
    data-date={dateKey}
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 1,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
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

export const EventList = ({ events }) => {
  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = getDateKey(event.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});

  // Sort date keys (most recent first)
  const sortedDateKeys = Object.keys(groupedEvents).sort((a, b) => new Date(b) - new Date(a));

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {sortedDateKeys.map((dateKey) => {
        const dateObj = new Date(dateKey);
        const dateLabel = isNaN(dateObj.getTime()) ? dateKey : formatDateHeader(dateObj);
        return (
          <Box key={dateKey}>
            <DateHeader date={dateLabel} dateKey={dateKey} />
            {groupedEvents[dateKey].map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </Box>
        );
      })}
    </List>
  );
};
