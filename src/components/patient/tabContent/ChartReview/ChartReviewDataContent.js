import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';


const ChartReviewDataContent = ({ columns, data, selectedRowData, onRowClick }) => {
    const [selectedRow, setSelectedRow] = useState(null);
  
    const handleRowClick = (rowData) => {
      setSelectedRow(rowData);
      onRowClick(rowData); // Pass the selected row data to the parent component if needed
    };
  
    return (
      <div className="tab-content-container">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} onClick={() => handleRowClick(row)}>
                {Object.values(row).map((cell, index) => (
                  <TableCell key={index}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  export default ChartReviewDataContent;