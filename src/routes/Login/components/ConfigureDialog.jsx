// This module represents the login configure modal popup that allows the admin to select the viewable pts and encounter values

import React, { useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import { Box, Label, Button, Window } from 'components/ui/Core.jsx';

const ConfigureDialog = ({ open, onClose, onSubmit, patients, encounterCounts }) => {
  const [selectedEncounters, setSelectedEncounters] = useState({});

  // Handle selecting an encounter for a patient
  const handleSelectEncounter = (patient, encounter) => {
    setSelectedEncounters((prev) => ({
      ...prev,
      [patient]: encounter === 'None' ? null : encounter, // Set to null if "None" is chosen
    }));
  };

  // This function will be the pop up box to select the desired encounters!
  const renderTree = () => {
    return patients.map((patient, pIndex) => {
      const encounterCount = encounterCounts[patient] || 0; // Get the number of encounters for the patient, default to 0
  
      // Ensure the selected value matches available options or defaults to "None"
      const selectedValue =
        selectedEncounters[patient] !== undefined
          ? selectedEncounters[patient]
          : "None";
  
      return (
        <Box key={`pt${pIndex}`} sx={{ marginBottom: 2 }}>
          <Label variant="h6">{patient}</Label>
          <Select
            value={selectedValue}
            onChange={(e) => handleSelectEncounter(patient, e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="None">None</MenuItem>
            {Array.from({ length: encounterCount }, (_, eIndex) => (
              <MenuItem key={eIndex} value={eIndex}>
                Encounter {eIndex + 1}
              </MenuItem>
            ))}
          </Select>
        </Box>
      );
    });
  };
  

  const handleSubmit = () => {
    const finalizedEncounters = { ...selectedEncounters };
    patients.forEach((patient) => {
      if (!(patient in finalizedEncounters)) {
        finalizedEncounters[patient] = null; // Default to null if not selected
      }
    });

    onSubmit(finalizedEncounters); 
  };

  return (
    <Window open={open} onClose={onClose}>
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
        <Label variant="h5" gutterBottom>
          Configure Patients and Encounters
        </Label>
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
    </Window>
  );
};

export default ConfigureDialog;
