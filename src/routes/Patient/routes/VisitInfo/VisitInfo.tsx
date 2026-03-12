import * as React from 'react';
import { TitledCard, Grid, Box, Autocomplete, Stack, Button, IconButton, Icon, Label } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';

const COMMON_COMPLAINTS = [
  'Abdominal pain',
  'Anxiety/Depression',
  'Back pain',
  'Chest pain',
  'Cough',
  'Dizziness',
  'Fatigue',
  'Fever',
  'Follow-up',
  'Headache',
  'Joint pain',
  'Nausea/Vomiting',
  'Rash',
  'Shortness of breath',
  'Sore throat',
  'Wellbeing exam'
];

export const VisitInfo = () => {
  const { useEncounter, isChartReview } = usePatient();
  const [encounter, setEncounter] = useEncounter()();

  // Handle case where encounter might not be available
  if (isChartReview || !encounter) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <TitledCard title="Reason for Visit">
          Please select an active encounter to view visit information.
        </TitledCard>
      </Box>
    );
  }

  const concerns = (encounter as any).concerns || [];
  const complaints = concerns.filter((c: string) => !c.startsWith('!'));
  const comments = concerns.find((c: string) => c.startsWith('!'))?.substring(1) || '';

  const handleComplaintsChange = (newValue: string[]) => {
    setEncounter((prev: any) => {
      const currentConcerns = prev.concerns || [];
      const currentComment = currentConcerns.find((c: string) => c.startsWith('!'));
      return {
        ...prev,
        concerns: [...newValue.filter(c => !c.startsWith('!')), ...(currentComment ? [currentComment] : [])]
      };
    });
  };

  const handleCommentsChange = (newValue: string) => {
    setEncounter((prev: any) => {
      const currentConcerns = prev.concerns || [];
      const baseConcerns = currentConcerns.filter((c: string) => !c.startsWith('!'));
      return {
        ...prev,
        concerns: newValue.trim() ? [...baseConcerns, `!${newValue}`] : baseConcerns
      };
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <TitledCard title="Reason for Visit" emphasized color="#5EA1F8">
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Stack spacing={4}>
              <Autocomplete
                multiple
                label="Reasons for Visit"
                fullWidth
                options={COMMON_COMPLAINTS}
                value={complaints}
                onChange={(_e, newValue) => handleComplaintsChange(newValue)}
                freeSolo
              />
              <Autocomplete
                label="Comments"
                fullWidth
                freeSolo
                options={[]}
                value={comments}
                onInputChange={(_e, newValue) => handleCommentsChange(newValue)}
                TextFieldProps={{
                  multiline: true,
                  rows: 4
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </TitledCard>
    </Box>
  );
};
