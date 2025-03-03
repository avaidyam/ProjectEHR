import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';

function AllergyTabContent() {
  const [patientMRN] = usePatientMRN();
  const [enc] = useEncounterID();

  const { encounters } = TEST_PATIENT_INFO({ patientMRN });
  const allergies = encounters?.find(x => x.id === enc)?.allergies || [];

  return (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {allergies.length > 0 ? (
            allergies.map((allergy) => (
              <TableRow key={allergy.id}>
                <TableCell>{allergy.allergen}</TableCell>
                <TableCell>{allergy.type}</TableCell>
                <TableCell>{allergy.reaction}</TableCell>
                <TableCell>{allergy.severity}</TableCell>
                <TableCell>{allergy.recorded}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" style={{ fontStyle: 'italic', color: '#666' }}>
                  No allergies on file
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AllergyTabContent;
