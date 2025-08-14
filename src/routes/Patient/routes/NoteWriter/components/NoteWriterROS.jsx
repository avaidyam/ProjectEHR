// This component is used to render the Review of Systems (ROS) section of the NoteWriter tab.
// Right now, it will render a list of body systems with checkboxes for each symptom and a "Neg" checkbox to mark all symptoms as negative.
// Depending on what the user selects, the ROS text will be updated automatically in the editor.

import React, { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox, Box, Typography, IconButton, Grid } from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CustomNoteModal from './CustomNoteModal.jsx'; // Import the custom note modal component


const replaceROSText = (editorState, rosState) => {
  const contentState = editorState.getCurrentContent();
  const blocks = contentState.getBlockMap().toArray();

  let rosText = "";
  Object.entries(rosState).forEach(([systemName, symptoms]) => {
    const positives = [];
    const negatives = [];
    let customNote = null;

    Object.entries(symptoms).forEach(([symptom, state]) => {
      if (state === true) positives.push(symptom);
      if (state === false) negatives.push(symptom);
      if (symptom === 'custom' && state) customNote = state;
    });

    if (positives.length || negatives.length || customNote) {
      if (rosText === '') rosText = "Review of Systems:\n";
      rosText += `${systemName.charAt(0).toUpperCase() + systemName.slice(1)}: `;
      if (positives.length) rosText += `Positive for ${positives.join(", ")}. `;
      if (negatives.length) rosText += `Negative for ${negatives.join(", ")}. `;
      if (customNote) rosText += `${customNote}. `;
      rosText += '\n';
    }
  });

  const startIndex = blocks.findIndex(block => block.getText().includes("Review of Systems:"));
  let contentStateWithoutROS = contentState;

  if (startIndex !== -1) {
    const startKey = blocks[startIndex].getKey();
    const selectionState = SelectionState.createEmpty(startKey).merge({
      focusKey: startKey,
      focusOffset: blocks[startIndex].getLength(),
    });

    contentStateWithoutROS = Modifier.replaceText(
      contentState,
      selectionState,
      rosText
    );
  } else {
    contentStateWithoutROS = Modifier.insertText(
      contentState,
      contentState.getSelectionAfter(),
      rosText
    );
  }

  // If content hasn't changed, return the original editor state
  if (contentStateWithoutROS === contentState) {
    return editorState;
  }

  return EditorState.push(editorState, contentStateWithoutROS, 'insert-characters');
};

const BodySystemComponent = React.memo(({ title, symptoms, systemState, updateSystemState }) => {
  const [isNegChecked, setIsNegChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling modal visibility
  const [currentCustomNote, setCurrentCustomNote] = useState(''); // State to hold the custom note

  const handleNegCheck = (e) => {
    setIsNegChecked(e.target.checked);
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
    setCurrentCustomNote(existingNote); // Set the current note
    setIsModalOpen(true); // Open the modal
  };

  const handleSaveCustomNote = (newCustomNote) => {
    updateSystemState({
      ...systemState,
      custom: newCustomNote, // Update the custom note
    });
    setIsModalOpen(false); // Close the modal
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
            <DescriptionIcon
              sx={{ color: systemState?.custom ? '#2e8fff' : 'inherit' }} // Change to light blue if custom note exists
            />
          </IconButton>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ marginLeft: 2 }}>
            {title}
          </Typography>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  borderRadius: 1,
                  backgroundColor:
                    systemState[symptom] === true
                      ? 'red'
                      : systemState[symptom] === false
                      ? 'green'
                      : '#f0f0f0',
                  color: systemState[symptom] != null ? 'white' : 'black',
                  cursor: 'pointer',
                  width: '100%',
                  height: '30px',
                }}
              >
                <Typography sx={{ marginLeft: 2 }}>{symptom}</Typography>
                <Box>
                  <IconButton
                    onClick={() => handleSymptomClick(symptom, true)}
                    sx={{ color: systemState[symptom] === false ? 'white' : 'inherit' }}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleSymptomClick(symptom, false)}
                    sx={{ color: systemState[symptom] === false ? 'white' : 'inherit' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Box>

      {/* Custom Note Modal */}
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

  /*
  useEffect(() => {
    const newEditorState = replaceROSText(editorState, rosState);
    
    // Avoid setting state if the new editor state is identical to the current one
    if (newEditorState.getCurrentContent() !== editorState.getCurrentContent()) {
      setEditorState(newEditorState);
    }
  }, [rosState, setEditorState]); // Remove `editorState` from the dependency array
  */

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={.5}>
        {bodySystems.map((system, idx) => (
          <Grid item xs={6} md={4} lg={3} key={idx}>
            <BodySystemComponent
              title={system.title}
              symptoms={system.symptoms}
              systemState={rosState[system.title.toLowerCase()]} // Pass specific state slice
              updateSystemState={(updatedSymptoms) =>
                setRosState(prevState => ({
                  ...prevState,
                  [system.title.toLowerCase()]: updatedSymptoms,
                }))
              } // Function to update state slice
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NoteWriterROS;