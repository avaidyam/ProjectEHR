import React, { useState } from 'react';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
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

export const SchedulePatientModal = ({ open, onClose, onSubmit, patientsDB, departments }) => {
    const [step, setStep] = useState(1);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedEncounterId, setSelectedEncounterId] = useState(null);
    const [formData, setFormData] = useState({
        department: '',
        date: dayjs('2026-01-01T08:00').format('YYYY-MM-DDTHH:mm'),
        type: 'Office Visit',
        cc: '',
        notes: ''
    });

    const handleNodeSelect = (event, nodeId) => {
        // IDs are formatted like "patient-123" or "enc-123-456"
        if (nodeId && nodeId.startsWith('enc-')) {
            const [, patId, encId] = nodeId.split('-');
            setSelectedPatientId(patId);
            setSelectedEncounterId(encId);
        } else {
            setSelectedPatientId(null);
            setSelectedEncounterId(null);
        }
    };

    const handleNext = () => {
        if (selectedEncounterId) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = () => {
        if (formData.department && formData.date) {
            onSubmit({
                patientId: selectedPatientId,
                encounterId: selectedEncounterId,
                department: formData.department,
                date: formData.date,
                type: formData.type,
                cc: formData.cc,
                notes: formData.notes
            });
            onClose();
            // Reset state
            setStep(1);
            setSelectedPatientId(null);
            setSelectedEncounterId(null);
            setFormData({
                department: '',
                date: dayjs('2026-01-01T08:00').format('YYYY-MM-DDTHH:mm'),
                type: 'Office Visit',
                cc: '',
                notes: ''
            });
        } else {
            alert("Please select a department and date.");
        }
    };

    // Tree View for Step 1
    const renderStep1 = () => (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 300 }}>
            <Label variant="subtitle1" gutterBottom>Select a Patient and Encounter:</Label>
            <TreeView
                aria-label="patient navigator"
                defaultCollapseIcon={<Icon>expand_more</Icon>}
                defaultExpandIcon={<Icon>chevron_right</Icon>}
                onSelectedItemsChange={handleNodeSelect}
            >
                {Object.values(patientsDB).map((patient) => (
                    <TreeItem
                        key={`patient-${patient.id}`}
                        itemId={`patient-${patient.id}`}
                        label={`${patient.lastName}, ${patient.firstName} (MRN: ${patient.id})`}
                    >
                        {!!patient.encounters && Object.values(patient.encounters).map((enc) => (
                            <TreeItem
                                key={`enc-${patient.id}-${enc.id}`}
                                itemId={`enc-${patient.id}-${enc.id}`}
                                label={`Encounter ${enc.id} - ${enc.status}`}
                            />
                        ))}
                    </TreeItem>
                ))}
            </TreeView>
        </Box>
    );

    // Form for Step 2
    const renderStep2 = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Label variant="subtitle1" gutterBottom>Schedule Details:</Label>
            <Box>
                <Label variant="body2">
                    Patient: {patientsDB[selectedPatientId]?.lastName}, {patientsDB[selectedPatientId]?.firstName}
                </Label>
                <Label variant="body2" sx={{ mb: 2 }}>
                    Encounter: {selectedEncounterId}
                </Label>
            </Box>

            <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                    value={formData.department}
                    label="Department"
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                    {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                    value={formData.type}
                    label="Appointment Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                    {VISIT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Appointment Time"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                label="Chief Complaint (CC)"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                fullWidth
            />

            <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
            />
        </Box>
    );

    const footer = (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            {step === 2 && <Button variant="outlined" onClick={handleBack}>Back</Button>}
            {step === 1 ? (
                <Button variant="contained" onClick={handleNext} disabled={!selectedEncounterId}>Next</Button>
            ) : (
                <Button variant="contained" onClick={handleSubmit}>Schedule</Button>
            )}
        </Box>
    );

    return (
        <Window
            open={open}
            onClose={onClose}
            title="Schedule Patient"
            footer={footer}
            fullWidth
            maxWidth="sm"
        >
            {step === 1 ? renderStep1() : renderStep2()}
        </Window>
    );
};
