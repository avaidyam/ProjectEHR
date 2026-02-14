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
  Grid,
  FormControlLabel,
  Checkbox,
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

export function SpecialtyOB() {
  const { useEncounter } = usePatient();
  const [obgynData, setObgynData] = useEncounter().history.OBGynHistory({});
  const [reviewed, setReviewed] = React.useState(false);

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

  // Calculate Counts function (placeholder for now)
  const handleCalculateCounts = () => {
    // This would implement the calculation logic based on the form values
    console.log('Calculate Counts clicked');
  };

  const handleReviewedChange = (e: any) => {
    setReviewed(e.target.checked);
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> OB/Gyn History</>} color="#9F3494">
      {/* Obstetric History */}
      <SectionPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <SectionHeader>Obstetric History</SectionHeader>
          <Button
            variant="contained"
            onClick={handleCalculateCounts}
            sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}
          >
            📊 Calculate Counts
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* First row */}
          {['Gravida', 'Para', 'Term', 'Preterm', 'AB', 'Living'].map((label) => (
            <Grid key={label} size={{ xs: 12, sm: 2 }}>
              <Autocomplete
                freeSolo
                label={label}
                fullWidth
                value={obgynData?.obstetricHistory?.[label.toLowerCase()]?.toString() || ''}
                onInputChange={(_e, newValue) => handleObstetricChange(label.toLowerCase(), parseInt(newValue) || 0)}
                options={['0', '1', '2', '3', '4', '5']}
              />
            </Grid>
          ))}

          {/* Second row */}
          {['SAB', 'IAB', 'Ectopic', 'Multiple'].map((label) => (
            <Grid key={label} size={{ xs: 12, sm: 2 }}>
              <Autocomplete
                freeSolo
                label={label}
                fullWidth
                value={obgynData?.obstetricHistory?.[label.toLowerCase()]?.toString() || ''}
                onInputChange={(_e, newValue) => handleObstetricChange(label.toLowerCase(), parseInt(newValue) || 0)}
                options={['0', '1', '2']}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={obgynData?.obstetricHistory?.currentlyPregnant || false}
                    onChange={(e) => handleObstetricChange('currentlyPregnant', e.target.checked)}
                  />
                }
                label="Currently pregnant"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={obgynData?.obstetricHistory?.neverPregnant || false}
                    onChange={(e) => handleObstetricChange('neverPregnant', e.target.checked)}
                  />
                }
                label="Never pregnant"
              />
            </Box>
          </Grid>

          {/* Obstetric Comments */}
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1, display: 'block' }}>
              Obstetric Comments
            </Label>
            <Editor
              initialContent={obgynData?.obstetricHistory?.comments || ''}
              onSave={handleObstetricCommentsChange}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Gynecology History */}
      <SectionPaper>
        <SectionHeader>Gynecology History</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
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
            <Editor
              initialContent={obgynData?.gynecologyHistory?.comment || ''}
              onSave={handleGynecologyCommentsChange}
              disableStickyMenuBar={true}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            OB/Gyn history has been reviewed.
          </Label>
        )}
      </Box>
    </TitledCard>
  );
}