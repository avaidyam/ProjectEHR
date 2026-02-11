import * as React from 'react';
import { Typography } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

export const SidebarClinicalImpressions = () => {
    const { useEncounter } = usePatient();
    const [clinicalImpressions] = (useEncounter() as any).clinicalImpressions();

    return (
        <>
            <Typography variant="h6" color="inherit" style={{ fontSize: '1.25em' }}>
                Clinical Impressions
            </Typography>
            {clinicalImpressions && (clinicalImpressions as any[]).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(clinicalImpressions as any[]).map((ci: any, idx: number) => (
                        <div key={idx}>{idx + 1}. {ci.name}</div>
                    ))}
                </div>
            ) : (
                <i>No clinical impressions on file</i>
            )}
        </>
    )
}
