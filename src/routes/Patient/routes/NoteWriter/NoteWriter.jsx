import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';

import NoteWriterHPI from './components/NoteWriterHPI.js';
import NoteWriterROS from './components/NoteWriterROS.js';
import NoteWriterPE from './components/NoteWriterPE.js';

const tabLabels = [
  "HPI",
  "ROS",
  "Physical Exam"
];

export const Notewriter = ({ editorState, setEditorState, 
                            rosState, setRosState, 
                            peState, setPEState,
                            bodySystems, bodySystemsPE}) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0); // Zero is Index of the first tab (HPI)
  const [selectedTabLabel, setSelectedTabLabel] = useState('HPI');

  const handleTabChange = (newTab, idx) => {
    setSelectedTabLabel(newTab);
    setSelectedTabIndex(idx);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {tabLabels.map((label, idx) => (
          <Chip
            key={idx}
            label={label}
            onClick={() => handleTabChange(label, idx)}
            variant={selectedTabIndex === idx ? "filled" : "outlined"}
            color={selectedTabIndex === idx ? "primary" : "default"}
            style={{ margin: 5 }}
          />
        ))}
      </Box>
      {selectedTabLabel === 'HPI' && (
        <NoteWriterHPI editorState={editorState} setEditorState={setEditorState} />
      )}
      {selectedTabLabel === 'ROS' && (
        <NoteWriterROS 
          editorState={editorState} setEditorState={setEditorState}
          rosState={rosState} setRosState={setRosState} bodySystems={bodySystems} />
      )}
      {selectedTabLabel === 'Physical Exam' && (
        <NoteWriterPE 
          editorState={editorState} setEditorState={setEditorState}
          peState={peState} setPEState={setPEState} bodySystemsPE={bodySystemsPE}/>
      )}
    </div>
  );
};
export default Notewriter;
