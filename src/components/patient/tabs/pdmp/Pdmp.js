import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Collapse, Box, Typography
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Sample data in FHIR-compliant structure
const fhirData = [
  {
    resourceType: 'MedicationRequest',
    medicationCodeableConcept: { text: 'Apixaban' }, // Generic Medication Name
    authoredOn: '2024-09-10', // Written Date
    requester: { display: 'Provider A' }, // Provider
    dispenseRequest: [
      {
        resourceType: 'MedicationDispense',
        medication: { text: 'Eliquis 2.5 MG Tablet' }, // Medication & Dosage
        whenHandedOver: '2024-09-15', // Dispensed Date
        quantity: { value: 10, unit: 'tablet' }, // Quantity
        daysSupply: { value: 5 }, // Days Supply
        performer: [{ display: 'Pharmacy A' }], // Pharmacy
        dosageInstruction: [{ doseAndRate: [{ doseQuantity: { value: 2.5, unit: 'MG' } }] }], // Strength
        numberOfRepeatsAllowed: 5, // Refills
      },
      {
        resourceType: 'MedicationDispense',
        medication: { text: 'Eliquis 5 MG Tablet' }, // Medication & Dosage
        whenHandedOver: '2023-08-11', // Dispensed Date
        quantity: { value: 10, unit: 'tablet' }, // Quantity
        daysSupply: { value: 15 }, // Days Supply
        performer: [{ display: 'Pharmacy A' }], // Pharmacy
        dosageInstruction: [{ doseAndRate: [{ doseQuantity: { value: 5, unit: 'MG' } }] }], // Strength
        numberOfRepeatsAllowed: 2, // Refills
      },
    ],
  },
  {
    resourceType: 'MedicationRequest',
    medicationCodeableConcept: { text: 'Benazepril HCI' },
    authoredOn: '2024-09-10',
    requester: { display: 'Provider B' },
    dispenseRequest: [
      {
        resourceType: 'MedicationDispense',
        medication: { text: 'Benazepril HCI 20 MG Tablet' },
        whenHandedOver: '2024-09-12',
        quantity: { value: 5, unit: 'tablet' },
        daysSupply: { value: 5 },
        performer: [{ display: 'Pharmacy B' }],
        dosageInstruction: [{ doseAndRate: [{ doseQuantity: { value: 20, unit: 'MG' } }] }],
        numberOfRepeatsAllowed: 5,
      },
    ],
  },
];

function Pdmp() {
  const [open, setOpen] = useState(() =>
    fhirData.reduce((acc, _, index) => ({ ...acc, [index]: true }), {})
);

  const handleToggle = (index) => {
    setOpen((prevOpen) => ({ ...prevOpen, [index]: !prevOpen[index] }));
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="medication dispense history">
        <TableBody>
          {fhirData.map((medRequest, index) => (
            <React.Fragment key={index}>
              {/* Generic Name Row */}
              <TableRow>
                <TableCell style={{ width: '5%' }}>
                  <IconButton size="small" onClick={() => handleToggle(index)}>
                    {open[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell align="left" colSpan={1}>
                  <Typography variant="h6">{medRequest.medicationCodeableConcept.text}</Typography>
                </TableCell>
              </TableRow>

              {/* Collapse Section with Data and Column Headers */}
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      {/* Table Headers Inside the Collapse */}
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: '9.1%' }} />
                            <TableCell align="left" style={{ display: 'none' }} />
                            <TableCell align="left">Dispensed</TableCell>
                            <TableCell align="left">Written</TableCell>
                            <TableCell align="left">Strength</TableCell>
                            <TableCell align="left">Quantity</TableCell>
                            <TableCell align="left">Refills</TableCell>
                            <TableCell align="left">Days Supply</TableCell>
                            <TableCell align="left">Provider</TableCell>
                            <TableCell align="left">Pharmacy</TableCell>
                          </TableRow>
                        </TableHead>

                        {/* Medication Dispense Rows */}
                        <TableBody>
                          {medRequest.dispenseRequest.map((dispense, idx) => (
                            <TableRow key={idx}>
                              <TableCell align="left">{dispense.medication.text}</TableCell>
                              <TableCell align="left">{dispense.whenHandedOver}</TableCell>
                              <TableCell align="left">{medRequest.authoredOn}</TableCell>
                              <TableCell align="left">
                                {dispense.dosageInstruction[0].doseAndRate[0].doseQuantity.value}{' '}
                                {dispense.dosageInstruction[0].doseAndRate[0].doseQuantity.unit}
                              </TableCell>
                              <TableCell align="left">{dispense.quantity.value} {dispense.quantity.unit}</TableCell>
                              <TableCell align="left">{dispense.numberOfRepeatsAllowed}</TableCell>
                              <TableCell align="left">{dispense.daysSupply.value}</TableCell>
                              <TableCell align="left">{medRequest.requester.display}</TableCell>
                              <TableCell align="left">{dispense.performer[0].display}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Pdmp;
