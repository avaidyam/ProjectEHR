// NoteWriterROS.jsx
import React, { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox, Box, Typography, IconButton, Icon, Grid } from '@mui/material';
import CustomNoteModal from './CustomNoteModal.jsx';

const BodySystemComponent = React.memo(({ title, symptoms, systemState, updateSystemState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomNote, setCurrentCustomNote] = useState('');

  const handleNegCheck = (e) => {
    updateSystemState(
      symptoms.reduce(
        (acc, symptom) => ({
          ...acc,
          [symptom]: e.target.checked ? false : null,
        }),
        {}
      )
    );
  };

  const handleCustomNote = () => {
    const existingNote = systemState?.custom || '';
    setCurrentCustomNote(existingNote);
    setIsModalOpen(true);
  };

  const handleSaveCustomNote = (newCustomNote) => {
    updateSystemState({
      ...systemState,
      custom: newCustomNote,
    });
    setIsModalOpen(false);
  };

  const allNegative = Object.values(systemState ?? {}).every((state) => state === false);

  const handleSymptomClick = (symptomName, newState) => {
    updateSystemState({
      ...systemState,
      [symptomName]: newState === systemState[symptomName] ? null : newState,
    });
  };

  return (
    <Box sx={{ border: '1px solid #ddd', padding: 2, marginBottom: 2, width: '100%' }}>
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
        <Grid item>
          <IconButton onClick={handleCustomNote}>
            <Icon sx={{ color: systemState?.custom ? '#2e8fff' : 'inherit' }}>description</Icon>
          </IconButton>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ marginLeft: 2 }}>{title}</Typography>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={<Checkbox checked={allNegative} onChange={handleNegCheck} />}
            label="Neg"
          />
        </Grid>
      </Grid>

      <Box sx={{ marginTop: 2 }}>
        {symptoms.map((symptom, idx) => (
          <Grid container key={idx} alignItems="center" spacing={1}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px', borderRadius: 1,
                  backgroundColor: systemState[symptom] === true ? 'red' : systemState[symptom] === false ? 'green' : '#f0f0f0',
                  color: systemState[symptom] != null ? 'white' : 'black',
                  cursor: 'pointer', width: '100%', height: '30px',
                }}
              >
                <Typography sx={{ marginLeft: 2 }}>{symptom}</Typography>
                <Box>
                  <IconButton onClick={() => handleSymptomClick(symptom, true)}
                    sx={{ color: systemState[symptom] === false ? 'white' : 'inherit' }}>
                    <Icon>add</Icon>
                  </IconButton>
                  <IconButton onClick={() => handleSymptomClick(symptom, false)}
                    sx={{ color: systemState[symptom] === false ? 'white' : 'inherit' }}>
                    <Icon>remove</Icon>
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Box>

      <CustomNoteModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomNote}
        title={`Enter a custom note for ${title}`}
        defaultValue={currentCustomNote}
      />
    </Box>
  );
});


const NoteWriterROS = ({ editorState, setEditorState, rosState, setRosState, bodySystems }) => {
  // We can re-introduce auto-update logic here if needed, or rely on Button in Parent
  // For now, let's assume the parent might fetch the Note content using the generator.

  // Optionally, we could update the Editor immediately here using HTML replacement, 
  // but simpler to let the User click "Generate" or the Parent handle it.

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={.5}>
        {bodySystems.map((system, idx) => (
          <Grid item xs={6} md={4} lg={3} key={idx}>
            <BodySystemComponent
              title={system.title}
              symptoms={system.symptoms}
              systemState={rosState[system.title.toLowerCase()]}
              updateSystemState={(updatedSymptoms) =>
                setRosState(prevState => ({
                  ...prevState,
                  [system.title.toLowerCase()]: updatedSymptoms,
                }))
              }
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NoteWriterROS;