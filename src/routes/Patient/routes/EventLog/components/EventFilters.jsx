import React from 'react';
import { Box, Stack, Icon, TreeView, TreeItem, Button, Label } from 'components/ui/Core';

const FILTERS = [
  { id: 'flowsheets', label: 'Flowsheets', icon: 'grid_on', color: '#4caf50' },
  { id: 'ldas', label: 'LDAs', icon: 'search', color: '#2196f3' },
  {
    id: 'mar', label: 'MAR', icon: 'vaccines', color: '#9c27b0', children: [
      { id: 'mar_scheduled', label: 'Scheduled', color: '#9c27b0' },
      { id: 'mar_continuous', label: 'Continuous', color: '#9c27b0' },
      { id: 'mar_prn', label: 'PRN', color: '#9c27b0' },
    ]
  },
  { id: 'narrator', label: 'Narrator Events', icon: 'location_on', color: '#e91e63' },
  {
    id: 'notes', label: 'Notes', icon: 'description', color: '#e91e63', children: [
      { id: 'notes_staff_progress', label: 'Staff Progress', color: '#e91e63' },
    ]
  },
  { id: 'patient_movement', label: 'Patient Movement', icon: 'swap_horiz', color: '#2196f3' },
  {
    id: 'results', label: 'Results', icon: 'science', color: '#3f51b5', children: [
      { id: 'results_ekg', label: 'EKG', color: '#3f51b5' },
      { id: 'results_imaging', label: 'Imaging', color: '#3f51b5' },
      { id: 'results_lab', label: 'Lab', color: '#3f51b5' },
    ]
  },
  { id: 'transfusions', label: 'Transfusions', icon: 'water_drop', color: '#c62828' },
];

const getAllFilterIds = (filters) => {
  return filters.reduce((acc, filter) => {
    acc.push(filter.id);
    if (filter.children) {
      acc = acc.concat(getAllFilterIds(filter.children));
    }
    return acc;
  }, []);
};

const ALL_FILTER_IDS = getAllFilterIds(FILTERS);

const FilterItem = ({ filter }) => {
  return (
    <TreeItem
      itemId={filter.id}
      label={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon sx={{ color: filter.color, fontSize: 18 }}>{filter.icon}</Icon>
          {filter.label}
        </span>
      }
      sx={{
        '& > .MuiTreeItem-content': {
          bgcolor: `${filter.color}15`,
          mb: 0.5,
          py: 0.25,
        },
        '& > .MuiTreeItem-content .MuiTreeItem-label': {
          color: filter.color,
          fontWeight: 500,
          flexGrow: 1,
        },
        '& > .MuiTreeItem-content .MuiTreeItem-checkbox': {
          color: filter.color,
          order: 1,
          '&.Mui-checked': { color: filter.color },
        },
      }}
    >
      {filter.children?.map((child) => (
        <FilterItem key={child.id} filter={child} />
      ))}
    </TreeItem>
  );
};

export const EventFilters = ({ selectedFilters, onFilterChange }) => {
  const handleToggleSelectAll = () => {
    if (selectedFilters.length > 0) {
      onFilterChange([]);
    } else {
      onFilterChange(ALL_FILTER_IDS);
    }
  };

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Label variant="h6">Filters</Label>
        <Button size="small" onClick={handleToggleSelectAll}>
          {selectedFilters.length > 0 ? 'Deselect All' : 'Select All'}
        </Button>
      </Stack>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <TreeView
          multiSelect
          checkboxSelection
          selectionPropagation={{ parents: true, descendants: true }}
          selectedItems={selectedFilters}
          onSelectedItemsChange={(event, ids) => onFilterChange(ids)}
        >
          {FILTERS.map((filter) => (
            <FilterItem key={filter.id} filter={filter} />
          ))}
        </TreeView>
      </Box>
    </Stack>
  );
};
