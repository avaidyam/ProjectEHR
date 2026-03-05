// MedicalHistory.jsx
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
  Grid,
} from '@mui/material';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { GridColDef, GridRowId } from '@mui/x-data-grid';
import { getICD10CodeDescription } from 'util/helpers';
import { DiagnosisPicker } from '../../ProblemList/components/DiagnosisPicker';

function MedicalHistoryDetailPanel({ row, onSave, onCancel, onDelete, onOpenModal, problems }: {
  row: any;
  onSave: (row: any, addToProblemList?: boolean) => void;
  onCancel: (row: any) => void;
  onDelete: (id: any) => void;
  onOpenModal: (index: string | number) => void;
  problems: any[];
}) {
  const [formData, setFormData] = React.useState({
    diagnosis: '',
    displayAs: '',
    date: '' as any,
    age: '',
    comment: '',
    source: undefined,
    isNew: false,
    ...row
  });
  const [shouldAddToProblemList, setShouldAddToProblemList] = React.useState(false);

  React.useEffect(() => {
    setFormData({ ...row });
    setShouldAddToProblemList(false);
  }, [row]);

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
                label="Diagnosis"
                size="small"
                disabled={!formData.isNew}
                value={formData.diagnosis ? `${getICD10CodeDescription(formData.diagnosis) || formData.diagnosis} (${formData.diagnosis})` : ''}
                onInputChange={(_e, newVal) => {
                  const match = newVal.match(/\(([^)]+)\)$/);
                  const code = (match ? match[1] : newVal) as Database.DiagnosisCode;
                  setFormData((prev: any) => ({
                    ...prev,
                    diagnosis: code,
                    displayAs: prev.displayAs || getICD10CodeDescription(code) || ''
                  }));
                }}
                options={[]}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onOpenModal(formData.id);
                  }
                }}
              />
              <Button outlined sx={{ minWidth: 40, p: 0, height: 40 }} onClick={() => onOpenModal(formData.id)}>
                <Icon>search</Icon>
              </Button>
            </Stack>

            <Autocomplete
              freeSolo
              fullWidth
              label="Display"
              size="small"
              options={[]}
              value={formData.displayAs}
              onInputChange={(_e, newVal) => setFormData((prev: any) => ({ ...prev, displayAs: newVal }))}
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
              onChange={(date: any) => {
                setFormData((prev: any) => ({ ...prev, date }));
              }}
            />

            <Autocomplete
              freeSolo
              fullWidth
              label="Comment"
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
              options={Object.values(Database.MedicalHistoryItem.Source)}
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
          <Button
            variant={shouldAddToProblemList ? "contained" : "outlined"}
            color="primary"
            size="small"
            startIcon={<Icon>{shouldAddToProblemList ? "check_circle" : "add"}</Icon>}
            disabled={problems.some(p => p.diagnosis?.replace(/\./g, '') === formData.diagnosis?.replace(/\./g, ''))}
            onClick={() => setShouldAddToProblemList(!shouldAddToProblemList)}
          >
            {shouldAddToProblemList ? "Added to Session" : "Add to Problem List"}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onSave(formData, shouldAddToProblemList)}
            variant="outlined"
            color="success"
            size="small"
            startIcon={<Icon>check</Icon>}
            disabled={!formData.diagnosis || formData.diagnosis.trim() === ''}
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

