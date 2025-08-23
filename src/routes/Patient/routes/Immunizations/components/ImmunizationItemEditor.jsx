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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Given By (Practitioner)"
              value={editedImmunization.given_by || ''}
              onChange={(e) => handleChange('given_by', e.target.value)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facility"
              value={editedImmunization.facility || ''}
              onChange={(e) => handleChange('facility', e.target.value)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Dose Value"
              type="number"
              value={editedImmunization.dose?.value || ''}
              onChange={(e) => handleDoseChange('value', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Mass Unit</InputLabel>
              <Select
                value={editedImmunization.dose?.unit?.mass || ''}
                onChange={(e) => handleUnitChange('mass', e.target.value)}
                label="Mass Unit"
              >
                <MenuItem value="">None</MenuItem>
                {Object.entries(MASS_UNITS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Volume Unit</InputLabel>
              <Select
                value={editedImmunization.dose?.unit?.volume || ''}
                onChange={(e) => handleUnitChange('volume', e.target.value)}
                label="Volume Unit"
              >
                <MenuItem value="">None</MenuItem>
                {Object.entries(VOLUME_UNITS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Time Unit</InputLabel>
              <Select
                value={editedImmunization.dose?.unit?.time || ''}
                onChange={(e) => handleUnitChange('time', e.target.value)}
                label="Time Unit"
              >
                <MenuItem value="">None</MenuItem>
                {Object.entries(TIME_UNITS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Site"
              value={editedImmunization.site || ''}
              onChange={(e) => handleChange('site', e.target.value)}
              margin="normal"
              placeholder="e.g., Left deltoid, Right thigh"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Route</InputLabel>
              <Select
                value={editedImmunization.route || ''}
                onChange={(e) => handleChange('route', e.target.value)}
                label="Route"
              >
                <MenuItem value="">Select route</MenuItem>
                {Object.entries(IMMUNIZATION_ROUTES).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Lot Number"
              value={editedImmunization.lot || ''}
              onChange={(e) => handleChange('lot', e.target.value)}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Manufacturer"
              value={editedImmunization.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              margin="normal"
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
