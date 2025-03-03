import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, Button, InputAdornment } from '@mui/material';

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
import dayjs from 'dayjs';

/**
 * A helper component for rendering a labeled text field in a 2-column layout:
 *  - A label in one Grid cell
 *  - A TextField in the adjacent Grid cell
 */
const EditorGridItem = ({ label, typographyCols, textFieldCols, value, onChange, select, menuItems, multiline }) => {
  return (
    <>
      <Grid item xs={typographyCols}>
        <Typography>{label}</Typography>
      </Grid>
      <Grid item xs={textFieldCols}>
        {select ? (
          <FormControl fullWidth>
            <TextField
              select
              label={label}
              value={value}
              onChange={onChange}
            >
              {menuItems?.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        ) : (
          <TextField
            label={label}
            fullWidth
            value={value}
            onChange={onChange}
            multiline={multiline}
            rows={multiline ? 3 : 1}
          />
        )}
      </Grid>
    </>
  );
};

/**
 * A helper component for rendering a labeled date picker in a 2-column layout.
 */

const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }) => {
    return (
      <>
        <Grid item xs={typographyCols}>
          <Typography>{label}</Typography>
        </Grid>
        <Grid item xs={textFieldCols}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              label={label}
              value={value ? dayjs(value) : null}
              onChange={(date) => onChange({ target: { value: date } })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </>
    );
  };
  

/**
 * AllergyEditor component for editing a single allergy record.
 *
 * @param {Object} props
 * @param {Object} props.data - The allergy data to edit.
 * @param {number} props.index - Index of the allergy in the list.
 * @param {function} props.onDelete - Called when user clicks Delete button.
 * @param {function} props.onToggle - Called when user toggles the editor dropdown (or modal).
 */
const AllergyEditor = ({ data, index, onDelete, onToggle }) => {
  // Local state to hold edits before accepting
  const [tempData, setTempData] = useState({ ...data });

  // Sync local state whenever `data` changes
  useEffect(() => {
    setTempData({ ...data });
  }, [data]);

  const handleEditorTempChange = (key, value) => {
    setTempData({
      ...tempData,
      [key]: value,
    });
  };

  // Called when user clicks Accept
  const handleEditorAccept = () => {
    // Commit tempData back to the original object
    // (In real usage, you might call a parent callback to finalize changes in state or on server)
    Object.keys(tempData).forEach((key) => {
      data[key] = tempData[key];
    });
    // Close the editor dropdown or modal
    onToggle(index);
  };

  // Called when user clicks Cancel
  const handleEditorCancel = () => {
    setTempData({ ...data });
    onToggle(index);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Allergen */}
      <EditorGridItem
        label="Allergen"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.allergen}
        onChange={(e) => handleEditorTempChange('allergen', e.target.value)}
      />

      {/* Reaction */}
      <EditorGridItem
        label="Reaction"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.reaction}
        onChange={(e) => handleEditorTempChange('reaction', e.target.value)}
      />

      {/* Type (Dropdown) */}
      <EditorGridItem
        label="Type"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.type}
        onChange={(e) => handleEditorTempChange('type', e.target.value)}
        select
        menuItems={['allergy', 'intolerance', 'side-effect']}
      />

      {/* Severity (Dropdown) */}
      <EditorGridItem
        label="Severity"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.severity}
        onChange={(e) => handleEditorTempChange('severity', e.target.value)}
        select
        menuItems={['low', 'high', 'unknown']}
      />

      {/* Verified (boolean toggle) */}
      <Grid item xs={2}>
        <Button
          variant={tempData.verified ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('verified', !tempData.verified)}
        >
          Verified
        </Button>
      </Grid>

      {/* Resolved (boolean toggle) */}
      <Grid item xs={2}>
        <Button
          variant={tempData.resolved ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('resolved', !tempData.resolved)}
        >
          Resolved
        </Button>
      </Grid>

      <Grid item xs={8} />

      {/* Recorded (Date) */}
      <EditorDateGridItem
        label="Recorded"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.recorded}
        onChange={(e) => handleEditorTempChange('recorded', e.target.value)}
      />

      {/* Recorder (Text) */}
      <EditorGridItem
        label="Recorder"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.recorder}
        onChange={(e) => handleEditorTempChange('recorder', e.target.value)}
      />

      {/* Comment (multiline) */}
      <EditorGridItem
        label="Comment"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.comment || ''}
        onChange={(e) => handleEditorTempChange('comment', e.target.value)}
        multiline
      />

      {/* Action Buttons: Delete, Accept, Cancel */}
      <Grid item xs={2}>
        <Button
          variant="contained"
          color="error"
          onClick={() => onDelete(index)}
        >
          Delete
        </Button>
      </Grid>
      <Grid item xs={6} />
      <Grid item xs={2}>
        <Button
          variant="outlined"
          color="success"
          onClick={handleEditorAccept}
          startIcon={<CheckIcon />}
        >
          Accept
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleEditorCancel}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
};

export default AllergyEditor;
