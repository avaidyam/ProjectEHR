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
  Checkbox
} from 'components/ui/Core';
import { MedicationItemEditor } from './components/MedicationItemEditor';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { OrderPicker } from '../OrderCart/components/OrderPicker';
import { GridColDef } from '@mui/x-data-grid';

export function Medications() {
  const { useEncounter } = usePatient();
  const [medications, setMedications] = useEncounter().medications();
  const [expandedRowIds, setExpandedRowIds] = React.useState<Set<Database.Medication.ID>>(new Set());
  const apiRef = useGridApiRef();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [openOrderPicker, setOpenOrderPicker] = React.useState(false);

  const handleRowDoubleClick = React.useCallback((params: any) => apiRef.current?.toggleDetailPanel(params.id), [apiRef]);

  const handleEdit = (id: Database.Medication.ID) => {
    setExpandedRowIds(new Set([id]));
  };

  const handleSave = (updatedMedication: Database.Medication) => {
    setMedications((prev) =>
      prev?.map((med) => (med.id === updatedMedication.id ? updatedMedication : med))
    );
    setExpandedRowIds(new Set());
  };

  const handleCancel = () => {
    setExpandedRowIds(new Set());
  };

  const handleDelete = (id: Database.Medication.ID) => {
    setMedications((prev) => prev?.filter((med) => med.id !== id));
  };

  const handleAdd = () => {
    setOpenOrderPicker(true);
  };

  const mapResultToMedication = (result: any): Database.Medication => {
    let baseName = result.originalName || result.name;
    let doseStr = result.dose || '';
    let doseValue = 0;
    let doseUnit = '';

    // If we have a descriptive dose string (e.g. "325 mg Tab"), parse it
    if (doseStr && typeof doseStr === 'string') {
      const match = doseStr.match(/^([\d.]+)\s*(\w+)\s*(.*)$/);
      if (match) {
        doseValue = parseFloat(match[1]);
        doseUnit = match[2];
        if (match[3]) doseUnit += ' ' + match[3];
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
        if (match[4]) doseUnit += ' ' + match[4];
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
      width: 400,
      renderCell: () => (
        <Stack direction="row" spacing={0.5}>
          <Button variant="outlined" size="small">Today</Button>
          <Button variant="outlined" size="small">Yesterday</Button>
          <Button variant="outlined" size="small">Past Week</Button>
          <Button variant="outlined" size="small">Past Month</Button>
          <Button variant="outlined" size="small">{'>'} Month</Button>
          <Button variant="outlined" size="small">Unknown</Button>
        </Stack>
      )
    },
    {
      field: 'lastDose',
      headerName: 'Last Dose',
      width: 150,
      renderCell: () => (
        <Autocomplete
          disabled
          size="small"
          fullWidth
          value=""
          options={[]}
          TextFieldProps={{ color: 'error' }}
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
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton onClick={() => handleEdit(params.row.id)} color="primary" size="small">
            edit
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
            delete
          </IconButton>
        </Stack>
      )
    }
  ];

  const getDetailPanelContent = React.useCallback(
    ({ row }: { row: any }) => (
      <Box paper sx={{ p: 2, mx: 4, my: 1, border: '1px solid #e0e0e0' }}>
        <MedicationItemEditor
          medication={row}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Box>
    ),
    [handleSave, handleCancel],
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
            rows={medications ?? []}
            columns={columns}
            getRowId={(row: any) => row.id || `medication-${row.name}-${row.dose}`}
            rowHeight={70}
            getRowHeight={() => 'auto'}
            initialState={{ columns: { columnVisibilityModel: { __detail_panel_toggle__: false } } }}
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
