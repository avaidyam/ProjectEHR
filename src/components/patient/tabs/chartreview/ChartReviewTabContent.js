import React, { useState, useContext } from 'react';
import {
  Box, Chip, Divider, Table, TableHead, TableRow, TableCell, Dialog, DialogContent, Typography, Button
} from '@mui/material';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import LabReport from '../snapshot/LabReportTab.js';
import ImagingTabContent from './ImagingTabContent.js';
import { AuthContext } from '../../../login/AuthContext.js';

const tabLabels = [
  "Encounters",
  "Note",
  "Imaging",
  "Lab",
  "Cardiac",
  "Specialty Test",
  "Other",
  "Meds",
  "Letter",
  "Referrals"
];

export const ChartReviewDataContent = ({ selectedTabLabel, data, ...props }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState('100%');

  const filteredData = selectedTabLabel ? data.filter(item => item.kind === selectedTabLabel) : [];

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0].data).filter(column => column !== 'id' && column !== 'content') : [];

  const visibleColumns = columns.filter(column =>
    filteredData.every(row => row.data[column] !== undefined && row.data[column] !== null && row.data[column] !== '')
  );

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsWindowOpen(true);
    setTableWidth('50%');
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    setTableWidth('100%');
  };

  return (
    <Box position="relative">
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        <div style={{ flex: '1', maxWidth: tableWidth, transition: 'max-width 0.5s', overflow: 'auto' }}>
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
                <TableRow key={index} onClick={() => handleRowClick(row)}>
                  {visibleColumns.map((column, columnIndex) => (
                    <TableCell key={columnIndex}>{row.data[column]}</TableCell> 
                  ))}
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
        {isWindowOpen && (
          <div style={{
            flex: '1', maxWidth: '50%', background: '#ffffff', borderLeft: '1px solid #ccc',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', transition: 'max-width 0.5s'
          }}>
            <div style={{ padding: '16px' }}>
              {selectedRow && (
                <div>
                  <Button onClick={handleCloseWindow}>Close</Button>
                  {selectedTabLabel === 'Lab' && (
                    <LabReport labReport={selectedRow} />
                  )}
                  {selectedTabLabel !== 'Lab' && Object.keys(selectedRow.data).map((key, index) => (
                    (key !== 'content' && key !== 'image') && (
                      <Box key={index}>
                        <strong>{key}:</strong> {selectedRow.data[key]}
                      </Box>
                    )
                  ))}
                  <Divider />
                  {/*selectedRow.data.image && <img src={selectedRow.data.image} alt="chart review" />*/}
                  <Box sx={{ whiteSpace: "pre-wrap" }}>{selectedRow.data.content}</Box>
                  {selectedRow.data.image && (
                    <ImagingTabContent selectedRow={selectedRow} />
                  )}
                  {selectedTabLabel === 'Specialty Test' && selectedRow && (
                    <ImagingTabContent selectedRow={selectedRow} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export const ChartReview = ({ ...props }) => {
  const [subValue, setValue] = useState(0);
  const [selectedTabLabel, setSelectedTabLabel] = useState('Encounters');
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const [enc, setEnc] = useEncounterID()
  const { encounters } = TEST_PATIENT_INFO({ patientMRN });

  // display all chart documents from the current encounter AND ALL PRIOR ENCOUNTERS
  // TODO: this is where modifications should be made for order-conditional documents being shown
  // or logic to advance from one encounter to the next
  const currentEncDate = encounters?.find(x => x.id === enc).startDate
  const documents = encounters?.filter(x => new Date(x.startDate) <= new Date(currentEncDate)).flatMap(x => x.documents)
  const encounters_data = encounters.map(x => ({
    kind: 'Encounters',
    data: {
      date: x.startDate,
      type: x.type,
      department: x.department,
      specialty: x.specialty,
      provider: x.provider
    }
  }))
  
  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {tabLabels.map((label, idx) => (
          <Chip
            key={idx}
            label={label}
            onClick={() => {
              setValue(idx);
              setSelectedTabLabel(label);
            }}
            variant={subValue === idx ? "filled" : "outlined"}
            color={subValue === idx ? "primary" : "default"}
            style={{ margin: 5 }}
          />
        ))}
      </Box>
      <ChartReviewDataContent selectedTabLabel={selectedTabLabel} data={[...encounters_data, ...documents]} />
    </div>
  );
};
