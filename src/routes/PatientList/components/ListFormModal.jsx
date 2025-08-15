import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem, ListItemText,
    Paper,
    TextField,
    Typography,
    Icon
} from '@mui/material';
import React from 'react';

const availableColumns = [
    { id: 'name', label: 'Patient Name', selected: true, order: 0 },
    { id: 'mrn', label: 'MRN', selected: true, order: 1 },
    { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
    { id: 'location', label: 'Location', selected: true, order: 3 },
    { id: 'status', label: 'Status', selected: true, order: 4 },
    { id: 'age', label: 'Age', selected: false, order: 5 },
    { id: 'sex', label: 'Sex', selected: false, order: 6 },
    { id: 'bedStatus', label: 'Bed Status', selected: false, order: 7 },
    {
      id: 'admissionDate',
      label: 'Last Admission Date',
      selected: false,
      order: 8,
    },
    { id: 'dischargeDate', label: 'Discharge Date', selected: false, order: 9 },
    { id: 'patientClass', label: 'Patient Class', selected: false, order: 10 },
    { id: 'attendingMD', label: 'Attending MD', selected: false, order: 11 },
    { id: 'roomNumber', label: 'Room Number', selected: false, order: 12 },
    { id: 'visitReason', label: 'Visit Reason', selected: false, order: 13 },
    { id: 'insuranceType', label: 'Insurance Type', selected: false, order: 14 },
];

export const ListFormModal = ({
    open,
    onClose,
    onSubmit,
    initialData = null, // Pass list data when editing
}) => {
    const isEditMode = !!initialData;
    const [listName, setListName] = React.useState('');
    const [selectedColumns, setSelectedColumns] = React.useState([]);
    const [unselectedColumns, setUnselectedColumns] = React.useState([]);

    // Initialize form when modal opens or initialData changes
    React.useEffect(() => {
        if (open) {
            if (isEditMode) {
                setListName(initialData.name);
                
                // Map existing columns to match our format
                const existingColumnIds = new Set(initialData.columns.map(col => col.id));
                
                setSelectedColumns(
                    initialData.columns
                        .map(col => ({
                            id: col.id,
                            label: col.label,
                            selected: true,
                            order: col.order
                        }))
                        .sort((a, b) => a.order - b.order)
                );
                
                setUnselectedColumns(
                    availableColumns
                        .filter(col => !existingColumnIds.has(col.id))
                        .sort((a, b) => a.order - b.order)
                );
            } else {
                // Reset to default state for create mode
                setListName('');
                setSelectedColumns(
                    availableColumns
                        .filter((col) => col.selected)
                        .sort((a, b) => a.order - b.order)
                );
                setUnselectedColumns(
                    availableColumns
                        .filter((col) => !col.selected)
                        .sort((a, b) => a.order - b.order)
                );
            }
        }
    }, [open, initialData]);

    const handleAddColumn = (column) => {
      setSelectedColumns([...selectedColumns, column]);
      setUnselectedColumns(unselectedColumns.filter((c) => c.id !== column.id));
    };
  
    const handleRemoveColumn = (column) => {
      setUnselectedColumns(
        [...unselectedColumns, column].sort((a, b) => a.order - b.order)
      );
      setSelectedColumns(selectedColumns.filter((c) => c.id !== column.id));
    };
  
    const handleMoveColumn = (index, direction) => {
      const newColumns = [...selectedColumns];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
  
      if (newIndex >= 0 && newIndex < selectedColumns.length) {
        [newColumns[index], newColumns[newIndex]] = [
          newColumns[newIndex],
          newColumns[index],
        ];
        setSelectedColumns(newColumns);
      }
    };
  
    const handleSubmit = () => {
        const formattedColumns = selectedColumns.map((col, index) => ({
            ...col,
            selected: true,
            order: index,
        }));

        onSubmit(listName, formattedColumns);
        
        // Reset form
        setListName('');
        setSelectedColumns(
            availableColumns
                .filter((col) => col.selected)
                .sort((a, b) => a.order - b.order)
        );
        setUnselectedColumns(
            availableColumns
                .filter((col) => !col.selected)
                .sort((a, b) => a.order - b.order)
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle>{isEditMode ? 'Edit List' : 'Create List'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label='Name'
                        fullWidth
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        size='small'
                        required
                        helperText="List name is required"
                    />
                    <TextField
                        label='Owner'
                        fullWidth
                        value="Aditya Vaidyam" // TODO: update once auth is implemented
                        disabled
                        size='small'
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant='subtitle2' gutterBottom>
                                Available Columns
                            </Typography>
                            <Paper variant='outlined' sx={{ height: 300, overflow: 'auto' }}>
                                <List dense>
                                    {unselectedColumns.map((column) => (
                                        <ListItem
                                            key={column.id}
                                            secondaryAction={
                                                <IconButton
                                                    edge='end'
                                                    size='small'
                                                    onClick={() => handleAddColumn(column)}
                                                >
                                                    <Icon>add</Icon>
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={column.label} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant='subtitle2' gutterBottom>
                                Selected Columns {selectedColumns.length === 0 && (
                                    <Typography component="span" color="error" variant="caption">
                                        (At least one column required)
                                    </Typography>
                                )}
                            </Typography>
                            <Paper variant='outlined' sx={{ height: 300, overflow: 'auto' }}>
                                <List dense>
                                    {selectedColumns.map((column, index) => (
                                        <ListItem
                                            key={column.id}
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <IconButton
                                                        edge='end'
                                                        size='small'
                                                        onClick={() => handleMoveColumn(index, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <Icon>keyboard_arrow_up</Icon>
                                                    </IconButton>
                                                    <IconButton
                                                        edge='end'
                                                        size='small'
                                                        onClick={() => handleMoveColumn(index, 'down')}
                                                        disabled={index === selectedColumns.length - 1}
                                                    >
                                                        <Icon>keyboard_arrow_down</Icon>
                                                    </IconButton>
                                                    <IconButton
                                                        edge='end'
                                                        size='small'
                                                        onClick={() => handleRemoveColumn(column)}
                                                    >
                                                        <Icon>remove</Icon>
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <ListItemText primary={column.label} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    disabled={!listName.trim() || selectedColumns.length === 0}
                >
                    {isEditMode ? 'Save Changes' : 'Create List'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
  