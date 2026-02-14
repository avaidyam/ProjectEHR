import * as React from 'react';
import { FormControlLabel, FormGroup, styled, FormControl } from '@mui/material';
import { Box, Button, Autocomplete, Label, DatePicker, Checkbox, Grid } from 'components/ui/Core';
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

const StyledLabel = styled(Label)({
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

  console.dir(editedMedication)

  React.useEffect(() => {
    setEditedMedication((prevState: any) => ({
      ...prevState,
      brandName: prevState.brandName || '',
      possiblePrnReasons: prevState.possiblePrnReasons || []
    }));
  }, [editedMedication.name]);

  const handleEditorChange = (name: string, value: any) => {
    setEditedMedication({
      ...editedMedication,
      [name]: value,
    });
  };

  const handleUnitChange = (value: any) => {
    const selectedUnit = units.find(unit => unit.full === value);
    setEditedMedication({
      ...editedMedication,
      unit: selectedUnit ? selectedUnit.full : value,
    });
  };

  const handlePrnReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setEditedMedication((prevState: any) => {
      const activePrnReasons = checked
        ? [...(prevState.activePrnReasons || []), value]
        : (prevState.activePrnReasons || []).filter((reason: any) => reason !== value);
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
        <Grid size={{ xs: 3 }}>
          <StyledLabel>Dose:</StyledLabel>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Autocomplete
            freeSolo
            label="Dose"
            options={['5', '10', '20', '50', '100', '200', '500', '1000']}
            value={editedMedication.dose?.toString()}
            onInputChange={(_e, newInputValue) => handleEditorChange('dose', newInputValue)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Autocomplete
            options={units.map(u => u.full)}
            value={editedMedication.unit}
            onChange={(_e, newValue: any) => handleUnitChange(newValue)}
            sx={{ minWidth: 100 }}
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StyledLabel>Route:</StyledLabel>
        </Grid>
        <Grid size={{ xs: 9 }}>
          <Autocomplete
            options={routesOfAdministration}
            getOptionLabel={(option) => option}
            value={editedMedication.route}
            onChange={(_e, newValue) => handleEditorChange('route', newValue)}
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <StyledLabel>Frequency:</StyledLabel>
        </Grid>
        <Grid size={{ xs: 9 }}>
          <Autocomplete
            freeSolo
            label="Frequency"
            options={['QD', 'BID', 'TID', 'QID', 'QHS', 'QAM', 'PRN', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Weekly', 'Monthly']}
            value={editedMedication.frequency}
            onInputChange={(_e, newInputValue) => handleEditorChange('frequency', newInputValue)}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 3 }}>
          <StyledLabel>Date Range:</StyledLabel>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <DatePicker
            convertString
            label="Start Date"
            value={editedMedication.startDate}
            onChange={(date: any) => handleEditorChange('startDate', date)}
          />
        </Grid>
        <Grid size={{ xs: 5 }}>
          <DatePicker
            convertString
            label="End Date"
            value={editedMedication.endDate}
            onChange={(date: any) => handleEditorChange('endDate', date)}
          />
        </Grid>

        {editedMedication.possiblePrnReasons && editedMedication.possiblePrnReasons.length > 0 && (
          <>
            <Grid size={{ xs: 3 }}>
              <StyledLabel>PRN Reasons:</StyledLabel>
            </Grid>
            <Grid size={{ xs: 9 }}>
              <FormControl component="fieldset" fullWidth margin="normal">
                <PrnFormGroup>
                  {editedMedication.possiblePrnReasons.map((reason: any) => (
                    <FormControlLabel
                      key={reason}
                      control={
                        <Checkbox
                          checked={editedMedication.activePrnReasons?.includes(reason)}
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
      <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
