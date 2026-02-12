// Medications.jsx
import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Icon,
  IconButton,
  TextField,
  Label,
  DataGrid,
  TitledCard,
  Grid,
} from 'components/ui/Core';
import {
  Checkbox,
} from '@mui/material';
import { MedicationItemEditor } from './components/MedicationItemEditor';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { GridColDef } from '@mui/x-data-grid';

export function Medications() {
  const { useEncounter } = usePatient();
  const [medications, setMedications] = useEncounter().medications();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<Database.Medication.ID>>(new Set());

  const handleEdit = (id: Database.Medication.ID) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedMedication: Database.Medication) => {
    setMedications((prev) =>
      prev?.map((med) => (med.id === updatedMedication.id ? updatedMedication : med))
    );
    setExpandedRowIds(new Set());
  };

  const handleCancel = () => {
    setExpandedRowIds(new Set());
  };

  const handleDelete = (id: Database.Medication.ID) => {
    setMedications((prev) => prev?.filter((med) => med.id !== id));
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Medication',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Label variant="body1" color="primary" bold>
            {params.row.name} ({params.row.brandName}) {params.row.dose}{params.row.unit} {params.row.route}
          </Label>
          <Label variant="body2" color="textSecondary">
            {[
              params.row.frequency && `${params.row.frequency}`,
              params.row.startDate && `${params.row.startDate}`,
              params.row.endDate && `${params.row.endDate}`,
              params.row.activePrnReasons?.length > 0 && `PRN: ${params.row.activePrnReasons.join(', ')}`
            ].filter(Boolean).join(', ')}
          </Label>
        </Box>
      )
    },
    {
      field: 'timeActions',
      headerName: 'Timing',
      width: 400,
      renderCell: () => (
        <Stack direction="row" spacing={0.5}>
          <Button variant="outlined" size="small">Today</Button>
          <Button variant="outlined" size="small">Yesterday</Button>
          <Button variant="outlined" size="small">Past Week</Button>
          <Button variant="outlined" size="small">Past Month</Button>
          <Button variant="outlined" size="small">{'>'} Month</Button>
          <Button variant="outlined" size="small">Unknown</Button>
        </Stack>
      )
    },
    {
      field: 'lastDose',
      headerName: 'Last Dose',
      width: 150,
      renderCell: () => <TextField disabled size="small" fullWidth color="error" />
    },
    {
      field: 'taking',
      headerName: 'Taking?',
      width: 80,
      renderCell: () => <Checkbox />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton onClick={() => handleEdit(params.row.id)} color="primary" size="small">
            edit
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            delete
          </IconButton>
        </Stack>
      )
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: { row: any }) => (
      <Box paper sx={{ p: 2, mx: 4, my: 1, border: '1px solid #e0e0e0' }}>
        <MedicationItemEditor
          medication={row}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Box>
    ),
    [handleSave, handleCancel],
  );

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>medication</Icon> Home Medications</>} color="#9F3494" sx={{ m: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField label="New Medication" variant="outlined" size="small" />
            <Button variant="contained" startIcon={<Icon>add_task</Icon>}>Add</Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small">Check Interactions</Button>
            <Button variant="outlined" size="small">Informants</Button>
            <Button variant="outlined" size="small">Find Medications Needing Review</Button>
            <Button variant="outlined" size="small">Mark all Unselected Today</Button>
            <Button variant="outlined" size="small">Mark all Unselected Yesterday</Button>
          </Stack>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={medications ?? []}
            columns={columns}
            getRowId={(row: any) => row.id || `medication-${row.name}-${row.brandName}-${row.dose}`}
            rowHeight={70}
            getRowHeight={() => 'auto'}
            initialState={{ columns: { columnVisibilityModel: { __detail_panel_toggle__: false } } }}
            hideFooter
            disableRowSelectionOnClick
            getDetailPanelHeight={() => 'auto'}
            getDetailPanelContent={getDetailPanelContent}
            detailPanelExpandedRowIds={expandedRowIds}
            onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
          />
        </Box>
      </Stack>
    </TitledCard>
  );
}
