import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material'; // FIXME: REMOVE!
import { Box, Divider, Button, Label, DataGrid, Icon } from 'components/ui/Core'
import { useSplitView } from 'components/contexts/SplitViewContext.jsx';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import LabReport from '../LabReport/LabReport.jsx';
import ImagingTabContent from '../ImagingViewer/ImagingViewer.jsx';
import { filterDocuments } from 'util/helpers'
import { NewLabResultDialog } from './NewLabResultDialog';
import { NewImagingResultDialog } from './NewImagingResultDialog';

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
  const { mainTabs, setMainTabs, setSelectedMainTab, sideTabs, setSideTabs, setSelectedSideTab } = useSplitView()

  const filteredData = selectedTabLabel ? data.filter(item => item.kind === selectedTabLabel) : [];

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0].data).filter(column => column !== 'id' && column !== 'content' && column !== 'image') : [];

  const visibleColumns = columns.filter(column =>
    filteredData.every(row => row.data[column] !== undefined && row.data[column] !== null && row.data[column] !== '')
  );

  const handleRowClick = (row) => {
    //setSelectedRow(row);
    //setIsWindowOpen(true);
    //setTableWidth('50%');

    if (selectedTabLabel === 'Lab') {
      // Open new tabs in the main view
      setMainTabs(prev => [...prev, { "Lab Report": { labReport: row } }])
      setSelectedMainTab(mainTabs.length)
    } else if (selectedTabLabel === 'Cardiac' && !!row.labResults) {
      // Cardiac Labs special case
      setMainTabs(prev => [...prev, { "Lab Report": { labReport: row } }])
      setSelectedMainTab(mainTabs.length)
    } else if (selectedTabLabel === 'Imaging' || selectedTabLabel === 'Specialty Test') {
      const isPathologySlide = row.data.accessionNumber?.startsWith("PATH") || row.data.id?.startsWith("PATH")
      const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      setMainTabs(prev => [...prev, { "Imaging Viewer": { selectedRow: row, viewerId: viewerId, convertMonochrome: !isPathologySlide } }]);
      setSelectedMainTab(mainTabs.length)
    } else if (selectedTabLabel === 'Cardiac' && !!row.data.image) {
      // EKG special case
      const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      setMainTabs(prev => [...prev, { "Imaging Viewer": { selectedRow: row, viewerId: viewerId, convertMonochrome: false } }]);
      setSelectedMainTab(mainTabs.length)
    } else if (selectedTabLabel === 'Note') {
      setSideTabs(prev => [...prev, { "Note": { selectedRow: row } }])
      setSelectedSideTab(sideTabs.length)
    } else {
      // TODO: handle other tabs somehow?
    }
  };

  const handleCloseWindow = () => {
    setIsWindowOpen(false);
    setTableWidth('100%');
  };

  return (
    <Box position="relative">
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        <div style={{ flex: '1', maxWidth: tableWidth, transition: 'max-width 0.5s', overflow: 'auto' }}>
          <DataGrid
            showToolbar
            columns={visibleColumns.map(x => ({ field: x, headerName: x, flex: 1, minWidth: 100 }))}
            rows={filteredData.map(x => ({ ...x.data, id: JSON.stringify(x.data), _obj: x }))}
            onCellDoubleClick={(params) => handleRowClick(params.row._obj)}
            pageSizeOptions={[25, 50, 100]}
            localeText={{
              footerTotalRows: "Total items: "
            }}
          />
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
                    <ImagingTabContent selectedRow={selectedRow} viewerId={viewerId} />
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

  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()
  const [documents1] = useEncounter().documents()

  const { sideTabs, setSideTabs, setSelectedSideTab, setMainTabs } = useSplitView()

  const [selectedTabLabel, setSelectedTabLabel] = useState('Encounters');
  const [isNewResultOpen, setIsNewResultOpen] = useState(false);
  const [isNewImagingOpen, setIsNewImagingOpen] = useState(false);

  const handleNewNote = () => {
    // Open Edit Note (side tab)
    const existingIndex = sideTabs.findIndex(tab => Object.keys(tab)[0] === "Edit Note");
    if (existingIndex !== -1) {
      setSelectedSideTab(existingIndex);
    } else {
      setSideTabs(prev => [...prev, { "Edit Note": {} }]);
      setSelectedSideTab(sideTabs.length); // Use current length as new index
    }

    // Make NoteWriter available (main tab) but don't auto-open
    setMainTabs(prev => {
      if (prev.find(tab => Object.keys(tab)[0] === "NoteWriter")) return prev;
      return [...prev, { "NoteWriter": {} }];
    });
  };

  // display all chart documents from the current encounter AND ALL PRIOR ENCOUNTERS
  // TODO: this is where modifications should be made for order-conditional documents being shown
  // or logic to advance from one encounter to the next
  const currentEncDate = encounter.startDate
  const documents2 = Object.values(chart.encounters)
    .toSorted((a, b) => (new Date(a.startDate)).getTime() - (new Date(b.startDate)).getTime())
    .filter(x => (new Date(x.startDate)).getTime() <= (new Date(currentEncDate)).getTime())
    .flatMap(x => x.documents)

  const documents = filterDocuments(documents2, conditionals, orders)

  const [departments] = useDatabase().departments()
  const [providers] = useDatabase().providers()

  const encountersData = Object.values(chart.encounters).map(x => {
    const dept = departments.find(d => d.id === x.department)
    const prov = providers.find(p => p.id === x.provider)

    return {
      kind: 'Encounters',
      data: {
        date: x.startDate,
        type: x.type,
        department: dept ? dept.name : x.department,
        specialty: prov ? prov.specialty : '',
        provider: prov ? prov.name : x.provider
      }
    }
  })

  const handleSaveNewLabResult = (newDoc) => {
    const encounterId = encounter.id;
    const newEncounters = { ...chart.encounters };

    if (newEncounters[encounterId]) {
      newEncounters[encounterId] = {
        ...newEncounters[encounterId],
        documents: [...newEncounters[encounterId].documents, newDoc]
      };

      const newChart = { ...chart, encounters: newEncounters };
      setChart(newChart);
      setEncounter(newEncounters[encounterId]);
    }
  };

  const handleSaveNewImaging = (newDoc) => {
    const encounterId = encounter.id;
    const newEncounters = { ...chart.encounters };

    if (newEncounters[encounterId]) {
      newEncounters[encounterId] = {
        ...newEncounters[encounterId],
        documents: [...newEncounters[encounterId].documents, newDoc]
      };

      const newChart = { ...chart, encounters: newEncounters };
      setChart(newChart);
      setEncounter(newEncounters[encounterId]);
    }
  };

  return (
    <div>
      <Label variant="h6" sx={{ p: 1, pb: 0 }}>Chart Review</Label>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
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
        {selectedTabLabel === 'Lab' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsNewResultOpen(true)}
          >
            New Result
          </Button>
        )}
        {selectedTabLabel === 'Imaging' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsNewImagingOpen(true)}
          >
            New Result
          </Button>
        )}
        {selectedTabLabel === 'Note' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon>add</Icon>}
            onClick={handleNewNote}
          >
            New Note
          </Button>
        )}
      </Box>
      <ChartReviewDataContent selectedTabLabel={selectedTabLabel} data={[...encountersData, ...documents]} />
      <NewLabResultDialog
        open={isNewResultOpen}
        onClose={() => setIsNewResultOpen(false)}
        onSave={handleSaveNewLabResult}
      />
      <NewImagingResultDialog
        open={isNewImagingOpen}
        onClose={() => setIsNewImagingOpen(false)}
        onSave={handleSaveNewImaging}
      />
    </div>
  );
};
