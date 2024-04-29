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
    { label: 'Label 1', subheader: 'Subheader 1', number: 10 },
    { label: 'Label 2', subheader: 'Subheader 2', number: 20 },
    { label: 'Label 3', subheader: 'Subheader 3', number: 30 },
    { label: 'Label 4', subheader: 'Subheader 4', number: 40 },
  ];

  return (
    <div style={{ float: 'right'}}> {/* Style for positioning */}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align="left">
                <h3>Header</h3>
                <h4>Subheader</h4>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div>
                  Label
                  <div style={{ fontSize: '12px' }}>Subheader</div>
                </div>
              </TableCell>
              <TableCell align="right">Ranges</TableCell>
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