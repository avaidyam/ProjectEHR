import React, { useState } from 'react';
import { Window, Button, Stack, Label, Icon, Box, TextField, dayjs, DataGrid, Autocomplete, IconButton } from 'components/ui/Core';
import { useDatabase } from 'components/contexts/PatientContext';

export const PDMPManagerWindow = ({ open, onClose, mrn, encounterId }) => {
    // eslint-disable-next-line
    const [db] = useDatabase()();

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

// ... DrugPicker and ProviderPicker (unchanged) ...
const DrugPicker = ({ value, onChange }) => {
    const [orderables] = useDatabase().orderables();

    const selectedDrug = orderables?.rxnorm?.find(d => d.name === value.name) || null;
    const selectedRoute = value.route || null;

    const drugOptions = orderables?.rxnorm || [];
    const routeOptions = selectedDrug ? Object.keys(selectedDrug.route || {}) : [];
    const dosageOptions = (selectedDrug && selectedRoute && selectedDrug.route[selectedRoute])
        ? Object.entries(selectedDrug.route[selectedRoute]).map(([code, label]) => ({ code, label }))
        : [];

    const currentDosageOption = dosageOptions.find(d => d.label === value.dosage) || null;

    const handleNameChange = (e, val) => {
        onChange({
            name: val ? val.name : '',
            route: '',
            dosage: '',
            code: ''
        });
    };

    const handleRouteChange = (e, val) => {
        onChange({
            ...value,
            route: val || '',
            dosage: '',
            code: ''
        });
    };

    const handleDosageChange = (e, val) => {
        onChange({
            ...value,
            dosage: val ? val.label : '',
            code: val ? val.code : ''
        });
    };

    return (
        <Stack direction="row" spacing={2}>
            <Autocomplete
                label="Drug Name"
                options={drugOptions}
                getOptionLabel={(option) => option.name || ''}
                value={selectedDrug}
                onChange={handleNameChange}
                renderInput={(params) => <TextField {...params} label="Drug Name" />}
            />
            <Autocomplete
                label="Route"
                options={routeOptions}
                value={selectedRoute}
                onChange={handleRouteChange}
                disabled={!selectedDrug}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Route" />}
            />
            <Autocomplete
                label="Dosage"
                options={dosageOptions}
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={currentDosageOption}
                onChange={handleDosageChange}
                disabled={!selectedRoute}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Dosage" />}
            />
        </Stack>
    );
};

const ProviderPicker = ({ value, onChange }) => {
    const [providers] = useDatabase().providers();
    const selectedProvider = providers?.find(p => p.id === value) || null;

    return (
        <Autocomplete
            label="Prescriber"
            options={providers || []}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            value={selectedProvider}
            onChange={(e, val) => onChange(val ? val.id : '')}
            fullWidth
        />
    );
};

const PDMPManagerContent = ({ mrn, encounterId, onClose }) => {
    const dbHook = useDatabase();
    const [dispenseHistory, setDispenseHistory] = dbHook.patients[mrn].encounters[encounterId].dispenseHistory();

    const [view, setView] = useState('list');

    const [newItem, setNewItem] = useState({
        name: '',
        route: '',
        dosage: '',
        drug: '', // Code
        quantity: 0,
        refills: 0,
        supply: 0,
        prescriber: '',
        pharmacy: '',
        written: '',
        dispensed: new Date().toISOString().split('T')[0],
    });

    const handleSave = () => {
        // eslint-disable-next-line no-unused-vars
        const { route, ...entryData } = newItem;
        const entry = {
            ...entryData,
            quantity: Number(newItem.quantity),
            refills: Number(newItem.refills),
            supply: Number(newItem.supply),
        };
        setDispenseHistory(prev => [...(prev || []), entry]);
        setView('list');
        setNewItem({
            name: '', route: '', dosage: '', drug: '',
            quantity: 0, refills: 0, supply: 0, prescriber: '', pharmacy: '',
            written: '',
            dispensed: new Date().toISOString().split('T')[0],
        });
    };

    const handleDelete = (id) => {
        setDispenseHistory(prev => prev.filter((_, idx) => idx !== id));
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
                    <TextField label="Quantity" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} />
                    <TextField label="Refills" type="number" value={newItem.refills} onChange={e => setNewItem({ ...newItem, refills: e.target.value })} />
                    <TextField label="Days Supply" type="number" value={newItem.supply} onChange={e => setNewItem({ ...newItem, supply: e.target.value })} />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <ProviderPicker
                        value={newItem.prescriber}
                        onChange={(id) => setNewItem({ ...newItem, prescriber: id })}
                    />
                    <TextField label="Pharmacy" value={newItem.pharmacy} onChange={e => setNewItem({ ...newItem, pharmacy: e.target.value })} fullWidth />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField label="Written Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.written} onChange={e => setNewItem({ ...newItem, written: e.target.value })} />
                    <TextField label="Dispensed Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.dispensed} onChange={e => setNewItem({ ...newItem, dispensed: e.target.value })} />
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
                                <IconButton onClick={() => handleDelete(params.id)} size="small">
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

// Ensure default export or named export matches typical usage
export default PDMPManagerWindow;
