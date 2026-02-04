import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Button, Autocomplete, Typography } from '@mui/material';
import { Editor } from 'components/ui/Editor.jsx';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import { Label, Stack, Icon, Window } from 'components/ui/Core';
import { useSplitView } from 'components/contexts/SplitViewContext.jsx';

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
    const { useEncounter } = usePatient();
    const [_, setNotes] = useEncounter().notes();
    const [activeNote, setActiveNote] = useEncounter().smartData.activeNote();
    const [departments] = useDatabase().departments();
    const { closeTab } = useSplitView();

    useEffect(() => {
        if (!activeNote) {
            setActiveNote({
                editorState: "",
                summary: '',
                date: (() => { const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); })(),
                type: null,
                service: null
            });
        }
    }, [activeNote, setActiveNote]);

    const closeTabs = () => {
        closeTab("Edit Note", "side");
        closeTab("NoteWriter", "main");
    }

    const handleAccept = () => {
        setNotes(prev => [...prev, {
            id: crypto.randomUUID(),
            serviceDate: activeNote.date.toString(),
            date: activeNote.date.toString(),
            summary: activeNote.summary,
            author: "12",
            status: "Signed",
            type: activeNote.type,
            content: activeNote.editorState
        }])
        setActiveNote(null);
        closeTabs();
    };

    const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = useState(false);

    const handleCancel = () => {
        if (activeNote?.editorState || activeNote?.summary || activeNote?.noteType || activeNote?.service) {
            setIsUnsavedDialogVisible(true);
        } else {
            closeTabs();
        }
    }

    const handleDiscard = () => {
        setIsUnsavedDialogVisible(false);
        setActiveNote(null);
        closeTabs();
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                value={activeNote?.date ?? ""}
                                onChange={(e) => setActiveNote({ ...activeNote, date: e.target.value })}
                                sx={{ width: 190 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Label variant="body2" color="text.secondary">Type:</Label>
                            <Autocomplete
                                options={NOTE_TYPES}
                                value={activeNote?.type ?? null}
                                onChange={(_, newValue) => setActiveNote({ ...activeNote, type: newValue })}
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
                                value={activeNote?.service ?? null}
                                onChange={(_, newValue) => setActiveNote({ ...activeNote, service: newValue })}
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
                        value={activeNote?.summary ?? ""}
                        onChange={(e) => setActiveNote({ ...activeNote, summary: e.target.value })}
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
                    initialContent={activeNote?.editorState ?? ""}
                    onSave={(val) => setActiveNote(prev => ({ ...prev, editorState: val }))}
                    onUpdate={(val) => setActiveNote(prev => ({ ...prev, editorState: val }))}
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
                <Button variant="outlined" color="success" startIcon={<Icon>check</Icon>} onClick={handleAccept}>Accept</Button>
                <Button variant="outlined" color="error" startIcon={<Icon>close</Icon>} onClick={handleCancel}>Cancel</Button>
            </Box>
            <Window
                open={isUnsavedDialogVisible}
                onClose={() => setIsUnsavedDialogVisible(false)}
                title="Unsaved Changes"
                maxWidth="sm"
                fullWidth
                footer={
                    <>
                        <Button onClick={handleDiscard} sx={{ bgcolor: '#eee', color: 'text.primary', '&:hover': { bgcolor: '#ddd' } }}>Discard</Button>
                        <Button onClick={() => setIsUnsavedDialogVisible(false)} variant="outlined" sx={{ border: 2, '&:hover': { border: 2 } }}>Return to Note</Button>
                    </>
                }
            >
                <Typography variant="subtitle1" fontWeight="bold">This note has not been saved.</Typography>
                <Typography sx={{ mt: 1 }}>Are you sure you want to discard your changes to the note?</Typography>
            </Window>
        </Box>
    );
};

export default EditNote;
