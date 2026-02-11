import * as React from 'react';
import {
  Box,
  Button,
  TextField,
  Label,
  TitledCard,
  Icon,
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
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Gravida"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.gravida || ''}
              onChange={(e) => handleObstetricChange('gravida', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Para"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.para || ''}
              onChange={(e) => handleObstetricChange('para', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Term"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.term || ''}
              onChange={(e) => handleObstetricChange('term', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Preterm"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.preterm || ''}
              onChange={(e) => handleObstetricChange('preterm', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="AB"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.ab || ''}
              onChange={(e) => handleObstetricChange('ab', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Living"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.living || ''}
              onChange={(e) => handleObstetricChange('living', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* Second row */}
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="SAB"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.sab || ''}
              onChange={(e) => handleObstetricChange('sab', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="IAB"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.iab || ''}
              onChange={(e) => handleObstetricChange('iab', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Ectopic"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.ectopic || ''}
              onChange={(e) => handleObstetricChange('ectopic', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label="Multiple"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.multiple || ''}
              onChange={(e) => handleObstetricChange('multiple', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Live Births"
              type="number"
              fullWidth
              value={obgynData?.obstetricHistory?.liveBirths || ''}
              onChange={(e) => handleObstetricChange('liveBirths', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
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
            <TextField
              label="Age at menarche"
              type="number"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtMenarche || ''}
              onChange={(e) => handleGynecologyChange('ageAtMenarche', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Age at first pregnancy"
              type="number"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtFirstPregnancy || ''}
              onChange={(e) => handleGynecologyChange('ageAtFirstPregnancy', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Age at first live birth"
              type="number"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtFirstLiveBirth || ''}
              onChange={(e) => handleGynecologyChange('ageAtFirstLiveBirth', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Months breastfeeding"
              type="number"
              fullWidth
              value={obgynData?.gynecologyHistory?.monthsBreastfeeding || ''}
              onChange={(e) => handleGynecologyChange('monthsBreastfeeding', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Age at menopause"
              type="number"
              fullWidth
              value={obgynData?.gynecologyHistory?.ageAtMenopause || ''}
              onChange={(e) => handleGynecologyChange('ageAtMenopause', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100 }}
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