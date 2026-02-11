import React, { useState } from 'react';
import { Window, Button, Stack, Label, Icon, Box, TextField, dayjs, DataGrid, Autocomplete, IconButton } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';

interface PDMPManagerWindowProps {
    open: boolean;
    onClose: () => void;
    mrn: string;
    encounterId: string;
}

export const PDMPManagerWindow: React.FC<PDMPManagerWindowProps> = ({ open, onClose, mrn, encounterId }) => {
    // eslint-disable-next-line
    const [db] = (useDatabase() as any)() as [Database.Root, any];

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

interface DrugPickerProps {
    value: {
        name: string;
        route: string;
        dosage: string;
        code: string;
    };
    onChange: (value: { name: string; route: string; dosage: string; code: string }) => void;
}

// ... DrugPicker and ProviderPicker (unchanged) ...
const DrugPicker: React.FC<DrugPickerProps> = ({ value, onChange }) => {
    const [orderables] = (useDatabase() as any).orderables() as [any, any];

    const selectedDrug = orderables?.rxnorm?.find((d: any) => d.name === value.name) || null;
    const selectedRoute = value.route || null;

    const drugOptions = orderables?.rxnorm || [];
    const routeOptions = selectedDrug ? Object.keys(selectedDrug.route || {}) : [];
    const dosageOptions = (selectedDrug && selectedRoute && selectedDrug.route[selectedRoute])
        ? Object.entries(selectedDrug.route[selectedRoute]).map(([code, label]) => ({ code: code as string, label: label as string }))
        : [];

    const currentDosageOption = dosageOptions.find((d: any) => d.label === value.dosage) || null;

    const handleNameChange = (e: any, val: any) => {
        onChange({
            name: val ? val.name : '',
            route: '',
            dosage: '',
            code: ''
        });
    };

    const handleRouteChange = (e: any, val: string | null) => {
        onChange({
            ...value,
            route: val || '',
            dosage: '',
            code: ''
        });
    };

    const handleDosageChange = (e: any, val: { code: string; label: string } | null) => {
        onChange({
            ...value,
            dosage: val ? val.label : '',
            code: val ? val.code : ''
        });
    };

    return (
        <Stack direction="row" spacing={2}>
            <Autocomplete
                // label="Drug Name"
                options={drugOptions}
                getOptionLabel={(option: any) => option.name || ''}
                value={selectedDrug}
                onChange={handleNameChange}
                renderInput={(params: any) => <TextField {...params} label="Drug Name" />}
            />
            <Autocomplete
                // label="Route"
                options={routeOptions}
                value={selectedRoute}
                onChange={handleRouteChange}
                disabled={!selectedDrug}
                fullWidth
                renderInput={(params: any) => <TextField {...params} label="Route" />}
            />
            <Autocomplete
                // label="Dosage"
                options={dosageOptions}
                getOptionLabel={(option: { label: string }) => option.label || ''}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={currentDosageOption}
                onChange={handleDosageChange}
                disabled={!selectedRoute}
                fullWidth
                renderInput={(params: any) => <TextField {...params} label="Dosage" />}
            />
        </Stack>
    );
};

interface ProviderPickerProps {
    value: string;
    onChange: (value: string) => void;
}

const ProviderPicker: React.FC<ProviderPickerProps> = ({ value, onChange }) => {
    const [providers] = (useDatabase() as any).providers() as [Database.Provider[], any];
    const selectedProvider = providers?.find((p: any) => p.id === value) || null;

    return (
        <Autocomplete
            // label="Prescriber"
            options={providers || []}
            getOptionLabel={(option: Database.Provider) => option.name || ''}
            isOptionEqualToValue={(option: any, val: any) => option.id === val.id}
            value={selectedProvider}
            onChange={(_: any, val: any) => onChange(val ? val.id : '')}
            fullWidth
            renderInput={(params: any) => <TextField {...params} label="Prescriber" />}
        />
    );
};

interface PDMPManagerContentProps {
    mrn: string;
    encounterId: string;
    onClose: () => void;
}

const PDMPManagerContent: React.FC<PDMPManagerContentProps> = ({ mrn, encounterId, onClose }) => {
    // cast to any to access dynamic paths in teaful if types are not precise enough
    const dbHook = useDatabase() as any;
    const [dispenseHistory, setDispenseHistory] = dbHook.patients[mrn].encounters[encounterId].dispenseHistory();

    const [view, setView] = useState<'list' | 'add'>('list');

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
        setDispenseHistory((prev: any[]) => [...(prev || []), entry]);
        setView('list');
        setNewItem({
            name: '', route: '', dosage: '', drug: '',
            quantity: 0, refills: 0, supply: 0, prescriber: '', pharmacy: '',
            written: '',
            dispensed: new Date().toISOString().split('T')[0],
        });
    };

    const handleDelete = (id: number) => {
        setDispenseHistory((prev: any[]) => prev.filter((_: any, idx: number) => idx !== id));
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
                    <TextField label="Quantity" type="number" value={newItem.quantity} onChange={(e: any) => setNewItem({ ...newItem, quantity: e.target.value })} />
                    <TextField label="Refills" type="number" value={newItem.refills} onChange={(e: any) => setNewItem({ ...newItem, refills: e.target.value })} />
                    <TextField label="Days Supply" type="number" value={newItem.supply} onChange={(e: any) => setNewItem({ ...newItem, supply: e.target.value })} />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <ProviderPicker
                        value={newItem.prescriber}
                        onChange={(id: string) => setNewItem({ ...newItem, prescriber: id })}
                    />
                    <TextField label="Pharmacy" value={newItem.pharmacy} onChange={(e: any) => setNewItem({ ...newItem, pharmacy: e.target.value })} fullWidth />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField label="Written Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.written} onChange={(e: any) => setNewItem({ ...newItem, written: e.target.value })} />
                    <TextField label="Dispensed Date" type="date" InputLabelProps={{ shrink: true }} value={newItem.dispensed} onChange={(e: any) => setNewItem({ ...newItem, dispensed: e.target.value })} />
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={() => setView('list')}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Entry</Button>
                </Stack>
            </Stack>
        )
    }

    // List View
    const rows = (dispenseHistory || []).map((item: any, idx: number) => ({
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
                            renderCell: (params: any) => (
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
