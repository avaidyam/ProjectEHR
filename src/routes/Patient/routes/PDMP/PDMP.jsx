import React from 'react';
import { DataGrid, Box, dayjs, useGridApiRef, useKeepGroupedColumnsHidden } from 'components/ui/Core';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';

function Pdmp() {
  const { useEncounter } = usePatient();
  const [dispenseHistory, setDispenseHistory] = useEncounter().dispenseHistory();
  const [providers] = useDatabase().providers();
  const apiRef = useGridApiRef();

  const rows = dispenseHistory.map((item, index) => {
    const provider = providers.find(p => p.id === item.prescriber);
    return {
      id: index,
      ...item,
      drugName: item.name,
      dispensedFormatted: item.dispensed ? dayjs(item.dispensed).format('MM/DD/YYYY') : '',
      writtenFormatted: item.written ? dayjs(item.written).format('MM/DD/YYYY') : '',
      providerName: provider ? provider.name : item.prescriber,
    };
  });

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: {
        model: ['drugName'],
      },
    },
  });

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={[
          { field: 'drugName', headerName: 'Drug', width: 200 },
          { field: 'dispensedFormatted', headerName: 'Dispensed', width: 120 },
          { field: 'writtenFormatted', headerName: 'Written', width: 120 },
          { field: 'dosage', headerName: 'Dosage', width: 150 },
          { field: 'quantity', headerName: 'Qty', width: 80, type: 'number' },
          { field: 'refills', headerName: 'Refills', width: 80, type: 'number' },
          { field: 'supply', headerName: 'Days Supply', width: 110, type: 'number' },
          { field: 'providerName', headerName: 'Provider', width: 180 },
          { field: 'pharmacy', headerName: 'Pharmacy', width: 180 },
        ]}
        initialState={initialState}
        disableRowSelectionOnClick
        groupingColDef={{ leafField: 'drugName' }}
      />
    </Box>
  );
}

export default Pdmp;
