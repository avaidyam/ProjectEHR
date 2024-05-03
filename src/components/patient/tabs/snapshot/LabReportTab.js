import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

const LabReport = ({ labReport }) => {
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
            {labReport.map((item, index) => {
              const [label, subheader, number] = item.split(': ');
              return (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <div>
                      {label}
                      <div style={{ fontSize: '12px' }}>{subheader}</div>
                    </div>
                  </TableCell>
                  <TableCell align="right">{number}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default LabReport;
