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
import { Checkbox, FormControlLabel } from '@mui/material';
import dayjs from 'dayjs';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';

// Format dose for display
const formatDose = (dose: any) => {
  if (!dose) return '';
  const { value, unit } = dose;
  const unitStr = [unit?.mass, unit?.volume, unit?.time].filter(Boolean).join('/');
  return `${value} ${unitStr}`;
};

// Format date for display
const formatDate = (dateString: any) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return dateString;
  } catch (error) {
    return 'Invalid Date';
  }
};

const dummyVaccines = [
  { vaccine: 'Influenza, inactivated (IIV)', family: 'Influenza' },
  { vaccine: 'Tetanus, diphtheria toxoids and acellular pertussis (Tdap)', family: 'Tdap' },
  { vaccine: 'Pneumococcal 20-valent conjugate (PCV20)', family: 'Pneumococcal' },
  { vaccine: 'Hepatitis B (HepB)', family: 'Hepatitis B' },
  { vaccine: 'Measles, Mumps, Rubella (MMR)', family: 'MMR' },
  { vaccine: 'Varicella (VAR)', family: 'Varicella' },
  { vaccine: 'Zoster Recombinant (RZV)', family: 'Zoster' },
  { vaccine: 'Human Papillomavirus (HPV)', family: 'HPV' },
];

