import React, { useState } from 'react';
import { Box, Button, Icon, TextField, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const ClinicalImpressions = () => {
  const [impression, setImpression] = useState('');
  const { patient: patientMRN, encounter: enc, data: patientData, updateData } = usePatient()
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
    <Box sx={{ padding: 2, textAlign: 'left' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 2,
      }}>
        <TextField
          variant="outlined"
          placeholder="Add a new impression"
          value={impression}
          onChange={(e) => setImpression(e.target.value)}
          sx={{
            width: '300px',
            marginRight: 0,
            borderRadius: 0,
            height: '56px',
          }}
        />
        <Button 
          variant="outlined" 
          onClick={handleAddClick}
          sx={{ borderRadius: 0, height: '56px' }}
        >
          <Icon color="success">add_task</Icon>Add
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
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
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginRight: 1,
                    }}>
                      <Button onClick={() => moveUp(index)} disabled={index === 0} sx={{
                        minWidth: '30px',
                        padding: '0',
                        background: 'none',
                        border: 'none',
                      }}>
                        <Icon>arrow_upward</Icon>
                      </Button>
                      <Button onClick={() => moveDown(index)} disabled={index === clinicalImpressions.length - 1} sx={{
                        minWidth: '30px',
                        padding: '0',
                        background: 'none',
                        border: 'none',
                      }}>
                        <Icon>arrow_downward</Icon>
                      </Button>
                    </Box>
                    <ListItem>
                      <ListItemText primary={`${index + 1}. ${imp}`} />
                    </ListItem>
                    <Button onClick={() => handleDelete(index)} sx={{
                        marginLeft: 'auto',
                        minWidth: '30px',
                        padding: '0',
                        background: 'none',
                        border: 'none'
                    }}>
                      <Icon>close</Icon>
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

export default ClinicalImpressions;