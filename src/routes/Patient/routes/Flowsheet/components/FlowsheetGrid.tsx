import React, { useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { FlowsheetEntry, TimeColumn, FlowsheetRow } from '../types/flowsheet.types';
import { v4 as uuidv4 } from 'uuid';

interface FlowsheetGridProps {
  rowsDefinition: FlowsheetRow[];
  entries: FlowsheetEntry[];
  timeColumns: TimeColumn[];
  onAddEntry: (entry: Omit<FlowsheetEntry, 'id'>) => void;
  onUpdateEntry: (id: string, updates: Partial<FlowsheetEntry>) => void;
  onAddTimeColumn: (column: TimeColumn) => void;
  onUpdateTimeColumn: (id: string, updates: Partial<TimeColumn>) => void;
}

export const FlowsheetGrid: React.FC<FlowsheetGridProps> = ({
  rowsDefinition,
  entries,
  timeColumns,
  onAddEntry,
  onUpdateEntry,
  onAddTimeColumn,
  onUpdateTimeColumn
}) => {
  // "Now" column logic: Update the display time of the current time column every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      const currentColumn = timeColumns.find((col: TimeColumn) => col.isCurrentTime);
      if (currentColumn) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const displayTime = `${hours}${minutes}`;

        // Only update if time changed (roughly)
        if (currentColumn.displayTime !== displayTime) {
          onUpdateTimeColumn(currentColumn.id, {
            displayTime: displayTime,
            timestamp: now.toISOString()
          });
        }
      }
    };

    const intervalId = setInterval(updateCurrentTime, 10000); // Check every 10 seconds
    updateCurrentTime(); // Initial update

    return () => clearInterval(intervalId);
  }, [timeColumns, onUpdateTimeColumn]);

  // Create a map of entries by row and columnId for quick lookup
  const entriesMap = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    entries.forEach((entry: FlowsheetEntry) => {
      if (!map.has(entry.rowId)) {
        map.set(entry.rowId, new Map());
      }
      map.get(entry.rowId)!.set(entry.columnId, entry);
    });
    return map;
  }, [entries]);

  // Prepare data for DataGrid - each row needs a unique id
  const rows = useMemo(() => {
    return rowsDefinition.map((row) => {
      const rowObj: any = {
        id: row.name || row.id || '', // Support both naming conventions
        label: row.label || row.name,
        unit: row.unit || row.type === 'number' ? '' : '', // Basic unit logic
      };

      // Add time column data
      timeColumns.forEach((column: TimeColumn) => {
        // Support looking up by name (new format) or id (old format)
        const rowId = row.name || row.id || '';
        const entry = entriesMap.get(rowId)?.get(column.id);
        rowObj[column.id] = entry?.value || '';
      });

      return rowObj;
    });
  }, [rowsDefinition, timeColumns, entriesMap]);

  // Prepare columns for DataGrid
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        field: 'label',
        headerName: 'Flowsheet Data',
        minWidth: 200,
        editable: false,
        sortable: false,
        resizable: true,
      },
    ];

    // Add time columns
    timeColumns.forEach((column: TimeColumn) => {
      cols.push({
        field: column.id,
        headerName: column.displayTime + (column.isCurrentTime ? ' (Now)' : ''),
        minWidth: 80,
        width: 100,
        editable: true,
        sortable: false,
        resizable: true,
        renderHeader: (params: any) => (
          <Box sx={{ fontWeight: column.isCurrentTime ? 'bold' : 'normal', color: column.isCurrentTime ? 'primary.main' : 'inherit' }}>
            {params.colDef.headerName}
          </Box>
        )
      });
    });

    return cols;
  }, [timeColumns]);

  const processRowUpdate = (newRow: any, oldRow: any) => {
    // Find which fields changed
    const changedFields = Object.keys(newRow).filter(key =>
      key !== 'id' && key !== 'label' && key !== 'unit' &&
      newRow[key] !== oldRow[key]
    );

    changedFields.forEach(field => {
      const rowId = newRow.id;
      const columnId = field;
      const value = newRow[field];

      const column = timeColumns.find((c: TimeColumn) => c.id === columnId);

      // Special logic for "Now" column
      if (column && column.isCurrentTime) {
        // 1. Convert current "Now" column to a static column
        onUpdateTimeColumn(column.id, { isCurrentTime: false });

        // 2. Create a NEW "Now" column
        const now = new Date();
        // Add 1 minute to avoid duplicate timestamp issues if processed immediately, 
        // or just rely on UUID. The Effect will picking up the time.
        onAddTimeColumn({
          id: uuidv4(),
          timestamp: now.toISOString(),
          displayTime: 'Now', // Will be updated by effect
          isCurrentTime: true,
          index: timeColumns.length + 1
        });
      }

      const existingEntry = entriesMap.get(rowId)?.get(columnId);

      if (existingEntry) {
        onUpdateEntry(existingEntry.id, { value });
      } else {
        onAddEntry({
          rowId,
          columnId,
          value,
          status: 'draft',
        });
      }
    });

    return newRow;
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      disableColumnMenu
      disableRowSelectionOnClick
      hideFooter
      processRowUpdate={processRowUpdate}
      sx={{
        border: 'none',
        width: '100%',
        height: '100%',
        '& .MuiDataGrid-main': {
          overflow: 'auto',
        },
        '& .MuiDataGrid-virtualScroller': {
          overflow: 'auto',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600
        }
      }}
    />
  );
};