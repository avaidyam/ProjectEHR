import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import LabReport from './LabReportTab.js';

const ChartReviewDataContent = ({ selectedTabLabel, data }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [labReportOpen, setLabReportOpen] = useState(false);

  const handleRowClick = (row) => {
    // If the same row is clicked again, toggle labReportOpen
    if (row === selectedRow) {
      setLabReportOpen(!labReportOpen);
    } else {
      setSelectedRow(row);
      // Show the dialog if the selected tab is not 'Lab'
      if (selectedTabLabel !== 'Lab') {
        setDialogOpen(true);
      } else {
        setLabReportOpen(true);
      }
    }
  };

  // Reset selectedRow when the tab changes
  useEffect(() => {
    setSelectedRow(null);
    setLabReportOpen(false);
  }, [selectedTabLabel]);

  // Filter data based on selectedTabLabel
  const filteredData = data.filter(item => item.kind === selectedTabLabel);

  // Retrieve columns dynamically from the properties of the objects in filteredData
  const columns = filteredData.length > 0 ? Object.keys(filteredData[0].data) : [];

  // Filter out columns where all rows have data
  const visibleColumns = columns.filter(column =>
    filteredData.every(row => row.data[column] !== undefined && row.data[column] !== null && row.data[column] !== '')
  );

  return (
    <div className="tab-content-container" style={{ position: 'relative', overflow: labReportOpen ? 'hidden' : 'auto' }}>
      <h2>{selectedTabLabel} Data</h2>
      <Table>
        <TableHead>
          <TableRow>
            {visibleColumns.map((column, index) => (
              <TableCell key={index}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <tbody>
          {filteredData.map((row, index) => (
            <TableRow key={index} onClick={() => handleRowClick(row.data)}>
              {visibleColumns.map((column, columnIndex) => (
                <TableCell key={columnIndex}>{row.data[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </Table>

      {/* Render the dialog if the selected tab is not 'Lab' */}
      {selectedTabLabel !== 'Lab' && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogContent>
            {selectedRow && Object.keys(selectedRow).map((key, index) => (
              <div key={index}>
                <strong>{key}:</strong> {selectedRow[key]}
              </div>
            ))}
          </DialogContent>
        </Dialog>
      )}

      {/* Render the LabReport if the selected tab is 'Lab' */}
      {selectedTabLabel === 'Lab' && selectedRow && labReportOpen && (
        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', overflowY: 'auto' }}>
          <LabReport data={selectedRow} />
        </div>
      )}
    </div>
  );
};

export default ChartReviewDataContent;
