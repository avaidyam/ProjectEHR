import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

const LabReport = ({ labReport }) => {
  const { data, labResults } = labReport;

  const formatReferenceInterval = (low, high) => {
    if (low !== null && high !== null) {
      return `${low} — ${high}`;
    } else if (low !== null) {
      return `> ${low}`;
    } else if (high !== null) {
      return `< ${high}`;
    }
    return null; // No reference interval provided
  };

  return (
    <div> {/* Style for positioning */}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align="left">
                <h3>Results</h3>
                <h4>{data.Test}</h4>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Date/Time</TableCell>
              <TableCell align="right">{data['Date/Time']}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell align="right">{data.Status}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Abnormal?</TableCell>
              <TableCell align="right">{data['Abnormal?']}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expected Date</TableCell>
              <TableCell align="right">{data['Expected Date']}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expiration</TableCell>
              <TableCell align="right">{data.Expiration}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Encounter Provider</TableCell>
              <TableCell align="right">{data['Encounter Provider']}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Test</TableCell>
              <TableCell align="right">Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labResults.map((item, index) => {
              if (item.value === null || item.name === null) {
                return null; // Skip this item if value or name is null
              }

              const referenceInterval = formatReferenceInterval(item.low, item.high);

              return (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <div>
                      {item.name}
                      {referenceInterval && (
                        <div style={{ fontSize: '12px' }}>{referenceInterval}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {item.value}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LabReport;
