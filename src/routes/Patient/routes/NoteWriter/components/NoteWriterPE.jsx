// NoteWriterPE.js
import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, IconButton, Checkbox, Icon } from '@mui/material';
import CustomNoteModal from './CustomNoteModal.jsx';

const PhysicalExamBodySystemComponent = ({ title, subsections = [], peState, updatePEState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomNote, setCurrentCustomNote] = useState('');

  const handleCustomNote = () => {
    const existingNote = peState[title.toLowerCase()]?.custom || '';
    setCurrentCustomNote(existingNote);
    setIsModalOpen(true);
  };

  const handleSaveCustomNote = (newCustomNote) => {
    updatePEState({
      ...peState,
      [title.toLowerCase()]: {
        ...peState[title.toLowerCase()],
        custom: newCustomNote,
      },
    });
    setIsModalOpen(false);
  };

  const handleCheckboxChange = (subsectionTitle, checkbox) => {
    const currentCheckboxState = peState[title.toLowerCase()]?.[subsectionTitle]?.checkboxes?.[checkbox] || false;

    updatePEState({
      ...peState,
      [title.toLowerCase()]: {
        ...peState[title.toLowerCase()],
        [subsectionTitle]: {
          ...peState[title.toLowerCase()]?.[subsectionTitle],
          checkboxes: {
            ...peState[title.toLowerCase()]?.[subsectionTitle]?.checkboxes,
            [checkbox]: !currentCheckboxState,
          },
        },
      },
    });
  };

  const handleSymptomClick = (subTitle, symptomName, newState) => {
    updatePEState({
      ...peState,
      [title.toLowerCase()]: {
        ...peState[title.toLowerCase()],
        [subTitle]: {
          ...peState[title.toLowerCase()]?.[subTitle],
          symptoms: {
            ...peState[title.toLowerCase()]?.[subTitle]?.symptoms,
            [symptomName]: newState === peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptomName] ? null : newState,
          },
        },
      },
    });
  };

  return (
    <Box sx={{ border: '1px solid #ddd', padding: 1, marginBottom: 1, width: '100%' }}>
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
        <Grid item>
          <IconButton onClick={handleCustomNote}>
            <Icon sx={{ color: peState[title.toLowerCase()]?.custom ? '#2e8fff' : 'inherit' }}>description</Icon>
          </IconButton>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ marginLeft: 1 }}>{title}</Typography>
        </Grid>
      </Grid>

      {subsections.map((subsection, idx) => {
        const subTitle = subsection.subsectionTitle ? subsection.subsectionTitle.toLowerCase() : ``;

        return (
          <Box key={subTitle} sx={{ marginTop: 1, border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
            {subsection.subsectionTitle && (
              <Typography variant="subtitle1" sx={{ marginBottom: 0.5 }}>
                {subsection.subsectionTitle}
              </Typography>
            )}

            <Grid container spacing={1}>
              {subsection.checkboxes?.map((checkbox, idx) => (
                <Grid item xs={6} key={`${subTitle}-checkbox-${idx}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: 1, color: 'black', cursor: 'pointer', width: '100%', height: '25px' }}>
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

            <Box sx={{ marginTop: 1 }}>
              <Grid container spacing={1}>
                {subsection.symptoms?.map((symptom, idx) => (
                  <Grid item xs={6} key={`${subTitle}-symptom-${idx}`}>
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '4px', borderRadius: 1,
                        backgroundColor: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === true ? 'red' : peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === false ? 'green' : '#f0f0f0',
                        color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] != null ? 'white' : 'black',
                        cursor: 'pointer', width: '100%',
                      }}
                    >
                      <Typography sx={{ marginLeft: 2 }}>{symptom}</Typography>
                      <Box>
                        <IconButton
                          onClick={() => handleSymptomClick(subTitle, symptom, true)}
                          sx={{ color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === true ? 'white' : 'inherit' }}
                        >
                          <Icon>add</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() => handleSymptomClick(subTitle, symptom, false)}
                          sx={{ color: peState[title.toLowerCase()]?.[subTitle]?.symptoms?.[symptom] === false ? 'white' : 'inherit' }}
                        >
                          <Icon>remove</Icon>
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

      <CustomNoteModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomNote}
        title={`Enter a custom note for ${title}`}
        defaultValue={currentCustomNote}
      />
    </Box>
  );
};


const NoteWriterPE = ({ editorState, setEditorState, peState, setPEState, bodySystemsPE }) => {
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
