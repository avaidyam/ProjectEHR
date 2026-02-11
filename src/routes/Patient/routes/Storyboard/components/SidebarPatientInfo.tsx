import * as React from 'react';
import { DateHelpers } from 'util/helpers.js';
import { Alert, Avatar, Box, colors } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';
import { StickyNote } from '../../../components/StickyNote';

export const SidebarPatientInfo = () => {
    const { useChart } = usePatient();
    const [mrn] = (useChart() as any).id();
    const [firstName] = (useChart() as any).firstName();
    const [lastName] = (useChart() as any).lastName();
    const [birthdate] = (useChart() as any).birthdate();
    const [preferredLanguage] = (useChart() as any).preferredLanguage();
    const [avatarUrl] = (useChart() as any).avatarUrl();
    const [gender] = (useChart() as any).gender();

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                <Avatar
                    src={avatarUrl}
                    sx={{ zIndex: 2, bgcolor: colors.deepOrange[500], height: 80, width: 80 }}
                >
                    {[firstName, lastName].map(x => x?.charAt(0) ?? '').join("")}
                </Avatar>

                <Box sx={{ position: 'absolute', left: 'calc(50% - 84px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <StickyNote />
                </Box>
            </Box>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', marginBottom: '1em' }}>
                <strong>{firstName} {lastName}</strong>
                <span>Sex: {gender}</span>
                <span>Age: {(new Date(birthdate) as any).age()} years old</span>
                <span>DOB: {DateHelpers.standardFormat(birthdate)}</span>
                <span>MRN: {mrn}</span>
                <strong>Preferred language: {preferredLanguage}</strong>
                {preferredLanguage !== 'English' &&
                    <Alert variant="filled" severity="warning">Needs Interpreter</Alert>
                }
            </div>
        </div>
    )
}
