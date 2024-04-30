import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

const LabReport = () => {
  // Sample data with labels and numbers
  const data = [
    { label: 'Glucose', subheader: '65 - 99 mg/dL', number: '100 HIGH' },
    { label: 'BUN', subheader: '6 - 24 mg/dL', number: '25 HIGH' },
    { label: 'Creatinine', subheader: '0.76 - 1.27 mg/dL', number: '1.35 HIGH' },
    { label: 'eGFR if NonAfricn Am', subheader: '>59 mL/min/1.73', number: '63' },
    { label: 'eGFR if Africn Am', subheader: '>59 mL/min/1.73', number: '73' },
    { label: 'BUN/Creatinine Ratio', subheader: '9 - 20', number: '19' },
    { label: 'Sodium', subheader: '134 - 144 mmol/L', number: '21 CRITICAL' },
    { label: 'Potassium', subheader: '3.5 - 5.2 mmol/L', number: '4.0' },
    { label: 'Chloride', subheader: '96 - 106 mmol/L', number: '110 HIGH' },
    { label: 'Carbon Dioxide, total', subheader: '20 - 29 mmol/L', number: '20' },
    { label: 'Calcium', subheader: '8.7 - 10.2 mg/dL', number: '9.0' },
    { label: 'Protein, Total', subheader: '6.0 - 8.5 g/dL', number: '5.9 LOW' },
    { label: 'Albumin', subheader: '4.0 - 5.0 g/dL', number: '3.9 LOW' },
    { label: 'Globulin, Total', subheader: '1.5-4.5 g/dL', number: '2.0' },
    { label: 'Bilirubin, Total', subheader: '0.0 - 1.2 mg/dL', number: '1.5 HIGH' },
    { label: 'Alkaline Phosphatase', subheader: '39 - 117 IU/L', number: '41' },
    { label: 'AST (SGOT)', subheader: '0 - 40 IU/L', number: '50 HIGH' },
    { label: 'ALT (SGPT)', subheader: '0 - 44 IU/L', number: '51 HIGH' },
  ];

  return (
    <div> {/* Style for positioning */}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align="left">
                <h3>Results</h3>
                <h4>Complete Metabolic Panel</h4>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div>
                  Test
                  <div style={{ fontSize: '12px' }}>Refrence Interval</div>
                </div>
              </TableCell>
              <TableCell align="right">Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  <div>
                    {item.label}
                    <div style={{ fontSize: '12px' }}>{item.subheader}</div>
                  </div>
                </TableCell>
                <TableCell align="right">{item.number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default LabReport;