function ImmunizationsDetailPanel({ row, onSave, onCancel, onDelete }: { row: any; onSave: (row: any) => void; onCancel: (row: any) => void; onDelete: (id: any) => void }) {
  const [providers] = useDatabase().providers();
  const [formData, setFormData] = React.useState({ ...row });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDoseChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      dose: {
        ...prev.dose,
        [field]: value
      }
    }));
  };

  const handleUnitChange = (type: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      dose: {
        ...prev.dose,
        unit: {
          ...prev.dose?.unit,
          [type]: value
        }
      }
    }));
  };

  const FieldLabel = ({ children, sx }: { children: React.ReactNode; sx?: any }) => (
    <Label variant="caption" sx={{ minWidth: 100, color: 'text.secondary', ...sx }}>
      {children}
    </Label>
  );

  return (
    <Box paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', mx: 4, my: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <FieldLabel>Vaccine</FieldLabel>
              {formData.isNew ? (
                <Autocomplete
                  fullWidth
                  size="small"
                  options={dummyVaccines}
                  getOptionLabel={(option) => option.vaccine || ''}
                  onChange={(e, newVal) => {
                    setFormData((prev: any) => ({
                      ...prev,
                      vaccine: newVal?.vaccine || '',
                      family: newVal?.family || prev.family
                    }));
                  }}
                  renderInput={(params: any) => <TextField {...params} />}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.vaccine}
                  disabled
                  sx={{ '& .MuiInputBase-input': { bgcolor: 'grey.100' } }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center">
              <FieldLabel>Date Received</FieldLabel>
              <TextField
                fullWidth
                type="date"
                size="small"
                value={formData.received}
                onChange={(e) => handleChange('received', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Recorder:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={providers || []}
                    getOptionLabel={(option) => typeof option === 'string' ? option : (option.name || '')}
                    value={providers?.find((p: any) => p.name === formData.recorder) || null}
                    onChange={(e, newVal) => handleChange('recorder', newVal?.name || '')}
                    disableClearable
                    renderInput={(params: any) => <TextField {...params} />}
                  />
                </Stack>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Recorded:</FieldLabel>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    value={formData.recorded}
                    onChange={(e) => handleChange('recorded', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Given By:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={providers || []}
                    getOptionLabel={(option) => typeof option === 'string' ? option : (option.name || '')}
                    value={providers?.find((p: any) => p.name === formData.given_by) || null}
                    onChange={(e, newVal) => handleChange('given_by', newVal?.name || '')}
                    disableClearable
                    renderInput={(params: any) => <TextField {...params} />}
                  />
                </Stack>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Facility:</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.facility}
                    onChange={(e) => handleChange('facility', e.target.value)}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FieldLabel sx={{ minWidth: 60 }}>Dose:</FieldLabel>
              <TextField
                type="number"
                size="small"
                sx={{ width: 80 }}
                value={formData.dose?.value}
                onChange={(e) => handleDoseChange('value', parseFloat(e.target.value))}
              />
              <Autocomplete
                size="small"
                sx={{ width: 100 }}
                options={Object.values(Database.Units.Mass)}
                value={formData.dose?.unit?.mass}
                onChange={(e, newVal) => handleUnitChange('mass', newVal)}
                renderInput={(params: any) => <TextField {...params} label="Mass" />}
                disableClearable
              />
              <Autocomplete
                size="small"
                sx={{ width: 100 }}
                options={Object.values(Database.Units.Volume)}
                value={formData.dose?.unit?.volume}
                onChange={(e, newVal) => handleUnitChange('volume', newVal)}
                renderInput={(params: any) => <TextField {...params} label="Vol" />}
                disableClearable
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Site:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={Object.values(Database.Immunization.Site)}
                    value={formData.site}
                    onChange={(e, newVal) => handleChange('site', newVal)}
                    renderInput={(params: any) => <TextField {...params} />}
                  />
                </Stack>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Route:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={Object.values(Database.Immunization.Route)}
                    value={formData.route}
                    onChange={(e, newVal) => handleChange('route', newVal)}
                    renderInput={(params: any) => <TextField {...params} />}
                  />
                </Stack>
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Lot #:</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.lot}
                    onChange={(e) => handleChange('lot', e.target.value)}
                  />
                </Stack>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Mfr:</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" mt={3}>
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
            contained
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

export const Immunizations = () => {
  const { useEncounter } = usePatient();
  const [immunizations, setImmunizations] = useEncounter().immunizations([]);
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<any>>(new Set());
  const [reviewed, setReviewed] = React.useState(false);
  const [lastReviewed, setLastReviewed] = React.useState<string | null>(null);

  const handleEdit = (id: any) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedRow: any) => {
    setImmunizations((prev: any) =>
      prev.map((row: any) => (row.id === updatedRow.id ? updatedRow : row))
    );
    setExpandedRowIds(new Set());
  };

  const handleDelete = (id: any) => {
    setImmunizations((prev: any) => prev.filter((row: any) => row.id !== id));
    setExpandedRowIds(new Set());
  };

  const handleCancel = (row: any) => {
    if (row.isNew) {
      setImmunizations((prev: any) => prev.filter((r: any) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };

  const handleAddClick = () => {
    const newEntry: Database.Immunization = {
      id: Database.Immunization.ID.create(),
      vaccine: '',
      received: dayjs().format('YYYY-MM-DD'),
      recorder: '',
      recorded: dayjs().format('YYYY-MM-DD'),
      administeredBy: '',
      facility: '',
      dose: { value: 0, unit: { mass: '', volume: '', time: '' } },
      site: '',
      route: '',
      lot: '',
      manufacturer: ''
    };

    setImmunizations([...(immunizations || []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
  };

  const handleReviewedChange = (e: any) => {
    setReviewed(e.target.checked);
    if (e.target.checked) {
      setLastReviewed(dayjs().format('MMM D, YYYY h:mm A'));
    }
  };

  const columns = [
    { field: 'vaccine', headerName: 'Vaccine', flex: 1 },
    {
      field: 'received',
      headerName: 'Date Received',
      width: 150,
      valueFormatter: (params: any) => formatDate(params.value)
    },
    { field: 'recorder', headerName: 'Recorder', width: 150 },
    { field: 'administeredBy', headerName: 'Given By', width: 150 },
    { field: 'facility', headerName: 'Facility', width: 150 },
    {
      field: 'dose',
      headerName: 'Dose',
      width: 120,
      renderCell: (params: any) => formatDose(params.value)
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
      <ImmunizationsDetailPanel
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
        <Label variant="h6">Current Immunizations</Label>
        <Button
          contained
          startIcon={<Icon>add</Icon>}
          onClick={handleAddClick}
          size="small"
        >
          Add Immunization
        </Button>
      </Stack>

      <DataGrid
        rows={immunizations || []}
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
      </Stack>
    </Stack>
  );
};
