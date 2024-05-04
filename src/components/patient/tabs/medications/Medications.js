import { Checkbox, Table, TableHead, TableRow, TableCell, Icon, Box, TextField, Button} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import React from 'react';

const mockMedicationData = () => ({
  currentMedications: [
    {
      id: '1',
      name: 'clopidogrel',
      brandName: 'PLAVIX',
      dosage: '75 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '2',
      name: 'aspirin',
      brandName: 'ASPIRIN',
      dosage: '81 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '3',
      name: 'atorvastatin',
      brandName: 'LIPITOR',
      dosage: '80 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '4',
      name: 'carvedilol',
      brandName: 'COREG',
      dosage: '3.125 mg',
      frequency: 'twice a day',
      startDate: '',
      endDate: '',
    },
    {
      id: '5',
      name: 'lisinopril',
      brandName: 'QBRELIS',
      dosage: '10 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '6',
      name: 'eplerenone',
      brandName: 'INSPRA',
      dosage: '25 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
  ]
});

export default function Medications() {
  const {currentMedications} = mockMedicationData();

  return(
    <Box>
      <div>
        <div style={{ display: "flex" }}>
          <TextField
            label="New Medication"
            variant="outlined"
          />
          <Button variant="outlined">
            <Icon color="success">add_task</Icon>Add
          </Button>
          <div style={{ marginLeft: "auto" }}>
            <Button variant="outlined">
              Check Interactions
            </Button>
            <Button variant="outlined">
              Informants
            </Button>
            <Button variant="outlined">
              Find Medications Needing Review
            </Button>
            <Button variant="outlined">
              Mark all Unselected Today 
            </Button>
            <Button variant="outlined">
              Mark all Unselected Yesterday 
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          <div style={{ flex: '1', transition: 'max-width 0.5s', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell>Medication</TableCell>
                    <TableCell />
                    <TableCell>Last Dose</TableCell>
                    <TableCell>Taking?</TableCell>
                    <TableCell />
                </TableRow>
              </TableHead>
              <tbody>
                {currentMedications.map(({ id, name, brandName, dosage, frequency }) => (
                  <TableRow key={id}>
                    <TableCell>{name} ({brandName}) {dosage} {frequency}</TableCell>
                    <TableCell>
                      <Button variant="outlined">
                        Today
                      </Button>
                      <Button variant="outlined">
                        Yesterday
                      </Button>
                      <Button variant="outlined">
                        Past Week
                      </Button>
                      <Button variant="outlined">
                        Past Month
                      </Button>
                      <Button variant="outlined">
                        {'>'} Month
                      </Button>
                      <Button variant="outlined">
                        Unknown
                      </Button>
                    </TableCell>
                    <TableCell>
                      <TextField
                        disabled="true"
                        color="error"
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Button><ClearIcon /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </Box>
  );
}