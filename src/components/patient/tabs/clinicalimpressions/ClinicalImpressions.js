import React, { useState } from 'react';
import { Box, Button, Icon, TextField, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';

const ClinicalImpressions = () => {
  const [impression, setImpression] = useState('');
  const [patientMRN] = usePatientMRN();
  const [enc] = useEncounterID(); // Get the encounter ID
  const patientData = TEST_PATIENT_INFO({ patientMRN });
  const encounter = patientData.encounters?.find(x => x.id === enc); // Find the current encounter

  // If encounter exists, initialize clinical impressions
  const initialClinicalImpressions = encounter?.clinicalImpressions || [];
  const [clinicalImpressions, setClinicalImpressions] = useState(initialClinicalImpressions);

  const handleAddClick = () => {
    if (impression.trim()) {
      // Update the encounter's clinical impressions
      const updatedImpressions = [...clinicalImpressions, impression];
      setClinicalImpressions(updatedImpressions); // Update local state
      encounter.clinicalImpressions = updatedImpressions; // Update the encounter directly
      setImpression(''); // Clear the input after adding
    }
  };

  const moveUp = (index) => {
    if (index > 0) {
      const updatedImpressions = [...clinicalImpressions];
      [updatedImpressions[index - 1], updatedImpressions[index]] = [updatedImpressions[index], updatedImpressions[index - 1]];
      setClinicalImpressions(updatedImpressions);
      encounter.clinicalImpressions = updatedImpressions; // Update the encounter directly
    }
  };

  const moveDown = (index) => {
    if (index < clinicalImpressions.length - 1) {
      const updatedImpressions = [...clinicalImpressions];
      [updatedImpressions[index], updatedImpressions[index + 1]] = [updatedImpressions[index + 1], updatedImpressions[index]];
      setClinicalImpressions(updatedImpressions);
      encounter.clinicalImpressions = updatedImpressions; // Update the encounter directly
    }
  };

  const handleDelete = (index) => {
    const updatedImpressions = clinicalImpressions.filter((_, i) => i !== index);
    setClinicalImpressions(updatedImpressions);
    encounter.clinicalImpressions = updatedImpressions; // Update the encounter directly
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.inputContainer}>
        <TextField
          variant="outlined"
          placeholder="Add a new impression"
          value={impression}
          onChange={(e) => setImpression(e.target.value)}
          sx={styles.textField}
        />
        <Button 
          variant="outlined" 
          onClick={handleAddClick}
          sx={styles.button}
        >
          <Icon color="success">add_task</Icon>Add
        </Button>
      </Box>
      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Clinical Impressions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clinicalImpressions.map((imp, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={styles.rowContainer}>
                    <Box sx={styles.arrowContainer}>
                      <Button onClick={() => moveUp(index)} disabled={index === 0} sx={styles.arrowButton}>
                        <ArrowUpwardIcon />
                      </Button>
                      <Button onClick={() => moveDown(index)} disabled={index === clinicalImpressions.length - 1} sx={styles.arrowButton}>
                        <ArrowDownwardIcon />
                      </Button>
                    </Box>
                    <ListItem>
                      <ListItemText primary={`${index + 1}. ${imp}`} />
                    </ListItem>
                    <Button onClick={() => handleDelete(index)} sx={styles.deleteButton}>
                      <CloseIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Styles section
const styles = {
  container: {
    padding: 2,
    textAlign: 'left',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 2,
  },
  textField: {
    width: '300px', // Fixed width
    marginRight: 0,
    borderRadius: 0,
    height: '56px',
  },
  button: {
    borderRadius: 0,
    height: '56px', // Same height as text field
  },
  tableContainer: {
    marginTop: 2,
  },
  rowContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column', // Stack arrows vertically
    alignItems: 'center', // Center align arrows
    marginRight: 1, // Space between arrows and text
  },
  arrowButton: {
    minWidth: '30px', // Set a minimum width for the buttons
    padding: '0', // Remove padding for closer alignment
    background: 'none', // Remove background
    border: 'none', // Remove border
  },
  deleteButton: {
    marginLeft: 'auto', // Push the delete button to the far right
    minWidth: '30px', // Set a minimum width for the button
    padding: '0', // Remove padding for closer alignment
    background: 'none', // Remove background
    border: 'none', // Remove border
  },
};

export default ClinicalImpressions;
