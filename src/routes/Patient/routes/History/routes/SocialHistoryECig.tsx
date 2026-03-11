import * as React from 'react';
import {
  Box,
  Button,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  DatePicker,
  AutocompleteButtons,
  Grid,
  MarkReviewed,
} from 'components/ui/Core';
import { usePatient, Database } from 'components/contexts/PatientContext';

export function ECigaretteVapingHistory() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const ecigaretteData = socialHistory[0]?.ECigaretteVaping || {};
  const setEcigaretteData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentECig = next[0].ECigaretteVaping || {};
      const newECig = typeof update === 'function' ? update(currentECig) : update;
      next[0] = { ...next[0], ECigaretteVaping: newECig };
      return next;
    });
  };

  const useOptions = [
    'Current Every Day User',
    'Current Some Day User',
    'Former User',
    'Never Assessed',
    'Never User',
    'User - Current Status Unknown',
    'Unknown If Ever Used'
  ];

  const handleDataChange = (field: string, value: any) => {
    setEcigaretteData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setEcigaretteData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBooleanToggle = (field: string, value: boolean) => {
    setEcigaretteData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedBooleanToggle = (section: string, field: string, value: boolean) => {
    setEcigaretteData((prev: any) => ({
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
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">E-cigarette/Vaping</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="E-cigarette/Vaping Use"
              options={useOptions}
              value={ecigaretteData?.use}
              onChange={(_e, val) => handleDataChange('use', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              size="small"
              convertString
              fullWidth
              label="Start Date"
              value={ecigaretteData?.startDate || ''}
              onChange={(date: any) => handleDataChange('startDate', date)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              size="small"
              convertString
              fullWidth
              label="Quit Date"
              value={ecigaretteData?.quitDate || ''}
              onChange={(date: any) => handleDataChange('quitDate', date)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Cartridges/Day"
              fullWidth
              value={ecigaretteData?.cartridgesPerDay?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('cartridgesPerDay', parseInt(newValue) || 0)}
              options={['1', '2', '3', '4', '5+']}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteButtons
              label="Passive Exposure"
              options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
              value={ecigaretteData?.passiveExposure}
              onChange={(_e, val) => handleBooleanToggle('passiveExposure', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteButtons
              label="Counseling Given"
              options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
              value={ecigaretteData?.counselingGiven}
              onChange={(_e, val) => handleBooleanToggle('counselingGiven', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={ecigaretteData?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* E-cigarette/Vaping Substances */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">E-cigarette/Vaping Substances</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              options={[
                { label: 'Nicotine', value: 'nicotine' },
                { label: 'THC', value: 'thc' },
                { label: 'CBD', value: 'cbd' },
                { label: 'Flavoring', value: 'flavoring' }
              ]}
              checkbox
              multiple
              value={(() => {
                const vals = [];
                if (ecigaretteData?.substances?.nicotine) vals.push('nicotine');
                if (ecigaretteData?.substances?.thc) vals.push('thc');
                if (ecigaretteData?.substances?.cbd) vals.push('cbd');
                if (ecigaretteData?.substances?.flavoring) vals.push('flavoring');
                return vals;
              })()}
              onChange={(_e, val) => {
                handleNestedBooleanToggle('substances', 'nicotine', val.includes('nicotine'));
                handleNestedBooleanToggle('substances', 'thc', val.includes('thc'));
                handleNestedBooleanToggle('substances', 'cbd', val.includes('cbd'));
                handleNestedBooleanToggle('substances', 'flavoring', val.includes('flavoring'));
              }}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '150px' } }}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Other"
              fullWidth
              value={ecigaretteData?.substances?.other || ''}
              onInputChange={(_e, newValue) => handleNestedChange('substances', 'other', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>
      {/* E-cigarette/Vaping Devices */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">E-cigarette/Vaping Devices</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              options={[
                { label: 'Disposable', value: 'disposable' },
                { label: 'Pre-filled Pod', value: 'preFilledPod' },
                { label: 'Pre-filled or Refillable Cartridge', value: 'preFilledOrRefillableCartridge' },
                { label: 'Refillable Tank', value: 'refillableTank' }
              ]}
              checkbox
              multiple
              value={(() => {
                const vals = [];
                if (ecigaretteData?.devices?.disposable) vals.push('disposable');
                if (ecigaretteData?.devices?.preFilledPod) vals.push('preFilledPod');
                if (ecigaretteData?.devices?.preFilledOrRefillableCartridge) vals.push('preFilledOrRefillableCartridge');
                if (ecigaretteData?.devices?.refillableTank) vals.push('refillableTank');
                return vals;
              })()}
              onChange={(_e, val) => {
                handleNestedBooleanToggle('devices', 'disposable', val.includes('disposable'));
                handleNestedBooleanToggle('devices', 'preFilledPod', val.includes('preFilledPod'));
                handleNestedBooleanToggle('devices', 'preFilledOrRefillableCartridge', val.includes('preFilledOrRefillableCartridge'));
                handleNestedBooleanToggle('devices', 'refillableTank', val.includes('refillableTank'));
              }}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '350px' } }}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Other"
              fullWidth
              value={ecigaretteData?.devices?.other || ''}
              onInputChange={(_e, newValue) => handleNestedChange('devices', 'other', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}