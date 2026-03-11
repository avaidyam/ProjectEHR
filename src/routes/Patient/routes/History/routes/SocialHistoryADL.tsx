// SocialHistoryADL.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
  MarkReviewed,
  AutocompleteButtons,
  Grid,
} from 'components/ui/Core';
import { usePatient, Database } from 'components/contexts/PatientContext';

export function SocialHistoryADL() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const socialHistoryData = socialHistory[0]?.adl || [];
  const setSocialHistoryData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentADL = next[0].adl || [];
      const newADL = typeof update === 'function' ? update(currentADL) : update;
      next[0] = { ...next[0], adl: newADL };
      return next;
    });
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Social History - ADL</>} color="#9F3494">
      <Box paper sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              options={[
                'Back Care',
                'Blood Transfusions',
                'Exercise',
                'Homebound',
                'Military Service',
                'Seat Belt',
                'Sleep Concern',
                'Stress Concern',
                'Bike Helmet',
                'Caffeine Concern',
                'Hobby Hazards',
                'Homeless',
                'Occupational Exposure',
                'Self-Exams',
                'Special Diet',
                'Weight Concern'
              ]}
              checkbox
              multiple
              value={socialHistoryData}
              onChange={(_e, val) => setSocialHistoryData(val)}
              sx={{ '& .MuiFormControlLabel-root': { minWidth: '49%' } }}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}