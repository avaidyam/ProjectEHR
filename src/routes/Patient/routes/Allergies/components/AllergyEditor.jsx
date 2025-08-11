// 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Grid
} from '@mui/material';

const severityLevels = ['Low', 'Moderate', 'High', 'Not Specified'];
const reactionTypes = ['Immediate', 'Delayed', 'Unknown', 'Systemic', 'Topical', 'Intolerance', 'Not Verified'];
const reactions = [
  'Rash', 'Anaphylaxis', 'Hives', 'Itching', 'Swelling', 'Nausea', 'Vomiting',
  'Dyspnea', 'Hypotension', 'Other, see comment', 'Atopic Dermatitis', 'Blood Pressure Drop',
  'Contact Dermatitis', 'Cough', 'Diarrhea', 'Dizzy', 'Excessive drowsiness', 'GI Cramps',
  'GI upset', 'Hallucinations', 'Headache', 'Loss of Consciousness', 'Muscle Myalgia',
  'Ocular Itching and/or Swelling', 'Other; see comment', 'Palpitations', 'Rhinitis', 'Nausea & Vomiting'
];

const AllergyEditor = ({ initialData, onSave, onCancel }) => {
  const [data, setData] = useState({
    agent: '',
    type: '',
    reaction: '',
    severity: '',
    reactionType: '',
    onsetDate: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const handleChange = (field) => (e) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleSave = () => {
    onSave(data);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {data.id ? 'Edit Allergy' : 'Add New Allergy'}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Agent: {data.agent}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Allergen Type: {data.type}
      </Typography>

      <Grid container spacing={2}>
        {/* Column 1: Reaction + Reaction Type */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Reaction"
            value={data.reaction}
            onChange={handleChange('reaction')}
            fullWidth
            size="small"
            margin="normal"
          >
            {reactions.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Reaction Type"
            value={data.reactionType}
            onChange={handleChange('reactionType')}
            fullWidth
            size="small"
            margin="normal"
          >
            {reactionTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Column 2: Severity + Noted Date */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Severity"
            value={data.severity}
            onChange={handleChange('severity')}
            fullWidth
            size="small"
            margin="normal"
          >
            {severityLevels.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Noted Date"
            type="date"
            value={data.onsetDate}
            onChange={handleChange('onsetDate')}
            fullWidth
            size="small"
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Column 3: Comments */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Comments"
            value={data.notes}
            onChange={handleChange('notes')}
            fullWidth
            multiline
            rows={5}
            size="small"
            margin="normal"
          />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" color="error" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Accept
        </Button>
      </Box>
    </Paper>
  );
};

export default AllergyEditor;
