import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material'; // FIXME: REMOVE!
import { Box, Button, Label, DataGrid, Icon } from 'components/ui/Core'
import { useSplitView } from 'components/contexts/SplitViewContext.jsx';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
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

const CARDIAC_ORDERS = [
  "EKG",
  "ECG",
  "Echocardiogram",
  "CT CORONARY ANGIOGRAM",
  "CT CORONARY ANGIOGRAM (POST-PCI)"
];

export const ChartReviewDataContent = ({ selectedTabLabel, data, ...props }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState('100%');
  const { openTab } = useSplitView()

  const filteredData = selectedTabLabel ? data.filter(item => {
    const isCardiac = CARDIAC_ORDERS.some(t => (item.Test || item.exam || "").includes(t))
    if (selectedTabLabel === 'Cardiac') return isCardiac;
    if (item.kind !== selectedTabLabel) return false;
    return !isCardiac;
  }) : [];

  const getRowData = (row) => row.data || row;

  const getAllKeys = (data) => {
    const keys = new Set();
    data.forEach(row => {
      Object.keys(getRowData(row)).forEach(key => keys.add(key));
    });
    return Array.from(keys);
  };

  const columns = filteredData.length > 0 ? getAllKeys(filteredData).filter(column => column !== 'id' && column !== 'content' && column !== 'image' && column !== 'kind' && column !== 'enc') : [];

  const visibleColumns = columns.filter(column =>
    filteredData.some(row => {
      const d = getRowData(row);
      return d[column] !== undefined && d[column] !== null && d[column] !== ''
    })
  );

  const handleRowClick = (row) => {
    const rowData = getRowData(row);
    if (selectedTabLabel === 'Lab') {
      openTab("Lab Report", { labReport: rowData }, "main", false)
    } else if (selectedTabLabel === 'Cardiac' && !!row.labResults) {
    } else if (selectedTabLabel === 'Imaging' || selectedTabLabel === 'Specialty Test') {
      const isPathologySlide = rowData.accessionNumber?.startsWith("PATH") || rowData.id?.startsWith("PATH")
      const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      openTab("Imaging Viewer", { selectedRow: rowData, viewerId: viewerId, convertMonochrome: !isPathologySlide }, "main", false)
    } else if (selectedTabLabel === 'Cardiac' && !!rowData.image) {
      // EKG special case
      const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      openTab("Imaging Viewer", { selectedRow: rowData, viewerId: viewerId, convertMonochrome: false }, "main", false)
    } else if (selectedTabLabel === 'Note') {
      openTab("Note", { selectedRow: rowData }, "side", false)
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
            rows={filteredData.map(x => {
              const d = getRowData(x);
              return { ...d, id: JSON.stringify(d), _obj: x }
            })}
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
                  {/* TODO: The old preview code has been deleted. Please rewrite it! */}
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

  const [departments] = useDatabase().departments()
  const [providers] = useDatabase().providers()

  const { openTab } = useSplitView()

  const [selectedTabLabel, setSelectedTabLabel] = useState('Encounters');
  const [isNewResultOpen, setIsNewResultOpen] = useState(false);
  const [isNewImagingOpen, setIsNewImagingOpen] = useState(false);

  const enrichDocs = (docs, kind, enc) => (docs || []).map(d => ({
    ...d,
    kind,
    encDate: enc?.startDate?.split(" ")[0], // Assuming StartDate is "YYYY-MM-DD HH:MM"
    encDept: departments.find(dep => dep.id === enc?.department)?.name,
    encType: enc?.type,
    encounterProvider: providers.find(p => p.id === enc?.provider)?.name
  }))

  const handleNewNote = () => {
    // Open Edit Note (side tab) - select if exists
    openTab("Edit Note", {}, "side", true);

    // Make NoteWriter available (main tab) but don't auto-select
    openTab("NoteWriter", {}, "main", false);
  };

  // display all chart documents from the current encounter AND ALL PRIOR ENCOUNTERS
  // TODO: this is where modifications should be made for order-conditional documents being shown
  // or logic to advance from one encounter to the next
  const currentEncDate = encounter.startDate
  const documents2 = Object.values(chart.encounters)
    .toSorted((a, b) => (new Date(a.startDate)).getTime() - (new Date(b.startDate)).getTime())
    .filter(x => (new Date(x.startDate)).getTime() <= (new Date(currentEncDate)).getTime())
    .flatMap(x => [
      ...enrichDocs(x.notes, 'Note', x),
      ...enrichDocs(x.labs, 'Lab', x),
      ...enrichDocs(x.imaging, 'Imaging', x)
    ])

  const documents = filterDocuments(documents2, conditionals, orders)

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
        labs: [...(newEncounters[encounterId].labs || []), newDoc]
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
        imaging: [...(newEncounters[encounterId].imaging || []), newDoc]
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
