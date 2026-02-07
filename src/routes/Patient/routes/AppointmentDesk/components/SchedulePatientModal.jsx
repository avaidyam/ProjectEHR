import React, { useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl, Grid, Autocomplete } from '@mui/material';
import { Box, Button, Window, TextField, TreeView, TreeItem, Icon, Label } from 'components/ui/Core.jsx';
import { dayjs } from 'components/ui/Core.jsx';

const VISIT_TYPES = [
    "Admission",
    "Inpatient",
    "Outpatient",
    "Emergency",
    "Observation",
    "Ambulatory Surgery",
    "ED Visit",
    "Office Visit",
    "Hospital Admission",
    "Physical",
    "Hospital Discharge Followup",
    "PCP Office Visit",
    "Emergency Room"
];

const VISIT_STATUSES = [
    "Scheduled",
    "Arrived",
    "Rooming In Progress",
    "Roomed",
    "Provider In Room",
    "Compassionate Service",
    "Visit in Progress",
    "Visit Complete",
    "Completed",
    "No Show",
    "Cancelled",
    "Checked Out",
    "Signed",
    "Waiting"
];

export const SchedulePatientModal = ({ open, onClose, onSubmit, patientsDB, departments, providers, locations, appointment, currentPatientId }) => {
    const [selectedPatientId, setSelectedPatientId] = useState(appointment?.patient?.mrn || currentPatientId || null);
    const [selectedEncounterId, setSelectedEncounterId] = useState(appointment?.patient?.enc || null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formData, setFormData] = useState({
        department: appointment ? appointment.department : null,
        provider: appointment ? appointment.provider : null,
        location: appointment ? appointment.location : null,
        status: appointment ? (appointment.status || 'Scheduled') : 'Scheduled',
        date: appointment ? appointment.apptTime : dayjs('2026-01-01T08:00').format('YYYY-MM-DDTHH:mm'),
        type: appointment?.type || 'Office Visit',
        cc: appointment?.cc || '',
        notes: appointment?.notes || '',
        checkinTime: appointment?.checkinTime || '',
        checkoutTime: appointment?.checkoutTime || ''
    });

    React.useEffect(() => {
        if (open && appointment) {
            setSelectedPatientId(appointment.patient?.mrn || currentPatientId);
            setSelectedEncounterId(appointment.patient?.enc);
            setFormData({
                department: appointment.department,
                provider: appointment.provider,
                location: appointment.location,
                status: appointment.status || 'Scheduled',
                date: appointment.apptTime,
                type: appointment.type || 'Office Visit',
                cc: appointment.cc || '',
                notes: appointment.notes || '',
                checkinTime: appointment.checkinTime || '',
                checkoutTime: appointment.checkoutTime || ''
            });
            setShowAdvanced(!!appointment.checkinTime || !!appointment.checkoutTime);
        } else if (open && !appointment) {
            setSelectedPatientId(currentPatientId || null);
            setSelectedEncounterId(null);
            setFormData({
                department: null,
                provider: null,
                location: null,
                status: 'Scheduled',
                date: dayjs('2026-01-01T08:00').format('YYYY-MM-DDTHH:mm'),
                type: 'Office Visit',
                cc: '',
                notes: '',
                checkinTime: '',
                checkoutTime: ''
            });
            setShowAdvanced(false);
        }
    }, [open, appointment, currentPatientId]);

    const handleNodeSelect = (event, nodeId) => {
        if (nodeId && nodeId.startsWith('enc-')) {
            const [, patId, encId] = nodeId.split('-');
            setSelectedPatientId(patId);
            setSelectedEncounterId(encId);
        } else {
            setSelectedEncounterId(null);
        }
    };

    const handleSubmit = () => {
        if (formData.department && formData.date && selectedEncounterId) {
            onSubmit({
                patientId: selectedPatientId,
                encounterId: selectedEncounterId,
                department: formData.department,
                provider: formData.provider,
                location: formData.location,
                status: formData.status,
                date: formData.date,
                type: formData.type,
                cc: formData.cc,
                notes: formData.notes,
                id: appointment?.id,
                checkinTime: formData.checkinTime,
                checkoutTime: formData.checkoutTime
            });
            onClose();
        } else {
            alert("Please select an encounter, department, and date.");
        }
    };

    const targetPatientId = currentPatientId || selectedPatientId;
    const targetPatient = targetPatientId ? patientsDB[targetPatientId] : null;

    const footer = (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedEncounterId}
            >
                {appointment ? "Save Changes" : "Schedule"}
            </Button>
        </Box>
    );

    return (
        <Window
            open={open}
            onClose={onClose}
            title={appointment ? "Edit Appointment" : "Schedule Patient"}
            footer={footer}
            fullWidth
            maxWidth="md"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
                {/* Encounter Selection Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Label variant="subtitle2" color="primary">Linked Encounter</Label>
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, maxHeight: 200, overflowY: 'auto', bgcolor: 'background.paper' }}>
                        {targetPatient ? (
                            <TreeView
                                aria-label="encounter navigator"
                                defaultCollapseIcon={<Icon>expand_more</Icon>}
                                defaultExpandIcon={<Icon>chevron_right</Icon>}
                                onSelectedItemsChange={handleNodeSelect}
                                selectedItems={selectedEncounterId ? [`enc-${targetPatientId}-${selectedEncounterId}`] : []}
                            >
                                {!!targetPatient.encounters && Object.values(targetPatient.encounters).map((enc) => (
                                    <TreeItem
                                        key={`enc-${targetPatient.id}-${enc.id}`}
                                        itemId={`enc-${targetPatient.id}-${enc.id}`}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                                                <Label variant="body2" sx={{ fontWeight: 'bold' }}>Encounter {enc.id}</Label>
                                                <Label variant="caption" color="textSecondary">{enc.status} • {enc.startDate}</Label>
                                            </Box>
                                        }
                                    />
                                ))}
                            </TreeView>
                        ) : (
                            <Label color="textSecondary">No patient selected.</Label>
                        )}
                    </Box>
                </Box>

                {/* Schedule Details Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Label variant="subtitle2" color="primary">Appointment Details</Label>

                    <Grid container spacing={2}>
                        {/* Department - Autocomplete (Strict) */}
                        <Grid item xs={6}>
                            <Autocomplete
                                options={departments || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={departments?.find(d => d.id === formData.department) || null}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({ ...prev, department: newValue ? newValue.id : null }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Department" size="small" />
                                )}
                            />
                        </Grid>

                        {/* Status - Autocomplete (Strict) */}
                        <Grid item xs={6}>
                            <Autocomplete
                                options={VISIT_STATUSES}
                                value={formData.status}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({ ...prev, status: newValue || 'Scheduled' }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Status" size="small" />
                                )}
                            />
                        </Grid>

                        {/* Provider - Autocomplete (Strict) */}
                        <Grid item xs={6}>
                            <Autocomplete
                                options={providers || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={providers?.find(p => p.id === formData.provider) || null}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({ ...prev, provider: newValue ? newValue.id : null }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Provider" size="small" />
                                )}
                            />
                        </Grid>

                        {/* Location - Autocomplete (Strict) */}
                        <Grid item xs={6}>
                            <Autocomplete
                                options={locations || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={locations?.find(l => l.id === formData.location) || null}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({ ...prev, location: newValue ? newValue.id : null }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Location" size="small" />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <Autocomplete
                                freeSolo
                                options={VISIT_TYPES}
                                value={formData.type}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({ ...prev, type: newValue || '' }));
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setFormData(prev => ({ ...prev, type: newInputValue || '' }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Appointment Type"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Appointment Time"
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Chief Complaint (CC)"
                                value={formData.cc}
                                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                startIcon={<Icon>{showAdvanced ? 'expand_less' : 'expand_more'}</Icon>}
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                size="small"
                            >
                                Advanced Options
                            </Button>
                        </Grid>

                        {showAdvanced && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Check-in Time"
                                        type="datetime-local"
                                        value={formData.checkinTime}
                                        onChange={(e) => setFormData({ ...formData, checkinTime: e.target.value })}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Check-out Time"
                                        type="datetime-local"
                                        value={formData.checkoutTime}
                                        onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </Box>
        </Window>
    );
};
