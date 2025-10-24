import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { DEFAULT_ROWS, FlowsheetEntry, TimeColumn } from '../types/flowsheet.types';

interface FlowsheetGridProps {
  onCellEdit: (rowId: string, columnIndex: number) => void;
  onCellSave: () => void;
  onCellCancel: () => void;
  flowsheet: any; // Type this properly based on your flowsheet hook return type
}

export const FlowsheetGrid: React.FC<FlowsheetGridProps> = ({
  onCellEdit,
  onCellSave,
  onCellCancel,
  flowsheet,
}) => {
  const { entries, visibleRows, addEntry, updateEntry, timeColumns } = flowsheet;

  console.log('FlowsheetGrid - entries:', entries);
  console.log('FlowsheetGrid - timeColumns:', timeColumns);
  console.log('FlowsheetGrid - visibleRows:', visibleRows);

  // Get visible rows in order
  const orderedVisibleRows = useMemo(() => {
    return DEFAULT_ROWS
      .filter(row => visibleRows.includes(row.id))
      .sort((a, b) => a.order - b.order);
  }, [visibleRows]);

  // Create a map of entries by row and columnId for quick lookup
  const entriesMap = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    entries.forEach((entry: FlowsheetEntry) => {
      if (!map.has(entry.rowId)) {
        map.set(entry.rowId, new Map());
      }
      map.get(entry.rowId)!.set(entry.columnId, entry);
    });
    console.log('FlowsheetGrid - entriesMap created:', map);
    return map;
  }, [entries]);

  // Prepare data for DataGrid - each row needs a unique id
  const rows = useMemo(() => {
    const rowData = orderedVisibleRows.map((row) => {
      const rowObj: any = {
        id: row.id,
        label: row.label,
        unit: row.unit,
      };

      // Add time column data
      timeColumns.forEach((column: TimeColumn) => {
        const entry = entriesMap.get(row.id)?.get(column.id);
        rowObj[column.id] = entry?.value || '';
        console.log(`Setting ${row.id}.${column.id} = ${entry?.value || ''}`);
      });

      return rowObj;
    });

    return rowData;
  }, [orderedVisibleRows, timeColumns, entriesMap]);

  // Prepare columns for DataGrid
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        field: 'label',
        headerName: 'Encounter Vitals',
        minWidth: 170,
        editable: false,
        sortable: false,
        resizable: false,
      },
    ];

    // Add time columns
    timeColumns.forEach((column: TimeColumn) => {
      cols.push({
        field: column.id,
        headerName: column.displayTime,
        minWidth: 60,
        maxWidth: 100,
        width: 80,
        editable: true,
        sortable: false,
        resizable: true,
      });
    });

    return cols;
  }, [timeColumns, entriesMap, addEntry, updateEntry]);

  const processRowUpdate = (newRow: any, oldRow: any) => {
    console.log('processRowUpdate called:', { newRow, oldRow });

    // Find which fields changed
    const changedFields = Object.keys(newRow).filter(key =>
      key !== 'id' && key !== 'label' && key !== 'unit' &&
      newRow[key] !== oldRow[key]
    );

    changedFields.forEach(field => {
      const rowId = newRow.id;
      const columnId = field;
      const value = newRow[field];

      const existingEntry = entriesMap.get(rowId)?.get(columnId);

      if (existingEntry) {
        console.log('Updating existing entry:', existingEntry.id, 'with value:', value);
        updateEntry(existingEntry.id, { value });
      } else {
        console.log('Adding new entry:', { rowId, columnId, value, status: 'draft' });
        addEntry({
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
      }}
    />
  );
};