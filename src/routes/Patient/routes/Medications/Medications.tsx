// Medications.jsx
import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Icon,
  IconButton,
  Label,
  DataGrid,
  useGridApiRef,
  TitledCard,
  Grid,
  Autocomplete,
  Checkbox,
  DatePicker
} from 'components/ui/Core';
import { MedicationItemEditor } from './components/MedicationItemEditor';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { OrderPicker } from '../OrderCart/components/OrderPicker';
import { GridColDef } from '@mui/x-data-grid';
import { filterDocuments } from 'util/helpers';

export function Medications() {
  const { useEncounter } = usePatient();
  const [medications, setMedications] = useEncounter().medications();
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<Database.Medication.ID>>(new Set());
  const apiRef = useGridApiRef();

  const visibleMedications = React.useMemo(() => {
    return filterDocuments(medications || [], conditionals, orders);
  }, [medications, conditionals, orders]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [openOrderPicker, setOpenOrderPicker] = React.useState(false);

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  const handleSave = React.useCallback((updatedMedication: Database.Medication) => {
    setMedications((prev) =>
      prev?.map((med) => (med.id === updatedMedication.id ? updatedMedication : med))
    );
    setExpandedRowIds(new Set());
  }, [setMedications]);

  const handleCancel = React.useCallback(() => {
    setExpandedRowIds(new Set());
  }, []);

  const handleDelete = React.useCallback((id: Database.Medication.ID) => {
    setMedications((prev) => prev?.filter((med) => med.id !== id));
  }, [setMedications]);

  const handleAdd = React.useCallback(() => {
    setOpenOrderPicker(true);
  }, []);

  const mapResultToMedication = (result: any): Database.Medication => {
    let baseName = result.originalName || result.name;
    const doseStr = result.dose || '';
    let doseValue = 0;
    let doseUnit = '';

    // If we have a descriptive dose string (e.g. "325 mg Tab"), parse it
    if (doseStr && typeof doseStr === 'string') {
      const match = doseStr.match(/^([\d.]+)\s*(\w+)\s*(.*)$/);
      if (match) {
        doseValue = parseFloat(match[1]);
        doseUnit = match[2];
        if (match[3]) doseUnit += ` ${match[3]}`;
      } else {
        doseValue = parseFloat(doseStr) || 0;
        doseUnit = doseStr.replace(/[0-9.]/g, '').trim();
      }
    }
    // Otherwise, if the name itself looks like it contains a dose (e.g. from the Browse tab)
    else if (result.name && !result.originalName) {
      const match = result.name.match(/^(.*?)\s*([\d.]+)\s*(\w+)\s*(.*)$/);
      if (match) {
        baseName = match[1].trim();
        doseValue = parseFloat(match[2]);
        doseUnit = match[3];
        if (match[4]) doseUnit += ` ${match[4]}`;
      }
    }

    return {
      id: Database.Medication.ID.create(),
      name: baseName,
      dose: doseValue,
      unit: doseUnit,
      route: result.Route || result.route || '',
      frequency: result.Frequency || result.frequency || 'ONE TIME',
      activePrnReasons: [],
      possiblePrnReasons: [],
      startDate: new Date().toISOString() as Database.JSONDate,
      endDate: new Date().toISOString() as Database.JSONDate,
      status: 'Active'
    };
  };

  const handleUpdateLastDose = React.useCallback((id: Database.Medication.ID, lastDose?: string) => {
    setMedications((prev) =>
      prev?.map((med) => (med.id === id ? { ...med, lastDose: lastDose as any } : med))
    );
  }, [setMedications]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Medication',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Label variant="body1" color="primary" bold>
            {params.row.name} {params.row.dose > 0 ? `${params.row.dose} ` : ''}{params.row.unit} {params.row.route}
          </Label>
          <Label variant="body2" color="textSecondary">
            {[
              params.row.frequency && `${params.row.frequency}`,
              params.row.startDate && `${params.row.startDate}`,
              params.row.endDate && `${params.row.endDate}`,
              params.row.activePrnReasons?.length > 0 && `PRN: ${params.row.activePrnReasons.join(', ')}`
            ].filter(Boolean).join(', ')}
          </Label>
        </Box>
      )
    },
    {
      field: 'timeActions',
      headerName: 'Timing',
      width: 300,
      renderCell: (params) => (
        <Stack direction="row" useFlexGap flexWrap="wrap" sx={{ gap: 0.5, py: 0.5 }}>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, Temporal.Now.zonedDateTimeISO().toInstant().toString())}>Today</Button>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, Temporal.Now.zonedDateTimeISO().subtract({ days: 1 }).toInstant().toString())}>Yesterday</Button>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, Temporal.Now.zonedDateTimeISO().subtract({ days: 7 }).toInstant().toString())}>Past Week</Button>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, Temporal.Now.zonedDateTimeISO().subtract({ months: 1 }).toInstant().toString())}>Past Month</Button>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, Temporal.Now.zonedDateTimeISO().subtract({ months: 6 }).toInstant().toString())}>{'>'} Month</Button>
          <Button variant="outlined" size="small" onClick={() => handleUpdateLastDose(params.row.id, undefined)}>Unknown</Button>
        </Stack>
      )
    },
    {
      field: 'lastDose',
      headerName: 'Last Dose',
      width: 180,
      renderCell: (params) => (
        <DatePicker
          convertString
          size="small"
          value={params.row.lastDose || null}
          onChange={(newValue: string | null) => handleUpdateLastDose(params.row.id, newValue || undefined)}
          slotProps={{
            textField: {
              placeholder: 'Unknown',
              color: params.row.lastDose ? 'primary' : 'error'
            }
          }}
        />
      )
    },
    {
      field: 'taking',
      headerName: 'Taking?',
      width: 80,
      renderCell: () => <Checkbox />
    },
    {
      field: '__detail_panel_toggle__',
      headerName: 'Actions',
      width: 48,
      sortable: false
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: { row: any }) => (
      <Box paper sx={{ p: 2, mx: 4, my: 1, border: '1px solid #e0e0e0' }}>
        <MedicationItemEditor
          medication={row}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      </Box>
    ),
    [handleSave, handleCancel, handleDelete],
  );

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>medication</Icon> Home Medications</>} color="#9F3494" sx={{ m: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Autocomplete
              freeSolo
              label="New Medication"
              size="small"
              fullWidth
              options={[]}
              value={searchTerm}
              onInputChange={(_e, newValue) => setSearchTerm(newValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              sx={{ width: 300 }}
            />
            <Button variant="contained" startIcon={<Icon>add_task</Icon>} onClick={handleAdd}>Add</Button>
          </Stack>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            apiRef={apiRef}
            rows={visibleMedications ?? []}
            columns={columns}
            getRowId={(row: any) => row.id || `medication-${row.name}-${row.dose}`}
            rowHeight={70}
            getRowHeight={() => 'auto'}
            hideFooter
            disableRowSelectionOnClick
            onRowDoubleClick={handleRowDoubleClick}
            getDetailPanelHeight={() => 'auto'}
            getDetailPanelContent={getDetailPanelContent}
            detailPanelExpandedRowIds={expandedRowIds}
            onDetailPanelExpandedRowIdsChange={(newIds: any) => setExpandedRowIds(new Set(newIds))}
          />
        </Box>
      </Stack>

      {openOrderPicker && (
        <OrderPicker
          open={openOrderPicker}
          searchTerm={searchTerm}
          categories={['medication']}
          onSelect={(result: any) => {
            setOpenOrderPicker(false);
            if (result) {
              if (Array.isArray(result)) {
                const newMeds = result.map(mapResultToMedication);
                setMedications((prev) => [...(prev ?? []), ...newMeds]);
              } else {
                const newMed = mapResultToMedication(result);
                setMedications((prev) => [...(prev ?? []), newMed]);
              }
            }
          }}
        />
      )}
    </TitledCard>
  );
}
