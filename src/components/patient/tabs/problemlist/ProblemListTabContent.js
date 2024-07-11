import { Typography, TextField, Button, Icon, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import React from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js'; 

const ProblemListTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const patientData = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em', marginTop: '1em', marginRight: '1em', marginLeft: '1em' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search for problem"
              variant="outlined"
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
                <TableCell style={{ width: '5%' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientData.problems.map((problem, index) => (
                <TableRow key={index}>
                  <TableCell>{problem.diagnosis}</TableCell>
                  <TableCell>
                    <Button>Create Overview</Button>
                  </TableCell>
                  <TableCell>
                    <Checkbox name="hospitalCheckbox" />
                  </TableCell>
                  <TableCell>
                    <Button><PentagonOutlinedIcon /></Button>
                  </TableCell>
                  <TableCell>
                    <Button><ChangeHistoryIcon /></Button>
                  </TableCell>
                  <TableCell>
                    <Button><ClearIcon /></Button>
                  </TableCell>
                  <TableCell>
                    <Button><KeyboardDoubleArrowDownOutlinedIcon /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ProblemListTabContent;
