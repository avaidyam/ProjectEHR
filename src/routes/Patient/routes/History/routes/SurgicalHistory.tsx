// SurgicalHistory.jsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Database, usePatient } from '../../../../../components/contexts/PatientContext';

const procedures = [
  "Appendectomy", "Cholecystectomy", "Hernia Repair - Inguinal", "Hernia Repair - Umbilical",
  "Hernia Repair - Ventral", "Tonsillectomy", "Adenoidectomy", "Cataract Removal",
  "Carpal Tunnel Release", "Arthroscopy - Knee", "Arthroscopy - Shoulder",
  "Hip Replacement", "Knee Replacement", "Coronary Artery Bypass (CABG)",
  "Angioplasty", "Pacemaker Insertion", "Gallbladder Removal", "Thyroidectomy",
  "Mastectomy", "Lumpectomy", "Hysterectomy", "Cesarean Section", "Tubal Ligation",
  "Vasectomy", "Prostatectomy", "Kidney Stone Removal", "Bladder Surgery",
  "Colon Resection", "Gastric Bypass", "Sleeve Gastrectomy", "Spinal Fusion",
  "Discectomy", "Craniotomy", "Skin Graft", "Mole Removal", "Cyst Removal",
  "Lipoma Removal", "Septoplasty", "Sinus Surgery", "Endoscopy - Upper",
  "Endoscopy - Lower", "Colonoscopy with Polypectomy", "Bronchoscopy",
  "Laparoscopy - Diagnostic", "Laparoscopy - Therapeutic", "Biopsy - Liver",
  "Biopsy - Kidney", "Biopsy - Lung", "Stent Placement", "Feeding Tube Placement",
  "Tracheostomy", "Wound Debridement", "Fracture Repair - Arm", "Fracture Repair - Leg",
  "Fracture Repair - Hand", "Fracture Repair - Foot", "Amputation - Toe",
  "Amputation - Finger", "Amputation - Below Knee", "Amputation - Above Knee",
  "Vascular Graft", "Embolectomy", "Carotid Endarterectomy", "Fistula Creation",
  "Port Placement", "Central Line Placement", "Dialysis Access", "Other"
];

const lateralityOptions = ['N/A', 'Bilateral', 'Left', 'Right'];
const sourceOptions = ['Approved by Clinician', 'From Patient Questionnaire'];

function SurgicalHistoryDetailPanel({ row, onSave, onCancel, onDelete }: { row: any; onSave: (row: any) => void; onCancel: (row: any) => void; onDelete: (id: any) => void }) {
  const [formData, setFormData] = React.useState({ ...row });

  const handleChange = (e: any) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Box paper elevation={5} sx={{ p: 2, mx: 4, my: 1 }}>
      <Label variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        {row.isNew ? 'Add New Surgical Entry' : 'Edit Surgical Entry'}
      </Label>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Procedure *</InputLabel>
            <Select name="procedure" value={formData.procedure} onChange={handleChange} label="Procedure *">
              {procedures.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Laterality</InputLabel>
            <Select name="laterality" value={formData.laterality} onChange={handleChange} label="Laterality">
              {lateralityOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Age" name="age" value={formData.age} onChange={handleChange} fullWidth size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Source</InputLabel>
            <Select name="src" value={formData.src} onChange={handleChange} label="Source">
              {sourceOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={12}>
          <TextField label="Comment/Notes" name="notes" value={formData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button onClick={() => onSave(formData)} variant="contained" color="primary" sx={{ mr: 1 }} size="small">Save</Button>
              <Button onClick={() => onCancel(row)} variant="outlined" size="small">Cancel</Button>
            </Box>
            {!row.isNew && (
              <Button onClick={() => onDelete(row.id)} variant="contained" color="error" startIcon={<Icon>delete</Icon>} size="small">Delete</Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export function SurgicalHistory() {
  const { useEncounter } = usePatient();
  const [surgicalHx, setSurgicalHx] = useEncounter().history.surgical([]);
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const [reviewed, setReviewed] = React.useState(false);

  const handleAddNew = () => {
    const newId = (surgicalHx ?? []).length > 0 ? Math.max(...surgicalHx.map((e: any) => e.id)) + 1 : 1;
    const newEntry = { id: newId, procedure: '', date: '' as Database.JSONDate, age: '', laterality: 'N/A', src: '', notes: '', isNew: true };
    setSurgicalHx([...(surgicalHx ?? []), newEntry]);
    setExpandedRowIds(new Set([newId]));
  };

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleDelete = (id: any) => {
    setSurgicalHx((prev: any) => prev.filter((row: any) => row.id !== id));
  };

  const handleSave = (updatedRow: any) => {
    setSurgicalHx((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? { ...updatedRow, isNew: false } : row))
    );
    setExpandedRowIds(new Set());
  };

  const handleCancel = (row: any) => {
    if (row.isNew) {
      setSurgicalHx((prev: any) => prev.filter((r: any) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };

  const handleReviewedChange = (e: any) => {
    setReviewed(e.target.checked);
  };

  const columns = [
    { field: 'procedure', headerName: 'Procedure', flex: 1, renderCell: (params: any) => <Box sx={{ color: '#e91e63', fontWeight: 'bold' }}>{params.value}</Box> },
    { field: 'laterality', headerName: 'Laterality', width: 120 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'age', headerName: 'Age', width: 120 },
    { field: 'notes', headerName: 'Comment', width: 200 },
    { field: 'src', headerName: 'Source', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton onClick={() => handleEdit(params.row.id)} color="primary">edit</IconButton>
      )
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: any) => (
      <SurgicalHistoryDetailPanel row={row} onSave={handleSave} onCancel={handleCancel} onDelete={handleDelete} />
    ),
    [handleSave, handleCancel, handleDelete],
  );

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Surgical History</>} color="#9F3494">
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddNew} size="small">Add History</Button>
      </Box>
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={surgicalHx ?? []}
          columns={columns}
          getRowId={(row: any) => row.id || `surgical-${row.procedure}-${row.date}-${row.age}`}
          initialState={{ columns: { columnVisibilityModel: { __detail_panel_toggle__: false } } }}
          hideFooter
          disableRowSelectionOnClick
          getDetailPanelHeight={() => 'auto'}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={expandedRowIds}
          onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
        />
      </Box>
      <Stack direction="row" alignItems="center">
        <FormControlLabel control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />} label="Mark as Reviewed" />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>All surgical history entries have been reviewed.</Label>
        )}
      </Stack>
    </TitledCard>
  );
}