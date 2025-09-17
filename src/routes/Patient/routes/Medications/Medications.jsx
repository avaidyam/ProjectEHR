import React, { useState } from 'react';
import { Checkbox, Table, TableHead, TableRow, TableCell, Icon, Box, TextField, Button, TableBody, Typography } from '@mui/material';
import MedicationItemEditor from './components/MedicationItemEditor.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';

export default function Medications() {
  const { useChart, useEncounter } = usePatient();
  const [medications, setMedications] = useEncounter().medications();
  const [editingMedication, setEditingMedication] = useState(null);

  const handleEdit = (medication) => {
    setEditingMedication(medication);
  };

  const handleSave = (updatedMedication) => {
    setMedications((prevMedications) =>
      prevMedications?.map((med) => (med.id === updatedMedication.id ? updatedMedication : med))
    );
    setEditingMedication(null);
  };

  const handleCancel = () => {
    setEditingMedication(null);
  };

  return (
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
              <TableBody>
                {(medications ?? []).map((medication) => (
                  <React.Fragment key={medication.id}>
                    <TableRow>
                      <TableCell>
                        <Button onClick={() => handleEdit(medication)} style={{ textAlign: 'left' }}>
                          <Box>
                            <Typography variant="body1" color="primary">
                              {medication.name} ({medication.brandName}) {medication.dose}{medication.unit} {medication.route}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {[
                                medication.frequency && `${medication.frequency}`,
                                medication.startDate && `${medication.startDate}`,
                                medication.endDate && `${medication.endDate}`,
                                medication.activePrnReasons.length > 0 && `PRN: ${medication.activePrnReasons.join(', ')}`
                              ].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        </Button>
                      </TableCell>
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
                          disabled
                          color="error"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Button><Icon>clear</Icon></Button>
                      </TableCell>
                    </TableRow>
                    {editingMedication && editingMedication.id === medication.id && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <MedicationItemEditor
                            medication={editingMedication}
                            onSave={handleSave}
                            onCancel={handleCancel}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Box>
  );
}
