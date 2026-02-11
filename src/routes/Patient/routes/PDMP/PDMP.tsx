import * as React from 'react';
import { DataGrid, Box, dayjs, useGridApiRef, useKeepGroupedColumnsHidden, TitledCard, Icon } from 'components/ui/Core';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';

export function Pdmp() {
  const { useEncounter } = usePatient();
  const [dispenseHistory] = (useEncounter() as any).dispenseHistory([]);
  const [providers] = (useDatabase() as any).providers();
  const apiRef = useGridApiRef();

  const rows = (dispenseHistory as any[]).map((item: any, index: any) => {
    const provider = (providers as any[]).find((p: any) => p.id === item.prescriber);
    return {
      id: index,
      ...item,
      drugName: item.name,
      dispensedFormatted: item.dispensed ? (dayjs as any)(item.dispensed).format('MM/DD/YYYY') : '',
      writtenFormatted: item.written ? (dayjs as any)(item.written).format('MM/DD/YYYY') : '',
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
    <TitledCard
      emphasized
      color="#9F3494"
      title={<><Icon sx={{ verticalAlign: 'text-bottom', mr: 1 }}>history</Icon> Medication Dispense History</>}
      sx={{ m: 2 }}
    >
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
    </TitledCard>
  );
}
