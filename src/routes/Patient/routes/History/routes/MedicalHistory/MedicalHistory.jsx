// MedicalHistory.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Label,
} from 'components/ui/Core.jsx';
import {
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../../components/contexts/PatientContext.jsx';

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
  const { useEncounter } = usePatient();
  const [medicalHx, setMedicalHx] = useEncounter().history.medical();

  const [editingEntry, setEditingEntry] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({
    id: null,
    diagnosis: '',
    date: '',
    age: '',
    src: '',
    problemList: '',
  });
  const [reviewed, setReviewed] = useState(false);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
  };

  const handleDelete = (id) => {
    const updatedHistory = medicalHx.filter(entry => entry.id !== id);
    setMedicalHx(updatedHistory);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleSave = () => {
    let updatedHistory = [];
    if (editingEntry) {
      updatedHistory = medicalHx.map(entry =>
        entry.id === editingEntry.id ? { ...newEntry, id: entry.id } : entry
      );
    } else {
      const newId = medicalHx.length > 0 ? Math.max(...medicalHx.map(e => e.id)) + 1 : 1;
      updatedHistory = [...medicalHx, { ...newEntry, id: newId }];
    }
    setMedicalHx(updatedHistory);
    
    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      diagnosis: '',
      date: '',
      age: '',
      src: '',
      problemList: '',
    });
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      diagnosis: '',
      date: '',
      age: '',
      src: '',
      problemList: '',
    });
  };

  const handleReviewedChange = (e) => {
    setReviewed(e.target.checked);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Label variant="h6" sx={{ fontWeight: 'bold' }}>Medical History</Label>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingNew(true)}
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          New
        </Button>
      </Box>

      <Box sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }} aria-label="medical history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Diagnosis</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Added to Problem List</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(medicalHx ?? []).map((entry, index) => (
              <StyledTableRow key={index}>
                <TableCell component="th" scope="row">
                  {entry.date}
                </TableCell>
                <TableCell>{entry.diagnosis}</TableCell>
                <TableCell>{entry.age}</TableCell>
                <TableCell>{entry.src}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={entry.problemList === 'True'}
                    disabled
                    color="primary"
                    icon={<CheckCircleOutlineIcon />}
                    checkedIcon={<CheckCircleOutlineIcon />}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(entry)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(entry.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {(isAddingNew || editingEntry) && (
        <Box sx={{ p: 2, mt: 4, border: '1px solid #e0e0e0' }}>
          <Label variant="h6" gutterBottom>
            {editingEntry ? 'Edit Entry' : 'Add New Entry'}
          </Label>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Diagnosis" name="diagnosis" value={newEntry.diagnosis} onChange={handleChange} fullWidth placeholder="e.g. Chronic kidney disease" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Date" name="date" value={newEntry.date} onChange={handleChange} fullWidth placeholder="mm/dd/yyyy" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Age" name="age" value={newEntry.age} onChange={handleChange} fullWidth placeholder="e.g. 65 years old" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Source" name="src" value={newEntry.src} onChange={handleChange} fullWidth placeholder="e.g. Hospital record" />
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
        </Box>
      )}

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            All medical history entries have been reviewed.
          </Label>
        )}
      </Box>
    </Box>
  );
}
