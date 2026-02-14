import * as React from 'react';
import { Window, Button, Stack, Label, Icon, Box, DataGrid, Autocomplete, IconButton, DatePicker } from './Core';
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
        fullWidth
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
    dispensed: Temporal.Now.plainDateISO().toString(),
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
      dispensed: Temporal.Now.plainDateISO().toString(),
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
          <Autocomplete
            freeSolo
            label="Quantity"
            fullWidth
            value={newItem.quantity.toString()}
            onInputChange={(_e, newValue) => setNewItem({ ...newItem, quantity: Number(newValue) || 0 })}
            options={['15', '30', '45', '60', '90']}
          />
          <Autocomplete
            freeSolo
            label="Refills"
            fullWidth
            value={newItem.refills.toString()}
            onInputChange={(_e, newValue) => setNewItem({ ...newItem, refills: Number(newValue) || 0 })}
            options={['0', '1', '2', '3', '4', '5']}
          />
          <Autocomplete
            freeSolo
            label="Days Supply"
            fullWidth
            value={newItem.supply.toString()}
            onInputChange={(_e, newValue) => setNewItem({ ...newItem, supply: Number(newValue) || 0 })}
            options={['7', '14', '30', '60', '90']}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <ProviderPicker
            value={newItem.prescriber as Database.Provider.ID}
            onChange={(id) => setNewItem({ ...newItem, prescriber: id })}
          />
          <Autocomplete
            freeSolo
            label="Pharmacy"
            fullWidth
            value={newItem.pharmacy}
            onInputChange={(_e, newValue) => setNewItem({ ...newItem, pharmacy: newValue })}
            options={[]}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <DatePicker
            convertString
            label="Written Date"
            value={newItem.written}
            onChange={(date: any) => setNewItem({ ...newItem, written: date })}
          />
          <DatePicker
            convertString
            label="Dispensed Date"
            value={newItem.dispensed}
            onChange={(date: any) => setNewItem({ ...newItem, dispensed: date })}
          />
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
    dispensedFormatted: item.dispensed ? Temporal.Instant.from(item.dispensed).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '',
    writtenFormatted: item.written ? Temporal.Instant.from(item.written).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '',
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
