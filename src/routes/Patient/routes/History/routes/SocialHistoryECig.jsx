// ECigaretteVapingHistory.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Label,
  TitledCard,
  Icon,
} from 'components/ui/Core.jsx';
import {
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../components/contexts/PatientContext.jsx';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const SectionHeader = styled(Label)(({ theme }) => ({
  color: 'black',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '1rem',
}));

const SubSectionHeader = styled(Label)(({ theme }) => ({
  color: 'black',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '0.9rem',
}));

export default function ECigaretteVapingHistory() {
  const { useEncounter } = usePatient();
  const [ecigaretteData, setEcigaretteData] = useEncounter().history.ECigaretteVaping();

  const useOptions = [
    'Current Every Day User',
    'Current Some Day User',
    'Former User',
    'Never Assessed',
    'Never User',
    'User - Current Status Unknown',
    'Unknown If Ever Used'
  ];

  const handleDataChange = (field, value) => {
    setEcigaretteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setEcigaretteData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBooleanToggle = (field, value) => {
    setEcigaretteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedBooleanToggle = (section, field, value) => {
    setEcigaretteData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> E-cigarette/Vaping</>} color="#9F3494">
      {/* Main E-cigarette/Vaping Section */}
      <SectionPaper>
        <SectionHeader>E-cigarette/Vaping</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>E-cigarette/Vaping Use</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {useOptions.map(option => (
                <Button
                  key={option}
                  variant={ecigaretteData?.use === option ? 'contained' : 'outlined'}
                  onClick={() => handleDataChange('use', option)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.use === option ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.use === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.use === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={ecigaretteData?.startDate || ''}
              onChange={(e) => handleDataChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Quit Date"
              type="date"
              fullWidth
              value={ecigaretteData?.quitDate || ''}
              onChange={(e) => handleDataChange('quitDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Cartridges/Day"
              type="number"
              fullWidth
              value={ecigaretteData?.cartridgesPerDay || ''}
              onChange={(e) => handleDataChange('cartridgesPerDay', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Passive Exposure</Label>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={ecigaretteData?.passiveExposure === true ? 'contained' : 'outlined'}
                onClick={() => handleBooleanToggle('passiveExposure', true)}
                size="small"
                sx={{
                  backgroundColor: ecigaretteData?.passiveExposure === true ? '#1976d2' : 'transparent',
                  color: ecigaretteData?.passiveExposure === true ? 'white' : '#1976d2',
                  borderColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: ecigaretteData?.passiveExposure === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Yes
              </Button>
              <Button
                variant={ecigaretteData?.passiveExposure === false ? 'contained' : 'outlined'}
                onClick={() => handleBooleanToggle('passiveExposure', false)}
                size="small"
                sx={{
                  backgroundColor: ecigaretteData?.passiveExposure === false ? '#1976d2' : 'transparent',
                  color: ecigaretteData?.passiveExposure === false ? 'white' : '#1976d2',
                  borderColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: ecigaretteData?.passiveExposure === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                No
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Counseling Given</Label>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={ecigaretteData?.counselingGiven === true ? 'contained' : 'outlined'}
                onClick={() => handleBooleanToggle('counselingGiven', true)}
                size="small"
                sx={{
                  backgroundColor: ecigaretteData?.counselingGiven === true ? '#1976d2' : 'transparent',
                  color: ecigaretteData?.counselingGiven === true ? 'white' : '#1976d2',
                  borderColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: ecigaretteData?.counselingGiven === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                Yes
              </Button>
              <Button
                variant={ecigaretteData?.counselingGiven === false ? 'contained' : 'outlined'}
                onClick={() => handleBooleanToggle('counselingGiven', false)}
                size="small"
                sx={{
                  backgroundColor: ecigaretteData?.counselingGiven === false ? '#1976d2' : 'transparent',
                  color: ecigaretteData?.counselingGiven === false ? 'white' : '#1976d2',
                  borderColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: ecigaretteData?.counselingGiven === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                No
              </Button>
            </Box>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Comments"
              multiline
              rows={3}
              fullWidth
              value={ecigaretteData?.comments || ''}
              onChange={(e) => handleDataChange('comments', e.target.value)}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* E-cigarette/Vaping Substances */}
      <SectionPaper>
        <SubSectionHeader>E-cigarette/Vaping Substances</SubSectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '80px', flex: 1 }}>Nicotine</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.substances?.nicotine === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'nicotine', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.nicotine === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.nicotine === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.nicotine === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.substances?.nicotine === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'nicotine', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.nicotine === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.nicotine === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.nicotine === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '80px', flex: 1 }}>THC</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.substances?.thc === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'thc', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.thc === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.thc === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.thc === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.substances?.thc === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'thc', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.thc === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.thc === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.thc === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '80px', flex: 1 }}>CBD</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.substances?.cbd === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'cbd', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.cbd === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.cbd === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.cbd === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.substances?.cbd === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'cbd', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.cbd === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.cbd === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.cbd === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '80px', flex: 1 }}>Flavoring</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.substances?.flavoring === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'flavoring', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.flavoring === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.flavoring === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.flavoring === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.substances?.flavoring === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('substances', 'flavoring', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.substances?.flavoring === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.substances?.flavoring === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.substances?.flavoring === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Other"
              fullWidth
              value={ecigaretteData?.substances?.other || ''}
              onChange={(e) => handleNestedChange('substances', 'other', e.target.value)}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* E-cigarette/Vaping Devices */}
      <SectionPaper>
        <SubSectionHeader>E-cigarette/Vaping Devices</SubSectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '120px', flex: 1 }}>Disposable</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.devices?.disposable === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'disposable', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.disposable === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.disposable === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.disposable === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.devices?.disposable === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'disposable', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.disposable === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.disposable === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.disposable === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '120px', flex: 1 }}>Pre-filled Pod</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.devices?.preFilledPod === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'preFilledPod', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.preFilledPod === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.preFilledPod === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.preFilledPod === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.devices?.preFilledPod === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'preFilledPod', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.preFilledPod === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.preFilledPod === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.preFilledPod === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '200px', flex: 1 }}>Pre-filled or Refillable Cartridge</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.devices?.preFilledOrRefillableCartridge === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'preFilledOrRefillableCartridge', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.preFilledOrRefillableCartridge === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.preFilledOrRefillableCartridge === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.preFilledOrRefillableCartridge === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.devices?.preFilledOrRefillableCartridge === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'preFilledOrRefillableCartridge', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.preFilledOrRefillableCartridge === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.preFilledOrRefillableCartridge === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.preFilledOrRefillableCartridge === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label variant="body2" sx={{ minWidth: '120px', flex: 1 }}>Refillable Tank</Label>
              <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
                <Button
                  variant={ecigaretteData?.devices?.refillableTank === true ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'refillableTank', true)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.refillableTank === true ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.refillableTank === true ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.refillableTank === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant={ecigaretteData?.devices?.refillableTank === false ? 'contained' : 'outlined'}
                  onClick={() => handleNestedBooleanToggle('devices', 'refillableTank', false)}
                  size="small"
                  sx={{
                    backgroundColor: ecigaretteData?.devices?.refillableTank === false ? '#1976d2' : 'transparent',
                    color: ecigaretteData?.devices?.refillableTank === false ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    minWidth: '50px',
                    '&:hover': {
                      backgroundColor: ecigaretteData?.devices?.refillableTank === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Other"
              fullWidth
              value={ecigaretteData?.devices?.other || ''}
              onChange={(e) => handleNestedChange('devices', 'other', e.target.value)}
            />
          </Grid>
        </Grid>
      </SectionPaper>
    </TitledCard>
  );
}