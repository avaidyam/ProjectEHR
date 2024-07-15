import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const LabReport = ({ labReport }) => {
  const { data, labResults, collected, resulted, resultingAgency, labReportComment } = labReport;

  // Extract the test name
  const testName = data?.Test;

  // Format the reference interval
  const formatReferenceInterval = (low, high, units) => {
    let interval = '';

    if (low !== null && high !== null) {
      interval = `${low} — ${high}`;
    } else if (low !== null) {
      interval = `< ${low}`;
    } else if (high !== null) {
      interval = `> ${high}`;
    }

    return interval ? `${interval} ${units ? units : ''}` : null;
  };

  // Function to check if there are any low or high values
  const hasLowOrHighValues = (labResults) => {
    return labResults.some(item => {
      const numericValue = parseFloat(item.value);
      if (!isNaN(numericValue)) {
        return (item.low !== null && numericValue < item.low) || (item.high !== null && numericValue > item.high);
      }
      return false;
    });
  };

  // Function to check if a value is outside the reference range
  const isValueOutsideRange = (value, low, high) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return (low !== null && numericValue < low) || (high !== null && numericValue > high);
    }
    return false;
  };

  // Check if there are any values outside the reference range
  const shouldHighlightBorder = hasLowOrHighValues(labResults);

  // Determine final result subtitle
  let finalResultSubtitle = null;
  if (resulted !== null) {
    finalResultSubtitle = <Typography variant="subtitle1" gutterBottom>Final Result: Yes</Typography>;
  } else {
    finalResultSubtitle = <Typography variant="subtitle1" gutterBottom>Final Result: No</Typography>;
  }

  // Determine Result Notes section
  let resultNotes = labReportComment ? `Result Notes: ${labReportComment}` : '0 Result Notes';

  return (
    <div>
      {testName && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {testName}
          </Typography>
          {finalResultSubtitle}
          <Typography variant="subtitle1" gutterBottom>
            {resultNotes}
          </Typography>
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table
          aria-label="lab results table"
          style={{ borderLeft: shouldHighlightBorder ? '3px solid yellow' : 'none' }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <div>Component</div>
                <div style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>Ref Range & Units</div>
              </TableCell>
              <TableCell align="right">Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labResults.map((item, index) => {
              if (item.value === null || item.name === null) {
                return null; // Skip this item if value or name is null
              }

              const referenceInterval = formatReferenceInterval(item.low, item.high, item.units);
              const isOutOfRange = isValueOutsideRange(item.value, item.low, item.high);

              // Determine symbol and color based on value compared to reference range
              let symbol = '';
              let symbolStyle = { color: 'inherit' };
              let valueStyle = { fontWeight: 'normal' }; // Default style for value

              if (isOutOfRange) {
                const numericValue = parseFloat(item.value);
                if (!isNaN(numericValue)) {
                  symbol = numericValue > item.high ? '⌃' : '⌄';
                  symbolStyle = { color: 'red' };
                  valueStyle = { fontWeight: 'bold', color: 'red' }; // Bold and red if outside range
                }
              }

              return (
                <TableRow key={index} style={{ borderLeft: isOutOfRange ? '3px solid yellow' : 'none' }}>
                  <TableCell component="th" scope="row">
                    <div>
                      {item.name}
                      {referenceInterval && (
                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>{referenceInterval}</div>
                      )}
                      {item.comment && (
                        <div style={{ fontSize: '12px', color: 'gray' }}>{item.comment}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ backgroundColor: isOutOfRange ? 'yellow' : 'inherit', padding: '2px 5px', borderRadius: '3px' }}>
                      <span style={valueStyle}>{item.value}</span>
                      <span style={{ ...symbolStyle, marginLeft: '5px' }}>{symbol}</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>
                Resulting Agency
              </TableCell>
              <TableCell align="right" style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>
                {resultingAgency}
              </TableCell>
            </TableRow>
            <TableRow style={{ borderTop: 'none' }}>
              <TableCell style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>
                Specimen Collected: {collected}
              </TableCell>
              <TableCell align="right" style={{ fontSize: '12px', fontWeight: 'normal', color: 'gray' }}>
                Last Resulted: {resulted}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LabReport;
