import React, { useState, useEffect, useContext  } from 'react';
import { Typography, TextField, Button, Icon, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Box } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import ProblemListEditor from './components/ProblemListEditor.jsx';

function formatSnomedData(data) {
  return data.map((item) => ({
    id: item.conceptId || "N/A",
    name: item.term || "Unnamed Concept",
    fields: {
      semanticTag: item.semanticTag || "N/A",
      active: item.active || false,
    },
  }));
}

async function getSnomed(term) {
  /** disabled nonfunctional try-catch to make eslint happy */
  try {
    const fetchSnomedData = `https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN/descriptions?&limit=50&term=${encodeURIComponent(term)}&conceptActive=true&lang=english&skipTo=0&returnLimit=100`;

    const response = await fetch(fetchSnomedData);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return formatSnomedData(data.items || []);
  } catch (error) {
    console.error('Error fetching SNOMED data:', error);
    return [];
  }
  // } catch (error) {
  //   throw error;
  // }
}

const ProblemListTabContent = ({ children, ...other }) => {
  const { patient: patientMRN, encounter: enc, data: { encounters } } = usePatient();

  const [searchTerm, setSearchTerm] = useState('');
  const [diagnosesArray, setDiagnosesArray] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState({}); // Track selected diagnosis
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [problems, setProblems] = useState(encounters?.find(x => x.id === enc)?.problems); // State to hold problems array
  const [expandedRows, setExpandedRows] = useState(Array(problems.length).fill(false));

  const [indexToUpdate, setIndexToUpdate] = useState(null);

  const handleExpandRow = (rowIndex) => {
    const newExpandedRows = expandedRows.map((item, index) =>
        index === rowIndex ? !item : item
    );

    // If it's a newly added row, ensure it's set to true (expanded)
    if (rowIndex >= expandedRows.length) {
        newExpandedRows.push(true); // Expand the new row
    }

    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (searchTerm.trim()) {
        const results = await getSnomed(searchTerm);
        setDiagnosesArray(results);
      } else {
        setDiagnosesArray([]);
      }
    };
    fetchDiagnoses();
  }, [searchTerm]);
  const handleOpenModal = (index) => {
    setIndexToUpdate(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDiagnosis(null); // Clear selected diagnosis on modal close
    setIndexToUpdate(null); // Clear index to update
  };

  const handleDiagnosisClick = (diagnosis) => {
    setSelectedDiagnosis(diagnosis.name === selectedDiagnosis?.name ? null : diagnosis);
  };

  const handleAccept = () => {
    if (selectedDiagnosis?.name) {
        if (indexToUpdate !== null) {
            // UPDATE the existing problem
            const updatedProblems = problems.map((problem, i) =>
                i === indexToUpdate ? { ...problem, diagnosis: selectedDiagnosis.name } : problem
            );
            setProblems(updatedProblems);
        } else {
            // ADD a new problem
            const newProblem = {
                diagnosis: selectedDiagnosis.name,
                // Add other properties as needed for the new problem row
            };
            setProblems([...problems, newProblem]);

            // Ensure the editor is expanded for the newly added row
            setExpandedRows([...expandedRows, true]);  // Automatically expand the new row
        }
        handleCloseModal();
    }
  };

  
  

  const handleDeleteProblem = (index) => {
    const updatedProblems = problems.filter((_, i) => i !== index);
    setProblems(updatedProblems);
    const updatedExpandedRows = expandedRows.filter((_, i) => i !== index);
    setExpandedRows(updatedExpandedRows);
  };

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em', marginTop: '1em', marginRight: '1em', marginLeft: '1em'}}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search for problem"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => handleOpenModal(null)}
              style={{ marginRight: 0 }}
            />
            <Button
              variant="outlined"
              style={{ height: '56px', marginLeft: '-1px' }} // Adjust marginLeft to remove space
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1em' }}>
            <Typography>Show:</Typography>
            <Checkbox name="showPastProblems" />
            <Typography>Past Problems</Typography>
            <Button variant="outlined" style={{ marginLeft: '1em' }}>
              View Drug-Disease Interactions
            </Button>
          </div>
        </div>
        <TableContainer component={Paper} style={{ marginTop: '1em' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '60%' }}>Diagnosis</TableCell>
                <TableCell style={{ width: '13%' }}>Notes</TableCell>
                <TableCell style={{ width: '5%' }}>Hospital</TableCell>
                <TableCell style={{ width: '5%' }}>Principal</TableCell>
                <TableCell style={{ width: '7%' }}>Change Dx</TableCell>
                <TableCell style={{ width: '5%' }}>Resolved</TableCell>
                <TableCell style={{ width: '5%' }}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {problems.map((problem, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>{problem.display ? problem.display : problem.diagnosis}</TableCell>
                    <TableCell>
                      <Button>Create Overview</Button>
                    </TableCell>
                    <TableCell>
                      <Checkbox name="hospitalCheckbox" />
                    </TableCell>
                    <TableCell>
                      <Button><Icon>pentagon</Icon></Button>
                    </TableCell>
                    <TableCell>
                      <Button><Icon>change_history</Icon></Button>
                    </TableCell>
                    <TableCell>
                      <Button><Icon>clear</Icon></Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleExpandRow(index)}><Icon>keyboard_double_arrow_down_outlined</Icon></Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows[index] && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <ProblemListEditor
                          data={problem}
                          index={index}
                          expandedRows={handleExpandRow}
                          onDelete={handleDeleteProblem}
                          onOpenModal={handleOpenModal}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
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
          <div>
            <TextField
              label="Search for problem"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '1em' }}
            />
            <Button
              variant="outlined"
              style={{ height: '56px', marginLeft: '-1px' }} // Adjust marginLeft to remove space
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
            <TableContainer component={Paper} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Diagnosis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diagnosesArray.map((diagnosis, index) => (
                    <TableRow
                      key={index}
                      onClick={() => handleDiagnosisClick(diagnosis)}
                      style={{ cursor: 'pointer', backgroundColor: selectedDiagnosis?.name === diagnosis.name ? '#e0f7fa' : 'inherit' }}
                    >
                      <TableCell>{diagnosis.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              style={{ marginRight: '1em' }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ProblemListTabContent;
