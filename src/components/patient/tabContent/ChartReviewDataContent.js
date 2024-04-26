import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import BasicTable from './LabReportTab.js';

const ChartReviewDataContent = ({ selectedTabLabel, data }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    // Show the dialog if the selected tab is not 'Lab'
    if (selectedTabLabel !== 'Lab') {
      setDialogOpen(true);
    }
  };

  // Reset selectedRow when the tab changes
  useEffect(() => {
    setSelectedRow(null);
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
    <div className="tab-content-container">
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

      {/* Render the BasicTable if the selected tab is 'Lab' */}
      {selectedTabLabel === 'Lab' && selectedRow && <BasicTable data={selectedRow} />}
    </div>
  );
};

export default ChartReviewDataContent;