// NoteWriterPE.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, IconButton, Checkbox } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { EditorState, Modifier, SelectionState } from 'draft-js';

// Function to replace Physical Exam text in the editor based on peState
const replacePEText = (editorState, peState) => {
  // Get the current content of the editor
  const contentState = editorState.getCurrentContent();
  const blocks = contentState.getBlockMap().toArray();

  let peText = "";

  // Iterate over the Physical Exam state to generate text for each system
  Object.entries(peState).forEach(([systemName, systemData]) => {
    if (!systemData) return; // If there's no data for this system, skip it

    const customNote = systemData.custom; // Extract custom note if it exists
    let systemText = `${systemName.charAt(0).toUpperCase() + systemName.slice(1)}: \n`; // Start building text for the system
    let hasSubsectionText = false; // Track if the system has any subsection text

    // Iterate over each subsection in the system
    Object.entries(systemData).forEach(([subsectionTitle, subsectionData]) => {
      if (subsectionTitle === 'custom' || !subsectionData) return; // Skip custom note or undefined subsections

      const positives = []; // List to store positive symptom only  findings
      const negatives = []; // List to store negative symptom only findings
      const checkboxesText = []; // List to store findings from selected checkboxes

      // Iterate through symptoms to determine which are positive and which are negative
      Object.entries(subsectionData.symptoms || {}).forEach(([symptom, state]) => {
        if (state === true) positives.push(symptom);
        if (state === false) negatives.push(symptom);
      });

      // Iterate through checkboxes to gather selected items
      Object.entries(subsectionData.checkboxes || {}).forEach(([checkbox, state]) => {
        if (state) checkboxesText.push(checkbox); // If checkbox is selected, add to checkboxesText
      });

      // Only add subsection text if there are positives, negatives, or checkboxes selected
      if (positives.length || negatives.length || checkboxesText.length) {
        hasSubsectionText = true; // Mark that this system has subsection text

        // Add subsection title to the system text, capitalize the first letter
        if (subsectionTitle)
        {
          systemText += ` ${subsectionTitle.charAt(0).toUpperCase() + subsectionTitle.slice(1)}: `;
        }

        if (positives.length) systemText += `Positive for ${positives.join(", ")}. `;
        
        if (negatives.length) systemText += `Negative for ${negatives.join(", ")}. `;
        
        if (checkboxesText.length) systemText += `Findings: ${checkboxesText.join(", ")}. `;
        
        // Add newline at the end of subsection text
        systemText += '\n';
      }
    });

    // Add custom note if it exists
    if (customNote) {
        systemText += ` ${customNote}.\n`;
    }

    // Only add the system text if there's subsection text or a custom note
    if (hasSubsectionText || customNote) {
      peText += systemText;
    }
  });

  // Add header for Physical Exam if there is any PE text
  if (peText) {
    peText = "Physical Exam:\n" + peText;
  }

  // Find the index of the block containing "Physical Exam:" to replace it
  const startIndex = blocks.findIndex(block => block.getText().includes("Physical Exam:"));
  let contentStateWithoutPE = contentState;

  if (startIndex !== -1) {
    // If "Physical Exam:" block exists, replace the text in that block
    const startKey = blocks[startIndex].getKey();
    const selectionState = SelectionState.createEmpty(startKey).merge({
      focusKey: startKey,
      focusOffset: blocks[startIndex].getLength(),
    });

    // Replace the old Physical Exam text with the updated text
    contentStateWithoutPE = Modifier.replaceText(
      contentState,
      selectionState,
      peText
    );
  } else {
    // If "Physical Exam:" block doesn't exist, insert new text at the end
    contentStateWithoutPE = Modifier.insertText(
      contentState,
      contentState.getSelectionAfter(),
      peText
    );
  }

  // If content hasn't changed, return the original editor state
  if (contentStateWithoutPE === contentState) {
    return editorState;
  }

  // Return new editor state with updated content
  return EditorState.push(editorState, contentStateWithoutPE, 'insert-characters');
};



