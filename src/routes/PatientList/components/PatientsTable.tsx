import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  Label,
  Chip,
  Icon,
  DataGrid
} from 'components/ui/Core';
import { Paper } from '@mui/material'

import { Database, useDatabase } from 'components/contexts/PatientContext';
import { AddToListModal } from './AddToListModal';

// Helper function to get status color
const getStatusColor = (status: string) => {
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

export const PatientsTable = ({
  lists,
  selectedList,
  setLists,
}: {
  lists: Database.PatientList[];
  selectedList?: Database.PatientList;
  setLists: (lists: Database.PatientList[]) => void;
}) => {
  const navigate = useNavigate();
  const [patientsDB] = useDatabase().patients();
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [ready, setReady] = React.useState(false);

  const listPatients = React.useMemo(() => {
    if (!selectedList) return [];
    if (selectedList.id === 'all-patients') return Object.values(patientsDB);

    return (selectedList.patients || []).map((p) => {
      if (typeof p === 'string') {
        return patientsDB[p];
      }
      return p;
    }).filter(Boolean);
  }, [selectedList, patientsDB]);

  // Wait until patients with sticky notes are fully loaded
  React.useEffect(() => {
    if (listPatients.length) {
      setReady(true);
    }
  }, [listPatients]);

  const handlePatientClick = (params: any, event: any) => {
    if (event.target.closest('button')) return;
    const patient = params.row;

    if (patient.encounterData) {
      navigate(
        `/patient/${patient.encounterData.patientId}/encounter/${patient.encounterData.encounterId}`
      );
    } else if (patient.encounters && Object.keys(patient.encounters).length > 0) {
      const encounters = Object.values(patient.encounters);
      const sortedEncounters = (encounters as any[]).sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      const latestEncounter = sortedEncounters[0];
      navigate(`/patient/${patient.id}/encounter/${latestEncounter.id}`);
    } else {
      navigate(`/patient/${patient.id}`);
    }
  };

  /* Safe defaults for hooks */
  const columnsConfig = selectedList?.columns || [
    { id: 'name', label: 'Patient Name', selected: true, order: 0 },
    { id: 'mrn', label: 'MRN', selected: true, order: 1 },
    { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
    { id: 'location', label: 'Location', selected: true, order: 3 },
    { id: 'status', label: 'Status', selected: true, order: 4 },
  ];

  const columns = React.useMemo(() => {
    const defaultCols: any[] = columnsConfig
      .filter((col: any) => col.selected)
      .sort((a: any, b: any) => a.order - b.order)
      .map((col: any) => {
        const baseCol = {
          field: col.id,
          headerName: col.label,
          flex: 1,
          minWidth: 150,
        };

        switch (col.id) {
          case 'name':
            return {
              ...baseCol,
              valueGetter: (value: any, row: any) => `${row.lastName}, ${row.firstName}`,
            };
          case 'mrn':
            return {
              ...baseCol,
              valueGetter: (value: any, row: any) => row.id
            };
          case 'dob':
            return {
              ...baseCol,
              valueGetter: (value: any, row: any) => {
                try {
                  return new Date(row.birthdate || row.dob).toLocaleDateString();
                } catch {
                  return row.birthdate || row.dob;
                }
              }
            };
          case 'location':
            return {
              ...baseCol,
              renderCell: (params: any) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
                  <Label variant="body2" sx={{ lineHeight: 1.2 }}>{params.row.location || params.row.address || 'Carle Foundation Hospital'}</Label>
                  {(params.row.bedStatus || true) && (
                    <Label variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      {params.row.bedStatus || (Math.random() > 0.5 ? 'In Room' : 'Out of Room')}
                    </Label>
                  )}
                </Box>
              ),
            };
          case 'status':
            return {
              ...baseCol,
              renderCell: (params: any) => {
                const status = params.row.status || 'No encounters';
                return (
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusColor(status)}
                    sx={{ minWidth: 85 }}
                  />
                );
              },
            };
          default:
            return baseCol;
        }
      });

    if (selectedList?.type === 'available') {
      defaultCols.push({
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        renderCell: (params: any) => (
          <Button
            variant='text'
            startIcon={<Icon>add</Icon>}
            onClick={(e: any) => {
              e.stopPropagation();
              setSelectedPatient(params.row);
            }}
            sx={{ minWidth: 'auto' }}
          >
            Add
          </Button>
        )
      });
    }
    return defaultCols;
  }, [columnsConfig, selectedList?.type]);

  if (!selectedList || !ready) {
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
        <Label variant='body1' color='text.secondary' align='center'>
          Loading patients...
        </Label>
      </Box>
    );
  }

  return (
    <>
      <Paper
        variant='outlined'
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <DataGrid
          rows={listPatients}
          columns={columns}
          onRowClick={handlePatientClick}
          disableRowSelectionOnClick
          hideFooter
          getRowHeight={() => 'auto'}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': {
              py: 1,
            }
          }}
        />
      </Paper>

      {selectedPatient && (
        <AddToListModal
          open={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          patient={selectedPatient}
          lists={lists}
          setLists={() => setLists}
        />
      )}
    </>
  );
};
