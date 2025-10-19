import React, { useState } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, TextField, Button } from '@mui/material';
import { MODE_OPTIONS, TimeColumn } from '../types/flowsheet.types';
import { useTimeColumns } from '../hooks/useTimeColumns';
import { v4 as uuidv4 } from 'uuid';

interface ControlBarProps {
  mode: string;
  onModeChange: (mode: string) => void;
  flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const ControlBar: React.FC<ControlBarProps> = ({ mode, onModeChange, flowsheet }) => {
  const { selectedColumnIndex, setSelectedColumnIndex, resetToDefaults, addTimeColumn, timeColumns } = flowsheet;
  const [patientMessage, setPatientMessage] = useState(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    return `Patient Message from ${dateStr} in Emergency Department`;
  });

  // Check if current time column already exists
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  const roundedTime = new Date(now);
  roundedTime.setMinutes(roundedMinutes, 0, 0);
  const currentTimestamp = roundedTime.toISOString();
  const currentTimeColumnExists = timeColumns.some((col: TimeColumn) => col.timestamp === currentTimestamp);

  const handleNowClick = () => {
    // Create new time column with UUID
    const newTimeColumn: TimeColumn = {
      id: uuidv4(),
      timestamp: currentTimestamp,
      displayTime: `${roundedTime.getHours().toString().padStart(2, '0')}${roundedTime.getMinutes().toString().padStart(2, '0')}`,
      isCurrentTime: false,
      index: timeColumns.length,
    };

    // Add the new time column
    addTimeColumn(newTimeColumn);

    // Set the new column as selected (it will be the last one)
    setSelectedColumnIndex(timeColumns.length);
  };

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Mode */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Mode</InputLabel>
        <Select
          value={mode}
          label="Mode"
          onChange={(e) => onModeChange(e.target.value)}
        >
          {MODE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Patient Message */}
      <TextField
        size="small"
        value={patientMessage}
        onChange={(e) => setPatientMessage(e.target.value)}
        sx={{ flexGrow: 1 }}
      />

      {/* Buttons */}
      <Button size="small" onClick={resetToDefaults}>
        Reset
      </Button>
      <Button
        size="small"
        onClick={handleNowClick}
        disabled={currentTimeColumnExists}
      >
        Now
      </Button>
    </Box>
  );
};