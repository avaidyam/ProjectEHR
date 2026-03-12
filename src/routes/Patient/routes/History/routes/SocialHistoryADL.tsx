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
import { filterDocuments } from 'util/helpers';

export function SocialHistoryADL() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSocialHistory = React.useMemo(() => {
    return filterDocuments(socialHistory || [], conditionals, orders);
  }, [socialHistory, conditionals, orders]);

  const socialHistoryData = visibleSocialHistory[0]?.adl || [];
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
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              options={Object.values(Database.SocialHistoryItem.ADL)}
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