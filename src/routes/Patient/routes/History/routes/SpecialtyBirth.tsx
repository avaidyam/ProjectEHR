// BirthHistory.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  DatePicker,
} from 'components/ui/Core';
import {
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../components/contexts/PatientContext';
import { Editor } from 'components/ui/Editor';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const SectionHeader = styled(Label)(({ theme }) => ({
  color: '#e91e63',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

export function BirthHistory() {
  const { useChart, useEncounter } = usePatient();
  const [{ birthdate }] = useChart()();
  const [birthHistoryData, setBirthHistoryData] = useEncounter().history.BirthHistory({});
  const [reviewed, setReviewed] = React.useState(false);

  const deliveryMethodOptions = [
    'Biochemical',
    'C-section, low transverse',
    'C-Section, low vertical',
    'C-Section, classical',
    'C-section, unspecified',
    'Vaginal, breech',
    'VBAC',
    'Vaginal, forceps',
    'Vaginal, spontaneous',
    'Vaginal, vacuum'
  ];

  const feedingMethodOptions = [
    'Breast Fed',
    'Bottle Fed-Formula',
    'Bottle Fed- Breast Milk',
    'Both Breast and Bottle Fed',
    'Unknown'
  ];

  // Calculate age from chart birthdate
  const patientAge = React.useMemo(() => {
    if (!birthdate) return '';

    try {
      const age = Temporal.Now.plainDateISO().since(birthdate, { largestUnit: 'year' }).years;
      return `${age} years old`;
    } catch (error) {
      return '';
    }
  }, [birthdate]);

  const handleFieldChange = (field: string, value: any) => {
    setBirthHistoryData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommentsChange = (content: any) => {
    setBirthHistoryData((prev: any) => ({
      ...prev,
      comments: content
    }));
  };

  const handleReviewedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewed(e.target.checked);
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Birth History</>} color="#9F3494">
      <SectionPaper>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Birth length"
                  fullWidth
                  value={birthHistoryData?.birthLength || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthLength', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Birth weight"
                  fullWidth
                  value={birthHistoryData?.birthWeight || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthWeight', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Birth head circ"
                  fullWidth
                  value={birthHistoryData?.birthHeadCirc || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthHeadCirc', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Discharge weight"
                  fullWidth
                  value={birthHistoryData?.dischargeWeight || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('dischargeWeight', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  label="Birth Date"
                  fullWidth
                  value={birthdate || ''}
                  options={[]}
                  TextFieldProps={{
                    disabled: true,
                    sx: {
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'black',
                        color: 'black'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  label="Age"
                  fullWidth
                  value={patientAge}
                  options={[]}
                  TextFieldProps={{
                    disabled: true,
                    sx: {
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'black',
                        color: 'black'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Birth Time"
                  fullWidth
                  value={birthHistoryData?.birthTime || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthTime', newValue)}
                  options={[]}
                  TextFieldProps={{ type: 'time', InputLabelProps: { shrink: true } }}
                />
              </Grid>

              <Grid size={6}>
                <Autocomplete
                  freeSolo
                  label="Gestation age (Weeks)"
                  fullWidth
                  value={birthHistoryData?.gestationWeeks || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('gestationWeeks', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 50 } }}
                />
              </Grid>

              <Grid size={6}>
                <Autocomplete
                  freeSolo
                  label="Gestation age (Days)"
                  fullWidth
                  value={birthHistoryData?.gestationDays || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('gestationDays', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 6 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  freeSolo
                  label="APGAR 1"
                  fullWidth
                  value={birthHistoryData?.apgar1 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar1', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  freeSolo
                  label="APGAR 5"
                  fullWidth
                  value={birthHistoryData?.apgar5 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar5', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  freeSolo
                  label="APGAR 10"
                  fullWidth
                  value={birthHistoryData?.apgar10 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar10', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Full Width Fields */}
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  label="Delivery method"
                  options={deliveryMethodOptions}
                  value={birthHistoryData?.deliveryMethod || ''}
                  onChange={(_e, newValue) => handleFieldChange('deliveryMethod', newValue)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  label="Duration of labor"
                  fullWidth
                  value={birthHistoryData?.durationOfLabor || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('durationOfLabor', newValue)}
                  options={[]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  label="Feeding method"
                  options={feedingMethodOptions}
                  value={birthHistoryData?.feedingMethod || ''}
                  onChange={(_e, newValue) => handleFieldChange('feedingMethod', newValue)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Hospital Information */}
      <SectionPaper>
        <SectionHeader>Hospital information</SectionHeader>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DatePicker
              convertString
              label="Date in hospital"
              value={birthHistoryData?.dateInHospital || ''}
              onChange={(date: any) => handleFieldChange('dateInHospital', date)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              freeSolo
              label="Hospital name"
              fullWidth
              value={birthHistoryData?.hospitalName || ''}
              onInputChange={(_e, newValue) => handleFieldChange('hospitalName', newValue)}
              options={[]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              freeSolo
              label="Hospital location"
              fullWidth
              value={birthHistoryData?.hospitalLocation || ''}
              onInputChange={(_e, newValue) => handleFieldChange('hospitalLocation', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Comments */}
      <SectionPaper>
        <SectionHeader>Comments:</SectionHeader>
        <Editor
          initialContent={birthHistoryData?.comments || ''}
          onSave={handleCommentsChange}
          disableStickyMenuBar={true}
        />
      </SectionPaper>
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            Birth history has been reviewed.
          </Label>
        )}
      </Box>
    </TitledCard>
  );
}