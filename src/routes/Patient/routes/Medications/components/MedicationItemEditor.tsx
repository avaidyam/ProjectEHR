import * as React from 'react';
import { Box, TextField, Button, Autocomplete, MenuItem, Select, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup, Grid, Typography, styled } from '@mui/material';
import { useDatabase } from 'components/contexts/PatientContext'

const routesOfAdministration = [
  'Oral',
  'Sublingual',
  'Buccal',
  'Rectal',
  'Vaginal',
  'Topical',
  'Inhalation',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Subcutaneous (SC)',
  'Intradermal (ID)',
  'Transdermal',
  'Nasal',
  'Ophthalmic',
  'Otic'
];

const units = [
  { full: 'Milligrams (mg)', abbrev: 'mg' },
  { full: 'Grams (g)', abbrev: 'g' },
  { full: 'Milliliters (mL)', abbrev: 'mL' },
  { full: 'Puffs', abbrev: 'Puffs' }
];

const unitMap: any = units.reduce((acc: any, unit: any) => {
  acc[unit.abbrev] = unit.full;
  return acc;
}, {});

const Label = styled(Typography)({
  alignSelf: 'flex-start',
  paddingTop: 8,
});

const PrnFormGroup = styled(FormGroup)({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  maxHeight: 150,
});

export function MedicationItemEditor({ medication, onSave, onCancel }: { medication: any, onSave: (med: any) => void, onCancel: () => void }) {
  const [orderables] = useDatabase().orderables()
  const [editedMedication, setEditedMedication] = React.useState({
    ...medication,
    unit: unitMap[medication.unit] || medication.unit,
  });

  React.useEffect(() => {
    const selectedMedication = orderables!.rxnorm.find((med: any) => med.name === editedMedication.name);
    setEditedMedication((prevState: any) => ({
      ...prevState,
      brandName: '', // FIXME
      possiblePrnReasons: [] // FIXME
    }));
  }, [editedMedication.name]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setEditedMedication({
      ...editedMedication,
      [name]: value,
    });
  };

  const handleRouteChange = (event: any, value: any) => {
    setEditedMedication({
      ...editedMedication,
      route: value,
    });
  };

  const handleUnitChange = (event: any) => {
    const selectedUnit = units.find(unit => unit.full === event.target.value);
    setEditedMedication({
      ...editedMedication,
      unit: selectedUnit ? selectedUnit.full : event.target.value,
    });
  };

  const handlePrnReasonChange = (event: any) => {
    const { value, checked } = event.target;
    setEditedMedication((prevState: any) => {
      const activePrnReasons = checked
        ? [...prevState.activePrnReasons, value]
        : prevState.activePrnReasons.filter((reason: any) => reason !== value);
      return {
        ...prevState,
        activePrnReasons
      };
    });
  };

  const handleSave = () => {
    const unitAbbrev = units.find(unit => unit.full === editedMedication.unit)?.abbrev || editedMedication.unit;
    const updatedMedication = {
      ...editedMedication,
      unit: unitAbbrev,
    };
    onSave(updatedMedication);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={3}>
          <Label>Dose:</Label>
        </Grid>
        <Grid size={6}>
          <TextField
            name="dose"
            value={editedMedication.dose}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <FormControl fullWidth>
            <InputLabel id="unit-label" />
            <Select
              labelId="unit-label"
              value={editedMedication.unit}
              onChange={handleUnitChange}
              fullWidth
              style={{ minWidth: 100 }}
            >
              {units.map((unit) => (
                <MenuItem key={unit.abbrev} value={unit.full}>
                  {unit.full}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={3}>
          <Label>Route:</Label>
        </Grid>
        <Grid size={9}>
          <Autocomplete
            options={routesOfAdministration}
            getOptionLabel={(option) => option}
            value={editedMedication.route}
            onChange={handleRouteChange}
            renderInput={(params: any) => (
              <TextField {...params} variant="outlined" fullWidth />
            )}
          />
        </Grid>
        <Grid size={3}>
          <Label>Frequency:</Label>
        </Grid>
        <Grid size={9}>
          <TextField
            name="frequency"
            value={editedMedication.frequency}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid size={3}>
          <Label>Date Range:</Label>
        </Grid>
        <Grid size={4}>
          <TextField
            name="startDate"
            placeholder="mm/dd/yyyy"
            value={editedMedication.startDate}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={5}>
          <TextField
            name="endDate"
            placeholder="mm/dd/yyyy"
            value={editedMedication.endDate}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {editedMedication.possiblePrnReasons && editedMedication.possiblePrnReasons.length > 0 && (
          <>
            <Grid size={3}>
              <Label component="legend">PRN Reasons:</Label>
            </Grid>
            <Grid size={9}>
              <FormControl component="fieldset" fullWidth margin="normal">
                <PrnFormGroup>
                  {editedMedication.possiblePrnReasons.map((reason: any) => (
                    <FormControlLabel
                      key={reason}
                      control={
                        <Checkbox
                          checked={editedMedication.activePrnReasons.includes(reason)}
                          onChange={handlePrnReasonChange}
                          value={reason}
                        />
                      }
                      label={reason}
                    />
                  ))}
                </PrnFormGroup>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel} style={{ marginLeft: '8px' }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
