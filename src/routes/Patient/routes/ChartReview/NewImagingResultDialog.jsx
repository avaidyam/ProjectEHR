import React, { useState } from 'react';
import {
    Box,
    Button,
    Window,
    Label,
    TextField,
    Icon
} from 'components/ui/Core';
import { Grid, Select, MenuItem } from '@mui/material';

export const NewImagingResultDialog = ({ open, onClose, onSave }) => {
    const [orderedDate, setOrderedDate] = useState(new Date().toISOString().slice(0, 10));
    const [exam, setExam] = useState('');
    const [status, setStatus] = useState('Final Result');
    const [provider, setProvider] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState('');

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

    const handleSave = () => {
        if (!exam || !imageBase64) return;

        const newDoc = {
            kind: "Imaging",
            data: {
                "patientSharing": "Shared",
                "orderedDate": new Date(orderedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                "status": status,
                "statusDate": new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
                "accessionNumber": "",
                "exam": exam,
                "abnormal": "",
                "acuity": "",
                "encounter": "Office Visit",
                "provider": provider,
                "image": imageBase64
            }
        };

        onSave(newDoc);
        onClose();
        // Reset form
        setExam('');
        setProvider('');
        setImageBase64('');
        setImagePreview(null);
    };

    return (
        <Window
            open={open}
            onClose={onClose}
            title="Add New Imaging Result"
            fullWidth
            maxWidth="md"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            type="date"
                            label="Ordered Date"
                            value={orderedDate}
                            onChange={(e) => setOrderedDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Exam Name"
                            value={exam}
                            onChange={(e) => setExam(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="Final Result">Final Result</MenuItem>
                            <MenuItem value="Preliminary">Preliminary</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            fullWidth
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
                            Upload Image
                        </Button>
                    </label>
                    {imagePreview && (
                        <Box sx={{ mt: 2 }}>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!exam || !imageBase64}>Save</Button>
                </Box>
            </Box>
        </Window>
    );
};
