import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button
} from '@mui/material';
import dayjs from 'dayjs';
import AllergyEditor from './AllergyEditor';

function AllergyTabContent({ patientData, setPatientData, encounterId }) {
  // Extract allergies from the patientData for the given encounter
  const initialAllergies =
    patientData.encounters?.find((x) => x.id === encounterId)?.allergies || [];

  // Manage allergy list locally for rendering/editing
  const [allergyList, setAllergyList] = useState(initialAllergies);

  // Track expanded rows (one per allergy, initially all false)
  const [expandedRows, setExpandedRows] = useState(() =>
    allergyList.map(() => false)
  );

  // Helper to update the underlying JSON patientData whenever allergyList changes
  const updateUnderlyingJSON = (newAllergyList) => {
    setPatientData((prevData) => {
      const updatedEncounters = prevData.encounters.map((encounter) =>
        encounter.id === encounterId ? { ...encounter, allergies: newAllergyList } : encounter
      );
      return { ...prevData, encounters: updatedEncounters };
    });
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleDelete = (index) => {
    const updated = allergyList.filter((_, i) => i !== index);
    setAllergyList(updated);
    updateUnderlyingJSON(updated);
    setExpandedRows(updated.map(() => false));
  };

  const handleAddAllergy = () => {
    // Create a new allergy object with default values
    const newAllergy = {
      id: Date.now().toString(),
      allergen: '',
      reaction: '',
      type: 'allergy',       // Allowed values: allergy|intolerance|side-effect
      severity: 'low',       // Allowed values: low|high|unknown
      verified: false,
      resolved: false,
      recorded: dayjs().format('YYYY-MM-DD'),
      recorder: '',
      comment: ''
    };

    const newAllergyList = [...allergyList, newAllergy];
    setAllergyList(newAllergyList);
    updateUnderlyingJSON(newAllergyList);
    setExpandedRows([...expandedRows, true]);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="allergy table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Allergy
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Type
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Reaction
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Severity
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  Recorded
                </Typography>
              </TableCell>
              <TableCell /> {/* For the Edit button */}
            </TableRow>
          </TableHead>
          <TableBody>
            {allergyList.length > 0 ? (
              allergyList.map((allergy, index) => (
                <React.Fragment key={allergy.id}>
                  <TableRow>
                    <TableCell>{allergy.allergen}</TableCell>
                    <TableCell>{allergy.type}</TableCell>
                    <TableCell>{allergy.reaction}</TableCell>
                    <TableCell>{allergy.severity}</TableCell>
                    <TableCell>
                      {allergy.recorded
                        ? dayjs(allergy.recorded).format('YYYY-MM-DD')
                        : ''}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => toggleRow(index)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows[index] && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <AllergyEditor
                          data={allergy}
                          index={index}
                          onDelete={handleDelete}
                          onToggle={toggleRow}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" style={{ fontStyle: 'italic', color: '#666' }}>
                    No allergies on file
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Button variant="contained" onClick={handleAddAllergy}>
          Add Allergy
        </Button>
      </div>
    </>
  );
}

export default AllergyTabContent;
