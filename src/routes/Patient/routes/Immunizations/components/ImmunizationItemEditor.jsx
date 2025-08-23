import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import { Icon } from '@mui/material';
import {
  IMMUNIZATION_ROUTES,
  IMMUNIZATION_SITES,
  MASS_UNITS,
  VOLUME_UNITS,
  TIME_UNITS,
  validateImmunization
} from '../utils/immunizationUtils.js';

const ImmunizationItemEditor = ({ immunization, onSave, onCancel }) => {
  const [editedImmunization, setEditedImmunization] = useState({
    ...immunization,
    dose: {
      value: immunization.dose?.value || 0,
      unit: {
        mass: immunization.dose?.unit?.mass || null,
        volume: immunization.dose?.unit?.volume || null,
        time: immunization.dose?.unit?.time || null
      }
    }
  });
  const [errors, setErrors] = useState([]);

  const handleChange = (field, value) => {
    setEditedImmunization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDoseChange = (field, value) => {
    setEditedImmunization(prev => ({
      ...prev,
      dose: {
        ...prev.dose,
        [field]: value
      }
    }));
  };

  const handleUnitChange = (field, value) => {
    setEditedImmunization(prev => ({
      ...prev,
      dose: {
        ...prev.dose,
        unit: {
          ...prev.dose.unit,
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    const validationErrors = validateImmunization(editedImmunization);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSave(editedImmunization);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Paper elevation={2} style={{ padding: '16px', margin: '8px 0' }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Edit Immunization
        </Typography>
        
        {errors.length > 0 && (
          <Alert severity="error" style={{ marginBottom: '16px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Immunization Name"
              value={editedImmunization.vaccine || ''}
              disabled
              margin="normal"
              sx={{ 
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(200, 200, 200, 0.6)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date Received"
              type="date"
              value={editedImmunization.received || ''}
              onChange={(e) => handleChange('received', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Recorder"
              value={editedImmunization.recorder || ''}
              onChange={(e) => handleChange('recorder', e.target.value)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Recorded Date"
              type="date"
              value={editedImmunization.recorded || ''}
              onChange={(e) => handleChange('recorded', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={1} marginTop={2}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ImmunizationItemEditor;
