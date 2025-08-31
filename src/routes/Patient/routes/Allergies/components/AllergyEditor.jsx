import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Icon,
  colors,
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
    allergen: '',
    type: '',
    reaction: '',
    severity: 'Not Specified',
    reactionType: '',
    recorded: '',
    comment: ''
  });

  const [isEditingCustomAllergen, setIsEditingCustomAllergen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        severity: initialData.severity || 'Not Specified',
      });
      if (initialData.allergen === 'Other') {
        setIsEditingCustomAllergen(true);
        setData((prev) => ({ ...prev, allergen: '', type: '' }));
      }
    }
  }, [initialData]);

  const handleChange = (field) => (e) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleSelectAllergen = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsEditingCustomAllergen(true);
      setData({ ...data, allergen: '', type: '' });
    } else {
      setIsEditingCustomAllergen(false);
      setData({ ...data, allergen: value });
    }
  };

  const handleSave = () => {
    onSave(data);
    setIsEditingCustomAllergen(false); // reset after save
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {data.id ? 'Edit Allergy' : 'Add New Allergy'}
      </Typography>

      <Grid container spacing={2}>
        {/* Left column: Allergen + 2x2 grid */}
        <Grid item xs={12} md={6}>
          {/* Allergen / Allergen Type */}
          {isEditingCustomAllergen ? (
            <Box>
              <TextField
                label="Allergen"
                value={data.allergen}
                onChange={handleChange('allergen')}
                fullWidth
                size="small"
                margin="normal"
              />
              <TextField
                label="Allergen Type"
                value={data.type}
                onChange={handleChange('type')}
                fullWidth
                size="small"
                margin="normal"
              />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Agent: {data.allergen}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Allergen Type: {data.type}
              </Typography>
            </>
          )}

          {/* 2x2 Grid: Reaction, Reaction Type, Severity, Noted Date */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
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
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Noted Date"
                type="date"
                value={data.recorded}
                onChange={handleChange('recorded')}
                fullWidth
                size="small"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right column: Comments */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          <TextField
            label="Comments"
            value={data.comment}
            onChange={handleChange('comment')}
            fullWidth
            multiline
            rows={8}
            size="small"
            margin="normal"
          />
        </Grid>
      </Grid>

      {/* Buttons */}
      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={2}>
          <Button variant="outlined" sx={{
              color: colors.grey[700],
              borderColor: colors.grey[700],
              '&:hover': {
                borderColor: colors.grey[700],
                backgroundColor: colors.grey[200],
              },
            }}>
            Past Updates
          </Button>
          <Button variant="outlined" sx={{
              color: colors.grey[700],
              borderColor: colors.grey[700],
              '&:hover': {
                borderColor: colors.grey[700],
                backgroundColor: colors.grey[200],
              },
            }}>
            <Icon>clear</Icon>Delete
          </Button>
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="success" onClick={handleSave}>
            <Icon>check</Icon>Accept
          </Button>
          <Button variant="outlined" color="error" onClick={onCancel}>
            <Icon>clear</Icon>Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AllergyEditor;
