import * as React from 'react';
import { CreateEncounter } from './CreateEncounter';
import { useDatabase } from 'components/contexts/PatientContext';
import { Box, Label } from 'components/ui/Core';

export const CreateEncounterTab = () => {
  const [open, setOpen] = React.useState(true);
  const [departments] = useDatabase().departments();
  const [providers] = useDatabase().providers();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Label variant="h6" color="text.secondary">Create Encounter</Label>
      <CreateEncounter
        open={open}
        onClose={() => setOpen(false)}
        departments={departments}
        providers={providers}
      />
      {!open && (
        <Box sx={{ mt: 2 }}>
          <Label>Re-select this tab to open the encounter creation dialog again.</Label>
        </Box>
      )}
    </Box>
  );
};
