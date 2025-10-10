// BirthHistory.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Label,
} from 'components/ui/Core.jsx';
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
import { usePatient } from '../../../../../../components/contexts/PatientContext.jsx';
import { Editor } from 'components/ui/Editor.jsx';

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

export default function BirthHistory() {
  const { useChart, useEncounter } = usePatient();
  const [{ birthdate }] = useChart()();
  const [birthHistoryData, setBirthHistoryData] = useEncounter().history.BirthHistory({});
  const [reviewed, setReviewed] = useState(false);

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
  const patientAge = useMemo(() => {
    if (!birthdate) return '';
    
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} years old`;
    } catch (error) {
      return '';
    }
  }, [birthdate]);

  const handleFieldChange = (field, value) => {
    setBirthHistoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommentsChange = (content) => {
    setBirthHistoryData(prev => ({
      ...prev,
      comments: content
    }));
  };

  const handleReviewedChange = (e) => {
    setReviewed(e.target.checked);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Label variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Birth History
      </Label>

      <SectionPaper>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Birth length"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthLength || ''}
                  onChange={(e) => handleFieldChange('birthLength', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Birth weight"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthWeight || ''}
                  onChange={(e) => handleFieldChange('birthWeight', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Birth head circ"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.birthHeadCirc || ''}
                  onChange={(e) => handleFieldChange('birthHeadCirc', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
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
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12}>
                <TextField
                  label="Birth Time"
                  type="time"
                  fullWidth
                  value={birthHistoryData?.birthTime || ''}
                  onChange={(e) => handleFieldChange('birthTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  label="Gestation age (Weeks)"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.gestationWeeks || ''}
                  onChange={(e) => handleFieldChange('gestationWeeks', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  label="Gestation age (Days)"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.gestationDays || ''}
                  onChange={(e) => handleFieldChange('gestationDays', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 6 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="APGAR 1"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.apgar1 || ''}
                  onChange={(e) => handleFieldChange('apgar1', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="APGAR 5"
                  type="number"
                  fullWidth
                  value={birthHistoryData?.apgar5 || ''}
                  onChange={(e) => handleFieldChange('apgar5', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
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
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Duration of labor"
                  fullWidth
                  value={birthHistoryData?.durationOfLabor || ''}
                  onChange={(e) => handleFieldChange('durationOfLabor', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={4}>
            <TextField
              label="Date in hospital"
              type="date"
              fullWidth
              value={birthHistoryData?.dateInHospital || ''}
              onChange={(e) => handleFieldChange('dateInHospital', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Hospital name"
              fullWidth
              value={birthHistoryData?.hospitalName || ''}
              onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
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
    </Box>
  );
}