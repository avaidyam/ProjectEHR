import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, InputAdornment, Button, IconButton, Icon, MenuItem, FormControl } from '@mui/material';
import { DatePicker } from 'components/ui/Core';

// Quicker way to quickly generate generic Probelem List Editor inputs
const EditorGridItem = ({ label, typographyCols, textFieldCols, icon, value, onChange }: { label: any; typographyCols: any; textFieldCols: any; icon?: any; value: any; onChange: any }) => {
  return (
    <>
      <Grid size={typographyCols}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid size={textFieldCols}>
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
const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }: { label: any; typographyCols: any; textFieldCols: any; value: any; onChange: any }) => {
  //
  return (
    <>
      <Grid size={typographyCols}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid size={textFieldCols}>
        <DatePicker label={label} value={value} onChange={(date) => onChange({ target: { value: date } })} />
      </Grid>
    </>
  );
};

const ProblemListEditor = ({ data, index, expandedRows, onDelete, onOpenModal }: { data: any; index: number; expandedRows: any; onDelete: any; onOpenModal: any }) => {
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


  const handleEditorTempChange = (key: string, value: any) => {
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
      <Grid size={2}>
        <Typography>Problem</Typography>
      </Grid>
      <Grid size={10}>
        <TextField
          label='Problem'
          fullWidth
          value={tempData.diagnosis}
          onChange={(e) => handleEditorTempChange('diagnosis', e.target.value)}
          InputProps={{
            endAdornment: (
              // Want deferred funciton call
              (<IconButton onClick={() => onOpenModal(index)}>
                <Icon>search</Icon>
              </IconButton>)
            )
          }}
        />
      </Grid>
      <EditorGridItem
        label="Display"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.display}
        onChange={(e: any) => handleEditorTempChange('display', e.target.value)}
      />
      <Grid size={2}>
        <Button
          variant={tempData.isChronicCondition ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isChronicCondition', !tempData.isChronicCondition)}
        >
          Chronic Condition
        </Button>
      </Grid>
      <Grid size={2}>
        <Button
          variant={tempData.isShareWithPatient ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isShareWithPatient', !tempData.isShareWithPatient)}
        >
          Share with Patient
        </Button>
      </Grid>
      <Grid style={{ width: '100%' }} />
      <Grid size={2}>
        <Typography>Priority</Typography>
      </Grid>
      <Grid size={4}>
        <FormControl fullWidth>
          <TextField
            select
            label="Priority"
            value={tempData.priority}
            onChange={(e: any) => handleEditorTempChange('priority', e.target.value)}
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
        onChange={(e: any) => handleEditorTempChange('class', e.target.value)}
      />
      <EditorDateGridItem
        label="Noted"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.notedDate}
        onChange={(e: any) => handleEditorTempChange('notedDate', e.target.value)}
      />
      <EditorDateGridItem
        label="Diagnosed"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.resolvedDate}
        onChange={(e: any) => handleEditorTempChange('diagnosedDate', e.target.value)}
      />
      <EditorDateGridItem
        label="Resolved"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.resolvedDate}
        onChange={(e: any) => handleEditorTempChange('resolvedDate', e.target.value)}
      />
      <Grid size={2}>
        <Button variant="contained" color='error' onClick={() => onDelete(index)}>Delete</Button>
      </Grid>
      <Grid size={2}>
        <Button variant="outlined">Add to History</Button>
      </Grid>
      <Grid size={4} />
      <Grid size={2}>
        <Button variant="outlined" color="success" onClick={handleEditorAccept}><Icon>check</Icon>Accept</Button>
      </Grid>
      <Grid size={2}>
        <Button variant="outlined" color="error" onClick={handleEditorCancel}><Icon>close</Icon>Cancel</Button>
      </Grid>
    </Grid>
  );
};

export default ProblemListEditor;
