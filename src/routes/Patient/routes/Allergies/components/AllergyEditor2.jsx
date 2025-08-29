// AllergyEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Paper
} from '@mui/material';
import { DatePicker } from 'components/ui/Core.jsx'

const reactionOptions = [
  'Rash',
  'Anaphylaxis',
  'Hives',
  'Itching',
  'Swelling',
  'Nausea',
  'Vomiting',
  'Dyspnea',
  'Hypotension',
  'Other, see comment',
  'Atopic Dermatitis', // Added from screenshot
  'Blood Pressure Drop',
  'Contact Dermatitis',
  'Cough',
  'Diarrhea',
  'Dizzy',
  'Excessive drowsiness',
  'GI Cramps',
  'GI upset',
  'Hallucinations',
  'Headache',
  'Loss of Consciousness',
  'Muscle Myalgia',
  'Ocular Itching and/or Swelling',
  'Palpitations',
  'Rhinitis',
  'GI upset', // From new screenshot
  'Nausea & Vomiting', // From new screenshot
  'GI upset', // From new screenshot
  'Nausea & Vomiting', // From new screenshot
];
const severityOptions = ['Low', 'Moderate', 'High', 'Not Specified'];
const reactionTypeOptions = ['Immediate', 'Delayed', 'Unknown', 'Systemic', 'Topical', 'Intolerance', 'Not Verified'];

const AllergyEditor2 = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    agent: '',
    type: '',
    reaction: '',
    severity: '',
    reactionType: '',
    onsetDate: null,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        onsetDate: initialData.onsetDate ? new Date(initialData.onsetDate) : null
      });
    } else {
      setFormData({
        agent: '',
        type: '',
        reaction: '',
        severity: '',
        reactionType: '',
        onsetDate: null,
        notes: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      onsetDate: date
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      onsetDate: formData.onsetDate ? formData.onsetDate.toISOString().split('T')[0] : null // Format date to YYYY-MM-DD
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, borderTop: '4px solid #1976d2' }}> {/* Added a top border for visual separation */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Agent: {initialData?.agent}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Allergen Types: {initialData?.type}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="reaction-label">Reactions</InputLabel>
            <Select
              labelId="reaction-label"
              id="reaction"
              name="reaction"
              value={formData.reaction}
              label="Reactions"
              onChange={handleChange}
            >
              {reactionOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="severity-label">Severity</InputLabel>
            <Select
              labelId="severity-label"
              id="severity"
              name="severity"
              value={formData.severity}
              label="Severity"
              onChange={handleChange}
            >
              {severityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="Noted"
            value={formData.onsetDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="reaction-type-label">Reaction Type</InputLabel>
            <Select
              labelId="reaction-type-label"
              id="reactionType"
              name="reactionType"
              value={formData.reactionType}
              label="Reaction Type"
              onChange={handleChange}
            >
              {reactionTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Comments"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
            size="small"
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} color="primary" sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Accept
        </Button>
      </Box>
    </Paper>
  );
};

export default AllergyEditor;