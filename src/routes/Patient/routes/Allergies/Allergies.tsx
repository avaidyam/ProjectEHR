import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Icon,
  IconButton,
  DataGrid,
  TextField,
  MenuItem,
  Autocomplete,
  Label,
  Grid
} from 'components/ui/Core';
import { Checkbox, FormControlLabel, colors } from '@mui/material';

import { usePatient, Database } from 'components/contexts/PatientContext';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const FieldLabel = ({ children, sx }: { children: React.ReactNode; sx?: any }) => (
    <Label variant="caption" sx={{ minWidth: 100, color: 'text.secondary', ...sx }}>
      {children}
    </Label>
  );

  return (
    <Box paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', mx: 4, my: 2 }}>
      <Label variant="subtitle1" sx={{ color: colors.blue[700], mb: 1, fontWeight: 500 }}>
        {formData.allergen || 'New Allergy'}
      </Label>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <FieldLabel>Agent</FieldLabel>
              {formData.isNew ? (
                <Autocomplete
                  fullWidth
                  size="small"
                  options={dummyAgents}
                  getOptionLabel={(option) => option.allergen || ''}
                  onChange={(e, newVal) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      allergen: newVal?.allergen || '',
                      type: newVal?.type || prev.type
                    }));
                  }}
                  renderInput={(params: any) => <TextField {...params} />}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Grid container alignItems="center">
                        <Grid size={6}>
                          <Label variant="body2" fontWeight="medium">
                            {option.allergen}
                          </Label>
                        </Grid>
                        <Grid size={6}>
                          <Label variant="body2" color="text.secondary">
                            {option.type}
                          </Label>
                        </Grid>
                      </Grid>
                    </li>
                  )}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  name="allergen"
                  value={formData.allergen}
                  disabled
                  sx={{ '& .MuiInputBase-input': { bgcolor: 'grey.100' } }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center">
              <FieldLabel>Allergen Types:</FieldLabel>
              <Label variant="body2">{formData.type || 'None'}</Label>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Stack direction="row" alignItems="flex-start" sx={{ flex: 1.5 }}>
                  <FieldLabel sx={{ mt: 1, minWidth: 80 }}>Reactions:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={Object.values(Database.Allergy.Reaction)}
                    value={formData.reaction}
                    onChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, reaction: newVal }))}
                    renderInput={(params: any) => <TextField {...params} />}
                    disableClearable
                  />
                </Stack>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center">
                    <Label variant="caption" sx={{ minWidth: 60, color: 'text.secondary' }}>Severity:</Label>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={Object.values(Database.Allergy.Severity)}
                      value={formData.severity}
                      onChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, severity: newVal }))}
                      renderInput={(params: any) => <TextField {...params} />}
                      disableClearable
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Label variant="caption" sx={{ minWidth: 60, color: 'text.secondary' }}>Noted:</Label>
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      name="recorded"
                      value={formData.recorded}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                </Stack>
              </Stack>

              <Stack direction="row" alignItems="center">
                <FieldLabel sx={{ minWidth: 80 }}>Reaction Type:</FieldLabel>
                <Autocomplete
                  sx={{ width: '40%' }}
                  size="small"
                  options={Object.values(Database.Allergy.ReactionType)}
                  value={formData.reactionType}
                  onChange={(e, newVal) => setFormData((prev: any) => ({ ...prev, reactionType: newVal }))}
                  renderInput={(params: any) => <TextField {...params} />}
                  disableClearable
                />
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6.5 }}>
          <Stack spacing={1} sx={{ height: '100%' }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              sx={{ '& .MuiInputBase-root': { py: 1 } }}
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
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const [reviewed, setReviewed] = React.useState(false);
  const [lastReviewed, setLastReviewed] = React.useState<string | null>(null);

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  React.useEffect(() => {
    if (allergies) {
      const normalized = allergies.map((raw: any, idx: number) => ({
        ...raw,
        id: raw.id || `allergy-${idx}`,
        allergen: capitalize(raw.allergen),
        type: capitalize(raw.type),
        reaction: capitalize(raw.reaction),
        reactionType: capitalize(raw.reactionType),
        severity: capitalize(raw.severity || 'Not Specified'),
      }));
      // Simple shallow check to avoid infinite loop
      if (JSON.stringify(normalized) !== JSON.stringify(allergies)) {
        setAllergies(normalized);
      }
    }
  }, [allergies, setAllergies]);

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedRow: any) => {
    setAllergies((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? { ...updatedRow, isNew: false } : row))
    );
    setExpandedRowIds(new Set());
    setLastReviewed(null); // Reset review status when data changes
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
    const newEntry: Database.Allergy = {
      id: Database.Allergy.ID.create(),
      allergen: '',
      type: Database.Allergy.Type.Other,
      reaction: '',
      severity: Database.Allergy.Severity.NotSpecified,
      reactionType: Database.Allergy.ReactionType.Unknown,
      recorded: '',
      comment: '',
      resovled: false,
      verified: false,
      recorder: '',
      isNew: true
    };

    setAllergies([...(allergies || []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
  };

  const handleReviewedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewed(e.target.checked);
    if (e.target.checked) {
      setLastReviewed(Temporal.Now.instant().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }));
    }
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
    { field: 'reaction', headerName: 'Reaction', width: 150 },
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
      valueFormatter: (params: any) => params.value ? Temporal.PlainDate.from(params.value).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton onClick={() => handleEdit(params.row.id)} color="primary">
          edit
        </IconButton>
      )
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
        rows={allergies || []}
        columns={columns}
        getRowId={(row: any) => row.id}
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
      <Stack direction="row" alignItems="center" spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="body2" color="green" italic>
            Last Reviewed at {lastReviewed}
          </Label>
        )}
        {!reviewed && (
          <Label variant="body2" color="gray" italic>
            Not Reviewed
          </Label>
        )}
      </Stack>
    </Stack>
  );
};
