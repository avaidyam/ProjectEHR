import * as React from 'react';
import { Alert } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

export const SidebarAllergies = () => {
  const { useEncounter } = usePatient();
  const [allergies] = useEncounter().allergies();

  return (
    <>
      {allergies && allergies.length > 0 ? (
        allergies.some((a: any) => a.severity?.toLowerCase() === 'high') ? (
          <Alert
            icon={false}
            sx={{
              mt: .5, py: 0.1,
              bgcolor: '#ffcb00',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            Allergies: {allergies.map((a: any) => a.allergen).join(", ")}
          </Alert>
        ) : (
          <span>Allergies: {allergies.map((a: any) => a.allergen).join(", ")}</span>
        )
      ) : (
        <span>Allergies: None on file</span>
      )}
    </>
  )
}
