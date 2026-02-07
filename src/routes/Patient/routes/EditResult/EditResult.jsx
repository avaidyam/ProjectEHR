import React, { useState } from 'react';
import {
    Box,
    Button,
    Label,
    TextField,
    IconButton,
    Icon,
    DataGrid,
    Divider
} from 'components/ui/Core';
import { Autocomplete, Grid, createFilterOptions } from '@mui/material';
import { useSplitView } from 'components/contexts/SplitViewContext';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';

const filterOptions = createFilterOptions({ limit: 50 });

const ComponentEditCell = ({ componentList, id, value, field, api }) => {
    const handleChange = (event, newValue) => {
        api.setEditCellValue({ id, field, value: newValue ? newValue.id : null });
        api.stopCellEditMode({ id, field });
    };
    return (
        <Autocomplete
            options={componentList}
            filterOptions={filterOptions}
            getOptionLabel={(option) => option.label}
            value={componentList.find(c => c.id === value) ?? null}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} fullWidth autoFocus />}
            fullWidth
            disableClearable
        />
    );
};

export const EditResult = ({ ...props }) => {
    const { closeTab } = useSplitView();
    const [orderables] = useDatabase().orderables()
    const [providers] = useDatabase().providers()
    const { useEncounter } = usePatient();
    const [labs, setLabs] = useEncounter().labs();
    const [imaging, setImaging] = useEncounter().labs();
    const procedures = Object.entries(orderables.procedures).map(([key, value]) => ({ label: value, id: key }));
    const componentList = Object.entries(orderables.components).map(([key, value]) => ({ label: value, id: key }));

    const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 16));
    const [selectedTest, setSelectedTest] = useState(null);
    const [results, setResults] = useState([]);

    // Imaging specific state
    const [status, setStatus] = useState('Final Result');
    const [provider, setProvider] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');

    const handleAddRow = () => {
        setResults([...results, { id: Date.now(), component: null, value: '', units: '', low: '', high: '', comment: '' }]);
    };

    const handleRemoveRow = (id) => {
        setResults(results.filter(r => r.id !== id));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        closeTab("Edit Result", "main");
    };

    const handleSave = () => {
        if (!selectedTest && !imageBase64) return;
        if (imageBase64) { // Imaging
            setImaging(prev => [...prev, {
                "date": new Date(testDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                "status": status,
                "statusDate": new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                "test": selectedTest ? selectedTest.label : "Unknown Exam",
                "abnormal": false,
                "acuity": "",
                "provider": provider,
                "image": imageBase64
            }])
        } else { // Labs
            setLabs(prev => [...[prev, {
                "date": new Date(testDate).toLocaleString(),
                "test": selectedTest ? selectedTest.label : "Unknown Test",
                "status": "Completed",
                "abnormal": false,
                "expectedDate": null,
                "expirationDate": null,
                "components": results.map(r => {
                    const comp = componentList.find(c => c.id === r.component);
                    return {
                        name: comp ? comp.label : '',
                        value: r.value,
                        units: r.units,
                        low: r.low,
                        high: r.high,
                        comment: r.comment
                    };
                }).filter(r => r.name !== ''),
                "collected": null,
                "resulted": null,
                "comment": null,
                "resultingAgency": null
            }]])
        }
        closeTab("Edit Result", "main");
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1 }}>
                <Label variant="h6" color="primary">New Result</Label>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            type="datetime-local"
                            label="Date/Time"
                            value={testDate}
                            onChange={(e) => setTestDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            options={procedures}
                            filterOptions={filterOptions}
                            getOptionLabel={(option) => option.label}
                            value={selectedTest}
                            onChange={(event, newValue) => setSelectedTest(newValue)}
                            renderInput={(params) => <TextField {...params} label="Test / Exam Name" fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            options={["Final Result", "Preliminary"]}
                            value={status}
                            onChange={(event, newValue) => setStatus(newValue)}
                            renderInput={(params) => <TextField {...params} label="Status" fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Autocomplete
                            options={providers}
                            getOptionLabel={(option) => option.name}
                            value={providers.find(p => p.name === provider) || null}
                            onChange={(event, newValue) => setProvider(newValue ? newValue.name : '')}
                            renderInput={(params) => <TextField {...params} label="Provider" fullWidth />}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
                    <input
                        accept="image/*,.dicom"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        multiple={false}
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<Icon>upload</Icon>}>
                            Upload Image (for Imaging)
                        </Button>
                    </label>
                    {imagePreview && (
                        <Box sx={{ mt: 2 }}>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        </Box>
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />
                <Label>Lab Components (Optional)</Label>
                <div style={{ height: 300, width: '100%', marginTop: 8 }}>
                    <DataGrid
                        rows={results}
                        hideFooter
                        disableColumnMenu
                        disableColumnSorting
                        columns={[
                            {
                                field: 'component',
                                headerName: 'Component',
                                width: 200,
                                editable: true,
                                renderCell: (params) => {
                                    const comp = componentList.find(c => c.id === params.value);
                                    return comp ? comp.label : params.value;
                                },
                                renderEditCell: (params) => <ComponentEditCell {...params} componentList={componentList} />
                            },
                            { field: 'value', headerName: 'Value', width: 120, editable: true },
                            { field: 'units', headerName: 'Units', width: 100, editable: true },
                            { field: 'low', headerName: 'Low', width: 100, editable: true },
                            { field: 'high', headerName: 'High', width: 100, editable: true },
                            { field: 'comment', headerName: 'Comment', flex: 1, editable: true },
                            {
                                field: 'actions',
                                headerName: '',
                                width: 50,
                                renderCell: (params) => (
                                    <IconButton onClick={() => handleRemoveRow(params.id)} color="error" size="small">
                                        <Icon>delete</Icon>
                                    </IconButton>
                                )
                            }
                        ]}
                        processRowUpdate={(newRow) => {
                            setResults(results.map(r => r.id === newRow.id ? newRow : r));
                            return newRow;
                        }}
                    />
                </div>

                <Button startIcon={<Icon>add</Icon>} onClick={handleAddRow} variant="outlined" sx={{ alignSelf: 'start', mt: 2 }}>
                    Add Component
                </Button>
            </Box>

            <Box sx={{
                p: 1,
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'background.paper',
                mt: 'auto'
            }}>
                <Button variant="outlined" color="success" startIcon={<Icon>check</Icon>} onClick={handleSave} disabled={!selectedTest && !imageBase64}>Accept</Button>
                <Button variant="outlined" color="error" startIcon={<Icon>close</Icon>} onClick={handleCancel}>Cancel</Button>
            </Box>
        </Box>
    );
};
