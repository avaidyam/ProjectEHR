import React, { useState } from 'react';
import { Box, Button, MenuItem, Tab, TabList, TabPanel, TabView } from 'components/ui/Core';
import { FormControl, Select } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import { Editor } from 'components/ui/Editor.jsx';

import NoteWriterHPI from './components/NoteWriterHPI.jsx';
import NoteWriterROS from './components/NoteWriterROS.jsx';
import NoteWriterPE from './components/NoteWriterPE.jsx';
import { useNoteWriterData } from './hooks/useNoteWriterData.js';

export const Notewriter = () => {
  const { useChart, useEncounter } = usePatient()
  const [{ id: patientMRN }] = useChart()()
  const [{ id: enc }] = useEncounter()()

  const [selectedTabLabel, setSelectedTabLabel] = useState('Note');
  const {
    isReady,
    editorState,
    setEditorState,
    peState,
    setPEState,
    rosState,
    setRosState,
    bodySystems,
    physicalExamBodySystems
  } = useNoteWriterData(patientMRN, enc);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TabView value={selectedTabLabel}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(event, newTab) => setSelectedTabLabel(newTab)}>
            {["Note", "HPI", "ROS", "Physical Exam"].map((label) => (
              <Tab key={label} label={label} value={label} disabled={!isReady} />
            ))}
          </TabList>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <TabPanel value="Note" sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isReady && (
              <Editor initialContent={editorState} onSave={setEditorState} onUpdate={setEditorState} />
            )}
          </TabPanel>
          <TabPanel value="HPI" sx={{ p: 0, height: '100%' }}>
            {isReady && (
              <NoteWriterHPI editorState={editorState} setEditorState={setEditorState} />
            )}
          </TabPanel>
          <TabPanel value="ROS" sx={{ p: 0, height: '100%', overflow: 'auto' }}>
            {isReady && (
              <NoteWriterROS
                editorState={editorState} setEditorState={setEditorState}
                rosState={rosState} setRosState={setRosState} bodySystems={bodySystems} />
            )}
          </TabPanel>
          <TabPanel value="Physical Exam" sx={{ p: 0, height: '100%', overflow: 'auto' }}>
            {isReady && (
              <NoteWriterPE
                editorState={editorState} setEditorState={setEditorState}
                peState={peState} setPEState={setPEState} bodySystemsPE={physicalExamBodySystems} />
            )}
          </TabPanel>
        </Box>
      </TabView>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, borderTop: '1px solid #divider' }}>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <Select value={0} onChange={(e) => { }} displayEmpty>
            <MenuItem value={0}>Pend on Accept</MenuItem>
            <MenuItem value={1}>Sign on Accept</MenuItem>
            <MenuItem value="">Sign when Signing Visit</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained">Submit</Button>
      </Box>
    </div>
  );
};
export default Notewriter;
