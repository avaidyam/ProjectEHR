import * as React from 'react';
import { Box, Autocomplete, DataGrid, DateTimePicker } from 'components/ui/Core'
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid-premium';
import { FlowsheetEntry, TimeColumn, FlowsheetRow } from '../Flowsheet';
import { Database } from 'components/contexts/PatientContext';

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
      label={value}
      TextFieldProps={{
        autoFocus: true,
        fullWidth: true,
        variant: "standard",
        sx: { height: '100%', p: 0 },
        InputProps: {
          disableUnderline: true,
          style: { fontSize: 'inherit', textAlign: 'center', height: '100%', padding: 0 }
        }
      }}
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<Database.JSONDate | null>(column.timestamp as Database.JSONDate);

  const handleDoubleClick = () => {
    setTempValue(column.timestamp as Database.JSONDate);
    setIsEditing(true);
  };

  const handleAccept = (newValue: Database.JSONDate | null) => {
    if (newValue) {
      const newValueDate = Temporal.Instant.from(newValue).toZonedDateTimeISO('UTC')
      onUpdate(column.id, {
        timestamp: newValue,
        displayTime: `${String(newValueDate.hour).padStart(2, '0')}${String(newValueDate.minute).padStart(2, '0')}`,
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
          convertString
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
              inputProps: {
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
  React.useEffect(() => {
    const updateCurrentTime = () => {
      const currentColumn = timeColumns.find((col: TimeColumn) => col.isCurrentTime);
      if (currentColumn) {
        const now = Temporal.Now.zonedDateTimeISO();
        const hours = String(now.hour).padStart(2, '0');
        const minutes = String(now.minute).padStart(2, '0');
        const displayTime = `${hours}${minutes}`;

        if (currentColumn.displayTime !== displayTime) {
          onUpdateTimeColumn(currentColumn.id, {
            displayTime: displayTime,
            timestamp: now.toInstant().toString()
          });
        }
      }
    };

    const intervalId = setInterval(updateCurrentTime, 10000);
    updateCurrentTime();

    return () => clearInterval(intervalId);
  }, [timeColumns, onUpdateTimeColumn]);

  const entriesMap = React.useMemo(() => {
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
  const rows = React.useMemo(() => {
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

  const columns = React.useMemo(() => {
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

  const columnGroupingModel = React.useMemo(() => {
    const groups: { [key: string]: string[] } = {};

    timeColumns.forEach((col) => {
      const dateKey = Temporal.Instant.from(col.timestamp).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' }); // e.g., "1/9/2022" - grouping key and label

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
        let nowInstant = Temporal.Now.instant();

        // Ensure uniqueness down to the second
        let collision = true;
        while (collision) {
          const timeToken = Math.floor(nowInstant.epochMilliseconds / 1000);
          // Check against existing columns
          const isTaken = timeColumns.some((c: TimeColumn) => {
            const cInstant = Temporal.Instant.from(c.timestamp);
            return Math.floor(cInstant.epochMilliseconds / 1000) === timeToken;
          });

          if (isTaken) {
            // Add 1 second
            nowInstant = nowInstant.add(Temporal.Duration.from({ seconds: 1 }));
          } else {
            collision = false;
          }
        }

        onAddTimeColumn({
          id: crypto.randomUUID(),
          timestamp: nowInstant.toString(),
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