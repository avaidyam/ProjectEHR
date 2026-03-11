import * as React from 'react';
import {
  Box,
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

  const substanceData = socialHistory[0] || {};
  const ecigaretteData = substanceData?.vaping || {};
  const setSubstanceData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentSubstance = next[0] || {};
      const newSubstance = typeof update === 'function' ? update(currentSubstance) : update;
      next[0] = { ...next[0], ...newSubstance };
      return next;
    });
  };

  const handleDataChange = (section: string, field: string, value: any) => {
    setSubstanceData((prev: any) => ({
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
              options={[
                'Current Every Day User',
                'Current Some Day User',
                'Former User',
                'Never Assessed',
                'Never User',
                'User - Current Status Unknown',
                'Unknown If Ever Used'
              ]}
              value={ecigaretteData?.status}
              onChange={(_e, val) => handleDataChange('vaping', 'status', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              size="small"
              convertString
              fullWidth
              label="Start Date"
              value={ecigaretteData?.startDate || ''}
              onChange={(date: any) => handleDataChange('vaping', 'startDate', date)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              size="small"
              convertString
              fullWidth
              label="Quit Date"
              value={ecigaretteData?.quitDate || ''}
              onChange={(date: any) => handleDataChange('vaping', 'quitDate', date)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Cartridges/Day"
              fullWidth
              value={ecigaretteData?.cartridgesPerDay?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('vaping', 'cartridgesPerDay', parseInt(newValue) || 0)}
              options={['1', '2', '3', '4', '5+']}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteButtons
              label="Passive Exposure"
              options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
              value={ecigaretteData?.passiveExposure}
              onChange={(_e, val) => handleDataChange('vaping', 'passiveExposure', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteButtons
              label="Counseling Given"
              options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
              value={ecigaretteData?.counselingGiven}
              onChange={(_e, val) => handleDataChange('vaping', 'counselingGiven', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={ecigaretteData?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('vaping', 'comments', newValue)}
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
              value={ecigaretteData?.substances || []}
              onChange={(_e, val) => handleDataChange('vaping', 'substances', val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '150px' } }}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Other"
              fullWidth
              value={(ecigaretteData?.substances || []).filter((s: string) => !['nicotine', 'thc', 'cbd', 'flavoring'].includes(s)).join(', ')}
              onInputChange={(_e, newValue) => {
                const known = (ecigaretteData?.substances || []).filter((s: string) => ['nicotine', 'thc', 'cbd', 'flavoring'].includes(s));
                const other = newValue ? [newValue] : [];
                handleDataChange('vaping', 'substances', [...known, ...other]);
              }}
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
              value={ecigaretteData?.devices || []}
              onChange={(_e, val) => handleDataChange('vaping', 'devices', val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '350px' } }}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Other"
              fullWidth
              value={(ecigaretteData?.devices || []).filter((s: string) => !['disposable', 'preFilledPod', 'preFilledOrRefillableCartridge', 'refillableTank'].includes(s)).join(', ')}
              onInputChange={(_e, newValue) => {
                const known = (ecigaretteData?.devices || []).filter((s: string) => ['disposable', 'preFilledPod', 'preFilledOrRefillableCartridge', 'refillableTank'].includes(s));
                const other = newValue ? [newValue] : [];
                handleDataChange('vaping', 'devices', [...known, ...other]);
              }}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}