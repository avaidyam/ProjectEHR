import * as React from 'react';
import {
  Box,
  Button,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  MarkReviewed,
  DatePicker,
  AutocompleteButtons,
  Grid,
  RichTextEditor
} from 'components/ui/Core';
import { usePatient, Database } from 'components/contexts/PatientContext';

export function SpecialtyOB() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const obgynData = socialHistory[0]?.OBGynHistory || {};
  const setObgynData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentOBGyn = next[0].OBGynHistory || {};
      const newOBGyn = typeof update === 'function' ? update(currentOBGyn) : update;
      next[0] = { ...next[0], OBGynHistory: newOBGyn };
      return next;
    });
  };

  // Obstetric History handlers
  const handleObstetricChange = (field: string, value: any) => {
    setObgynData((prev: any) => ({
      ...prev,
      obstetricHistory: {
        ...prev.obstetricHistory,
        [field]: value
      }
    }));
  };

  const handleObstetricCommentsChange = (content: any) => {
    setObgynData((prev: any) => ({
      ...prev,
      obstetricHistory: {
        ...prev.obstetricHistory,
        comments: content
      }
    }));
  };

  // Gynecology History handlers
  const handleGynecologyChange = (field: string, value: any) => {
    setObgynData((prev: any) => ({
      ...prev,
      gynecologyHistory: {
        ...prev.gynecologyHistory,
        [field]: value
      }
    }));
  };

  const handleGynecologyCommentsChange = (content: any) => {
    setObgynData((prev: any) => ({
      ...prev,
      gynecologyHistory: {
        ...prev.gynecologyHistory,
        comment: content
      }
    }));
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> OB/Gyn History</>} color="#9F3494">
      {/* Obstetric History */}
      <Box paper sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Label bold sx={{ color: '#e91e63', fontSize: '1.1rem' }}>Obstetric History</Label>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
          >
            Calculate Counts
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* First row */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Gravida"
              fullWidth
              value={obgynData?.obstetricHistory?.gravida?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('gravida', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Para"
              fullWidth
              value={obgynData?.obstetricHistory?.para?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('para', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Term"
              fullWidth
              value={obgynData?.obstetricHistory?.term?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('term', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Preterm"
              fullWidth
              value={obgynData?.obstetricHistory?.preterm?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('preterm', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="AB"
              fullWidth
              value={obgynData?.obstetricHistory?.ab?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('ab', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Living"
              fullWidth
              value={obgynData?.obstetricHistory?.living?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('living', parseInt(newValue) || 0)}
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
              value={obgynData?.obstetricHistory?.sab?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('sab', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="IAB"
              fullWidth
              value={obgynData?.obstetricHistory?.iab?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('iab', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Ectopic"
              fullWidth
              value={obgynData?.obstetricHistory?.ectopic?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('ectopic', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Multiple"
              fullWidth
              value={obgynData?.obstetricHistory?.multiple?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('multiple', parseInt(newValue) || 0)}
              options={['0', '1', '2']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Live Births"
              fullWidth
              value={obgynData?.obstetricHistory?.liveBirths?.toString() || ''}
              onInputChange={(_e, newValue) => handleObstetricChange('liveBirths', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5']}
            />
          </Grid>

          {/* Pregnancy status checkboxes */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                ➕ Add previous pregnancy
              </Button>
              <AutocompleteButtons
                options={[
                  { label: 'Currently pregnant', value: 'currentlyPregnant' },
                  { label: 'Never pregnant', value: 'neverPregnant' }
                ]}
                checkbox
                multiple
                value={(() => {
                  const vals = [];
                  if (obgynData?.obstetricHistory?.currentlyPregnant) vals.push('currentlyPregnant');
                  if (obgynData?.obstetricHistory?.neverPregnant) vals.push('neverPregnant');
                  return vals;
                })()}
                onChange={(_e, val) => {
                  handleObstetricChange('currentlyPregnant', val.includes('currentlyPregnant'));
                  handleObstetricChange('neverPregnant', val.includes('neverPregnant'));
                }}
                sx={{ mb: 0 }}
              />
            </Box>
          </Grid>

          {/* Obstetric Comments */}
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1, display: 'block' }}>
              Obstetric Comments
            </Label>
            <RichTextEditor
              initialContent={obgynData?.obstetricHistory?.comments || ''}
              onUpdate={handleObstetricCommentsChange}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </Box>
      {/* Gynecology History */}
      <Box paper sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Label bold sx={{ color: '#e91e63', mb: 2, fontSize: '1.1rem' }}>Gynecology History</Label>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DatePicker
              label="LMP"
              fullWidth
              size="small"
              value={obgynData?.gynecologyHistory?.lastMenstrualPeriod || ''}
              onChange={(newValue: any) => handleGynecologyChange('lastMenstrualPeriod', newValue)}
              convertString
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at menarche"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtMenarche?.toString() || ''}
              onInputChange={(_e, newValue) => handleGynecologyChange('ageAtMenarche', parseInt(newValue) || 0)}
              options={['10', '11', '12', '13', '14', '15']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at first pregnancy"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtFirstPregnancy?.toString() || ''}
              onInputChange={(_e, newValue) => handleGynecologyChange('ageAtFirstPregnancy', parseInt(newValue) || 0)}
              options={['18', '20', '25', '30', '35']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at first live birth"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtFirstLiveBirth?.toString() || ''}
              onInputChange={(_e, newValue) => handleGynecologyChange('ageAtFirstLiveBirth', parseInt(newValue) || 0)}
              options={['18', '20', '25', '30', '35']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Months breastfeeding"
              fullWidth
              value={obgynData?.gynecologyHistory?.monthsBreastfeeding?.toString() || ''}
              onInputChange={(_e, newValue) => handleGynecologyChange('monthsBreastfeeding', parseInt(newValue) || 0)}
              options={['0', '3', '6', '12', '24']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Age at menopause"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtMenopause?.toString() || ''}
              onInputChange={(_e, newValue) => handleGynecologyChange('ageAtMenopause', parseInt(newValue) || 0)}
              options={['45', '50', '52', '55']}
            />
          </Grid>

          {/* Gynecology Comments */}
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1, display: 'block' }}>
              Comment
            </Label>
            <RichTextEditor
              initialContent={obgynData?.gynecologyHistory?.comment || ''}
              onUpdate={handleGynecologyCommentsChange}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}