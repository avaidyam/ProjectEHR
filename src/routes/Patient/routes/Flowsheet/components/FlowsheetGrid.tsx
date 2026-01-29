import React, { useMemo, useEffect } from 'react';
import { DataGrid } from 'components/ui/Core'
import { Box } from '@mui/material';
import { FlowsheetEntry, TimeColumn, FlowsheetRow } from '../types/flowsheet.types';
import { v4 as uuidv4 } from 'uuid';

interface FlowsheetGridProps {
  rowsDefinition: FlowsheetRow[];
  entries: FlowsheetEntry[];
  timeColumns: TimeColumn[];
  visibleRows?: string[];
  lastFiledValues?: { [key: string]: string | number };
  onAddEntry: (entry: Omit<FlowsheetEntry, 'id'>) => void;
  onUpdateEntry: (id: string, updates: Partial<FlowsheetEntry>) => void;
  onAddTimeColumn: (column: TimeColumn) => void;
  onUpdateTimeColumn: (id: string, updates: Partial<TimeColumn>) => void;
}

export const FlowsheetGrid: React.FC<FlowsheetGridProps> = ({
  rowsDefinition,
  entries,
  timeColumns,
  visibleRows,
  lastFiledValues = {},
  onAddEntry,
  onUpdateEntry,
  onAddTimeColumn,
  onUpdateTimeColumn
}) => {
  // "Now" column logic
  useEffect(() => {
    const updateCurrentTime = () => {
      const currentColumn = timeColumns.find((col: TimeColumn) => col.isCurrentTime);
      if (currentColumn) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const displayTime = `${hours}${minutes}`;

        if (currentColumn.displayTime !== displayTime) {
          onUpdateTimeColumn(currentColumn.id, {
            displayTime: displayTime,
            timestamp: now.toISOString()
          });
        }
      }
    };

    const intervalId = setInterval(updateCurrentTime, 10000);
    updateCurrentTime();

    return () => clearInterval(intervalId);
  }, [timeColumns, onUpdateTimeColumn]);

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

  // Prepare data for DataGrid with Grouping
  const rows = useMemo(() => {
    const finalRows: any[] = [];
    const groups: { [key: string]: FlowsheetRow[] } = {};

    // 1. Group rows
    rowsDefinition.forEach(row => {
      const category = row.category || row.group || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(row);
    });

    // 2. Build flat list with headers
    Object.entries(groups).forEach(([category, categoryRows]) => {
      // Filter by visibility
      const distinctRows = categoryRows.filter(row =>
        !visibleRows || visibleRows.includes(row.name)
      );

      if (distinctRows.length === 0) return;

      // Add Header Row
      finalRows.push({
        id: `header-${category}`,
        label: category,
        isHeader: true,
      });

      // Add Data Rows
      distinctRows.forEach(row => {
        const rowObj: any = {
          id: row.name || row.id || '',
          label: row.label || row.name,
          unit: row.unit || (row.type === 'number' ? '' : ''),
          isHeader: false,
          lastFiled: lastFiledValues[row.name || row.id || ''] // Add Last Filed Value
        };

        timeColumns.forEach((column: TimeColumn) => {
          const rowId = row.name || row.id || '';
          const entry = entriesMap.get(rowId)?.get(column.id);
          rowObj[column.id] = entry?.value || '';
        });

        finalRows.push(rowObj);
      });
    });

    return finalRows;
  }, [rowsDefinition, timeColumns, entriesMap, visibleRows, lastFiledValues]);

  const columns = useMemo(() => {
    const cols: any[] = [
      {
        field: 'label',
        headerName: 'Flowsheet Data',
        minWidth: 200,
        editable: false,
        sortable: false,
        resizable: true,
        pinned: 'left', // Pin label to left if supported
        renderCell: (params: any) => (
          <Box sx={{
            fontWeight: params.row.isHeader ? 'bold' : 'normal',
            pl: params.row.isHeader ? 0 : 2
          }}>
            {params.value}
          </Box>
        )
      },
    ];

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

    // Add Last Filed Column
    cols.push({
      field: 'lastFiled',
      headerName: 'Last Filed',
      minWidth: 100,
      width: 120,
      editable: false,
      sortable: false,
      resizable: true,
      renderCell: (params: any) => (
        <Box sx={{ color: 'text.secondary' }}>
          {params.value}
        </Box>
      )
    });

    return cols;
  }, [timeColumns]);

  const processRowUpdate = (newRow: any, oldRow: any) => {
    if (newRow.isHeader) return oldRow; // Updates not allowed on headers

    const changedFields = Object.keys(newRow).filter(key =>
      key !== 'id' && key !== 'label' && key !== 'unit' && key !== 'isHeader' && key !== 'lastFiled' &&
      newRow[key] !== oldRow[key]
    );

    changedFields.forEach(field => {
      const rowId = newRow.id;
      const columnId = field;
      const value = newRow[field];

      const column = timeColumns.find((c: TimeColumn) => c.id === columnId);

      if (column && column.isCurrentTime) {
        onUpdateTimeColumn(column.id, { isCurrentTime: false });
        // Spawn new Now column logic
        // 2. Create a NEW "Now" column
        const now = new Date();
        onAddTimeColumn({
          id: uuidv4(),
          timestamp: now.toISOString(),
          displayTime: 'Now',
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
      isCellEditable={(params: any) => !params.row.isHeader && params.field !== 'lastFiled'}
      getRowClassName={(params: any) => params.row.isHeader ? 'flowsheet-header-row' : ''}
      initialState={{
        pinnedColumns: {
          right: ['lastFiled']
        }
      }}
      sx={{
        border: 'none',
        width: '100%',
        height: '100%',
        '& .MuiDataGrid-main': { overflow: 'auto' },
        '& .MuiDataGrid-virtualScroller': { overflow: 'auto' },
        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
        '& .flowsheet-header-row': {
          bgcolor: '#f5f5f5',
          '&:hover': { bgcolor: '#f5f5f5' },
        },
        '& .flowsheet-header-row .MuiDataGrid-cell': {
          borderBottom: 'none',
        },
        '& .flowsheet-header-row .MuiDataGrid-cell--pinnedRight': {
          bgcolor: '#f5f5f5',
        }
      }}
      children={null}
    />
  );
};