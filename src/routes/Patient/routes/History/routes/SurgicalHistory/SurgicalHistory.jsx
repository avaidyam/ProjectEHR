// SurgicalHistory.jsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../../components/contexts/PatientContext.jsx';
import procedures from '../../../../../../util/data/procedure_list.json';

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

export default function SurgicalHistory() {
  const { useEncounter } = usePatient();
  const [surgicalHx, setSurgicalHx] = useEncounter().history.surgical([]);

  const [editingEntry, setEditingEntry] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({
    id: null,
    procedure: '',
    date: '',
    age: '',
    laterality: 'N/A',
    src: '',
    notes: '',
  });
  const [reviewed, setReviewed] = useState(false);

  const lateralityOptions = ['N/A', 'Bilateral', 'Left', 'Right'];
  const sourceOptions = ['Approved by Clinician', 'From Patient Questionnaire'];

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
  };

  const handleDelete = (id) => {
    const updatedHistory = surgicalHx.filter(entry => entry.id !== id);
    setSurgicalHx(updatedHistory);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleSave = () => {
    let updatedHistory = [];
    if (editingEntry) {
      updatedHistory = surgicalHx.map(entry =>
        entry.id === editingEntry.id ? { ...newEntry, id: entry.id } : entry
      );
    } else {
      const newId = surgicalHx.length > 0 ? Math.max(...surgicalHx.map(e => e.id)) + 1 : 1;
      updatedHistory = [...surgicalHx, { ...newEntry, id: newId }];
    }
    setSurgicalHx(updatedHistory);
    
    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      procedure: '',
      date: '',
      age: '',
      laterality: 'N/A',
      src: '',
      notes: '',
    });
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      procedure: '',
      date: '',
      age: '',
      laterality: 'N/A',
      src: '',
      notes: '',
    });
  };

  const handleReviewedChange = (e) => {
    setReviewed(e.target.checked);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Label variant="h6" sx={{ fontWeight: 'bold' }}>Surgical History</Label>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingNew(true)}
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          Add
        </Button>
      </Box>

      <Label variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
        Past Surgical History
      </Label>

      <Box sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }} aria-label="surgical history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Procedure</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Laterality</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Src</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(surgicalHx ?? []).map((entry, index) => (
              <StyledTableRow key={index}>
                <TableCell component="th" scope="row" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                  {entry.procedure}
                </TableCell>
                <TableCell>{entry.laterality}</TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.age}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.notes}
                </TableCell>
                <TableCell>{entry.src}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(entry)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(entry.id)} color="secondary" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {(isAddingNew || editingEntry) && (
        <Box sx={{ p: 3, mt: 3, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Label variant="h6" gutterBottom sx={{ mb: 3 }}>
            {editingEntry ? 'Edit Surgical Entry' : 'Add New Surgical Entry'}
          </Label>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Procedure *</InputLabel>
                <Select
                  name="procedure"
                  value={newEntry.procedure}
                  onChange={handleChange}
                  label="Procedure *"
                  required
                >
                  {procedures.map((procedure) => (
                    <MenuItem key={procedure} value={procedure}>
                      {procedure}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Laterality</InputLabel>
                <Select
                  name="laterality"
                  value={newEntry.laterality}
                  onChange={handleChange}
                  label="Laterality"
                >
                  {lateralityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField 
                label="Date" 
                name="date" 
                type="date"
                value={newEntry.date} 
                onChange={handleChange} 
                fullWidth 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Age" 
                name="age" 
                value={newEntry.age} 
                onChange={handleChange} 
                fullWidth 
                placeholder="e.g. 25 years old" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  name="src"
                  value={newEntry.src}
                  onChange={handleChange}
                  label="Source"
                >
                  {sourceOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Comment/Notes" 
                name="notes" 
                value={newEntry.notes} 
                onChange={handleChange} 
                fullWidth 
                multiline
                rows={3}
                placeholder="Additional details about the procedure..." 
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  onClick={handleSave} 
                  variant="contained" 
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  {editingEntry ? 'Update' : 'Save'}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Box>
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
            All surgical history entries have been reviewed.
          </Label>
        )}
      </Box>
    </Box>
  );
}