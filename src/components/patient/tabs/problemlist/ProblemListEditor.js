// This file represnets the Problem List Editor that is formed as a dropdown from the ProblemList 
import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, InputAdornment, Button } from '@mui/material';

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

// Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Quicker way to quickly generate generic Probelem List Editor inputs
const EditorGridItem = ({ label, typographyCols, textFieldCols, icon, value, onChange }) => {
  return (
    <>
      <Grid item xs={typographyCols}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid item xs={textFieldCols}>
        <TextField
          label={label}
          fullWidth
          value={value}
          onChange={onChange}
          // Make the icon optional
          InputProps={{
            endAdornment: icon && (
              <InputAdornment position="end">
                {icon}
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </>
  );
};

// For Noted, Diagnosed, and Resolved with Date Picker
const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }) => {
  //
  return (
    <>
      <Grid item xs={typographyCols}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid item xs={textFieldCols}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label={label} value={value} onChange={(date) => onChange({ target: { value: date } })} />
        </LocalizationProvider>
      </Grid>
    </>
  );
};

const ProblemListEditor = ({ data, index, expandedRows, onDelete, onOpenModal }) => {
  /**
   * ProblemListEditor component for editing problem details.
   *
   * @param {Object} props - The component props.
   * @param {Object} props.data - The data for the problem being edited.
   * @param {number} props.index - The index of the problem in the list.
   * @param {function} props.expandedRows - Function to handle row expansion.
   * @param {function} props.onDelete - Function to handle deleting the problem.
   * @param {function} props.onOpenModal - Function to open the modal for searching diagnosis.
   * @returns {JSX.Element} The ProblemListEditor component.
   */

  // Since there is an accept button, we need to use a tempstate that we can modify and then accept or cancel
  const [tempData, setTempData] = useState({ ...data });


  const handleEditorTempChange = (key, value) => {
    setTempData({
      ...tempData,
      [key]: value,
    });
  };

  const handleEditorAccept = () => {
    Object.keys(tempData).forEach((key) => {
      data[key] = tempData[key];
    });
    expandedRows(index);
  };

  const handleEditorCancel = () => {
    setTempData({ ...data });
    expandedRows(index);
  };

  useEffect(() => {
    setTempData({ ...data });
  }, [data]);


  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={2}>
        <Typography>Problem</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextField
          label='Problem'
          fullWidth
          value={tempData.diagnosis}
          onChange={(e) => handleEditorTempChange('diagnosis', e.target.value)}
          InputProps={{
            endAdornment: (
              // Want deferred funciton call
              <IconButton onClick={() => onOpenModal(index)}>
                <SearchIcon />
              </IconButton>
            )
          }}
        />
      </Grid>

      <EditorGridItem
        label="Display"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.display}
        onChange={(e) => handleEditorTempChange('display', e.target.value)}
      />
      <Grid item xs={2}>
        <Button
          variant={tempData.isChronicCondition ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isChronicCondition', !tempData.isChronicCondition)}
        >
          Chronic Condition
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant={tempData.isShareWithPatient ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isShareWithPatient', !tempData.isShareWithPatient)}
        >
          Share with Patient
        </Button>
      </Grid>
      <Grid item style={{ width: '100%' }}/>

      <Grid item xs={2}>
        <Typography>Priority</Typography>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <TextField
            select
            label="Priority"
            value={tempData.priority}
            onChange={(e) => handleEditorTempChange('priority', e.target.value)}
          >
            <MenuItem value=''>N/A</MenuItem>
            <MenuItem value='Low'>Low</MenuItem>
            <MenuItem value='Medium'>Medium</MenuItem>
            <MenuItem value='High'>High</MenuItem>
          </TextField>
        </FormControl>
      </Grid>

      <EditorGridItem
        label="Class"
        typographyCols={2}
        textFieldCols={4}
        value={tempData.class}
        onChange={(e) => handleEditorTempChange('class', e.target.value)}
      />
      <EditorDateGridItem
        label="Noted"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.notedDate}
        onChange={(e) => handleEditorTempChange('notedDate', e.target.value)}
      />
      <EditorDateGridItem
        label="Diagnosed"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.resolvedDate}
        onChange={(e) => handleEditorTempChange('diagnosedDate', e.target.value)}
      />
      <EditorDateGridItem
        label="Resolved"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.resolvedDate}
        onChange={(e) => handleEditorTempChange('resolvedDate', e.target.value)}
      />
      <Grid item xs={2}>
        <Button variant="contained" color='error' onClick={() => onDelete(index)}>Delete</Button>
      </Grid>
      <Grid item xs={2}>
        <Button variant="outlined">Add to History</Button>
      </Grid>
      <Grid item xs={4}/>
      <Grid item xs={2}>
        <Button variant="outlined" color="success" onClick={handleEditorAccept}><CheckIcon />Accept</Button>
      </Grid>
      <Grid item xs={2}>
        <Button variant="outlined" color="error" onClick={handleEditorCancel}><CloseIcon />Cancel</Button>
      </Grid>

    </Grid>
  );
};

export default ProblemListEditor;
