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

  const formatReferenceInterval = (low, high, units) => {
    let interval = '';

    if (low !== null && high !== null) {
      interval = `${low} — ${high}`;
    } else if (low !== null) {
      interval = `> ${low}`;
    } else if (high !== null) {
      interval = `< ${high}`;
    }

    return interval ? `${interval} ${units ? units : ''}` : null;
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table aria-label="lab results table">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align="left">
                <h3>Results</h3>
                <h4>{data.Test}</h4>
              </TableCell>
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

              const referenceInterval = formatReferenceInterval(item.low, item.high, item.units);

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
