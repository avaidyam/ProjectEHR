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
  RichTextEditor
} from 'components/ui/Core';
import { MarkReviewed } from 'components/ui/MarkReviewed';
import { usePatient, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export function SpecialtyOB() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSocialHistory = React.useMemo(() => {
    return filterDocuments(socialHistory || [], conditionals, orders);
  }, [socialHistory, conditionals, orders]);

  const socialData = visibleSocialHistory[0] || {};
  const setSocialData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const current = next[0] || {};
      const newSocial = typeof update === 'function' ? update(current) : update;
      next[0] = { ...current, ...newSocial };
      return next;
    });
  };

  const handleDataChange = (section: string, field: string, value: any) => {
    setSocialData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> OB/Gyn History</>} color="#9F3494">
      {/* Obstetric History */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Obstetric History</Label>

        <Grid container spacing={2}>
          {/* First row */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Gravida"
              fullWidth
              value={socialData?.obstetrics?.gravida?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'gravida', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Para"
              fullWidth
              value={socialData?.obstetrics?.para?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'para', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Term"
              fullWidth
              value={socialData?.obstetrics?.term?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'term', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Preterm"
              fullWidth
              value={socialData?.obstetrics?.preterm?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'preterm', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="AB"
              fullWidth
              value={socialData?.obstetrics?.ab?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'ab', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Living"
              fullWidth
              value={socialData?.obstetrics?.living?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'living', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>

          {/* Second row */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="SAB"
              fullWidth
              value={socialData?.obstetrics?.sab?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'sab', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="IAB"
              fullWidth
              value={socialData?.obstetrics?.iab?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'iab', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Ectopic"
              fullWidth
              value={socialData?.obstetrics?.ectopic?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'ectopic', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Multiple"
              fullWidth
              value={socialData?.obstetrics?.multiple?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'multiple', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Live Births"
              fullWidth
              value={socialData?.obstetrics?.liveBirths?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('obstetrics', 'liveBirths', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>

          {/* Pregnancy status checkboxes */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <AutocompleteButtons
                options={[
                  { label: 'Currently pregnant', value: 'currentlyPregnant' },
                  { label: 'Never pregnant', value: 'neverPregnant' }
                ]}
                checkbox
                multiple
                value={(() => {
                  const vals = [];
                  if (socialData?.obstetrics?.currentlyPregnant) vals.push('currentlyPregnant');
                  if (socialData?.obstetrics?.neverPregnant) vals.push('neverPregnant');
                  return vals;
                })()}
                onChange={(_e, val) => {
                  handleDataChange('obstetrics', 'currentlyPregnant', val.includes('currentlyPregnant'));
                  handleDataChange('obstetrics', 'neverPregnant', val.includes('neverPregnant'));
                }}
                sx={{ mb: 0 }}
              />
            </Box>
          </Grid>

          {/* Obstetric Comments */}
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1, display: 'block' }}>
              Comments
            </Label>
            <RichTextEditor
              initialContent={socialData?.obstetrics?.comments || ''}
              onUpdate={(content: any) => handleDataChange('obstetrics', 'comments', content)}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </Box>
      {/* Gynecology History */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Gynecology History</Label>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DatePicker
              label="LMP"
              fullWidth
              size="small"
              value={socialData?.gynecology?.lastMenstrualPeriod || ''}
              onChange={(newValue: any) => handleDataChange('gynecology', 'lastMenstrualPeriod', newValue)}
              convertString
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at menarche"
              fullWidth
              value={socialData?.gynecology?.ageAtMenarche?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('gynecology', 'ageAtMenarche', parseInt(newValue) || 0)}
              options={['10', '11', '12', '13', '14', '15']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at first pregnancy"
              fullWidth
              value={socialData?.gynecology?.ageAtFirstPregnancy?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('gynecology', 'ageAtFirstPregnancy', parseInt(newValue) || 0)}
              options={['18', '20', '25', '30', '35']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at first live birth"
              fullWidth
              value={socialData?.gynecology?.ageAtFirstLiveBirth?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('gynecology', 'ageAtFirstLiveBirth', parseInt(newValue) || 0)}
              options={['18', '20', '25', '30', '35']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Months breastfeeding"
              fullWidth
              value={socialData?.gynecology?.monthsBreastfeeding?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('gynecology', 'monthsBreastfeeding', parseInt(newValue) || 0)}
              options={['0', '3', '6', '12', '24']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at menopause"
              fullWidth
              value={socialData?.gynecology?.ageAtMenopause?.toString() || ''}
              onInputChange={(_e, newValue) => handleDataChange('gynecology', 'ageAtMenopause', parseInt(newValue) || 0)}
              options={['45', '50', '52', '55']}
            />
          </Grid>

          {/* Gynecology Comments */}
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1, display: 'block' }}>
              Comments
            </Label>
            <RichTextEditor
              initialContent={socialData?.gynecology?.comments || ''}
              onUpdate={(content: any) => handleDataChange('gynecology', 'comment', content)}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}