// Component to display individual body system for the Physical Exam
const PhysicalExamBodySystemComponent = ({ title, subsections = [], peState, updatePEState }) => {
  
  // Function to handle adding or updating a custom note for a body system
  const handleCustomNote = () => {
    // Extract current custom note or initialize as an empty string
    const currentCustomNote = peState[title.toLowerCase()]?.custom || '';
    
    // Prompt the user to enter a custom note with the current note as a pre-filled value
    const newCustomNote = prompt(`Enter a custom note for ${title}`, currentCustomNote);
    
    // If the user does not cancel the prompt, update the PE state with the new custom note
    if (newCustomNote !== null) {
      updatePEState({
        ...peState, // Keep the existing state intact
        [title.toLowerCase()]: {
          ...peState[title.toLowerCase()], // Keep the existing state for this particular body system
          custom: newCustomNote, // Update the custom note with the new value
        },
      });
    }
  };

  // Function to handle checkbox changes for a specific subsection
  const handleCheckboxChange = (subsectionTitle, checkbox) => {
    // Get the current state of the checkbox (default to false if undefined)
    const currentCheckboxState = peState[title.toLowerCase()]?.[subsectionTitle]?.checkboxes?.[checkbox] || false;
    
    // Update the checkbox state, effectively toggling the value
    updatePEState({
      ...peState, // Keep the existing state intact
      [title.toLowerCase()]: {
        ...peState[title.toLowerCase()], // Keep the existing state for this body system intact
        [subsectionTitle]: {
          ...peState[title.toLowerCase()]?.[subsectionTitle], // Keep the existing state for this subsection intact
          checkboxes: {
            ...peState[title.toLowerCase()]?.[subsectionTitle]?.checkboxes, // Keep the existing checkboxes intact
            [checkbox]: !currentCheckboxState, // Toggle the checkbox value (if checked, uncheck it and vice versa)
          },
        },
      },
    });
  };

  // Function to handle symptom click (+/-) for a specific subsection
  const handleSymptomClick = (subTitle, symptomName, newState) => {
    updatePEState({
      ...peState, // Keep the existing state intact
      [title.toLowerCase()]: {
        ...peState[title.toLowerCase()], // Keep the existing state for this body system intact
        [subTitle]: {
          ...peState[title.toLowerCase()]?.[subTitle], // Keep the existing state for this subsection intact
          symptoms: {
            ...peState[title.toLowerCase()]?.[subTitle]?.symptoms, // Keep the existing symptoms intact
            [symptomName]: newState === peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptomName] ? null : newState, // Toggle between new state and null
          },
        },
      },
    });
  };

  // Render component for each body system and its subsections
  return (
    <Box sx={{ border: '1px solid #ddd', padding: 1, marginBottom: 1, width: '100%' }}>
      {/* Header with Title and Custom Note Icon */}
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
        <Grid item>
          <IconButton onClick={handleCustomNote}>
            {/* Display custom note icon, change color if custom note exists */}
            <DescriptionIcon sx={{ color: peState[title.toLowerCase()]?.custom ? '#2e8fff' : 'inherit' }} />
          </IconButton>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ marginLeft: 1 }}>
            {title} {/* Display the title of the body system */}
          </Typography>
        </Grid>
      </Grid>

      {/* Render subsections for the body system */}
      {subsections.map((subsection, idx) => {
        // Generate subsection title or fallback to "subsection_{index}" if none exists
        const subTitle = subsection.subsectionTitle ? subsection.subsectionTitle.toLowerCase() : ``;

        return (
          <Box key={subTitle} sx={{ marginTop: 1, border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
            {subsection.subsectionTitle && (
              <Typography variant="subtitle1" sx={{ marginBottom: 0.5 }}>
                {subsection.subsectionTitle} {/* Display the subsection title if it exists */}
              </Typography>
            )}

            {/* Render checkboxes for normal findings in the subsection */}
            <Grid container spacing={1}>
              {subsection.checkboxes?.map((checkbox, idx) => (
                <Grid item xs={6} key={`${subTitle}-checkbox-${idx}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      borderRadius: 1,
                      color: 'black',
                      cursor: 'pointer',
                      width: '100%',
                      height: '25px',
                    }}
                  >
                    {/* Checkbox for each normal finding */}
                    <Checkbox
                      checked={peState[title.toLowerCase()]?.[subTitle]?.checkboxes?.[checkbox] || false}
                      onChange={() => handleCheckboxChange(subTitle, checkbox)}
                      sx={{ marginRight: 1 }}
                    />
                    <Typography variant="body2">{checkbox}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Render symptoms (+/-) for findings in the subsection */}
            <Box sx={{ marginTop: 1 }}>
              <Grid container spacing={1}>
                {/* Iterate through symptoms and display positive/negative buttons */}
                {subsection.symptoms?.map((symptom, idx) => (
                  <Grid item xs={6} key={`${subTitle}-symptom-${idx}`}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px',
                        borderRadius: 1,
                        backgroundColor:
                          peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === true
                            ? 'red'
                            : peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === false
                            ? 'green'
                            : '#f0f0f0',
                        color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] != null ? 'white' : 'black',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <Typography sx={{ marginLeft: 2 }}>{symptom}</Typography>
                      <Box>
                        <IconButton
                          onClick={() => handleSymptomClick(subTitle, symptom, true)}
                          sx={{ color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === true ? 'white' : 'inherit' }}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleSymptomClick(subTitle, symptom, false)}
                          sx={{ color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === false ? 'white' : 'inherit' }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};


const NoteWriterPE = ({ editorState, setEditorState, peState, setPEState, bodySystemsPE }) => {
  useEffect(() => {
    const newEditorState = replacePEText(editorState, peState);

    // Avoid setting state if the new editor state is identical to the current one
    if (newEditorState.getCurrentContent() !== editorState.getCurrentContent()) {
      setEditorState(newEditorState);
    }
  }, [peState, setEditorState]);

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={1}>
        {bodySystemsPE.map((system, idx) => (
          <Grid item xs={12} md={6} lg={4} key={idx}>
            <PhysicalExamBodySystemComponent
              title={system.title}
              subsections={system.subsections}
              peState={peState}
              updatePEState={setPEState}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NoteWriterPE;
