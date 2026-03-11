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

  const substanceData = socialHistory[0]?.SubstanceSexualHealth || {};
  const setSubstanceData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentSubstance = next[0].SubstanceSexualHealth || {};
      const newSubstance = typeof update === 'function' ? update(currentSubstance) : update;
      next[0] = { ...next[0], SubstanceSexualHealth: newSubstance };
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
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Tobacco</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Smoking"
              options={['Never', 'Former', 'Every Day', 'Some Days', 'Unknown']}
              value={substanceData?.tobacco?.status}
              onChange={(_e, val) => handleDataChange('tobacco', 'status', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Passive Exposure"
              options={['Never', 'Past', 'Current']}
              value={substanceData?.tobacco?.passiveExposure}
              onChange={(_e, val) => handleDataChange('tobacco', 'passiveExposure', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Smoking Types"
              options={['Cigarettes', 'Pipe', 'Cigars', 'Other']}
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
              options={['Never', 'Former', 'Current', 'Unknown']}
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
              options={['Yes', 'No', 'Not Currently', 'Never']}
              value={substanceData?.alcohol?.use}
              onChange={(_e, val) => handleDataChange('alcohol', 'use', val)}
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
              value={substanceData?.alcohol?.drinksPerWeek?.wine?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('wine', newValue)}
              options={['0', '1', '2', '3', '7', '14']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Cans of beer"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.beer?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('beer', newValue)}
              options={['0', '1', '2', '3', '6', '12']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Shots of liquor"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.liquor?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('liquor', newValue)}
              options={['0', '1', '2', '3', '5']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Drinks containing 1.5 oz of alcohol"
              fullWidth
              value={substanceData?.alcohol?.drinksPerWeek?.mixedDrinks?.toString() || ''}
              onInputChange={(_e, newValue) => handleDrinksChange('mixedDrinks', newValue)}
              options={['0', '1', '2', '3']}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
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
              options={['Yes', 'No', 'Not Currently', 'Never']}
              value={substanceData?.drugs?.use}
              onChange={(_e, val) => handleDataChange('drugs', 'use', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Types"
              options={[
                'Anabolic Steroids',
                'Barbiturates',
                'Benzodiazepines',
                'Cannabinoids - Marijuana, Hashish, Synthetics',
                'Hallucinogens - e.g. LSD, Mushrooms',
                'Inhalants - e.g. Nitrous Oxide, Amyl Nitrite',
                'Opioids',
                'Stimulants - e.g. Amphetamines, Crack/Cocaine, Methyphenidate',
                'Other'
              ]}
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
              value={substanceData?.drugs?.usePerWeek?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('drugs', 'usePerWeek', parseInt(newValue) || 0)}
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
              options={['Yes', 'Not Currently', 'Never']}
              value={substanceData?.sexualActivity?.active}
              onChange={(_e, val) => handleDataChange('sexualActivity', 'active', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Birth Control Methods"
              options={[
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
              ]}
              checkbox
              multiple
              value={substanceData?.sexualActivity?.birthControl || []}
              onChange={(_e, val) => handleDataChange('sexualActivity', 'birthControl', val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '200px' } }}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Partners"
              options={['Female', 'Male']}
              checkbox
              multiple
              value={substanceData?.sexualActivity?.partners || []}
              onChange={(_e, val) => handleDataChange('sexualActivity', 'partners', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              label="Comments"
              fullWidth
              value={substanceData?.sexualActivity?.comments || ''}
              onInputChange={(_e, newValue) => handleDataChange('sexualActivity', 'comments', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}