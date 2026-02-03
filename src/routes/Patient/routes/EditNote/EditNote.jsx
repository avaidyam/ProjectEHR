import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Button, Autocomplete } from '@mui/material';
import { Editor } from 'components/ui/Editor.jsx';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import { Label, Stack, Icon } from 'components/ui/Core';

const temporaryStorage = {};
const exampleContent = '<p>Start writing your note here...</p>';

export const useEditNoteData = (patientMRN, enc) => {
    const [activeContextId, setActiveContextId] = useState(null);
    const currentContextId = patientMRN && enc ? `${patientMRN}-${enc}` : null;

    // Force re-render helper
    const [_, setTick] = useState(0);

    useEffect(() => {
        if (!currentContextId) return;

        if (temporaryStorage[patientMRN]?.[enc]?.editNote === undefined) {
            if (!temporaryStorage[patientMRN]) temporaryStorage[patientMRN] = {};
            if (!temporaryStorage[patientMRN][enc]) temporaryStorage[patientMRN][enc] = {};

            temporaryStorage[patientMRN][enc].editNote = {
                editorState: exampleContent,
                summary: '',
                date: (() => { const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); })(),
                noteType: null,
                service: null
            };
        }
        setActiveContextId(currentContextId);
    }, [currentContextId, patientMRN, enc]);

    const isReady = activeContextId === currentContextId;
    const getStorage = () => temporaryStorage[patientMRN]?.[enc]?.editNote;

    const editorState = isReady ? getStorage().editorState : exampleContent;
    const summary = isReady ? getStorage().summary : '';
    const date = isReady ? getStorage().date : '';
    const noteType = isReady ? getStorage().noteType : null;
    const service = isReady ? getStorage().service : null;

    const setEditorState = (newState) => {
        if (isReady && getStorage()) {
            getStorage().editorState = newState;
        }
    };

    const setSummary = (newSummary) => {
        if (isReady && getStorage()) {
            getStorage().summary = newSummary;
            setTick(t => t + 1);
        }
    }

    const setDate = (newDate) => {
        if (isReady && getStorage()) {
            getStorage().date = newDate;
            setTick(t => t + 1);
        }
    }

    const setNoteType = (newType) => {
        if (isReady && getStorage()) {
            getStorage().noteType = newType;
            setTick(t => t + 1);
        }
    }

    const setService = (newService) => {
        if (isReady && getStorage()) {
            getStorage().service = newService;
            setTick(t => t + 1);
        }
    }

    return {
        isReady,
        editorState,
        setEditorState,
        summary,
        setSummary,
        date,
        setDate,
        noteType,
        setNoteType,
        service,
        setService
    };
};

const NOTE_TYPES = [
    "ACP (Advance Care Planning)",
    "Brief Op Note",
    "Consults",
    "Discharge Summary",
    "ED Medical/PA Student Note",
    "H&P",
    "Lactation Note",
    "OB ED/Admit Note",
    "Outcome Summary",
    "Patient Care Conference",
    "Procedures",
    "Progress Notes",
    "Psych Limited Note",
    "Psych Progress",
    "Significant Event"
];

const EditNote = () => {
    const { useChart, useEncounter } = usePatient();
    const [{ id: patientMRN }] = useChart()();
    const [{ id: enc }] = useEncounter()();
    const [departments] = useDatabase().departments();

    const {
        isReady,
        editorState,
        setEditorState,
        summary,
        setSummary,
        date,
        setDate,
        noteType,
        setNoteType,
        service,
        setService
    } = useEditNoteData(patientMRN, enc);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isReady ? (
                <>
                    <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Label variant="h6" color="primary">My Note</Label>
                            <Stack direction="row" spacing={1}>
                                <IconButton size="small" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}><Icon>lock</Icon></IconButton>
                                <IconButton size="small" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}><Icon>local_offer</Icon></IconButton>
                                <IconButton size="small" sx={{ bgcolor: 'warning.main', color: 'white', borderRadius: 1 }}><Icon>warning</Icon></IconButton>
                                <IconButton size="small" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}><Icon>arrow_back</Icon></IconButton>
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Label variant="body2" color="text.secondary">Date of Service:</Label>
                                    <TextField
                                        type="datetime-local"
                                        variant="standard"
                                        size="small"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        sx={{ width: 190 }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    <Label variant="body2" color="text.secondary">Type:</Label>
                                    <Autocomplete
                                        options={NOTE_TYPES}
                                        value={noteType}
                                        onChange={(_, newValue) => setNoteType(newValue)}
                                        fullWidth
                                        size="small"
                                        renderInput={(params) => <TextField {...params} variant="standard" placeholder="Note Type" />}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    <Label variant="body2" color="text.secondary">Service:</Label>
                                    <Autocomplete
                                        options={departments}
                                        getOptionLabel={(option) => option.name || ""}
                                        value={service}
                                        onChange={(_, newValue) => setService(newValue)}
                                        fullWidth
                                        size="small"
                                        renderInput={(params) => <TextField {...params} variant="standard" placeholder="Service" />}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Label variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>Summary:</Label>
                            <TextField
                                variant="standard"
                                fullWidth
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                InputProps={{ disableUnderline: false }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        m: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Editor
                            disableStickyFooter
                            initialContent={editorState}
                            onSave={setEditorState}
                            onUpdate={setEditorState}
                        />
                    </Box>
                    <Box sx={{
                        p: 1,
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'background.paper',
                        mt: 'auto'
                    }}>
                        <Autocomplete
                            options={['Sign', 'Pend', 'Sign on Signing Visit', 'Sign on Exit WS']}
                            defaultValue="Sign"
                            size="small"
                            sx={{ minWidth: 200 }}
                            renderInput={(params) => <TextField {...params} variant="outlined" />}
                        />
                        <Button variant="outlined" color="success" startIcon={<Icon>check</Icon>}>Accept</Button>
                        <Button variant="outlined" color="error" startIcon={<Icon>close</Icon>}>Cancel</Button>
                    </Box>
                </>
            ) : (
                <Box sx={{ p: 2 }}>Loading...</Box>
            )}
        </Box>
    );
};

export default EditNote;
