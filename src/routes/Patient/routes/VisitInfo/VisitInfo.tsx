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
  const { useEncounter } = usePatient();
  const [encounter, setEncounter] = useEncounter()();
  const [complaints, setComplaints] = React.useState<string[]>([]);
  const [comments, setComments] = React.useState<string>('');

  React.useEffect(() => {
    const concerns = (encounter as any)?.concerns || [];
    setComplaints(concerns.filter((c: string) => !c.startsWith('!')));
    setComments(concerns.find((c: string) => c.startsWith('!'))?.substring(1) || '');
  }, [encounter]);

  const handleSave = () => {
    setEncounter((prev: any) => ({
      ...prev,
      concerns: [...complaints, ...(comments.trim() ? [`!${comments}`] : [])]
    }));
  };

  // Handle case where encounter might not be available
  if (!encounter?.id) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <TitledCard title="Reason for Visit">
          Please select an active encounter to view visit information.
        </TitledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <TitledCard title="Reason for Visit" emphasized color="#5EA1F8">
        <Stack spacing={2}>
          <Autocomplete
            multiple
            label="Reasons for Visit"
            fullWidth
            options={COMMON_COMPLAINTS}
            value={complaints}
            onChange={(_e, newValue) => setComplaints(newValue)}
            freeSolo
          />
          <Autocomplete
            label="Comments"
            fullWidth
            freeSolo
            options={[]}
            value={comments}
            onInputChange={(_e, newValue) => setComments(newValue)}
            TextFieldProps={{
              multiline: true,
              rows: 4
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Stack>
      </TitledCard>
    </Box>
  );
};
