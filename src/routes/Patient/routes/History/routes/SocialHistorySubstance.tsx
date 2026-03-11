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

export function SubstanceAndSexualHistory() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const substanceData = socialHistory[0] || {};
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
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Substance & Sexual Activity</>} color="#9F3494">

      {/* Tobacco Section */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Tobacco</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Smoking"
              options={Object.values(Database.SocialHistoryItem.SmokingStatus)}
              value={substanceData?.tobacco?.status}
              onChange={(_e, val) => handleDataChange('tobacco', 'status', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Passive Exposure"
              options={Object.values(Database.SocialHistoryItem.PassiveExposure)}
              value={substanceData?.tobacco?.passiveExposure}
              onChange={(_e, val) => handleDataChange('tobacco', 'passiveExposure', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Smoking Types"
              options={Object.values(Database.SocialHistoryItem.SmokingType)}
              checkbox
              multiple
              value={substanceData?.tobacco?.types || []}
              onChange={(_e, val) => handleDataChange('tobacco', 'types', val)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Packs per day"
              fullWidth
              value={substanceData?.tobacco?.packsPerDay?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('tobacco', 'packsPerDay', newValue)}
              options={['0.25', '0.5', '1', '1.5', '2']}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Pack years"
              fullWidth
              value={substanceData?.tobacco?.packYears?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('tobacco', 'packYears', newValue)}
              options={['5', '10', '20', '30', '40', '50']}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              size="small"
              label="Start Date"
              fullWidth
              value={substanceData?.tobacco?.startDate || ''}
              onChange={(newValue: any) => handleDataChange('tobacco', 'startDate', newValue)}
              convertString
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              size="small"
              label="Quit Date"
              fullWidth
              value={substanceData?.tobacco?.quitDate || ''}
              onChange={(newValue: any) => handleDataChange('tobacco', 'quitDate', newValue)}
              convertString
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Smokeless"
              options={Object.values(Database.SocialHistoryItem.SmokelessStatus)}
              value={substanceData?.tobacco?.smokeless}
              onChange={(_e, val) => handleDataChange('tobacco', 'smokeless', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.tobacco?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('tobacco', 'comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Alcohol Section */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Alcohol</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Alcohol Use?"
              options={Object.values(Database.SocialHistoryItem.AlcoholStatus)}
              value={substanceData?.alcohol?.status}
              onChange={(_e, val) => handleDataChange('alcohol', 'status', val)}
            />
          </Grid>
          <Grid size={12}>
            <Label variant="subtitle2">
              Drinks per Week
            </Label>
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Glasses of wine"
              fullWidth
              value={substanceData?.alcohol?.wine?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'wine', newValue)}
              options={['0', '1', '2', '3', '7', '14']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Cans of beer"
              fullWidth
              value={substanceData?.alcohol?.beer?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'beer', newValue)}
              options={['0', '1', '2', '3', '6', '12']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Shots of liquor"
              fullWidth
              value={substanceData?.alcohol?.liquor?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'liquor', newValue)}
              options={['0', '1', '2', '3', '5']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Drinks containing 1.5 oz of alcohol"
              fullWidth
              value={substanceData?.alcohol?.mixed?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'mixed', newValue)}
              options={['0', '1', '2', '3']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Standard drinks or equivalent"
              fullWidth
              value={substanceData?.alcohol?.standard?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'standard', newValue)}
              options={['0', '1', '2', '3', '7', '14', '21']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.alcohol?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('alcohol', 'comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Drug Section */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Drug</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Drug Use"
              options={Object.values(Database.SocialHistoryItem.DrugStatus)}
              value={substanceData?.drugs?.status}
              onChange={(_e, val) => handleDataChange('drugs', 'status', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Types"
              options={Object.values(Database.SocialHistoryItem.DrugType)}
              checkbox
              multiple
              value={substanceData?.drugs?.types || []}
              onChange={(_e, val) => handleDataChange('drugs', 'types', val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '300px' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Use/week"
              fullWidth
              value={substanceData?.drugs?.usage || ''}
              onInputChange={(_e, newValue) => handleDataChange('drugs', 'usage', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5', '6', '7']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.drugs?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('drugs', 'comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sexual Activity Section */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Sexual Activity</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Sexually active"
              options={Object.values(Database.SocialHistoryItem.SexualStatus)}
              value={substanceData?.sexual?.status}
              onChange={(_e, val) => handleDataChange('sexual', 'status', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Birth Control Methods"
              options={Object.values(Database.SocialHistoryItem.BirthControlMethod)}
              checkbox
              multiple
              value={substanceData?.sexual?.birthControl || []}
              onChange={(_e, val) => handleDataChange('sexual', 'birthControl', val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '200px' } }}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Partners"
              options={Object.values(Database.SocialHistoryItem.SexualPartner)}
              checkbox
              multiple
              value={substanceData?.sexual?.partners || []}
              onChange={(_e, val) => handleDataChange('sexual', 'partners', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.sexual?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('sexual', 'comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}