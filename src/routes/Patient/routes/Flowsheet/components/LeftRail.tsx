import React, { useState } from 'react';
import { Box, Checkbox, FormControlLabel, TextField, IconButton, Collapse } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DEFAULT_ROWS } from '../types/flowsheet.types';

interface LeftRailProps {
  width?: number;
  flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const LeftRail: React.FC<LeftRailProps> = ({ width = 250, flowsheet }) => {
  const { visibleRows, setVisibleRows } = flowsheet;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get all Enc Vitals row IDs
  const encVitalsRows = DEFAULT_ROWS
    .filter(row => row.group === 'Enc Vitals')
    .map(row => row.id);

  // Check if all Enc Vitals are visible
  const allEncVitalsVisible = encVitalsRows.every(rowId => visibleRows.includes(rowId));

  // Check if all rows are visible (Show All state)
  const showAll = visibleRows.length === DEFAULT_ROWS.length &&
    DEFAULT_ROWS.every(row => visibleRows.includes(row.id));

  const handleEncVitalsToggle = () => {
    console.log('LeftRail: Encounter Vitals toggle clicked, allEncVitalsVisible:', allEncVitalsVisible, 'visibleRows:', visibleRows);
    if (allEncVitalsVisible) {
      // Hide all Enc Vitals
      const newVisibleRows = visibleRows.filter((rowId: string) => !encVitalsRows.includes(rowId));
      console.log('LeftRail: Hiding Enc Vitals, new visibleRows:', newVisibleRows);
      setVisibleRows(newVisibleRows);
    } else {
      // Show all Enc Vitals
      const newVisibleRows = [...new Set([...visibleRows, ...encVitalsRows])];
      console.log('LeftRail: Showing Enc Vitals, new visibleRows:', newVisibleRows);
      setVisibleRows(newVisibleRows);
    }
  };

  const handleShowAllToggle = () => {
    console.log('LeftRail: Show All toggle clicked, showAll:', showAll, 'visibleRows:', visibleRows);
    if (showAll) {
      // Hide all rows
      console.log('LeftRail: Hiding all rows');
      setVisibleRows([]);
    } else {
      // Show all rows
      const newVisibleRows = DEFAULT_ROWS.map(row => row.id);
      console.log('LeftRail: Showing all rows, new visibleRows:', newVisibleRows);
      setVisibleRows(newVisibleRows);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex' }}>
      <Box
        sx={{
          width: isCollapsed ? 24 : width,
          flexShrink: 0,
          bgcolor: 'grey.50',
          borderRight: 1,
          borderColor: 'divider',
          p: isCollapsed ? 1 : 2,
          overflowY: 'auto',
          height: '100%',
          position: 'relative',
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <Collapse
          in={!isCollapsed}
          orientation="horizontal"
          timeout="auto"
          sx={{
            '.MuiCollapse-wrapperInner': {
              flex: 1,
            }
          }}
        >
          <Box>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search"
              sx={{ width: '100%', mb: 2 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {/* Show All */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAll}
                    onChange={handleShowAllToggle}
                    size="small"
                  />
                }
                label="Show All"
              />

              {/* Encounter Vitals */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allEncVitalsVisible}
                    onChange={handleEncVitalsToggle}
                    size="small"
                  />
                }
                label="Encounter Vitals"
                sx={{ mb: 2, fontWeight: 'bold' }}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Collapse Toggle Button - positioned outside the rail */}
      <IconButton
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          position: 'absolute',
          top: '1.5rem',
          right: -12,
          width: 24,
          height: 24,
          backgroundColor: 'grey.100',
          border: 1,
          borderColor: 'divider',
          zIndex: 1001,
          '&:hover': {
            backgroundColor: 'grey.200',
          },
        }}
      >
        {isCollapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
      </IconButton>
    </Box>
  );
};