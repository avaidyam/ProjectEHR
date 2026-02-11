import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Window, TextField, Stack, Label, Icon, IconButton, Divider } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';
import { List, ListItem, ListItemText, ListItemButton, InputAdornment } from '@mui/material';

interface OpenPatientChartDialogProps {
    open: boolean;
    onClose: () => void;
}

export const OpenPatientChartDialog: React.FC<OpenPatientChartDialogProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [patients] = useDatabase().patients() as [Record<string, Database.Patient>, any];
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatientMRN, setSelectedPatientMRN] = useState<string | null>(null);

    // Reset state when closing or opening
    const handleClose = () => {
        setSearchQuery("");
        setSelectedPatientMRN(null);
        onClose();
    };

    const patientList = useMemo(() => {
        if (!searchQuery) return Object.values(patients);
        const lowerQuery = searchQuery.toLowerCase();
        return Object.values(patients).filter((p: Database.Patient) =>
            (p.firstName || "").toLowerCase().includes(lowerQuery) ||
            (p.lastName || "").toLowerCase().includes(lowerQuery) ||
            (p.id || "").toString().includes(lowerQuery)
        );
    }, [patients, searchQuery]);

    const handlePatientSelect = (mrn: string) => {
        setSelectedPatientMRN(mrn);
    };

    const handleEncounterSelect = (encID: string) => {
        navigate(`/patient/${selectedPatientMRN}/encounter/${encID}`);
        handleClose();
    };

    const handleBack = () => {
        setSelectedPatientMRN(null);
    };

    const renderStep1 = () => (
        <Stack spacing={2} sx={{ height: '100%' }}>
            <TextField
                autoFocus
                placeholder="Search by Name or MRN..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Icon>search</Icon>
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />
            <List sx={{ overflow: 'auto', flex: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {patientList.map(patient => (
                    <React.Fragment key={patient.id as string}>
                        <ListItemButton onClick={() => handlePatientSelect(patient.id as string)}>
                            <ListItemText
                                primary={`${patient.lastName}, ${patient.firstName}`}
                                secondary={`MRN: ${patient.id} • DOB: ${patient.birthdate}`}
                            />
                            <Icon color="action">chevron_right</Icon>
                        </ListItemButton>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
                {patientList.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No patients found" sx={{ textAlign: 'center', color: 'text.secondary' }} />
                    </ListItem>
                )}
            </List>
        </Stack>
    );

    const renderStep2 = () => {
        const patient = patients[selectedPatientMRN!];
        if (!patient) return <Box>Error: Patient not found</Box>;

        const encounters = Object.values(patient.encounters || {}).sort((a: Database.Encounter, b: Database.Encounter) => new Date(b.startDate as string).getTime() - new Date(a.startDate as string).getTime());

        return (
            <Stack spacing={2} sx={{ height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton onClick={handleBack} size="small">
                        <Icon>arrow_back</Icon>
                    </IconButton>
                    <Box>
                        <Label bold>{patient.lastName}, {patient.firstName}</Label>
                        <Label variant="caption" color="text.secondary">MRN: {patient.id}</Label>
                    </Box>
                </Stack>
                <Divider />
                <Label variant="subtitle2" color="text.secondary">Select Encounter</Label>
                <List sx={{ overflow: 'auto', flex: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    {encounters.map((enc: Database.Encounter) => (
                        <React.Fragment key={enc.id as string}>
                            <ListItemButton onClick={() => handleEncounterSelect(enc.id as string)}>
                                <ListItemText
                                    primary={enc.type || "Unknown Type"}
                                    secondary={`${enc.startDate} • ${enc.specialty || "No Specialty"} • ${enc.provider || "No Provider"}`}
                                />
                                <Icon color="action">open_in_new</Icon>
                            </ListItemButton>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                    {encounters.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No encounters found" sx={{ textAlign: 'center', color: 'text.secondary' }} />
                        </ListItem>
                    )}
                </List>
            </Stack>
        );
    };

    return (
        <Window
            open={open}
            onClose={handleClose}
            title="Open Patient Chart"
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { height: '60vh' } }}
        >
            {selectedPatientMRN ? renderStep2() : renderStep1()}
        </Window>
    );
};
