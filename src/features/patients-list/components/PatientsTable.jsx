import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
  } from '@mui/material';
  import AddIcon from '@mui/icons-material/Add';
  import React, { useState } from 'react';
  import {
    usePatientLists
  } from '../../../routes/app/patients-list';
  import { AddToListModal } from './AddToListModal';
  
  // Helper function to get column value
  const getColumnValue = (patient, columnId) => {
    switch (columnId) {
      case 'name':
        return patient.name;
      case 'mrn':
        return patient.mrn;
      case 'dob':
        return patient.dob;
      case 'location':
        return patient.location;
      case 'status':
        return patient.status;
      default:
        return '';
    }
  };
  
  export const PatientsTable = () => {
    const { selectedListId, lists } = usePatientLists();
    const selectedList = lists.find((list) => list.id === selectedListId);
    const [selectedPatient, setSelectedPatient] = useState(null);
  
    if (!selectedListId || !selectedList) {
      return (
        <Paper
          variant='outlined'
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            Select a list to view patients
          </Typography>
        </Paper>
      );
    }
  
    // Get columns configuration
    const columns = selectedList.columns || [
      { id: 'name', label: 'Patient Name', selected: true, order: 0 },
      { id: 'mrn', label: 'MRN', selected: true, order: 1 },
      { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
      { id: 'location', label: 'Location', selected: true, order: 3 },
      { id: 'status', label: 'Status', selected: true, order: 4 },
    ];
  
    // Sort columns by order and filter selected ones
    const selectedColumns = [...columns]
      .sort((a, b) => a.order - b.order)
      .filter((col) => col.selected);
  
    return (
      <>
        <TableContainer
          component={Paper}
          variant='outlined'
          sx={{
            bgcolor: 'background.default',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {selectedColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontWeight: 'medium',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {selectedList.type === 'available' && (
                  <TableCell
                    align='right'
                    sx={{
                      fontWeight: 'medium',
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedList.patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  {selectedColumns.map((column) => (
                    <TableCell key={column.id}>
                      {getColumnValue(patient, column.id)}
                    </TableCell>
                  ))}
                  {selectedList.type === 'available' && (
                    <TableCell align='right'>
                      <Button
                        variant='text'
                        startIcon={<AddIcon />}
                        onClick={() => setSelectedPatient(patient)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {selectedList.patients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={
                      selectedColumns.length +
                      (selectedList.type === 'available' ? 1 : 0)
                    }
                    align='center'
                  >
                    <Typography variant='body2' color='text.secondary'>
                      No patients in this list
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedPatient && (
          <AddToListModal
            open={Boolean(selectedPatient)}
            onClose={() => setSelectedPatient(null)}
            patient={selectedPatient}
          />
        )}
      </>
    );
  };
  