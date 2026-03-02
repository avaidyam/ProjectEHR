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
  Label,
  Grid,
  DatePicker,
  Checkbox,
  MarkReviewed,
} from 'components/ui/Core';
import { FormControlLabel } from '@mui/material';

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
    return Temporal.Instant.from(dateString).toZonedDateTimeISO('UTC').toPlainDate().toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

const VACCINE_LIST = [
  "Adenovirus Type 4 and Type 7 Vaccine, Live, Oral",
  "Anthrax Vaccine Adsorbed, Adjuvanted (CYFENDUS)",
  "Anthrax Vaccine Adsorbed (Biothrax)",
  "BCG Vaccine (BCG Vaccine)",
  "Chikungunya Vaccine, Recombinant (VIMKUNYA)",
  "Cholera Vaccine Live Oral (Vaxchora)",
  "COVID-19 Vaccine, mRNA (MNEXSPIKE)",
  "COVID-19 Vaccine, Adjuvanted (NUVAXOVID)",
  "COVID-19 Vaccine, mRNA (Comirnaty)",
  "COVID-19 Vaccine, mRNA (SPIKEVAX)",
  "Dengue Tetravalent Vaccine, Live (DENGVAXIA)",
  "Diphtheria & Tetanus Toxoids & Acellular Pertussis Vaccine Adsorbed (Infanrix)",
  "Diphtheria & Tetanus Toxoids & Acellular Pertussis Vaccine Adsorbed (DAPTACEL)",
  "Diphtheria & Tetanus Toxoids & Acellular Pertussis Vaccine Adsorbed, Hepatitis B (recombinant) and Inactivated Poliovirus Vaccine Combined (Pediarix)",
  "Diphtheria and Tetanus Toxoids and Acellular Pertussis Adsorbed and Inactivated Poliovirus Vaccine (KINRIX)",
  "Diphtheria and Tetanus Toxoids and Acellular Pertussis Adsorbed and Inactivated Poliovirus Vaccine (Quadracel)",
  "Diphtheria and Tetanus Toxoids and Acellular Pertussis Adsorbed, Inactivated Poliovirus, Haemophilus b Conjugate [Meningococcal Protein Conjugate] and Hepatitis B [Recombinant] Vaccine (VAXELIS)",
  "Diphtheria and Tetanus Toxoids and Acellular Pertussis Adsorbed, Inactivated Poliovirus and Haemophilus b Conjugate (Tetanus Toxoid Conjugate) Vaccine (Pentacel)",
  "Ebola Zaire Vaccine, Live (ERVEBO)",
  "Haemophilus b Conjugate Vaccine (Meningococcal Protein Conjugate) (PedvaxHIB)",
  "Haemophilus b Conjugate Vaccine (Tetanus Toxoid Conjugate) (ActHIB)",
  "Haemophilus b Conjugate Vaccine (Tetanus Toxoid Conjugate) (Hiberix)",
  "Hepatitis A Vaccine, Inactivated (Havrix)",
  "Hepatitis A Vaccine, Inactivated (VAQTA)",
  "Hepatitis A Inactivated and Hepatitis B (Recombinant) Vaccine (Twinrix)",
  "Hepatitis B Vaccine (Recombinant) (Recombivax HB)",
  "Hepatitis B Vaccine (Recombinant) (PREHEVBRIO)",
  "Hepatitis B Vaccine (Recombinant) (Engerix-B)",
  "Hepatitis B Vaccine (Recombinant), Adjuvanted (HEPLISAV-B)",
  "Human Papillomavirus Quadrivalent (Types 6, 11, 16, 18) Vaccine, Recombinant (Gardasil)",
  "Human Papillomavirus 9-valent Vaccine, Recombinant (Gardasil 9)",
  "Human Papillomavirus Bivalent (Types 16, 18) Vaccine, Recombinant (Cervarix)",
  "Influenza A (H1N1) 2009 Monovalent Vaccine",
  "Influenza A (H1N1) 2009 Monovalent Vaccine",
  "Influenza A (H1N1) 2009 Monovalent Vaccine",
  "Influenza A (H1N1) 2009 Monovalent Vaccine",
  "Influenza A (H1N1) 2009 Monovalent Vaccine",
  "Influenza A (H5N1) Virus Monovalent Vaccine, Adjuvanted (AREPANRIX)",
  "Influenza Virus Vaccine, H5N1 (for National Stockpile)",
  "Influenza A (H5N1) Monovalent Vaccine, Adjuvanted (AUDENZ)",
  "Influenza Vaccine, Adjuvanted (Fluad Quadrivalent)",
  "Influenza Vaccine, Adjuvanted (Fluad)",
  "Influenza Vaccine (Afluria Quadrivalent, Afluria Quadrivalent Southern Hemisphere)",
  "Influenza Vaccine (Flucelvax Quadrivalent)",
  "Influenza Vaccine (Flulaval Quadrivalent)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Afluria, Afluria Southern Hemisphere)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (FluLaval)",
  "Influenza Vaccine, Live, Intranasal (Trivalent, Types A and B) (FluMist)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Fluarix)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Fluvirin)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Agriflu)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Fluzone, Fluzone High-Dose and Fluzone Intradermal)",
  "Influenza Virus Vaccine (Trivalent, Types A and B) (Flucelvax)",
  "Influenza Vaccine (Trivalent) (Flublok)",
  "Influenza Vaccine (Quadrivalent) (Flublok Quadrivalent)",
  "Influenza Vaccine,Live, Intranasal (Quadrivalent, Types A and Types B) (FluMist Quadrivalent)",
  "Influenza Virus Vaccine (Quadrivalent, Types A and Types B) (Fluarix Quadrivalent)",
  "Influenza Virus Vaccine (Quadrivalent, Types A and Types B) (Fluzone Quadrivalent)",
  "Japanese Encephalitis Virus Vaccine, Inactivated, Adsorbed (Ixiaro)",
  "Measles, Mumps and Rubella Vaccine, Live (PRIORIX)",
  "Measles, Mumps, and Rubella Virus Vaccine, Live (M-M-R II)",
  "Measles, Mumps, Rubella and Varicella Virus Vaccine Live (ProQuad)",
  "Meningococcal Groups A, B, C, W, and Y Vaccine (PENBRAYA)",
  "Meningococcal Groups A, B, C, W, and Y Vaccine (PENMENVY)",
  "Meningococcal (Groups A, C, Y, and W-135) Oligosaccharide Diphtheria CRM197 Conjugate Vaccine (MENVEO)",
  "Meningococcal (Groups A, C, Y and W-135) Polysaccharide Diphtheria Toxoid Conjugate Vaccine (Menactra)",
  "Meningococcal Group B Vaccine (BEXSERO)",
  "Meningococcal Group B Vaccine (TRUMENBA)",
  "Meningococcal (Groups A, C, Y, W) Conjugate Vaccine (MenQuadfi)",
  "Plague Vaccine",
  "Pneumococcal Vaccine, Polyvalent (Pneumovax 23)",
  "Pneumococcal 13-valent Conjugate Vaccine (Diphtheria CRM197 Protein) (Prevnar 13)",
  "Pneumococcal 15-valent Conjugate Vaccine (VAXNEUVANCE)",
  "Pneumococcal 20-valent Conjugate Vaccine (Prevnar 20)",
  "Pneumococcal 21-valent Conjugate Vaccine (CAPVAXIVE)",
  "Poliovirus Vaccine Inactivated (Human Diploid Cell) (Poliovax)",
  "Poliovirus Vaccine Inactivated (Monkey Kidney Cell) (IPOL)",
  "Rabies Vaccine (IMOVAX RABIES)",
  "Rabies Vaccine (RabAvert)",
  "Rabies Vaccine Adsorbed",
  "Rotavirus Vaccine, Live, Oral (ROTARIX)",
  "Rotavirus Vaccine, Live, Oral, Pentavalent (RotaTeq)",
  "Respiratory Syncytial Virus Vaccine (MRESVIA)",
  "Respiratory Syncytial Virus Vaccine (ABRYSVO)",
  "Respiratory Syncytial Virus Vaccine, Adjuvanted (AREXVY)",
  "Smallpox and Monkeypox Vaccine, Live, Non-Replicating (JYNNEOS)",
  "Smallpox and Mpox (Vaccinia) Vaccine, Live (ACAM2000)",
  "Tetanus & Diphtheria Toxoids, Adsorbed (TDVAX)",
  "Tetanus & Diphtheria Toxoids Adsorbed for Adult Use (TENIVAC)",
  "Tetanus Toxoid, Reduced Diphtheria Toxoid and Acellular Pertussis Vaccine, Adsorbed (Adacel)",
  "Tetanus Toxoid, Reduced Diphtheria Toxoid and Acellular Pertussis Vaccine, Adsorbed (Boostrix)",
  "Tick-Borne Encephalitis Vaccine (TICOVAC)",
  "Typhoid Vaccine Live Oral Ty21a (Vivotif)",
  "Typhoid Vi Polysaccharide Vaccine (TYPHIM Vi)",
  "Varicella Virus Vaccine Live (Varivax)",
  "Yellow Fever Vaccine (YF-Vax)",
  "Zoster Vaccine, Live, (Oka/Merck) (Zostavax)",
  "Zoster Vaccine Recombinant, Adjuvanted (SHINGRIX)"
];

