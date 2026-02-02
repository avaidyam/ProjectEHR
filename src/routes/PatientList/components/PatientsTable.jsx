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
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientLists } from 'components/contexts/PatientListContext.jsx';
import { useDatabase } from 'components/contexts/PatientContext';
import { AddToListModal } from './AddToListModal.jsx';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
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
    case 'name':
      return `${patient.lastName}, ${patient.firstName}`;
    case 'mrn':
      return patient.id;
    case 'dob':
      try {
        return new Date(patient.birthdate || patient.dob).toLocaleDateString();
      } catch {
        return patient.birthdate || patient.dob;
      }
    case 'location':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">{patient.location || patient.address || 'Carle Foundation Hospital'}</Typography>
          {(patient.bedStatus || true) && (
            <Typography variant="caption" color="text.secondary">
              {patient.bedStatus || (Math.random() > 0.5 ? 'In Room' : 'Out of Room')}
            </Typography>
          )}
        </Box>
      );
    case 'status':
      const status = patient.status || 'No encounters';
      return (
        <Chip
          label={status}
          size="small"
          color={getStatusColor(status)}
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
  const [patientsDB] = useDatabase().patients();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [ready, setReady] = useState(false);

  const selectedList = lists.find((list) => list.id === selectedListId);

  const listPatients = useMemo(() => {
    if (!selectedList) return [];
    if (selectedList.id === 'all-patients') return Object.values(patientsDB);

    return (selectedList.patients || []).map(p => {
      if (typeof p === 'string') {
        return patientsDB[p];
      }
      return p;
    }).filter(Boolean);
  }, [selectedList, patientsDB]);

  // Wait until patients with sticky notes are fully loaded
  useEffect(() => {
    if (listPatients.length) {
      setReady(true);
    }
  }, [listPatients]);

  const handlePatientClick = (patient, event) => {
    if (event.target.closest('button')) return;

    if (patient.encounterData) {
      navigate(
        `/patient/${patient.encounterData.patientId}/encounter/${patient.encounterData.encounterId}`
      );
    } else {
      navigate(`/patient/${patient.id}`);
    }
  };

  if (!selectedListId || !selectedList || !ready) {
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
          Loading patients...
        </Typography>
      </Box>
    );
  }

  const columns = selectedList.columns || [
    { id: 'name', label: 'Patient Name', selected: true, order: 0 },
    { id: 'mrn', label: 'MRN', selected: true, order: 1 },
    { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
    { id: 'location', label: 'Location', selected: true, order: 3 },
    { id: 'status', label: 'Status', selected: true, order: 4 },
  ];

  const selectedColumns = [...columns]
    .sort((a, b) => a.order - b.order)
    .filter((col) => col.selected);

  return (
    <>
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectedColumns.map((column) => (
                <TableCell key={column.id} sx={{ fontWeight: 500 }}>
                  {column.label}
                </TableCell>
              ))}
              {selectedList.type === 'available' && (
                <TableCell align='right' sx={{ fontWeight: 500 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {listPatients.map((patient) => (
              <TableRow
                key={patient.id}
                hover
                onClick={(event) => handlePatientClick(patient, event)}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
              >
                {selectedColumns.map((column) => (
                  <TableCell key={column.id}>
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
            {listPatients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length + (selectedList.type === 'available' ? 1 : 0)}
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

