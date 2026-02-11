import * as React from 'react';
import { Typography } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

export const SidebarProblemList = () => {
    const { useEncounter } = usePatient();
    const [problems] = (useEncounter() as any).problems();

    return (
        <>
            <Typography variant="h6" style={{ fontSize: '1.25em' }}>
                Problem List ({(problems as any[])?.length})
            </Typography>
            {problems && (problems as any[]).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(problems as any[]).map((p: any) => (<div key={JSON.stringify(p)}>{p.display ? p.display : p.diagnosis}</div>))}
                </div>
            ) : (
                <i>No problems on file</i>
            )}
        </>
    )
}
