import React, { useMemo, useEffect, useState, useRef } from 'react';
import { DataGrid } from 'components/ui/Core'
import { Box, TextField, Select, MenuItem, Autocomplete } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid-premium';
import { FlowsheetEntry, TimeColumn, FlowsheetRow } from '../Flowsheet';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

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

const FlowsheetEditCell = (params: GridRenderEditCellParams) => {
  const { id, field, value, row } = params;
  const apiRef = useGridApiContext();

  const isSelect = row.type === 'select' && row.options && row.options.length > 0;
  const options = isSelect ? row.options : [];

  return (
    <Autocomplete
      disablePortal
      fullWidth
      clearOnEscape
      openOnFocus
      autoHighlight
      autoSelect
      freeSolo={!isSelect}
      value={value}
      options={options}
      onChange={(event, newValue) => {
        apiRef.current.setEditCellValue({ id, field, value: newValue });
        if (apiRef.current.getCellMode(id, field) === 'edit') {
          apiRef.current.stopCellEditMode({ id, field });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          fullWidth
          variant="standard"
          sx={{ height: '100%', p: 0 }}
          InputProps={{
            ...params.InputProps,
            disableUnderline: true,
            style: { fontSize: 'inherit', textAlign: 'center', height: '100%', padding: 0 }
          }}
        />
      )}
      sx={{
        height: '100%',
        '& .MuiAutocomplete-inputRoot': { height: '100%', p: '0 !important', display: 'flex', alignItems: 'center' },
        '& .MuiAutocomplete-input': { p: '0 !important', textAlign: 'center' }
      }}
      slotProps={{
        popper: {
          sx: {
            width: 'auto !important',
            minWidth: '200px'
          }
        }
      }}
    />
  );
};

export const FlowsheetColumnHeader = ({ column, onUpdate }: { column: TimeColumn, onUpdate: (id: string, updates: Partial<TimeColumn>) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<dayjs.Dayjs | null>(dayjs(column.timestamp));

  const handleDoubleClick = () => {
    setTempValue(dayjs(column.timestamp));
    setIsEditing(true);
  };

  const handleAccept = (newValue: dayjs.Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onUpdate(column.id, {
        timestamp: newValue.toISOString(),
        displayTime: newValue.format('HHmm'),
        ...(column.isCurrentTime ? { isCurrentTime: false } : {})
      });
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Box sx={{ width: '100%', p: 0 }}>
        <DateTimePicker
          value={tempValue}
          onChange={(newValue) => setTempValue(newValue)}
          onAccept={handleAccept}
          onClose={handleClose}
          autoFocus
          format="HHmm"
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              variant: 'standard',
              autoFocus: true,
              InputProps: {
                style: { fontSize: 'inherit', textAlign: 'center' }
              }
            },
            popper: {
              sx: { zIndex: 99999 }
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      onDoubleClick={handleDoubleClick}
      sx={{
        fontWeight: column.isCurrentTime ? 'bold' : 'normal',
        color: column.isCurrentTime ? 'primary.main' : 'inherit',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
        userSelect: 'none'
      }}
    >
      {column.displayTime + (column.isCurrentTime ? ' (Now)' : '')}
    </Box>
  );
};

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
          lastFiled: lastFiledValues[row.name || row.id || ''], // Add Last Filed Value
          type: row.type, // Pass metadata
          options: row.options // Pass metadata
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
          <FlowsheetColumnHeader column={column} onUpdate={onUpdateTimeColumn} />
        ),
        renderEditCell: (params: GridRenderEditCellParams) => <FlowsheetEditCell {...params} />
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

  const columnGroupingModel = useMemo(() => {
    const groups: { [key: string]: string[] } = {};

    timeColumns.forEach((col) => {
      const date = new Date(col.timestamp);
      const dateKey = date.toLocaleDateString(); // e.g., "1/9/2022" - grouping key and label

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(col.id);
    });

    return Object.entries(groups).map(([date, fields]) => ({
      groupId: date,
      headerName: date,
      headerAlign: 'center' as 'center',
      children: fields.map(field => ({ field })),
      headerClassName: 'flowsheet-group-header'
    }));
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

        // Spawn new "Now" column logic
        let now = new Date();

        // Ensure uniqueness down to the second
        let collision = true;
        while (collision) {
          const timeToken = Math.floor(now.getTime() / 1000);
          // Check against existing columns
          const isTaken = timeColumns.some((c: TimeColumn) => {
            const cDate = new Date(c.timestamp);
            return Math.floor(cDate.getTime() / 1000) === timeToken;
          });

          if (isTaken) {
            // Add 1 second
            now = new Date(now.getTime() + 1000);
          } else {
            collision = false;
          }
        }

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
      columnGroupingModel={columnGroupingModel}
      columnGroupHeaderHeight={28}
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
        },
        '& .flowsheet-group-header': {
          bgcolor: '#e0e0e0',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          lineHeight: '28px'
        }
      }}
      children={null}
    />
  );
};