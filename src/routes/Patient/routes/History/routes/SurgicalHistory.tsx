// SurgicalHistory.jsx
import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Icon,
  IconButton,
  Label,
  DataGrid,
  useGridApiRef,
  TitledCard,
  Autocomplete,
  DatePicker,
  MarkReviewed,
} from 'components/ui/Core';
import {
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { Database, usePatient } from '../../../../../components/contexts/PatientContext';
import { GridColDef } from '@mui/x-data-grid';

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

function SurgicalHistoryDetailPanel({ row, onSave, onCancel, onDelete }: { row: any; onSave: (row: any) => void; onCancel: (row: any) => void; onDelete: (id: any) => void }) {
  const [formData, setFormData] = React.useState({
    procedure: '',
    laterality: Database.SurgicalHistoryItem.Laterality.NA,
    date: '' as any,
    age: '',
    comment: '',
    source: undefined,
    ...row
  });

  const { useChart } = usePatient();
  const [patientData] = useChart()();

  // Sync age in formData when date changes
  React.useEffect(() => {
    if (patientData?.birthdate && formData.date) {
      const age = Database.JSONDate.toAge(patientData.birthdate, formData.date).toString();
      if (formData.age !== age) {
        setFormData((prev: any) => ({ ...prev, age }));
      }
    }
  }, [formData.date, patientData?.birthdate, formData.age]);

  return (
    <Box paper elevation={5} sx={{ p: 2, mx: 4, my: 1, bgcolor: 'background.paper' }}>
      <Label variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Details
      </Label>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Autocomplete
                freeSolo
                fullWidth
                label="Procedure"
                size="small"
                options={procedures}
                value={formData.procedure}
                onChange={(_e, newValue) => setFormData((prev: any) => ({ ...prev, procedure: newValue }))}
                onInputChange={(_e, newInputValue) => setFormData((prev: any) => ({ ...prev, procedure: newInputValue }))}
              />
              <Button outlined sx={{ minWidth: 40, p: 0, height: 40 }}>
                <Icon>change_history</Icon>
              </Button>
            </Stack>

            <Autocomplete
              fullWidth
              label="Laterality"
              size="small"
              options={Object.values(Database.SurgicalHistoryItem.Laterality)}
              value={formData.laterality}
              onChange={(_e, newValue) => setFormData((prev: any) => ({ ...prev, laterality: newValue }))}
            />

            <DatePicker
              convertString
              label="Date"
              size="small"
              helperText={(() => {
                if (!patientData?.birthdate || !formData.date) return 'Age: —';
                const age = Database.JSONDate.toAge(patientData.birthdate, formData.date);
                return `Age: ${age} years old`;
              })()}
              fullWidth
              value={formData.date}
              onChange={(date: any) => setFormData((prev: any) => ({ ...prev, date }))}
            />

            <Autocomplete
              freeSolo
              fullWidth
              label="Comment/Notes"
              size="small"
              options={[]}
              value={formData.comment}
              onInputChange={(_e, newVal) => setFormData((prev: any) => ({ ...prev, comment: newVal }))}
            />

            <Autocomplete
              freeSolo
              fullWidth
              label="Source"
              size="small"
              options={Object.values(Database.SurgicalHistoryItem.Source)}
              value={formData.source}
              onChange={(_e, newValue) => setFormData((prev: any) => ({ ...prev, source: newValue }))}
              onInputChange={(_e, newInputValue) => setFormData((prev: any) => ({ ...prev, source: newInputValue }))}
            />
          </Stack>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" mt={4}>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onDelete(formData.id)}
            variant="outlined"
            color="error"
            startIcon={<Icon>delete</Icon>}
            size="small"
            disabled={formData.isNew}
          >
            Delete
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onSave(formData)}
            variant="outlined"
            color="success"
            size="small"
            startIcon={<Icon>check</Icon>}
            disabled={!formData.procedure || formData.procedure.trim() === ''}
          >
            Accept
          </Button>
          <Button
            onClick={() => onCancel(row)}
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Icon>close</Icon>}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export function SurgicalHistory() {
  const { useEncounter, useChart } = usePatient();
  const [surgicalHx, setSurgicalHx] = useEncounter().history.surgical([]);
  const [patientData] = useChart()();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const apiRef = useGridApiRef();

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  // Ensure all items have unique IDs
  React.useEffect(() => {
    if (surgicalHx) {
      let madeChanges = false;
      const normalized = surgicalHx.map((item: any, idx: number) => {
        if (!item.id) {
          madeChanges = true;
          return { ...item, id: `gen-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}` };
        }
        return item;
      });

      if (madeChanges) {
        setSurgicalHx(normalized);
      }
    }
  }, [surgicalHx, setSurgicalHx]);

  // Cleanup unsaved new items when they are no longer expanded
  React.useEffect(() => {
    if (surgicalHx) {
      const expandedIds = new Set(expandedRowIds);
      const itemsToRemove = surgicalHx.filter((item: any) => item.isNew && !expandedIds.has(item.id));
      if (itemsToRemove.length > 0) {
        setSurgicalHx((prev: any) => prev.filter((item: any) => !itemsToRemove.some((r: any) => r.id === item.id)));
      }
    }
  }, [expandedRowIds, surgicalHx, setSurgicalHx]);

  const handleAddNew = () => {
    if (surgicalHx?.some((item: any) => item.isNew || !item.procedure)) {
      const existingNew = surgicalHx.find((item: any) => item.isNew || !item.procedure);
      if (existingNew) setExpandedRowIds(new Set([(existingNew as any).id]));
      return;
    }

    const newEntry = { id: Database.SurgicalHistoryItem.ID.create(), procedure: '', date: (new Date()).toISOString() as Database.JSONDate, age: '', laterality: Database.SurgicalHistoryItem.Laterality.NA, source: undefined, comment: '', isNew: true };
    setSurgicalHx([...(surgicalHx ?? []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
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


  const columns: GridColDef[] = [
    { field: 'procedure', headerName: 'Procedure', flex: 1 },
    { field: 'laterality', headerName: 'Laterality', width: 120 },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r?.date) return 'N/A';
        return Database.JSONDate.toDateString(r.date);
      }
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 120,
      valueGetter: (value: any, row: any) => {
        if (!patientData?.birthdate || !row.date) return row.age || '—';
        return Database.JSONDate.toAge(patientData.birthdate, row.date).toString();
      }
    },
    { field: 'comment', headerName: 'Comment', width: 200 },
    { field: 'source', headerName: 'Source', width: 220 },
    { field: '__detail_panel_toggle__', width: 48 }
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
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, maxHeight: 'calc(100vh - 300px)' }}>
        <DataGrid
          apiRef={apiRef}
          rows={surgicalHx ?? []}
          columns={columns}
          getRowId={(row: any) => row.id}
          hideFooter
          disableRowSelectionOnClick
          onRowDoubleClick={handleRowDoubleClick}
          getDetailPanelHeight={() => 'auto'}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={expandedRowIds}
          onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
        />
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}