function ImmunizationsDetailPanel({ row, onSave, onCancel, onDelete }: { row: any; onSave: (row: any) => void; onCancel: (row: any) => void; onDelete: (id: any) => void }) {
  const [providers] = useDatabase().providers();
  const [formData, setFormData] = React.useState({ ...row });

  const update = (patch: any) => setFormData((prev: any) => ({ ...prev, ...patch }));
  const updateDose = (patch: any) => setFormData((prev: any) => ({ ...prev, dose: { ...prev.dose, ...patch } }));
  const updateUnit = (patch: any) => setFormData((prev: any) => ({ ...prev, dose: { ...prev.dose, unit: { ...prev.dose?.unit, ...patch } } }));

  return (
    <Box paper elevation={4} sx={{ p: 2, bgcolor: 'background.paper', mx: 4, my: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            {formData.isNew || !formData.vaccine ? (
              <Autocomplete
                label="Vaccine"
                fullWidth
                size="small"
                options={VACCINE_LIST}
                value={formData.vaccine}
                onChange={(e, newVal) => update({ vaccine: newVal || '' })}
                onInputChange={(e, newVal) => update({ vaccine: newVal || '' })}
                freeSolo
              />
            ) : (
              <Autocomplete
                label="Vaccine"
                disabled
                fullWidth
                size="small"
                value={formData.vaccine}
                options={[formData.vaccine]}
              />
            )}

            <DatePicker
              label="Date Received"
              convertString
              fullWidth
              size="small"
              value={formData.received}
              onChange={(date) => update({ received: date })}
            />

            <Stack direction="row" spacing={2}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Autocomplete
                  label="Recorder"
                  fullWidth
                  size="small"
                  options={providers || []}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option.name || '')}
                  value={providers?.find((p: any) => p.name === formData.recorder) || null}
                  onChange={(e, newVal) => update({ recorder: newVal?.name || '' })}
                  disableClearable
                />
                <DatePicker
                  label="Recorded"
                  convertString
                  fullWidth
                  size="small"
                  value={formData.recorded}
                  onChange={(date) => update({ recorded: date })}
                />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Autocomplete
                  label="Given By"
                  fullWidth
                  size="small"
                  options={providers || []}
                  getOptionLabel={(option) => typeof option === 'string' ? option : (option.name || '')}
                  value={providers?.find((p: any) => p.name === formData.given_by) || null}
                  onChange={(e, newVal) => update({ given_by: newVal?.name || '' })}
                  disableClearable
                />
                <Autocomplete
                  label="Facility"
                  freeSolo
                  fullWidth
                  size="small"
                  value={formData.facility}
                  onInputChange={(e, newVal) => update({ facility: newVal })}
                  options={[]}
                />
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Autocomplete
                label="Dose"
                freeSolo
                size="small"
                sx={{ width: 80 }}
                value={formData.dose?.value?.toString()}
                onInputChange={(e, newVal) => updateDose({ value: parseFloat(newVal) || 0 })}
                options={[]}
                TextFieldProps={{ type: 'number' }}
              />
              <Autocomplete
                size="small"
                sx={{ width: 100 }}
                options={Object.values(Database.Units.Mass)}
                value={formData.dose?.unit?.mass}
                onChange={(e, newVal) => updateUnit({ mass: newVal })}
                label="Mass"
                disableClearable
              />
              <Autocomplete
                size="small"
                sx={{ width: 100 }}
                options={Object.values(Database.Units.Volume)}
                value={formData.dose?.unit?.volume}
                onChange={(e, newVal) => updateUnit({ volume: newVal })}
                label="Vol"
                disableClearable
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Autocomplete
                  label="Site"
                  fullWidth
                  size="small"
                  options={Object.values(Database.Immunization.Site)}
                  value={formData.site}
                  onChange={(e, newVal) => update({ site: newVal })}
                />
                <Autocomplete
                  label="Route"
                  fullWidth
                  size="small"
                  options={Object.values(Database.Immunization.Route)}
                  value={formData.route}
                  onChange={(e, newVal) => update({ route: newVal })}
                />
              </Stack>
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Autocomplete
                  label="Lot #"
                  freeSolo
                  fullWidth
                  size="small"
                  value={formData.lot}
                  onInputChange={(e, newVal) => update({ lot: newVal })}
                  options={[]}
                />
                <Autocomplete
                  label="Mfr"
                  freeSolo
                  fullWidth
                  size="small"
                  value={formData.manufacturer}
                  onInputChange={(e, newVal) => update({ manufacturer: newVal })}
                  options={[]}
                />
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" mt={3}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small">Past Updates</Button>
          <Button
            variant="outlined"
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
            variant="contained"
            color="success"
            size="small"
            startIcon={<Icon>check</Icon>}
            onClick={() => onSave({ ...formData, isNew: false })}
            disabled={!formData.vaccine || formData.vaccine.trim() === ''}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
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
  const apiRef = useGridApiRef();

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  // Normalization and cleanup logic
  React.useEffect(() => {
    if (!immunizations) return;

    // 1. Ensure all items have IDs
    const normalized = immunizations.map((item: any, idx: number) =>
      item.id ? item : { ...item, id: `gen-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}` }
    );
    if (JSON.stringify(normalized) !== JSON.stringify(immunizations)) {
      setImmunizations(normalized);
    }

    // 2. Cleanup unsaved new items when they are no longer expanded
    const itemsToRemove = immunizations.filter((item: any) => item.isNew && !expandedRowIds.has(item.id));
    if (itemsToRemove.length > 0) {
      setImmunizations((prev: any) => prev.filter((item: any) => !itemsToRemove.some((r: any) => r.id === item.id)));
    }
  }, [immunizations, expandedRowIds, setImmunizations]);

  const updateList = (updater: (prev: any[]) => any[]) => {
    setImmunizations(updater);
    setExpandedRowIds(new Set());
  };

  const handleEdit = (id: any) => setExpandedRowIds(new Set([id]));
  const handleDelete = (id: any) => updateList(prev => prev.filter(r => r.id !== id));
  const handleSave = (row: any) => updateList(prev => prev.map(r => r.id === row.id ? row : r));
  const handleCancel = (row: any) => row.isNew ? handleDelete(row.id) : setExpandedRowIds(new Set());

  const handleAddClick = () => {
    const existing = immunizations?.find((item: any) => item.isNew || !item.vaccine?.trim());
    if (existing) return setExpandedRowIds(new Set([existing.id]));

    const newEntry = {
      id: Database.Immunization.ID.create(),
      vaccine: '',
      received: Temporal.Now.instant().toString(),
      recorder: '',
      recorded: Temporal.Now.instant().toString(),
      administeredBy: '',
      facility: '',
      dose: { value: 0, unit: { mass: '', volume: '', time: '' } },
      site: '',
      route: '',
      lot: '',
      manufacturer: '',
      isNew: true
    };

    setImmunizations([...(immunizations || []), newEntry]);
    setExpandedRowIds(new Set([newEntry.id]));
  };

  const columns = [
    { field: 'vaccine', headerName: 'Vaccine', flex: 1 },
    { field: 'received', headerName: 'Date Received', width: 150, valueFormatter: (params: any) => formatDate(params.value) },
    { field: 'recorder', headerName: 'Recorder', width: 150 },
    { field: 'administeredBy', headerName: 'Given By', width: 150 },
    { field: 'facility', headerName: 'Facility', width: 150 },
    { field: 'dose', headerName: 'Dose', width: 120, renderCell: (params: any) => formatDose(params.value) },
    { field: '__detail_panel_toggle__', width: 48 }
  ];

  return (
    <Stack spacing={2} sx={{ height: '100%', p: 2, overflow: 'hidden' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Label variant="h6">Current Immunizations</Label>
        <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddClick} size="small">
          Add Immunization
        </Button>
      </Stack>

      <DataGrid
        apiRef={apiRef}
        rows={immunizations || []}
        columns={columns}
        getRowId={(row: any) => row.id || `${row.vaccine}-${row.received}`}
        hideFooter
        disableRowSelectionOnClick
        onRowDoubleClick={handleRowDoubleClick}
        getDetailPanelHeight={() => 'auto'}
        getDetailPanelContent={({ row }: any) => (
          <ImmunizationsDetailPanel row={row} onSave={handleSave} onCancel={handleCancel} onDelete={handleDelete} />
        )}
        detailPanelExpandedRowIds={expandedRowIds}
        onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
      />

      <MarkReviewed />
    </Stack>
  );
};
