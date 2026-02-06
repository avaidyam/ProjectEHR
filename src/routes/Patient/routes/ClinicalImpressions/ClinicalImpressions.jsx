import React, { useState } from 'react';
import { Box, Button, Icon, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ListItem, ListItemText } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import { DiagnosisPicker } from '../ProblemList/components/DiagnosisPicker.jsx';

const ClinicalImpressions = () => {

  const { useEncounter } = usePatient()
  const [encounter, setEncounter] = useEncounter()()

  // If encounter exists, initialize clinical impressions
  const initialClinicalImpressions = encounter?.clinicalImpressions || [];
  const [clinicalImpressions, setClinicalImpressions] = useState(initialClinicalImpressions);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateClinicalImpressions = (updated) => {
    setClinicalImpressions(updated);
    setEncounter({ ...encounter, clinicalImpressions: updated });
  };

  // Modal handlers
  const handleOpenModal = (term = "") => {
    setSearchTerm(term);
    setIsModalOpen(true);
  };

  const handleSelect = (selection) => {
    setIsModalOpen(false);
    if (!selection) return;

    // Convert selection to array if it's a single object
    const selectedItems = Array.isArray(selection) ? selection : [selection];

    if (selectedItems.length === 0) return;

    const newImpressions = selectedItems.map(item => ({
      name: item.name,
      code: item.conceptId,
      id: item.conceptId
    }));

    // Check for duplicates before adding? Or just allow dupes?
    // Let's filter out dupes based on duplicate ID/code invocation if we want, 
    // but the initial logic allowed unchecked appending. Let's stick to appending.

    const updated = [...clinicalImpressions, ...newImpressions];
    updateClinicalImpressions(updated);
  };

  const handleDelete = (index) => {
    const updated = clinicalImpressions.filter((_, i) => i !== index);
    updateClinicalImpressions(updated);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...clinicalImpressions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updateClinicalImpressions(updated);
  };

  const moveDown = (index) => {
    if (index === clinicalImpressions.length - 1) return;
    const updated = [...clinicalImpressions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updateClinicalImpressions(updated);
  };

  return (
    <Box sx={{ padding: 2, textAlign: 'left' }}>
      {/* Inline Add Box + Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>

        <TextField
          variant="outlined"
          placeholder="Add a new impression"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOpenModal(searchTerm);
            }
          }}
          sx={{ width: '300px', marginRight: 0, borderRadius: 0, height: '56px' }}
        />
        <Button
          variant="outlined"
          onClick={() => handleOpenModal(searchTerm)}
          sx={{ borderRadius: 0, height: '56px' }}
        >
          <Icon color="success">add_task</Icon> Add
        </Button>
      </Box>

      {/* Clinical Impressions Table */}
      <TableContainer component={Paper}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginRight: 1 }}>
                      <Button onClick={() => moveUp(index)} disabled={index === 0}>
                        <Icon>arrow_upward</Icon>
                      </Button>
                      <Button onClick={() => moveDown(index)} disabled={index === clinicalImpressions.length - 1}>
                        <Icon>arrow_downward</Icon>
                      </Button>
                    </Box>
                    <ListItem sx={{ padding: 0 }}>
                      <ListItemText primary={`${index + 1}. ${imp.name ?? ''}`} />
                    </ListItem>
                    <Button onClick={() => handleDelete(index)}>
                      <Icon>close</Icon>
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      <DiagnosisPicker
        open={isModalOpen}
        searchTerm={searchTerm}
        onSelect={handleSelect}
      />
    </Box>
  );
};

export default ClinicalImpressions;
