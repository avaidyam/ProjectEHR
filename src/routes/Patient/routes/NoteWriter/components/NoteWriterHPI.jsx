// NoteWriterHPI.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, FormControl, MenuItem, Select, TextField, List, ListItem, Paper, Icon } from '@mui/material';

// Eventually this will be much more robust, and will have a map to each of the HPI Forms, but for now it's just a simple map
const HPI_FORM_MAP = {
  34: 'Diabetes',
  266: 'Hypertension',
  22: 'CHF',
  150: 'Animal Bite',
  11: 'Asthma'
};

const NoteWriterHPI = ({ editorState, setEditorState }) => {
  const [submitOption, setSubmitOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const textFieldRef = useRef(null);

  useEffect(() => {
    const options = Object.entries(HPI_FORM_MAP)
      .filter(([, name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(([id, name]) => ({ id, name }));

    setFilteredOptions(options);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowOptions(true);
  };

  const handleTextFieldClick = () => {
    if (!searchTerm) setFilteredOptions(Object.entries(HPI_FORM_MAP).map(([id, name]) => ({ id, name })));
    setShowOptions(true);
  };

  const handleBlur = (event) => {
    if (!textFieldRef.current.contains(event.relatedTarget)) setShowOptions(false);
  };

  return (
    <form style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        <Box
          ref={textFieldRef}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, width: '300px' }}
          onBlur={handleBlur}
        >
          <TextField
            fullWidth
            label="Search and add an HPI Form"
            InputProps={{ endAdornment: <Icon>search</Icon> }}
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={handleTextFieldClick}
            size="small" // Makes the TextField smaller in height
          />
          {showOptions && filteredOptions.length > 0 && (
            <Paper sx={{ maxHeight: 200, overflowY: 'auto', position: 'absolute', width: '100%', zIndex: 2 }}>
              <List>
                <ListItem disabled sx={{ fontWeight: 'bold' }}>
                  ID: Diagnosis
                </ListItem>
                {filteredOptions.map((option) => (
                  <ListItem button key={option.id} onClick={() => setSearchTerm(option.name)}>
                    {option.id.toString().padStart(4, ' ')}: {option.name}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>
    </form>
  );
};

export default NoteWriterHPI;
