// MedicalHistory.jsx
import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Grid, IconButton, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import { usePatientMRN } from '../../../../util/urlHelpers.js';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function MedicalHistory() {
  const [patientMRN] = usePatientMRN();
  const { encounters } = TEST_PATIENT_INFO({ patientMRN });
  
  const sortedEncounters = [...encounters].sort((a, b) => b.id - a.id);
  const mostRecentHistory = sortedEncounters[0]?.history?.medical || [];

  const [history, setHistory] = useState(mostRecentHistory.map((item, index) => ({
    ...item,
    id: index,
  })));
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ id: null, diagnosis: '', date: '', age: '', comment: '', src: 'Approved', problemList: false });
  const [reviewed, setReviewed] = useState(false);

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setNewEntry(entry);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setHistory(history.filter(entry => entry.id !== id));
  };

  const handleSave = () => {
    if (editingId !== null) {
      setHistory(history.map(entry => entry.id === editingId ? newEntry : entry));
      setEditingId(null);
    } else {
      setHistory([...history, { ...newEntry, id: Date.now() }]);
      setIsAdding(false);
    }
    setNewEntry({ id: null, diagnosis: '', date: '', age: '', comment: '', src: 'Approved', problemList: false });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewEntry({ id: null, diagnosis: '', date: '', age: '', comment: '', src: 'Approved', problemList: false });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry({ ...newEntry, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingId(null);
    setNewEntry({ id: null, diagnosis: '', date: '', age: '', comment: '', src: 'Approved', problemList: false });
  };

  const handleReviewedChange = (event) => {
    setReviewed(event.target.checked);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Past Medical History</Typography>
        <Button startIcon={<Icon>add</Icon>} variant="contained" onClick={handleAddClick} sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          Add Medical History
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }} aria-label="medical history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Diagnosis</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Src.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>PL</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry) => (
              <StyledTableRow key={entry.id}>
                <TableCell>{entry.diagnosis}</TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.age}</TableCell>
                <TableCell>{entry.comment}</TableCell>
                <TableCell>{entry.src}</TableCell>
                <TableCell>
                  {entry.problemList === 'True' ? <CheckCircleOutlineIcon color="success" /> : <CancelIcon color="error" />}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(entry)}><Icon fontSize="small">edit</Icon></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(entry.id)}><Icon fontSize="small">delete</Icon></IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {(isAdding || editingId !== null) && (
        <Paper sx={{ p: 2, mt: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{editingId !== null ? 'Edit Entry' : 'Add New Entry'}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Diagnosis" name="diagnosis" value={newEntry.diagnosis} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Date" name="date" value={newEntry.date} onChange={handleChange} fullWidth placeholder="mm/dd/yyyy" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Age" name="age" value={newEntry.age} onChange={handleChange} fullWidth placeholder="e.g. 65 years old" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Comment" name="comment" value={newEntry.comment} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={newEntry.problemList === 'True'} onChange={(e) => setNewEntry({ ...newEntry, problemList: e.target.checked ? 'True' : 'False' })} />}
                label="Add to Problem List"
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={handleSave} variant="contained" color="primary" sx={{ mr: 1 }}>Save</Button>
              <Button onClick={handleCancel} variant="outlined">Cancel</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Last Reviewed by [User Name] on [Date]
          </Typography>
        )}
      </Box>
    </Box>
  );
}
