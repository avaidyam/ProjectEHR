import * as React from 'react';
import {
  Box,
  Button,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
} from 'components/ui/Core';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../components/contexts/PatientContext';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const SectionHeader = styled(Label)(({ theme }) => ({
  color: 'black',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

export function SubstanceAndSexualHistory() {
  const { useEncounter } = usePatient();
  const [substanceData, setSubstanceData] = useEncounter().history.SubstanceSexualHealth({});

  const tobaccoOptions = ['Never', 'Former', 'Every Day', 'Some Days', 'Unknown'];
  const smokelessOptions = ['Never', 'Former', 'Current', 'Unknown'];
  const exposureOptions = ['Never', 'Past', 'Current'];
  const useOptions = ['Yes', 'No', 'Not Currently', 'Never'];
  const sexualActivityOptions = ['Yes', 'Not Currently', 'Never'];

  const drugTypes = [
    'Anabolic Steroids',
    'Barbiturates',
    'Benzodiazepines',
    'Cannabinoids - Marijuana, Hashish, Synthetics',
    'Hallucinogens - e.g. LSD, Mushrooms',
    'Inhalants - e.g. Nitrous Oxide, Amyl Nitrite',
    'Opioids',
    'Stimulants - e.g. Amphetamines, Crack/Cocaine, Methyphenidate',
    'Other'
  ];

  const birthControlMethods = [
    'Abstinence',
    'Coitus Interruptus',
    'Condom',
    'Diaphragm',
    'IUD',
    'Implant',
    'Injection',
    'None',
    'Patch',
    'Pill',
    'Progesterone only pill (mini-pill)',
    'Rhythm',
    'Ring',
    'Spermicide',
    'Sponge',
    'Spouse/Partner w/vasectomy',
    'Surgical'
  ];

  const handleDataChange = (section: string, field: string, value: any) => {
    setSubstanceData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (section: string, field: string, value: any) => {
    setSubstanceData((prev: any) => {
      const currentArray = prev[section]?.[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: any) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const handleDrinksChange = (drinkType: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setSubstanceData((prev: any) => ({
      ...prev,
      alcohol: {
        ...prev.alcohol,
        drinksPerWeek: {
          ...prev.alcohol?.drinksPerWeek,
          [drinkType]: numValue
        }
      }
    }));
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Substance & Sexual Activity</>} color="#9F3494">
      {/* Tobacco Section */}
      <SectionPaper>
        <SectionHeader>Tobacco</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Smoking</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tobaccoOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.tobacco?.status === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('tobacco', 'status', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.tobacco?.status === option ? '#1976d2' : 'transparent',
                    color: substanceData?.tobacco?.status === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.tobacco?.status === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Smokeless</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {smokelessOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.tobacco?.smokeless === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('tobacco', 'smokeless', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.tobacco?.smokeless === option ? '#1976d2' : 'transparent',
                    color: substanceData?.tobacco?.smokeless === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.tobacco?.smokeless === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Cessation</Label>
            <FormControlLabel
              control={
                <Checkbox
                  checked={substanceData?.tobacco?.counselingGiven || false}
                  onChange={(e) => handleDataChange('tobacco', 'counselingGiven', e.target.checked)}
                />
              }
              label="Counseling given"
            />
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Passive Exposure</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {exposureOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.tobacco?.passiveExposure === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('tobacco', 'passiveExposure', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.tobacco?.passiveExposure === option ? '#1976d2' : 'transparent',
                    color: substanceData?.tobacco?.passiveExposure === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.tobacco?.passiveExposure === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Autocomplete
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.tobacco?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('tobacco', 'comments', newValue)}
              options={[]}
              TextFieldProps={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Alcohol Section */}
      <SectionPaper>
        <SectionHeader>Alcohol</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Alcohol Use?</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {useOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.alcohol?.use === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('alcohol', 'use', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.alcohol?.use === option ? '#1976d2' : 'transparent',
                    color: substanceData?.alcohol?.use === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.alcohol?.use === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 2, color: '#1976d2' }}>
              Drinks per Week
            </Label>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Autocomplete
              freeSolo
              label="Glasses of wine"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.wine?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('wine', newValue)}
              options={['0', '1', '2', '3', '7', '14']}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Autocomplete
              freeSolo
              label="Cans of beer"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.beer?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('beer', newValue)}
              options={['0', '1', '2', '3', '6', '12']}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Autocomplete
              freeSolo
              label="Shots of liquor"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.liquor?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('liquor', newValue)}
              options={['0', '1', '2', '3', '5']}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Autocomplete
              freeSolo
              label="Drinks containing 1.5 oz of alcohol"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.mixedDrinks?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('mixedDrinks', newValue)}
              options={['0', '1', '2', '3']}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Autocomplete
              freeSolo
              label="Standard drinks or equivalent"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.standardDrinks?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('standardDrinks', newValue)}
              options={['0', '1', '2', '3', '7', '14', '21']}
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.alcohol?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'comments', newValue)}
              options={[]}
              TextFieldProps={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Drug Section */}
      <SectionPaper>
        <SectionHeader>Drug</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Drug Use</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {useOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.drugs?.use === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('drugs', 'use', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.drugs?.use === option ? '#1976d2' : 'transparent',
                    color: substanceData?.drugs?.use === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.drugs?.use === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              freeSolo
              label="Use/week"
              fullWidth
              value={substanceData?.drugs?.usePerWeek?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('drugs', 'usePerWeek', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5', '6', '7']}
            />
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Types</Label>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {drugTypes.map(type => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={(substanceData?.drugs?.types || []).includes(type)}
                      onChange={() => handleArrayToggle('drugs', 'types', type)}
                    />
                  }
                  label={type}
                  sx={{ mb: 1, mr: 2, minWidth: '300px' }}
                />
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Autocomplete
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.drugs?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('drugs', 'comments', newValue)}
              options={[]}
              TextFieldProps={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Sexual Activity Section */}
      <SectionPaper>
        <SectionHeader>Sexual Activity</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Sexually active</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {sexualActivityOptions.map(option => (
                <Button
                  key={option}
                  variant={substanceData?.sexualActivity?.active === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('sexualActivity', 'active', option)}
                  size="small"
                  sx={{
                    backgroundColor: substanceData?.sexualActivity?.active === option ? '#1976d2' : 'transparent',
                    color: substanceData?.sexualActivity?.active === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: substanceData?.sexualActivity?.active === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Birth Control Methods</Label>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {birthControlMethods.map(method => (
                <FormControlLabel
                  key={method}
                  control={
                    <Checkbox
                      checked={(substanceData?.sexualActivity?.birthControl || []).includes(method)}
                      onChange={() => handleArrayToggle('sexualActivity', 'birthControl', method)}
                    />
                  }
                  label={method}
                  sx={{ mb: 1, mr: 2, minWidth: '200px' }}
                />
              ))}
            </Box>
          </Grid>

          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Partners</Label>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(substanceData?.sexualActivity?.partners || []).includes('Female')}
                  onChange={() => handleArrayToggle('sexualActivity', 'partners', 'Female')}
                />
              }
              label="Female"
              sx={{ mr: 3 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(substanceData?.sexualActivity?.partners || []).includes('Male')}
                  onChange={() => handleArrayToggle('sexualActivity', 'partners', 'Male')}
                />
              }
              label="Male"
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.sexualActivity?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('sexualActivity', 'comments', newValue)}
              options={[]}
              TextFieldProps={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </SectionPaper>
    </TitledCard>
  );
}