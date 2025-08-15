import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Typography,
    Chip,
    Icon
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientLists } from 'components/contexts/PatientListContext.jsx';
import { AddToListModal } from './AddToListModal.jsx';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'admitted':
      return 'success';
    case 'discharged':
      return 'default';
    case 'waiting':
      return 'warning';
    case 'in treatment':
      return 'info';
    default:
      return 'default';
  }
};

// Helper function to get column value with formatting
const getColumnValue = (patient, columnId) => {
  switch (columnId) {
    case 'dob':
      try {
        return new Date(patient.dob).toLocaleDateString();
      } catch {
        return patient.dob;
      }
    case 'location':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">
            {patient.location}
          </Typography>
          {patient.bedStatus && (
            <Typography variant="caption" color="text.secondary">
              {patient.bedStatus}
            </Typography>
          )}
        </Box>
      );
    case 'status':
      return (
        <Chip
          label={patient.status}
          size="small"
          color={getStatusColor(patient.status)}
          sx={{ minWidth: 85 }}
        />
      );
    default:
      return patient[columnId] || '';
  }
};

export const PatientsTable = () => {
  const navigate = useNavigate();
  const { selectedListId, lists } = usePatientLists();
  const selectedList = lists.find((list) => list.id === selectedListId);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handlePatientClick = (patient, event) => {
    /**
     * This is a bit of a hack, but it works for now
     * TODO: Find a better solution
     */
    if (event.target.closest('button')) {
      return;
    }
    
    if (patient.encounterData) {
      navigate(`/patient/${patient.encounterData.patientId}/encounter/${patient.encounterData.encounterId}`);
    } else {
      navigate(`/patient/${patient.id}`);
    }
  };

  if (!selectedListId || !selectedList) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant='body1' color='text.secondary' align='center'>
          Select a list to view patients
        </Typography>
      </Box>
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectedColumns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {selectedList.type === 'available' && (
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedList.patients.map((patient) => (
              <TableRow 
                key={patient.id} 
                hover
                onClick={(event) => handlePatientClick(patient, event)}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
              >
                {selectedColumns.map((column) => (
                  <TableCell 
                    key={column.id}
                  >
                    {getColumnValue(patient, column.id)}
                  </TableCell>
                ))}
                {selectedList.type === 'available' && (
                  <TableCell align='right'>
                    <Button
                      variant='text'
                      startIcon={<Icon>add</Icon>}
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
                  sx={{ py: 8 }}
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
  