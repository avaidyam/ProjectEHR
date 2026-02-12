// MedicalHistory.jsx
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
} from 'components/ui/Core';
import {
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { Database, usePatient } from '../../../../../components/contexts/PatientContext';

function MedicalHistoryDetailPanel({ row, onSave, onCancel, onDelete }: { row: any; onSave: (row: any) => void; onCancel: (row: any) => void; onDelete: (id: any) => void }) {
  const [formData, setFormData] = React.useState({ ...row });

  const handleChange = (e: any) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Box paper elevation={5} sx={{ p: 2, mx: 4, my: 1 }}>
      <Label variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        {row.isNew ? 'Add New Entry' : 'Edit Entry'}
      </Label>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField label="Date" name="date" value={formData.date} onChange={handleChange} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField label="Age" name="age" value={formData.age} onChange={handleChange} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Source" name="src" value={formData.src} onChange={handleChange} fullWidth size="small" />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox checked={formData.problemList === 'True'} onChange={(e) => setFormData({ ...formData, problemList: e.target.checked ? 'True' : 'False' })} />}
            label="Add to Problem List"
          />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button onClick={() => onSave(formData)} variant="contained" color="primary" sx={{ mr: 1 }} size="small">Save</Button>
              <Button onClick={() => onCancel(row)} variant="outlined" size="small">Cancel</Button>
            </Box>
            {!row.isNew && (
              <Button
                onClick={() => onDelete(row.id)}
                variant="contained"
                color="error"
                startIcon={<Icon>delete</Icon>}
                size="small"
              >
                Delete
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export function MedicalHistory() {
  const { useEncounter } = usePatient();
  const [medicalHx, setMedicalHx] = useEncounter().history.medical([]);
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const [reviewed, setReviewed] = React.useState(false);

  const handleAddNew = () => {
    const newId = (medicalHx ?? []).length > 0 ? Math.max(...medicalHx.map((e: any) => e.id)) + 1 : 1;
    const newEntry = { id: newId, diagnosis: '', date: '' as Database.JSONDate, age: '', src: '', problemList: 'False', isNew: true };
    setMedicalHx([...(medicalHx ?? []), newEntry]);
    setExpandedRowIds(new Set([newId]));
  };

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleDelete = (id: any) => {
    setMedicalHx((prev: any) => prev.filter((row: any) => row.id !== id));
  };

  const handleSave = (updatedRow: any) => {
    setMedicalHx((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? { ...updatedRow, isNew: false } : row))
    );
    setExpandedRowIds(new Set());
  };

  const handleCancel = (row: any) => {
    if (row.isNew) {
      setMedicalHx((prev: any) => prev.filter((r: any) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };

  const handleReviewedChange = (e: any) => {
    setReviewed(e.target.checked);
  };

  const columns = [
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'age', headerName: 'Age', width: 120 },
    { field: 'src', headerName: 'Source', width: 200 },
    {
      field: 'problemList',
      headerName: 'Problem List',
      width: 150,
      renderCell: (params: any) => (
        <Checkbox
          checked={params.value === 'True'}
          disabled
          color="primary"
          icon={<Icon>radio_button_unchecked</Icon>}
          checkedIcon={<Icon>check_circle</Icon>}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params: any) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row.id)} color="primary">
            edit
          </IconButton>
        </Box>
      )
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: any) => (
      <MedicalHistoryDetailPanel
        row={row}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    ),
    [handleSave, handleCancel, handleDelete],
  );

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medical History</>} color="#9F3494">
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddNew} size="small">
          Add History
        </Button>
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={medicalHx ?? []}
          columns={columns}
          getRowId={(row: any) => row.id || `medical-${row.diagnosis}-${row.date}-${row.age}`}
          initialState={{
            columns: {
              columnVisibilityModel: {
                __detail_panel_toggle__: false,
              },
            },
          }}
          hideFooter
          disableRowSelectionOnClick
          getDetailPanelHeight={() => 'auto'}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={expandedRowIds}
          onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
        />
      </Box>
      <Stack direction="row" alignItems="center">
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            All medical history entries have been reviewed.
          </Label>
        )}
      </Stack>
    </TitledCard>
  );
}
