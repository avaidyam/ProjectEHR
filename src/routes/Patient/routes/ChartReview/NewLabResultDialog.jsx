import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Window,
    Label,
    TextField,
    IconButton,
    Icon,
    Divider
} from 'components/ui/Core';
import { Autocomplete, Grid, createFilterOptions } from '@mui/material';
import orderables from 'util/data/orderables.json';

const procedures = Object.entries(orderables.procedures).map(([key, value]) => ({ label: value, id: key }));
const componentList = Object.entries(orderables.components).map(([key, value]) => ({ label: value, id: key }));

const filterOptions = createFilterOptions({
    limit: 50,
});

export const NewLabResultDialog = ({ open, onClose, onSave }) => {
    const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 16));
    const [selectedTest, setSelectedTest] = useState(null);
    const [results, setResults] = useState([
        { component: null, value: '', units: '', low: '', high: '', comment: '' }
    ]);

    const handleAddRow = () => {
        setResults([...results, { component: null, value: '', units: '', low: '', high: '', comment: '' }]);
    };

    const handleRemoveRow = (index) => {
        const newResults = [...results];
        newResults.splice(index, 1);
        setResults(newResults);
    };

    const handleRowChange = (index, field, value) => {
        const newResults = [...results];
        newResults[index][field] = value;
        setResults(newResults);
    };

    const handleSave = () => {
        if (!selectedTest) return;

        const newDoc = {
            kind: "Lab",
            data: {
                "Date/Time": new Date(testDate).toLocaleString(),
                "Test": selectedTest.label,
                "Status": "Completed",
                "Abnormal?": "No", // logic could be added here
                "Expected Date": "",
                "Expiration": "N/A",
                "Encounter Provider": ""
            },
            labResults: results.map(r => ({
                name: r.component ? r.component.label : '',
                value: r.value,
                units: r.units,
                low: r.low,
                high: r.high,
                comment: r.comment
            })).filter(r => r.name !== '')
        };

        onSave(newDoc);
        onClose();
        // Reset form
        setSelectedTest(null);
        setResults([{ component: null, value: '', units: '', low: '', high: '', comment: '' }]);
    };

    return (
        <Window
            open={open}
            onClose={onClose}
            title="Add New Lab Result"
            fullWidth
            maxWidth="lg"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
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
                            renderInput={(params) => <TextField {...params} label="Test Name" fullWidth />}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Label>Results</Label>

                {results.map((row, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <Box sx={{ flex: 2 }}>
                            <Autocomplete
                                options={componentList}
                                filterOptions={filterOptions}
                                getOptionLabel={(option) => option.label}
                                value={row.component}
                                onChange={(event, newValue) => handleRowChange(index, 'component', newValue)}
                                renderInput={(params) => <TextField {...params} label="Component" size="small" />}
                            />
                        </Box>
                        <TextField
                            label="Value"
                            value={row.value}
                            onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Units"
                            value={row.units}
                            onChange={(e) => handleRowChange(index, 'units', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Low"
                            value={row.low}
                            onChange={(e) => handleRowChange(index, 'low', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="High"
                            value={row.high}
                            onChange={(e) => handleRowChange(index, 'high', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Comment"
                            value={row.comment}
                            onChange={(e) => handleRowChange(index, 'comment', e.target.value)}
                            size="small"
                            sx={{ flex: 2 }}
                        />
                        <IconButton onClick={() => handleRemoveRow(index)} color="error">
                            <Icon>delete</Icon>
                        </IconButton>
                    </Box>
                ))}

                <Button startIcon={<Icon>add</Icon>} onClick={handleAddRow} variant="outlined" sx={{ alignSelf: 'start' }}>
                    Add Component
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!selectedTest}>Save</Button>
                </Box>
            </Box>
        </Window>
    );
};
