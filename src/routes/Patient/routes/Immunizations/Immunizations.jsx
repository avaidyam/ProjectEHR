import React, { useState } from 'react';
import { Icon, Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Paper, IconButton, Collapse, Box, Typography } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

function ImmunizationsTabContent() {
  const { useChart, useEncounter } = usePatient()
  const [immunizations, setImmunizations] = useEncounter().immunizations()

  // Group immunizations by vaccine type
  const grouped = immunizations.reduce((acc, record) => {
    const key = record.vaccine;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {});

  // Set up toggle state for each group (arrow on left)
  const initialState = Object.keys(grouped).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});
  const [openGroups, setOpenGroups] = useState(initialState);

  const toggleGroup = (vaccine) => {
    setOpenGroups(prev => ({ ...prev, [vaccine]: !prev[vaccine] }));
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="immunizations table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '5%' }} />
            <TableCell>
              <Typography  variant="h5" style={{ fontWeight: 'bold' }}>Immunization Family</Typography>
            </TableCell>
            <TableCell>
              <Typography  variant="h5" style={{ fontWeight: 'bold' }}>Admin Dates</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(grouped).map(([vaccine, records]) => {
            // Create a comma-separated string of administration dates for the top row
            const adminDates = records.map(r => r.received).join(', ');
            return (
              <React.Fragment key={vaccine}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => toggleGroup(vaccine)}>
                      {openGroups[vaccine] ? <Icon>keyboard_arrow_up</Icon> : <Icon>keyboard_arrow_down</Icon>}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">{vaccine}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">{adminDates}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} style={{ padding: 0 }}>
                    <Collapse in={openGroups[vaccine]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Provider</TableCell>
                              <TableCell>Recorded</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {records.map((record, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{record.received}</TableCell>
                                <TableCell>{record.vaccine}</TableCell>
                                <TableCell>{record.recorder}</TableCell>
                                <TableCell>{record.recorded}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
          {immunizations.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body2" style={{ fontStyle: 'italic', color: '#666' }}>
                  No immunizations on file
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ImmunizationsTabContent;