export function MedicalHistory() {
  const { useEncounter, useChart } = usePatient();
  const [medicalHx, setMedicalHx] = useEncounter().history.medical([]);
  const [problems, setProblems] = useEncounter().problems([]);
  const [patientData] = useChart()();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<GridRowId>>(new Set());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [idToUpdate, setIdToUpdate] = React.useState<any>(null);
  const apiRef = useGridApiRef();

  const handleOpenModal = (id: any, term = "") => {
    setIdToUpdate(id);
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection: any) => {
    setIsModalOpen(false);
    if (!selection) return;
    const selectedItems = Array.isArray(selection) ? selection : [selection];
    if (selectedItems.length === 0) return;

    if (idToUpdate !== null) {
      const item = selectedItems[0];
      setMedicalHx((prev: any) => prev.map((row: any) =>
        row.id === idToUpdate ? { ...row, diagnosis: item.conceptId, displayAs: item.name } : row
      ));
    }
    setIdToUpdate(null);
  };

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  // Ensure all items have an ID
  React.useEffect(() => {
    if (medicalHx) {
      let madeChanges = false;
      const newHx = medicalHx.map((item: any, index: number) => {
        if (!item.id) {
          madeChanges = true;
          return { ...item, id: `gen-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}` };
        }
        return item;
      });

      if (madeChanges) {
        setMedicalHx(newHx);
      }
    }
  }, [medicalHx, setMedicalHx]);

  const handleAddNew = () => {
    if (medicalHx?.some((item: any) => item.isNew || !item.diagnosis)) {
      const existingNew = medicalHx.find((item: any) => item.isNew || !item.diagnosis);
      if (existingNew) setExpandedRowIds(new Set([(existingNew as any).id]));
      return;
    }
    const newEntry = { id: Database.MedicalHistoryItem.ID.create(), diagnosis: '' as Database.DiagnosisCode, displayAs: '', date: (new Date()).toISOString() as Database.JSONDate, age: '', source: undefined, comment: '', isNew: true };
    setMedicalHx([...(medicalHx ?? []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
  };

  // Cleanup unsaved new items when they are no longer expanded
  React.useEffect(() => {
    if (medicalHx) {
      const expandedIds = new Set(expandedRowIds);
      const itemsToRemove = medicalHx.filter((item: any) => item.isNew && !expandedIds.has(item.id));
      if (itemsToRemove.length > 0) {
        setMedicalHx((prev: any) => prev.filter((item: any) => !itemsToRemove.some((r: any) => r.id === item.id)));
      }
    }
  }, [expandedRowIds, medicalHx, setMedicalHx]);

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleDelete = (id: any) => {
    setMedicalHx((prev: any) => prev.filter((row: any) => row.id !== id));
  };

  const handleSave = (updatedRow: any, addToProblemList?: boolean) => {
    setMedicalHx((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? { ...updatedRow, isNew: false } : row))
    );

    if (addToProblemList) {
      const newProblem = {
        id: Database.Problem.ID.create(),
        diagnosis: updatedRow.diagnosis,
        displayAs: updatedRow.displayAs || getICD10CodeDescription(updatedRow.diagnosis) || 'Unknown',
        notedDate: updatedRow.date,
        class: '',
        chronic: false,
        priority: '',
        isNew: true
      };
      setProblems((prev: any) => [...(prev ?? []), newProblem]);
    }

    setExpandedRowIds(new Set());
  };

  const handleCancel = (row: any) => {
    if (row.isNew) {
      setMedicalHx((prev: any) => prev.filter((r: any) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };


  const columns: GridColDef[] = [
    {
      field: 'diagnosis',
      headerName: 'Diagnosis',
      flex: 1,
      valueGetter: (value: any, row: any) => {
        const r = row || value.row;
        if (!r) return '';
        const name = r.displayAs || getICD10CodeDescription(r.diagnosis) || 'Unknown';
        return `${name} (${r.diagnosis})`;
      }
    },
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
    { field: 'source', headerName: 'Source', width: 220 },
    {
      field: 'problemList',
      headerName: 'PL?',
      width: 80,
      renderCell: (params) => {
        const isInProblemList = (problems ?? []).some(
          (p: any) => p.diagnosis?.replace(/\./g, '') === params.row.diagnosis?.replace(/\./g, '')
        );
        return (
          <Checkbox
            checked={isInProblemList}
            disabled
            color="primary"
            icon={<Icon>radio_button_unchecked</Icon>}
            checkedIcon={<Icon>check_circle</Icon>}
          />
        );
      }
    },
    { field: '__detail_panel_toggle__', width: 48 }
  ];

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medical History</>} color="#9F3494">
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddNew} size="small">
          Add History
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, maxHeight: 'calc(100vh - 300px)' }}>
        <DataGrid
          apiRef={apiRef}
          rows={medicalHx ?? []}
          columns={columns}
          getRowId={(row: any) => row.id}
          hideFooter
          disableRowSelectionOnClick
          onRowDoubleClick={handleRowDoubleClick}
          getDetailPanelHeight={() => 'auto'}
          getDetailPanelContent={({ row }: any) => (
            <MedicalHistoryDetailPanel
              row={row}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onOpenModal={handleOpenModal}
              problems={problems ?? []}
            />
          )}
          detailPanelExpandedRowIds={expandedRowIds}
          onDetailPanelExpandedRowIdsChange={(newIds) => setExpandedRowIds(new Set(newIds))}
        />
      </Box>
      <DiagnosisPicker
        open={isModalOpen}
        onSelect={handleSelect}
        onClose={() => setIsModalOpen(false)}
        searchTerm={searchTerm}
      />
      <MarkReviewed />
    </TitledCard>
  );
}
