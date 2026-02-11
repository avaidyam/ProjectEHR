import * as React from 'react';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Box, Button, Window, TextField } from './Core';
import * as Database from '../contexts/Database';

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

interface CreateEncounterDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: EncounterFormData) => void;
    departments: Database.Department[];
    providers: Database.Provider[];
}

interface EncounterFormData {
    startDate: string;
    endDate: string;
    department: string;
    type: string;
    provider: string;
    specialty: string;
    status: string;
}

export const CreateEncounterDialog: React.FC<CreateEncounterDialogProps> = ({ open, onClose, onSubmit, departments, providers }) => {
    const [formData, setFormData] = React.useState<EncounterFormData>({
        startDate: new Date().toISOString().slice(0, 16), // Default to now
        endDate: new Date(new Date().getTime() + 30 * 60000).toISOString().slice(0, 16), // Default +30m
        department: '',
        type: 'Office Visit',
        provider: '',
        specialty: '',
        status: 'Scheduled'
    });

    const handleChange = (field: keyof EncounterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        // Basic validation
        if (!formData.department || !formData.provider) {
            alert("Please fill in Department and Provider");
            return;
        }
        onSubmit(formData);
    };

    const footer = (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
            <Button variant="outlined" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
                Create
            </Button>
        </Box>
    );

    return (
        <Window
            open={open}
            onClose={onClose}
            title="Create New Encounter"
            footer={footer}
            fullWidth
            maxWidth="sm"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                    label="Start Date/Time"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('startDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="End Date/Time"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('endDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                        value={formData.department}
                        label="Department"
                        onChange={(e) => handleChange('department', e.target.value as string)}
                    >
                        {departments && departments.map((dept, idx) => (
                            <MenuItem key={idx} value={dept.name}>{dept.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={formData.type}
                        label="Type"
                        onChange={(e) => handleChange('type', e.target.value as string)}
                    >
                        {VISIT_TYPES.map((type, idx) => (
                            <MenuItem key={idx} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Specialty"
                    value={formData.specialty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('specialty', e.target.value)}
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Provider</InputLabel>
                    <Select
                        value={formData.provider}
                        label="Provider"
                        onChange={(e) => handleChange('provider', e.target.value as string)}
                    >
                        {providers && providers
                            .filter(prov => {
                                if (!formData.department) return true;
                                const selectedDept = departments.find(d => d.name === formData.department);
                                return selectedDept ? prov.department === selectedDept.id : true;
                            })
                            .map((prov, idx) => (
                                <MenuItem key={idx} value={prov.name}>{prov.name}</MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Box>
        </Window>
    );
};
