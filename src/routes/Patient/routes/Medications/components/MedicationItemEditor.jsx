import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Autocomplete, MenuItem, Select, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup, Grid, Typography, styled } from '@mui/material';
import medications from 'util/data/medications_list.json';

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

const unitMap = units.reduce((acc, unit) => {
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

export default function MedicationItemEditor({ medication, onSave, onCancel }) {
  const [editedMedication, setEditedMedication] = useState({
    ...medication,
    unit: unitMap[medication.unit] || medication.unit,
  });

  useEffect(() => {
    const selectedMedication = medications.find(med => med.generic === editedMedication.name);
    const brand = selectedMedication?.brand || '';
    const possiblePrnReasons = selectedMedication?.prnReasons || [];
    setEditedMedication(prevState => ({
      ...prevState,
      brandName: brand,
      possiblePrnReasons
    }));
  }, [editedMedication.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMedication({
      ...editedMedication,
      [name]: value,
    });
  };

  const handleRouteChange = (event, value) => {
    setEditedMedication({
      ...editedMedication,
      route: value,
    });
  };

  const handleUnitChange = (event) => {
    const selectedUnit = units.find(unit => unit.full === event.target.value);
    setEditedMedication({
      ...editedMedication,
      unit: selectedUnit ? selectedUnit.full : event.target.value,
    });
  };

  const handlePrnReasonChange = (event) => {
    const { value, checked } = event.target;
    setEditedMedication((prevState) => {
      const activePrnReasons = checked
        ? [...prevState.activePrnReasons, value]
        : prevState.activePrnReasons.filter((reason) => reason !== value);
      return {
        ...prevState,
        activePrnReasons
      };
    });
  };

  const handleSave = () => {
    const updatedMedication = {
      ...editedMedication,
      unit: units.find(unit => unit.full === editedMedication.unit).abbrev,
    };
    onSave(updatedMedication);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={3}>
          <Label>Dose:</Label>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="dose"
            value={editedMedication.dose}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel id="unit-label"/>
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
        <Grid item xs={3}>
          <Label>Route:</Label>
        </Grid>
        <Grid item xs={9}>
          <Autocomplete
            options={routesOfAdministration}
            getOptionLabel={(option) => option}
            value={editedMedication.route}
            onChange={handleRouteChange}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" fullWidth />
            )}
          />
        </Grid>
        <Grid item xs={3}>
          <Label>Frequency:</Label>
        </Grid>
        <Grid item xs={9}>
          <TextField
            name="frequency"
            value={editedMedication.frequency}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={3}>
          <Label>Date Range:</Label>
        </Grid>
        <Grid item xs={4}>
          <TextField
            name="startDate"
            placeholder="mm/dd/yyyy"
            value={editedMedication.startDate}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={5}>
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
            <Grid item xs={3}>
              <Label component="legend">PRN Reasons:</Label>
            </Grid>
            <Grid item xs={9}>
              <FormControl component="fieldset" fullWidth margin="normal">
                <PrnFormGroup>
                  {editedMedication.possiblePrnReasons.map((reason) => (
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
