import React, { useState } from 'react';
import { Box, Checkbox, FormControlLabel, Typography, Button } from '@mui/material';
import { Window } from 'components/ui/Core.jsx';
import { DEFAULT_ROWS } from '../types/flowsheet.types';

interface AddRowsModalProps {
  open: boolean;
  onClose: () => void;
  onAddRows: (selectedRows: string[]) => void;
}

// Mock additional rows that can be added
const ADDITIONAL_ROWS = [
  { id: 'I_O', label: 'I/O', unit: 'mL', group: 'Fluids' },
  { id: 'Urine_Output', label: 'Urine Output', unit: 'mL', group: 'Fluids' },
  { id: 'GCS', label: 'GCS', group: 'Neuro' },
  { id: 'Pupils', label: 'Pupils', group: 'Neuro' },
  { id: 'LOC', label: 'LOC', group: 'Neuro' },
  { id: 'Skin_Color', label: 'Skin Color', group: 'Assessment' },
  { id: 'Cap_Refill', label: 'Cap Refill', unit: 'sec', group: 'Assessment' },
  { id: 'Edema', label: 'Edema', group: 'Assessment' },
];

export const AddRowsModal: React.FC<AddRowsModalProps> = ({
  open,
  onClose,
  onAddRows,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleRowToggle = (rowId: string) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleAdd = () => {
    onAddRows(selectedRows);
    setSelectedRows([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedRows([]);
    onClose();
  };

  // Group additional rows by their group
  const groupedRows = ADDITIONAL_ROWS.reduce((acc, row) => {
    if (!acc[row.group]) {
      acc[row.group] = [];
    }
    acc[row.group].push(row);
    return acc;
  }, {} as Record<string, typeof ADDITIONAL_ROWS>);

  return (
    <Window
      open={open}
      onClose={handleCancel}
      title="Add Rows"
      header={null}
      footer={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained"
            disabled={selectedRows.length === 0}
          >
            Add Selected ({selectedRows.length})
          </Button>
        </Box>
      }
      sx={{ minWidth: 500 }}
    >
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the rows you want to add to the flowsheet:
        </Typography>
        
        {Object.entries(groupedRows).map(([groupName, rows]) => (
          <Box key={groupName} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {groupName}
            </Typography>
            {rows.map((row) => (
              <FormControlLabel
                key={row.id}
                control={
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowToggle(row.id)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {row.label}
                    </Typography>
                    {row.unit && (
                      <Typography variant="caption" color="text.secondary">
                        ({row.unit})
                      </Typography>
                    )}
                  </Box>
                }
                sx={{ display: 'block', ml: 0 }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Window>
  );
};
