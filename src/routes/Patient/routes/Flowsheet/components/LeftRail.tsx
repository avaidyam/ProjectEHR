import * as React from 'react';
import { Box, Typography, Checkbox, TextField, IconButton, Collapse } from '@mui/material';
import { Icon } from '../../../../../components/ui/Core';
import { FlowsheetRow } from '../Flowsheet';

interface LeftRailProps {
  rows: FlowsheetRow[];
  visibleRows: string[]; // List of row names that are visible
  onToggleRow: (rowName: string) => void;
  onToggleCategory: (category: string, allSelected: boolean) => void;
  className?: string;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  rows,
  visibleRows,
  onToggleRow,
  onToggleCategory,
  className,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Group rows by category
  const categorizedRows = React.useMemo(() => {
    const groups: { [key: string]: FlowsheetRow[] } = {};
    rows.forEach((row) => {
      const category = row.category || row.group || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(row);
    });
    return groups;
  }, [rows]);

  // Handle Search
  const filteredCategories = React.useMemo(() => {
    if (!debouncedSearch.trim()) return categorizedRows;

    const query = debouncedSearch.toLowerCase();
    const filtered: { [key: string]: FlowsheetRow[] } = {};

    Object.entries(categorizedRows).forEach(([category, categoryRows]) => {
      // Match category name OR any row within it
      const matchesCategory = category.toLowerCase().includes(query);
      const hasMatchingRows = categoryRows.some(row => row.label.toLowerCase().includes(query));

      if (matchesCategory || hasMatchingRows) {
        filtered[category] = categoryRows;
      }
    });

    return filtered;
  }, [categorizedRows, debouncedSearch]);


  return (
    <Box sx={{ position: 'relative', display: 'flex', height: '100%', width: "100%" }} className={className}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
          <TextField
            size="small"
            placeholder="Search groups..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Icon size={20} sx={{ color: 'text.secondary', mr: 1 }}>search</Icon>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 10, bgcolor: '#f0f2f5' }, '& fieldset': { border: 'none' } }}
          />
          {(searchTerm !== '') && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
                Clear
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {Object.entries(filteredCategories).map(([category, categoryRows]) => {
            const visibleCount = categoryRows.filter((row) => visibleRows.includes(row.name)).length;
            const isAllSelected = visibleCount === categoryRows.length;
            const isIndeterminate = visibleCount > 0 && !isAllSelected;

            return (
              <Box key={category} sx={{ mb: 1 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': { bgcolor: '#e0e0e0' },
                  borderRadius: 1,
                  pr: 1,
                  pl: 1,
                  py: 0.5
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, userSelect: 'none', flex: 1 }}>
                    {category}
                  </Typography>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={() => onToggleCategory(category, isAllSelected)}
                    sx={{ p: 0.5 }}
                  />
                </Box>
              </Box>
            );
          })}

          {Object.keys(filteredCategories).length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
