// BirthHistory.jsx
import * as React from 'react';
import {
  Box,
  TextField,
  Label,
  TitledCard,
  Icon,
} from 'components/ui/Core';
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

  const handleReviewedChange = (e: any) => {
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
                <TextField
                  label="Birth length"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthLength || ''}
                  onChange={(e) => handleFieldChange('birthLength', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Birth weight"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthWeight || ''}
                  onChange={(e) => handleFieldChange('birthWeight', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Birth head circ"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthHeadCirc || ''}
                  onChange={(e) => handleFieldChange('birthHeadCirc', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Discharge weight"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.dischargeWeight || ''}
                  onChange={(e) => handleFieldChange('dischargeWeight', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Birth Date"
                  fullWidth
                  value={birthdate || ''}
                  disabled
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'black',
                      color: 'black'
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Age"
                  fullWidth
                  value={patientAge}
                  disabled
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'black',
                      color: 'black'
                    }
                  }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Birth Time"
                  type="time"
                  fullWidth
                  value={birthHistoryData?.birthTime || ''}
                  onChange={(e) => handleFieldChange('birthTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Gestation age (Weeks)"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.gestationWeeks || ''}
                  onChange={(e) => handleFieldChange('gestationWeeks', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Gestation age (Days)"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.gestationDays || ''}
                  onChange={(e) => handleFieldChange('gestationDays', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 6 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="APGAR 1"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.apgar1 || ''}
                  onChange={(e) => handleFieldChange('apgar1', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="APGAR 5"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.apgar5 || ''}
                  onChange={(e) => handleFieldChange('apgar5', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="APGAR 10"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.apgar10 || ''}
                  onChange={(e) => handleFieldChange('apgar10', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Full Width Fields */}
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Delivery method</InputLabel>
                  <Select
                    value={birthHistoryData?.deliveryMethod || ''}
                    onChange={(e) => handleFieldChange('deliveryMethod', e.target.value)}
                    label="Delivery method"
                  >
                    {deliveryMethodOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Duration of labor"
                  fullWidth
                  value={birthHistoryData?.durationOfLabor || ''}
                  onChange={(e) => handleFieldChange('durationOfLabor', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Feeding method</InputLabel>
                  <Select
                    value={birthHistoryData?.feedingMethod || ''}
                    onChange={(e) => handleFieldChange('feedingMethod', e.target.value)}
                    label="Feeding method"
                  >
                    {feedingMethodOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
            <TextField
              label="Date in hospital"
              type="date"
              fullWidth
              value={birthHistoryData?.dateInHospital || ''}
              onChange={(e) => handleFieldChange('dateInHospital', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Hospital name"
              fullWidth
              value={birthHistoryData?.hospitalName || ''}
              onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Hospital location"
              fullWidth
              value={birthHistoryData?.hospitalLocation || ''}
              onChange={(e) => handleFieldChange('hospitalLocation', e.target.value)}
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