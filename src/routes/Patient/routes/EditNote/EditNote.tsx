import * as React from 'react';
import { Box, IconButton, Button, Typography } from '@mui/material';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';
import { Label, Stack, Icon, Window, RichTextEditor, Autocomplete, DateTimePicker } from 'components/ui/Core';
import { useSplitView } from 'components/contexts/SplitViewContext';

export const EditNote = () => {
  const { useEncounter } = usePatient();
  const [_, setNotes] = useEncounter().notes([]);
  const [] = useEncounter().smartData({} as any) // FIXME: force-init smartData object if null
  const [activeNote, setActiveNote] = useEncounter().smartData.activeNote();
  const [departments] = useDatabase().departments();
  const { closeTab } = useSplitView();

  React.useEffect(() => {
    if (!activeNote) {
      setActiveNote({
        editorState: "",
        summary: '',
        date: Temporal.Now.instant().toString() as Database.JSONDate,
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
    if (!activeNote)
      return
    setNotes(prev => [...prev, {
      id: Database.Note.ID.create(),
      serviceDate: activeNote.date!.toString() as Database.JSONDate,
      date: activeNote.date!.toString() as Database.JSONDate,
      summary: activeNote.summary!,
      author: "12" as Database.Provider.ID,
      status: "Signed",
      type: activeNote.type!,
      content: activeNote.editorState!
    }])
    setActiveNote(null);
    closeTabs();
  };

  const [isUnsavedDialogVisible, setIsUnsavedDialogVisible] = React.useState(false);

  const handleCancel = () => {
    if (activeNote?.editorState || activeNote?.summary || activeNote?.type || activeNote?.service) {
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
              <DateTimePicker
                convertString
                label="Date of Service"
                value={activeNote?.date ?? ""}
                onChange={(newValue: any) => setActiveNote({ ...activeNote!, date: newValue as Database.JSONDate })}
                sx={{ width: 190 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Label variant="body2" color="text.secondary">Type:</Label>
              <Autocomplete
                options={Database.Note.NOTE_TYPES}
                value={activeNote?.type ?? null}
                onChange={(_: any, newValue: any) => setActiveNote({ ...activeNote!, type: newValue })}
                fullWidth
                size="small"
                label="Note Type"
                TextFieldProps={{ variant: 'standard' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Label variant="body2" color="text.secondary">Service:</Label>
              <Autocomplete
                options={departments}
                getOptionLabel={(option: any) => option.name || ""}
                value={activeNote?.service ?? null}
                onChange={(_: any, newValue: any) => setActiveNote({ ...activeNote!, service: newValue })}
                fullWidth
                size="small"
                label="Service"
                TextFieldProps={{ variant: 'standard' }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Label variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>Summary:</Label>
          <Autocomplete
            freeSolo
            label="Summary"
            fullWidth
            value={activeNote?.summary ?? ""}
            onInputChange={(_e, newValue) => setActiveNote({ ...activeNote!, summary: newValue })}
            options={[]}
            TextFieldProps={{ variant: 'standard', InputProps: { disableUnderline: false } }}
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
        <RichTextEditor
          disableStickyFooter
          initialContent={activeNote?.editorState ?? ""}
          onSave={(val: string) => setActiveNote(prev => ({ ...prev!, editorState: val }))}
          onUpdate={(val: string) => setActiveNote(prev => ({ ...prev!, editorState: val }))}
          sx={{ height: "100%", overflow: "auto" }}
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
