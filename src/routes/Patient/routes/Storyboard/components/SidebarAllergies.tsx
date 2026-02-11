import * as React from 'react';
import { Alert } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

export const SidebarAllergies = () => {
    const { useEncounter } = usePatient();
    const [allergies] = (useEncounter() as any).allergies();

    return (
        <>
            {allergies && (allergies as any[]).length > 0 ? (
                (allergies as any[]).some(a => a.severity?.toLowerCase() === 'high') ? (
                    <Alert
                        icon={false}
                        sx={{
                            mt: .5, py: 0.1,
                            bgcolor: '#ffcb00',
                            color: 'black',
                            fontWeight: 'bold',
                        }}
                    >
                        Allergies: {(allergies as any[]).map(a => a.allergen).join(", ")}
                    </Alert>
                ) : (
                    <span>Allergies: {(allergies as any[]).map(a => a.allergen).join(", ")}</span>
                )
            ) : (
                <span>Allergies: None on file</span>
            )}
        </>
    )
}
