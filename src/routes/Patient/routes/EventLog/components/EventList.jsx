import React, { useState } from 'react';
import { List, Popover, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { Box, Stack, Icon, Label, Button } from 'components/ui/Core';

// Helper to get color by category
const getCategoryColor = (category) => {
  const colors = {
    'flowsheets': '#4caf50',
    'results_lab': '#2196f3',
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
    'results_ekg': 'science',
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
    <Stack direction="row">
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
      <Stack direction="column" sx={{ flexGrow: 1, borderBottom: '1px solid #e0e0e0' }}>
        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            size="small"
            endIcon={<Icon sx={{ color: '#777' }}>description</Icon>}
            sx={{
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
          <Label variant="caption" color="text.secondary" noWrap>
            {event.details}
          </Label>
        </Stack>
        <Stack direction="row" flexWrap sx={{ pl: 2, gap: 2 }}>
          {(event.subItems ?? []).map((item, index) => (
            <Label key={index} variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              {item.name || item.label}: <Box component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>{item.value}</Box> {item.unit}
            </Label>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const EventList = ({ events }) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </List>
  );
};
