import React from 'react';
import { Divider, Typography } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

import { SidebarPatientInfo } from './components/SidebarPatientInfo';
import { SidebarSepsisAlert } from './components/SidebarSepsisAlert';
import { SidebarCareTeam } from './components/SidebarCareTeam';
import { SidebarAllergies } from './components/SidebarAllergies';
import { SidebarVitals } from './components/SidebarVitals';
import { SidebarClinicalImpressions } from './components/SidebarClinicalImpressions';
import { SidebarProblemList } from './components/SidebarProblemList';

export const Storyboard = () => {
    const { useEncounter } = usePatient();
    const [encounter] = useEncounter()();

    return (
        <>
            <SidebarPatientInfo />
            <SidebarSepsisAlert />
            <Divider sx={{ bgcolor: "primary.light" }} />
            <SidebarCareTeam />
            <Divider sx={{ bgcolor: "primary.light" }} />
            <SidebarAllergies />
            <Divider sx={{ bgcolor: "primary.light" }} />
            {!!encounter ?
                <>
                    <Typography variant="h6">Encounter</Typography>
                    <Typography>Type: {encounter?.type}</Typography>
                    <Typography>Date: {encounter?.startDate}</Typography>
                    <Typography>Reason: {encounter?.concerns?.join(", ")}</Typography>
                </> :
                <>
                    <Typography variant="h6">Chart Review</Typography>
                </>
            }
            <Divider sx={{ bgcolor: "primary.light" }} />
            <SidebarVitals />
            <Divider sx={{ bgcolor: "primary.light" }} />
            <Divider sx={{ bgcolor: "primary.light" }} />
            <SidebarClinicalImpressions />
            <Divider sx={{ bgcolor: "primary.light" }} />
            <SidebarProblemList />
        </>
    );
};
