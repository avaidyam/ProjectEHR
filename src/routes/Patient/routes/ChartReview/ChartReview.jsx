import React, { useState } from 'react';
import {
  Tabs, Tab, Box, Divider, Table, TableHead, TableRow, TableCell, Button
} from '@mui/material';
import { useSplitView } from 'components/contexts/SplitViewContext.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import LabReport from '../LabReport/LabReport.jsx';
import ImagingTabContent from '../ImagingViewer/ImagingViewer.jsx';

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
  const [customTabs, setCustomTabs] = useSplitView()

  const filteredData = selectedTabLabel ? data.filter(item => item.kind === selectedTabLabel) : [];

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0].data).filter(column => column !== 'id' && column !== 'content') : [];

  const visibleColumns = columns.filter(column =>
    filteredData.every(row => row.data[column] !== undefined && row.data[column] !== null && row.data[column] !== '')
  );

  const handleRowClick = (row) => {
    //setSelectedRow(row);
    //setIsWindowOpen(true);
    //setTableWidth('50%');

    // Open new tabs in the main view
    if (selectedTabLabel === 'Lab')
      setCustomTabs(prev => [...prev, {"Lab Report": { labReport: row }}])
    if (selectedTabLabel === 'Imaging' || selectedTabLabel === 'Specialty Test') {
      const accessionNumber = row.data?.accessionNumber; // Get the accession number here
      if (accessionNumber) {
        const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        setCustomTabs(prev => [...prev, { "Imaging Viewer": { selectedRow: row, viewerId: viewerId } }]);
      }
    }
    if (selectedTabLabel === 'Note')
      setCustomTabs(prev => [...prev, {"Note": { selectedRow: row }}])
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
                  {(selectedTabLabel === 'Imaging' || selectedTabLabel === 'Specialty Test') && selectedRow && (
                    <ImagingTabContent selectedRow={selectedRow} viewerId={viewerId}/>
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
  const { useChart, useEncounter } = usePatient()
  const [chart, setChart] = useChart()()
  const [encounter, setEncounter] = useEncounter()()

  const [selectedTabLabel, setSelectedTabLabel] = useState('Encounters');

  // display all chart documents from the current encounter AND ALL PRIOR ENCOUNTERS
  // TODO: this is where modifications should be made for order-conditional documents being shown
  // or logic to advance from one encounter to the next
  const currentEncDate = encounter.startDate
  const documents = Object.values(chart.encounters).filter(x => new Date(x.startDate) <= new Date(currentEncDate)).flatMap(x => x.documents)
  const encountersData = Object.values(chart.encounters).map(x => ({
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
        <Tabs 
          variant="scrollable" 
          textColor="inherit"
          scrollButtons="auto"
          allowScrollButtonsMobile 
          value={selectedTabLabel}
          onChange={(event, newValue) => setSelectedTabLabel(newValue)}>
          {tabLabels.map((label) => (
            <Tab
              key={label}
              value={label}
              label={label}
            />
          ))}
        </Tabs>
      </Box>
      <ChartReviewDataContent selectedTabLabel={selectedTabLabel} data={[...encountersData, ...documents]} />
    </div>
  );
};
