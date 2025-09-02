import React, { useState, useEffect } from 'react';
import { Box, Button, Icon, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, ListItem, ListItemText } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

// SNOMED fetch helper
async function getSnomed(term) {
  try {
    const fetchSnomedData = `https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN/descriptions?&limit=50&term=${encodeURIComponent(term)}&conceptActive=true&lang=english&skipTo=0&returnLimit=100`;
    const response = await fetch(fetchSnomedData);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return (data.items || []).map(item => ({ id: item.conceptId, name: item.term }));
  } catch (error) {
    console.error('Error fetching SNOMED data:', error);
    return [];
  }
}
const ClinicalImpressions = () => {

  const { useChart, useEncounter } = usePatient()
  const [encounter, setEncounter] = useEncounter()()

  // If encounter exists, initialize clinical impressions
  const initialClinicalImpressions = encounter?.clinicalImpressions || [];
  const [clinicalImpressions, setClinicalImpressions] = useState(initialClinicalImpressions);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedImpression, setSelectedImpression] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (searchTerm.trim()) {
        const results = await getSnomed(searchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    fetchDiagnoses();
  }, [searchTerm]);
  
  const updateClinicalImpressions = (updated) => {
    setClinicalImpressions(updated);
    setEncounter({ ...encounter, clinicalImpressions: updated });
  };

  // Modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImpression(null);
    setSearchTerm('');
  };

  const handleAccept = () => {
    if (selectedImpression) {
      const updated = [...clinicalImpressions, selectedImpression];
      updateClinicalImpressions(updated);
      handleCloseModal();
    }
  };

  const handleAddClick = () => {
    if (searchTerm.trim()) {
      const updated = [...clinicalImpressions, searchTerm.trim()];
      updateClinicalImpressions(updated);
      setSearchTerm('');
    }
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
          onClick={handleOpenModal} // open SNOMED modal if desired
          sx={{ width: '300px', marginRight: 0, borderRadius: 0,height: '56px' }}
        />
        <Button variant="outlined" onClick={handleAddClick} sx={{ borderRadius: 0,height: '56px'}}>
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

      {/* SNOMED Search Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            label="Search SNOMED for Clinical Impression"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table>
              <TableBody>
                {searchResults.map((res, index) => (
                  <TableRow
                    key={index}
                    onClick={() => setSelectedImpression(res)}
                    sx={{ cursor: 'pointer', backgroundColor: selectedImpression?.name === res.name ? '#e0f7fa' : 'inherit' }}
                  >
                    <TableCell>{res.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAccept} sx={{ marginRight: 1 }}>
              Accept
            </Button>
            <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ClinicalImpressions;
