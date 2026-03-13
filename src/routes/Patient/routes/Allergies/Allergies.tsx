import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Icon,
  IconButton,
  DataGrid,
  useGridApiRef,
  Autocomplete,
  AutocompleteList,
  Label,
  Grid,
  DatePicker,
} from 'components/ui/Core';
import { MarkReviewed } from 'components/ui/MarkReviewed';
import { Checkbox, FormControlLabel, colors } from '@mui/material';

import { usePatient, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

const dummyAgents = [
  { allergen: 'Penicillin', type: Database.Allergy.Type.Drug },
  { allergen: 'Peanuts', type: Database.Allergy.Type.Food },
  { allergen: 'Latex', type: Database.Allergy.Type.Environmental },
  { allergen: 'Crab', type: Database.Allergy.Type.Food },
  { allergen: 'Metoprolol', type: Database.Allergy.Type.Ingredient },
  { allergen: 'Codeine', type: Database.Allergy.Type.Ingredient },
  { allergen: 'Demerol [Meperidine]', type: Database.Allergy.Type.Ingredient },
  { allergen: 'Xanax [Alprazolam]', type: Database.Allergy.Type.Ingredient },
  { allergen: 'Aspirin', type: Database.Allergy.Type.Drug },
  { allergen: 'Dust Mites', type: Database.Allergy.Type.Environmental },
  { allergen: 'Bee Venom', type: Database.Allergy.Type.Environmental },
  { allergen: 'Amoxicillin-potassium clavulanate', type: Database.Allergy.Type.Drug },
  { allergen: 'Other', type: Database.Allergy.Type.Other },
];

function AllergiesDetailPanel({ row, onSave, onCancel, onDelete }: {
  row: any
  onSave: (row: any) => void
  onCancel: (row: any) => void
  onDelete: (id: any) => void
}) {
  const [formData, setFormData] = React.useState<any>({ ...row });

  return (
    <Box paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', mx: 4, my: 2 }}>
      <Label variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
        {formData.allergen || 'New Allergy'}
      </Label>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Stack spacing={1.5}>
            {formData.isNew || !formData.allergen ? (
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                label="Agent"
                options={dummyAgents}
                getOptionLabel={(option) => option.allergen || ''}
                onChange={(e, newVal: any) => {
                  setFormData((prev: any) => {
                    const allergen = typeof newVal === 'string' ? newVal : newVal?.allergen;
                    const type = typeof newVal === 'string' ? Database.Allergy.Type.Other : (newVal?.type || prev.type);
                    return {
                      ...prev,
                      allergen: allergen || '',
                      type: type
                    };
                  });
                }}
                onInputChange={(e, newInputValue) => {
                  setFormData((prev: any) => ({ ...prev, allergen: newInputValue }));
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                      <Label variant="body2" fontWeight="medium">
                        {option.allergen}
                      </Label>
                      <Label variant="body2" color="text.secondary">
                        {option.type}
                      </Label>
                    </Stack>
                  </li>
                )}
              />
            ) : (
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                label="Agent"
                value={formData.allergen}
                options={[]}
              />
            )}

            <Autocomplete
              label="Allergen Types"
              fullWidth
              size="small"
              value={formData.type || 'None'}
              options={[]}
              disabled
            />

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <AutocompleteList
                sx={{ flex: 1.5 }}
                label="Reactions"
                options={Object.values(Database.Allergy.Reaction)}
                value={formData.reaction}
                onChange={(newVal: string[]) => setFormData((prev: any) => ({ ...prev, reaction: newVal }))}
              />
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Autocomplete
                  fullWidth
                  size="small"
                  label="Severity"
                  options={Object.values(Database.Allergy.Severity)}
                  value={formData.severity}
                  onChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, severity: newVal }))}
                  disableClearable
                />
                <DatePicker
                  convertString
                  size="small"
                  fullWidth
                  label="Noted"
                  value={formData.recorded}
                  onChange={(date) => setFormData((prev: any) => ({ ...prev, recorded: date }))}
                />
              </Stack>
            </Stack>

            <Autocomplete
              sx={{ width: '40%' }}
              size="small"
              label="Reaction Type"
              options={Object.values(Database.Allergy.ReactionType)}
              value={formData.reactionType}
              onChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, reactionType: newVal }))}
              disableClearable
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6.5 }}>
          <Stack spacing={1} sx={{ height: '100%' }}>
            <Autocomplete
              freeSolo
              fullWidth
              disableClearable
              label="Comment"
              TextFieldProps={{ multiline: true, rows: 6, sx: { '& .MuiInputBase-root': { py: 1 } } }}
              value={formData.comment}
              options={[]}
              onInputChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, comment: newVal }))}
            />
          </Stack>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" mt={2}>
        <Stack direction="row" spacing={1}>
          <Button outlined size="small">Past Updates</Button>
          <Button
            outlined
            color="error"
            size="small"
            startIcon={<Icon>close</Icon>}
            onClick={() => onDelete(formData.id)}
          >
            Delete
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            outlined
            color="success"
            size="small"
            startIcon={<Icon>check</Icon>}
            onClick={() => onSave({ ...formData, isNew: false })}
            disabled={!formData.allergen || formData.allergen.trim() === ''}
          >
            Accept
          </Button>
          <Button
            outlined
            color="error"
            size="small"
            startIcon={<Icon>close</Icon>}
            onClick={() => onCancel(row)}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export const Allergies = () => {
  const { useEncounter } = usePatient();
  const [allergies, setAllergies] = useEncounter().allergies([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const apiRef = useGridApiRef();

  const visibleAllergies = React.useMemo(() => {
    return filterDocuments(allergies || [], conditionals, orders);
  }, [allergies, conditionals, orders]);

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  React.useEffect(() => {
    if (allergies) {
      let madeChanges = false;
      const normalized = allergies.map((raw: any, idx: number) => {
        let newItem = { ...raw };
        if (!newItem.id) {
          newItem.id = `gen-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`;
          madeChanges = true;
        }
        const reactions = Array.isArray(newItem.reaction)
          ? newItem.reaction
          : (newItem.reaction ? [newItem.reaction] : []);

        return {
          ...newItem,
          allergen: newItem.allergen,
          type: newItem.type,
          reaction: reactions,
          reactionType: newItem.reactionType,
          severity: newItem.severity || 'Not Specified',
        }
      });

      if (madeChanges || JSON.stringify(normalized) !== JSON.stringify(allergies)) {
        setAllergies(normalized);
      }
    }
  }, [allergies, setAllergies]);

  // Cleanup unsaved new items when they are no longer expanded
  React.useEffect(() => {
    if (allergies) {
      const expandedIds = new Set(expandedRowIds);
      const itemsToRemove = allergies.filter((item: any) => item.isNew && !expandedIds.has(item.id));
      if (itemsToRemove.length > 0) {
        setAllergies((prev: any) => prev.filter((item: any) => !itemsToRemove.some((r: any) => r.id === item.id)));
      }
    }
  }, [expandedRowIds, allergies, setAllergies]);

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedRow: any) => {
    setAllergies((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? { ...updatedRow, isNew: false } : row))
    );
    setExpandedRowIds(new Set());
  };

  const handleDelete = (id: any) => {
    setAllergies((prev: any) => prev.filter((row: any) => row.id !== id));
    setExpandedRowIds(new Set());
  };

  const handleCancel = (row: any) => {
    if (row.isNew) {
      setAllergies((prev: any) => prev.filter((r: any) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };


  const handleAddClick = () => {
    if (allergies?.some((item: any) => item.isNew || !item.allergen)) {
      const existingNew = allergies.find((item: any) => item.isNew || !item.allergen);
      if (existingNew) setExpandedRowIds(new Set([(existingNew as any).id]));
      return;
    }

    const newEntry = {
      id: Database.Allergy.ID.create(),
      allergen: '',
      type: Database.Allergy.Type.Other,
      reaction: [],
      severity: Database.Allergy.Severity.NotSpecified,
      reactionType: Database.Allergy.ReactionType.Unknown,
      recorded: '',
      comment: '',
      resolved: false,
      verified: false,
      recorder: '',
      isNew: true
    } as unknown as Database.Allergy;

    setAllergies([...(allergies || []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
  };


  const columns = [
    {
      field: 'allergen',
      headerName: 'Allergen',
      flex: 1,
      renderCell: (params: any) => (
        <Stack>
          <Label variant="body2" bold={params.row.severity === 'High'}>
            {params.value}
          </Label>
          {params.row.comment && (
            <Label variant="caption" sx={{ display: 'block', pl: 1, opacity: 0.7 }}>
              {params.row.comment}
            </Label>
          )}
        </Stack>
      )
    },
    { field: 'type', headerName: 'Allergen Type', width: 150 },
    {
      field: 'reaction',
      headerName: 'Reaction',
      width: 200,
      valueFormatter: (params: any) => Array.isArray(params.value) ? params.value.join(', ') : params.value
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 130,
      renderCell: (params: any) => (
        <Box sx={{
          fontWeight: params.value === 'Not Specified' ? 'bold' : 'normal',
          bgcolor: params.value === 'Not Specified' ? '#ffcb00' : 'transparent',
          px: 1,
          borderRadius: 0.5
        }}>
          {params.value}
        </Box>
      )
    },
    { field: 'reactionType', headerName: 'Reaction Type', width: 150 },
    {
      field: 'recorded',
      headerName: 'Noted',
      width: 120,
      valueFormatter: (params: any) => params.value ? Temporal.Instant.from(params.value).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''
    },
    {
      field: '__detail_panel_toggle__',
      headerName: 'Edit',
      width: 48,
      sortable: false,
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: any) => (
      <AllergiesDetailPanel
        row={row}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    ),
    [handleSave, handleCancel, handleDelete]
  );

  return (
    <Stack spacing={2} sx={{ height: '100%', p: 2, overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Label variant="h6">Allergies/Contraindications</Label>
        <Button
          contained
          startIcon={<Icon>add</Icon>}
          onClick={handleAddClick}
          size="small"
        >
          Add Allergy
        </Button>
      </Stack>
      <DataGrid
        apiRef={apiRef}
        rows={visibleAllergies || []}
        columns={columns}
        getRowId={(row: any) => row.id || `${row.allergen}-${row.type}-${row.recorded}`}
        onRowDoubleClick={handleRowDoubleClick}
        hideFooter
        disableRowSelectionOnClick
        getDetailPanelHeight={() => 'auto'}
        getDetailPanelContent={getDetailPanelContent}
        detailPanelExpandedRowIds={expandedRowIds}
        onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
        getRowClassName={(params: any) => params.row.severity === 'High' ? 'severity-high' : ''}
        sx={{
          '& .severity-high': {
            bgcolor: '#ffcb00',
            '&:hover': {
              bgcolor: '#FFB700',
            },
          },
        }}
      />
      <MarkReviewed />
    </Stack>
  );
};
