import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { ContentState, EditorState } from 'draft-js';
import React, { useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const NotesTabContent = () => {
  const [submitOption, setAge] = useState('');

  const [patientMRN, setPatientMRN] = usePatientMRN();

  const [editorState, setEditorState] = useState(
    (() => {
      const plainText = patientMRN || '';
      const content = ContentState.createFromText(plainText);

      return EditorState.createWithContent(content);
    })()
  );

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <form>
      <Editor
        //wrapperClassName="wrapper"
        //editorClassName="editor"
        //toolbarClassName="toolbar"
        onEditorStateChange={setEditorState}
        editorState={editorState}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <Button
            variant="contained"
            sx={{ height: '100%' }}
            onClick={() => setPatientMRN(editorState.getCurrentContent().getPlainText('\u0001'))}
          >
            Submit
          </Button>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <Select id="selectSubmit" value={submitOption} onChange={handleChange} displayEmpty>
            <MenuItem value={0}>Pend on Accept</MenuItem>
            <MenuItem value={1}>Sign on Accept</MenuItem>
            <MenuItem value="">Sign when Signing Visit</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </form>
  );
};



const NotesTabContent2 = ({ children, ...other }) => {
  const { currentMedications, patientAllergies, medicalHistory } = getPatientPreChartingData();

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          History 2
        </Typography>
        <div style={{ display: 'flex', flexDirection: "column" }} className="sub-content-container">
          {medicalHistory.map(({ id, name, date }) => (
            <li key={id}>
              {name} / {date}
            </li>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Allergies
        </Typography>
        <div className="sub-content-container">NKDA</div>
      </div>
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <Typography variant="h6" color="inherit" component="div">
          Medications
        </Typography>
        <div style={{ display: 'flex', flexDirection: "column" }} className="sub-content-container">
          {currentMedications.map(({ id, name, dosage, frequency }) => (
            <li key={id}>
              {name} - {dosage} / {frequency}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesTabContent;
