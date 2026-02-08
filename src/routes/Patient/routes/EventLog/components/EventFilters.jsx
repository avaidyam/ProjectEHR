import React from 'react';
import { Box, Stack, Icon, TreeView, TreeItem, Button, Label } from 'components/ui/Core';

const buildFilterTree = (filters) => {
  const tree = [];
  const map = {};
  filters.forEach(f => {
    map[f.id] = { ...f, children: [] };
  });
  filters.forEach(f => {
    if (f.parent) {
      map[f.parent].children.push(map[f.id]);
    } else {
      tree.push(map[f.id]);
    }
  });
  return tree;
};

const FilterItem = ({ filter, selectedFilters }) => {
  const color = filter.color ?? '#9e9e9e';
  const icon = filter.icon ?? 'help_outline';

  // State calculation
  const getSubFilterIds = (f) => {
    const ids = [];
    if (f.children) {
      f.children.forEach(child => {
        ids.push(child.id);
        ids.push(...getSubFilterIds(child));
      });
    }
    return ids;
  };

  const subFilterIds = React.useMemo(() => getSubFilterIds(filter), [filter]);
  const selectedSubFilters = subFilterIds.filter(id => selectedFilters.includes(id));

  const isSelected = selectedFilters.includes(filter.id) || (subFilterIds.length > 0 && selectedSubFilters.length === subFilterIds.length);
  const isIndeterminate = subFilterIds.length > 0 && selectedSubFilters.length > 0 && selectedSubFilters.length < subFilterIds.length;

  return (
    <TreeItem
      itemId={filter.id}
      label={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon sx={{ color, fontSize: 18 }}>{icon}</Icon>
          {filter.label}
        </span>
      }
      slotProps={{
        checkbox: {
          indeterminate: isIndeterminate,
          checked: isSelected,
        }
      }}
      sx={{
        '& > .MuiTreeItem-content': {
          bgcolor: `${color}15`,
          mb: 0.5,
          py: 0.25,
        },
        '& > .MuiTreeItem-content .MuiTreeItem-label': {
          color: color,
          fontWeight: 500,
          flexGrow: 1,
        },
        '& > .MuiTreeItem-content .MuiTreeItem-checkbox': {
          color: color,
          order: 1,
          '&.Mui-checked': { color: color },
        },
      }}
    >
      {filter.children?.map((child) => (
        <FilterItem key={child.id} filter={child} selectedFilters={selectedFilters} />
      ))}
    </TreeItem>
  );
};

export const EventFilters = ({ categories, selectedFilters, onFilterChange }) => {
  const filterTree = React.useMemo(() => buildFilterTree(categories), [categories]);
  const allFilterIds = React.useMemo(() => categories.map(f => f.id), [categories]);

  const handleToggleSelectAll = () => {
    if (selectedFilters.length > 0) {
      onFilterChange([]);
    } else {
      onFilterChange(allFilterIds);
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
          {filterTree.map((filter) => (
            <FilterItem key={filter.id} filter={filter} selectedFilters={selectedFilters} />
          ))}
        </TreeView>
      </Box>
    </Stack>
  );
};


