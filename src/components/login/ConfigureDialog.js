// This module represents the login configure modal popup that allows the admin to select the viewable pts and encounter values

import React, { useState } from 'react';
import { Modal, Box, Typography, MenuItem, Select, Button } from '@mui/material';

const ConfigureDialog = ({ open, onClose, onSubmit, patients, encountersPerPatient }) => {
  const [selectedEncounters, setSelectedEncounters] = useState({});

  // Handle selecting an encounter for a patient
  const handleSelectEncounter = (patient, encounter) => {
    setSelectedEncounters((prev) => ({
      ...prev,
      [patient]: encounter === 'None' ? null : encounter, // Set to null if "None" is chosen
    }));
  };

  const renderTree = () => {
    return patients.map((patient, pIndex) => (
      <Box key={`pt${pIndex}`} sx={{ marginBottom: 2 }}>
        <Typography variant="h6">{patient}</Typography>
        <Select
          value={selectedEncounters[patient] !== undefined ? selectedEncounters[patient] : 'None'}
          onChange={(e) => handleSelectEncounter(patient, e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="None">None</MenuItem>
          {Array.from({ length: encountersPerPatient }, (_, eIndex) => (
            <MenuItem key={eIndex} value={eIndex}>
              Encounter {eIndex + 1}
            </MenuItem>
          ))}
        </Select>
      </Box>
    ));
  };

  const handleSubmit = () => {
    const finalizedEncounters = { ...selectedEncounters };
    patients.forEach((patient) => {
      if (!(patient in finalizedEncounters)) {
        finalizedEncounters[patient] = null; // Default to null if not selected
      }
    });

    console.log('Finalized Encounters:', finalizedEncounters);
    onSubmit(finalizedEncounters); 
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Configure Patients and Encounters
        </Typography>
        <Box>{renderTree()}</Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfigureDialog;
