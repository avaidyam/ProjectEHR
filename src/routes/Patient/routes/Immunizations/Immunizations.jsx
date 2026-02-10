import React, { useState, useEffect, useCallback } from 'react';
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
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
// Common immunization routes
const IMMUNIZATION_ROUTES = {
  IM: 'Intramuscular (IM)',
  SC: 'Subcutaneous (SC)',
  ID: 'Intradermal (ID)',
  IN: 'Intranasal (IN)',
  PO: 'Oral (PO)',
  IV: 'Intravenous (IV)'
};

// Common immunization sites
const IMMUNIZATION_SITES = {
  'left_deltoid': 'Left deltoid',
  'right_deltoid': 'Right deltoid',
  'left_thigh': 'Left thigh',
  'right_thigh': 'Right thigh',
  'left_arm': 'Left arm',
  'right_arm': 'Right arm',
  'left_glute': 'Left gluteal',
  'right_glute': 'Right gluteal',
  'oral': 'Oral',
  'nasal': 'Nasal'
};

// Common mass units
const MASS_UNITS = {
  'mg': 'mg',
  'g': 'g',
  'mcg': 'mcg',
  'mg/ml': 'mg/ml',
  'mg/kg': 'mg/kg'
};

// Common volume units
const VOLUME_UNITS = {
  'ml': 'ml',
  'l': 'L',
  'cc': 'cc'
};

// Common time units
const TIME_UNITS = {
  'min': 'minutes',
  'hr': 'hours',
  'day': 'days'
};

// Format dose for display
const formatDose = (dose) => {
  if (!dose) return '';
  const { value, unit } = dose;
  const unitStr = [unit?.mass, unit?.volume, unit?.time].filter(Boolean).join('/');
  return `${value} ${unitStr}`;
};

// Format date for display
const formatDate = (dateString) => {
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

function ImmunizationsDetailPanel({ row, onSave, onCancel, onDelete }) {
  const [providers] = useDatabase().providers();
  const [formData, setFormData] = useState({ ...row });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDoseChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dose: {
        ...prev.dose,
        [field]: value
      }
    }));
  };

  const handleUnitChange = (type, value) => {
    setFormData((prev) => ({
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

  const FieldLabel = ({ children, sx }) => (
    <Label variant="caption" sx={{ minWidth: 100, color: 'text.secondary', ...sx }}>
      {children}
    </Label>
  );

  return (
    <Box paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', mx: 4, my: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
                    setFormData(prev => ({
                      ...prev,
                      vaccine: newVal?.vaccine || '',
                      family: newVal?.family || prev.family
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} />}
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
                    value={providers?.find(p => p.name === formData.recorder) || null}
                    onChange={(e, newVal) => handleChange('recorder', newVal?.name || '')}
                    disableClearable
                    renderInput={(params) => <TextField {...params} />}
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
                    value={providers?.find(p => p.name === formData.given_by) || null}
                    onChange={(e, newVal) => handleChange('given_by', newVal?.name || '')}
                    disableClearable
                    renderInput={(params) => <TextField {...params} />}
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

        <Grid item xs={12} md={6}>
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
                options={Object.keys(MASS_UNITS)}
                value={formData.dose?.unit?.mass}
                onChange={(e, newVal) => handleUnitChange('mass', newVal)}
                renderInput={(params) => <TextField {...params} label="Mass" />}
                disableClearable
              />
              <Autocomplete
                size="small"
                sx={{ width: 100 }}
                options={Object.keys(VOLUME_UNITS)}
                value={formData.dose?.unit?.volume}
                onChange={(e, newVal) => handleUnitChange('volume', newVal)}
                renderInput={(params) => <TextField {...params} label="Vol" />}
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
                    options={Object.values(IMMUNIZATION_SITES)}
                    value={formData.site}
                    onChange={(e, newVal) => handleChange('site', newVal)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
                <Stack direction="row" alignItems="center">
                  <FieldLabel sx={{ minWidth: 60 }}>Route:</FieldLabel>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={Object.values(IMMUNIZATION_ROUTES)}
                    value={formData.route}
                    onChange={(e, newVal) => handleChange('route', newVal)}
                    renderInput={(params) => <TextField {...params} />}
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
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());
  const [reviewed, setReviewed] = useState(false);
  const [lastReviewed, setLastReviewed] = useState(null);

  const handleEdit = (id) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedRow) => {
    setImmunizations((prev) =>
      prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    setExpandedRowIds(new Set());
  };

  const handleDelete = (id) => {
    setImmunizations((prev) => prev.filter((row) => row.id !== id));
    setExpandedRowIds(new Set());
  };

  const handleCancel = (row) => {
    if (row.isNew) {
      setImmunizations((prev) => prev.filter((r) => r.id !== row.id));
    }
    setExpandedRowIds(new Set());
  };

  const handleAddClick = () => {
    const newId = (immunizations || []).length > 0 ? Math.max(...immunizations.map(a => Number.isFinite(Number(a.id)) ? Number(a.id) : 0)) + 1 : 1;
    const newEntry = {
      id: newId,
      vaccine: '',
      received: dayjs().format('YYYY-MM-DD'),
      recorder: '',
      recorded: dayjs().format('YYYY-MM-DD'),
      given_by: '',
      facility: '',
      dose: { value: 0, unit: { mass: '', volume: '', time: '' } },
      site: '',
      route: '',
      lot: '',
      manufacturer: '',
      isNew: true
    };

    setImmunizations([...(immunizations || []), newEntry]);
    setExpandedRowIds(new Set([newId]));
  };

  const handleReviewedChange = (e) => {
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
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'recorder', headerName: 'Recorder', width: 150 },
    { field: 'given_by', headerName: 'Given By', width: 150 },
    { field: 'facility', headerName: 'Facility', width: 150 },
    {
      field: 'dose',
      headerName: 'Dose',
      width: 120,
      renderCell: (params) => formatDose(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleEdit(params.row.id)} color="primary">
          edit
        </IconButton>
      )
    }
  ];

  const getDetailPanelContent = useCallback(
    ({ row }) => (
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
        getRowId={(row) => row.id}
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
        onDetailPanelExpandedRowIdsChange={(newIds) => setExpandedRowIds(new Set(newIds))}
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

export default Immunizations;
