import * as React from 'react';
import { Window, Button, Stack, Label, Icon, Box, TextField, dayjs, DataGrid, Autocomplete, IconButton } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

export const PDMPManagerWindow = ({ open, onClose, mrn, encounterId }: {
  open: boolean;
  onClose: () => void;
  mrn: Database.Patient.ID;
  encounterId: Database.Encounter.ID;
}) => {
  return (
    <Window
      title="PDMP Manager"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {open && mrn && encounterId ? (
        <PDMPManagerContent mrn={mrn} encounterId={encounterId} onClose={onClose} />
      ) : (
        <Box p={2}><Label>Please open a patient encounter to manage PDMP.</Label></Box>
      )}
    </Window>
  );
};

const DrugPicker = ({ value, onChange }: {
  value: {
    name: string;
    route: string;
    dosage: string;
    code: string;
  };
  onChange: (value: { name: string; route: string; dosage: string; code: string }) => void;
}) => {
  const [orderables] = useDatabase().orderables()
  const selectedDrug = orderables?.rxnorm?.find((d) => d.name === value.name) || null;
  const selectedRoute = value.route || null;
  const drugOptions = orderables?.rxnorm || [];
  const routeOptions = selectedDrug ? Object.keys(selectedDrug.route || {}) : [];
  const dosageOptions = (selectedDrug && selectedRoute && selectedDrug.route[selectedRoute])
    ? Object.entries(selectedDrug.route[selectedRoute]).map(([code, label]) => ({ code, label }))
    : [];

  const currentDosageOption = dosageOptions.find((d) => d.label === value.dosage) || null;

  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        label="Drug Name"
        options={drugOptions}
        getOptionLabel={(option) => option.name || ''}
        value={selectedDrug}
        onChange={(_, val) => {
          onChange({
            name: val ? val.name : '',
            route: '',
            dosage: '',
            code: ''
          });
        }}
      />
      <Autocomplete
        label="Route"
        options={routeOptions}
        value={selectedRoute}
        onChange={(_, val) => {
          onChange({
            ...value,
            route: val || '',
            dosage: '',
            code: ''
          });
        }}
        disabled={!selectedDrug}
        fullWidth
      />
      <Autocomplete
        label="Dosage"
        options={dosageOptions}
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        value={currentDosageOption}
        onChange={(_, val) => {
          onChange({
            ...value,
            dosage: val ? val.label : '',
            code: val ? val.code : ''
          });
        }}
        disabled={!selectedRoute}
        fullWidth
      />
    </Stack>
  );
};

const ProviderPicker = ({ value, onChange }: {
  value: Database.Provider.ID;
  onChange: (value: Database.Provider.ID) => void;
}) => {
  const [providers] = useDatabase().providers()
  const selectedProvider = providers?.find(p => p.id === value) || null;
  return (
    <Autocomplete
      label="Prescriber"
      options={providers || []}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={selectedProvider}
      onChange={(_, val) => onChange(val ? val.id : '')}
      fullWidth
    />
  );
};

const PDMPManagerContent = ({ mrn, encounterId, onClose }: {
  mrn: Database.Patient.ID;
  encounterId: Database.Encounter.ID;
  onClose: () => void;
}) => {
  const [dispenseHistory, setDispenseHistory] = useDatabase().patients[mrn].encounters[encounterId].dispenseHistory([]);
  const [view, setView] = React.useState<'list' | 'add'>('list');
  const [newItem, setNewItem] = React.useState<Database.Medication.DispenseLog>({
    name: '',
    route: '',
    dosage: '',
    drug: '',
    quantity: 0,
    refills: 0,
    supply: 0,
    prescriber: '',
    pharmacy: '',
    written: '',
    dispensed: new Date().toISOString().split('T')[0],
  });

  const handleSave = () => {
    setDispenseHistory((prev) => [...(prev || []), {
      ...newItem,
      quantity: Number(newItem.quantity),
      refills: Number(newItem.refills),
      supply: Number(newItem.supply),
    }]);
    setView('list');
    setNewItem({
      name: '', route: '', dosage: '', drug: '',
      quantity: 0, refills: 0, supply: 0, prescriber: '', pharmacy: '',
      written: '',
      dispensed: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (id: number) => {
    setDispenseHistory((prev) => prev!.filter((_, idx) => idx !== id));
  };

  if (view === 'add') {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Label variant="h6">Add New PDMP Entry</Label>

        <DrugPicker
          value={{
            name: newItem.name,
            route: newItem.route,
            dosage: newItem.dosage,
            code: newItem.drug
          }}
          onChange={(val) => setNewItem({
            ...newItem,
            name: val.name,
            route: val.route,
            dosage: val.dosage,
            drug: val.code
          })}
        />

        <Stack direction="row" spacing={2}>
          <TextField label="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
          <TextField label="Refills" type="number" value={newItem.refills} onChange={(e) => setNewItem({ ...newItem, refills: Number(e.target.value) })} />
          <TextField label="Days Supply" type="number" value={newItem.supply} onChange={(e) => setNewItem({ ...newItem, supply: Number(e.target.value) })} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <ProviderPicker
            value={newItem.prescriber as Database.Provider.ID}
            onChange={(id) => setNewItem({ ...newItem, prescriber: id })}
          />
          <TextField label="Pharmacy" value={newItem.pharmacy} onChange={(e) => setNewItem({ ...newItem, pharmacy: e.target.value })} fullWidth />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField label="Written Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.written} onChange={(e) => setNewItem({ ...newItem, written: e.target.value })} />
          <TextField label="Dispensed Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.dispensed} onChange={(e) => setNewItem({ ...newItem, dispensed: e.target.value })} />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={() => setView('list')}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Entry</Button>
        </Stack>
      </Stack>
    )
  }

  // List View
  const rows = (dispenseHistory || []).map((item, idx) => ({
    id: idx,
    ...item,
    dispensedFormatted: item.dispensed ? dayjs(item.dispensed).format('MM/DD/YYYY') : '',
    writtenFormatted: item.written ? dayjs(item.written).format('MM/DD/YYYY') : '',
  }));

  return (
    <Stack spacing={2} sx={{ height: '500px', p: 1 }}>
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={() => setView('add')}>
          Add New Entry
        </Button>
      </Stack>
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'name', headerName: 'Drug', width: 200 },
            { field: 'dosage', headerName: 'Dosage', width: 100 },
            { field: 'quantity', headerName: 'Qty', width: 80 },
            { field: 'prescriber', headerName: 'Prescriber', width: 150 },
            { field: 'dispensedFormatted', headerName: 'Dispensed', width: 120 },
            {
              field: 'actions',
              headerName: '',
              width: 50,
              renderCell: (params) => (
                <IconButton onClick={() => handleDelete(params.id as number)} size="small">
                  <Icon>delete</Icon>
                </IconButton>
              )
            }
          ]}
          density="compact"
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );
};
