import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Icon,
  colors,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const allergenTypes = ['Drug', 'Drug Ingredient', 'Environmental', 'Food', 'Other'];
const severityLevels = ['Low', 'Moderate', 'High', 'Not Specified'];
const reactionTypes = ['Immediate', 'Delayed', 'Unknown', 'Systemic', 'Topical', 'Intolerance', 'Not Verified'];
const reactions = [
  'Rash', 'Anaphylaxis', 'Hives', 'Itching', 'Swelling', 'Nausea', 'Vomiting',
  'Dyspnea', 'Hypotension', 'Other, see comment', 'Atopic Dermatitis', 'Blood Pressure Drop',
  'Contact Dermatitis', 'Cough', 'Diarrhea', 'Dizzy', 'Excessive drowsiness', 'GI Cramps',
  'GI upset', 'Hallucinations', 'Headache', 'Loss of Consciousness', 'Muscle Myalgia',
  'Ocular Itching and/or Swelling', 'Other; see comment', 'Palpitations', 'Rhinitis', 'Nausea & Vomiting'
];

const dummyAgents = [
  { allergen: 'Penicillin', type: 'Drug' },
  { allergen: 'Peanuts', type: 'Food' },
  { allergen: 'Latex', type: 'Environmental' },
  { allergen: 'Crab', type: 'Food' },
  { allergen: 'Metoprolol', type: 'Drug Ingredient' },
  { allergen: 'Codeine', type: 'Drug Ingredient' },
  { allergen: 'Demerol [Meperidine]', type: 'Drug Ingredient' },
  { allergen: 'Xanax [Alprazolam]', type: 'Drug Ingredient' },
  { allergen: 'Aspirin', type: 'Drug' },
  { allergen: 'Dust Mites', type: 'Environmental' },
  { allergen: 'Bee Venom', type: 'Insect' },
  { allergen: 'Amoxicillin-potassium clavulanate', type: 'Drug' },
  { allergen: 'Other', type: 'Other' },
];

const AgentSearchMenu = ({ onAgentSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box sx={{ my: 2, width: 300 }}>
      <Autocomplete
        options={dummyAgents}
        getOptionLabel={(option) => option.allergen}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            onAgentSelect(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select an agent"
            variant="outlined"
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid size={6}>
                <Typography variant="body2" fontWeight="medium">
                  {option.allergen}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="text.secondary">
                  {option.type}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )}
        blurOnSelect
      />
    </Box>
  );
};

const AllergiesTable = ({ allergies, onEdit, onDelete }) => {
  const handleDelete = (id) => {
    onDelete && onDelete(id);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
        Allergies
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="allergies table">
          <TableHead>
            <TableRow>
              <TableCell>Allergen</TableCell>
              <TableCell>Allergen Type</TableCell>
              <TableCell>Reaction</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Reaction Type</TableCell>
              <TableCell>Noted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies?.map((allergy) => (
              <TableRow
                key={allergy.id}
                onClick={() => onEdit(allergy)}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: allergy.severity === 'High' ? '#ffcb00' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: allergy.severity === 'High' ? '#FFB700' : 'action.hover',
                  },
                  '& td': {
                    fontWeight: allergy.severity === 'High' ? 'bold' : 'normal',
                  },
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    color: allergy.severity === 'High' ? 'text.primary' : colors.blue[500],
                    fontWeight: allergy.severity === 'High' ? 'bold' : 'normal',
                  }}
                >
                  <Box>
                    {allergy.allergen}
                    {allergy.comment && (
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        fontWeight: 'normal',
                        pl: 4,
                      }}
                      >
                        {allergy.comment}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ verticalAlign: allergy.comment ? 'top' : 'middle' }}>{allergy.type}</TableCell>
                <TableCell sx={{ verticalAlign: allergy.comment ? 'top' : 'middle' }}>{allergy.reaction}</TableCell>
                <TableCell
                  sx={{
                    fontWeight: allergy.severity === 'Not Specified' ? 'bold!important' : 'inherit',
                    backgroundColor: allergy.severity === 'Not Specified' ? '#ffcb00!important' : 'inherit',
                    verticalAlign: allergy.comment ? 'top' : 'middle',
                  }}
                >
                  {allergy.severity}
                </TableCell>
                <TableCell sx={{ verticalAlign: allergy.comment ? 'top' : 'middle' }}>{allergy.reactionType}</TableCell>
                <TableCell sx={{ verticalAlign: allergy.comment ? 'top' : 'middle' }}>
                  {allergy.recorded ? dayjs(allergy.recorded).format('MM-DD-YYYY') : ''}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(allergy);
                    }}
                    size="small"
                  >
                    <Icon fontSize="small">edit</Icon>
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(allergy.id);
                    }}
                    size="small"
                  >
                    <Icon fontSize="small">delete</Icon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

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

  const handleSave = () => {
    onSave(data);
    setIsEditingCustomAllergen(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {data.id ? 'Edit Allergy' : 'Add New Allergy'}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
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
                select
                label="Allergen Type"
                value={data.type}
                onChange={handleChange('type')}
                fullWidth
                size="small"
                margin="normal"
              >
                {allergenTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
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
          <Grid container spacing={2}>
            <Grid size={6}>
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
            <Grid size={6}>
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
            <Grid size={6}>
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
            <Grid size={6}>
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

        <Grid display="flex" flexDirection="column" size={{ xs: 12, md: 6 }}>
          <TextField
            label="Comments"
            value={data.comment}
            onChange={handleChange('comment')}
            fullWidth
            multiline
            rows={7}
            size="small"
            margin="normal"
          />
        </Grid>
      </Grid>
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

export const Allergies = () => {
  const { useChart, useEncounter } = usePatient();
  const [allergies, setAllergies] = useEncounter().allergies([]);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);  // <--- selected from search, waiting to add
  const [lastReviewed, setLastReviewed] = useState(null);

  // Normalize backend allergy data and assign numeric IDs if needed
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const normalizeAllergies = (rawAllergies) => {
    let nextId = 1;
    return rawAllergies.map((raw) => {
      let numericId = Number(raw.id);
      if (!Number.isFinite(numericId)) {
        numericId = nextId++;
      } else {
        nextId = Math.max(nextId, numericId + 1); // ensure nextId is always higher
      }

      return {
        id: numericId,
        allergen: capitalize(raw.allergen),
        type: capitalize(raw.type),
        reaction: capitalize(raw.reaction),
        reactionType: capitalize(raw.reactionType),
        severity: capitalize(raw.severity || 'Not Specified'),
        recorded: raw.recorded || '',
        comment: raw.comment || '',

      };
    });
  };

  // Use it when initializing state
  useEffect(() => {
    setAllergies(normalizeAllergies(allergies ?? []));
  }, []);

  const handleEdit = (allergy) => {
    setEditingAllergy(allergy);
    setIsEditingMode(true);
  };

  const handleSaveAllergy = (newAllergyData) => {
    if (editingAllergy && editingAllergy.id) {
      setAllergies((prev) =>
        prev.map((allergy) =>
          allergy.id === editingAllergy.id
            ? { ...allergy, ...newAllergyData }
            : allergy
        )
      );
    } else {
      // filter out any NaN or undefined ids
      const validIds = allergies
        .map(a => Number(a.id))
        .filter(id => Number.isFinite(id));

      const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;

      setAllergies((prev) => [
        ...prev,
        { id: newId, ...newAllergyData }
      ]);
    }

    setIsEditingMode(false);
    setEditingAllergy(null);
    setLastReviewed(null); // reset last reviewed date when saving new allergy
  };


  const handleDeleteAllergy = (id) => {
    setAllergies((prev) => prev.filter((allergy) => allergy.id !== id));
    if (editingAllergy?.id === id) {
      setIsEditingMode(false);
      setEditingAllergy(null);
      setLastReviewed(null);
    }
  };

  const handleAgentSelect = (agentObject) => {
    setSelectedAgent(agentObject);  // store selected agent, do NOT open editor yet
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // On Add button click, open editor with selectedAgent (or empty if none selected)
  const handleAddClick = () => {
    const agentName = selectedAgent?.allergen?.trim() || '';
    // Check if the agent already exists
    if (agentName) {
      const alreadyExists = allergies.some(
        (a) => a?.allergen?.trim().toLowerCase() === agentName.toLowerCase()
      );
      if (alreadyExists) {
        setSnackbarMessage('Allergen already on file');
        setSnackbarOpen(true);
        return; // Stop opening the editor
      }
    }
    if (selectedAgent) {
      setEditingAllergy({ ...selectedAgent });
    } else {
      setEditingAllergy({
        allergen: '',
        type: '',
        reaction: '',
        severity: '',
        reactionType: '',
        recorded: '',
        comment: '',
      });
    }
    setIsEditingMode(true);
    setLastReviewed(null); // reset last reviewed date when adding new allergy
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    setEditingAllergy(null);
  };
  const handleMarkAsReviewed = () => {
    const now = dayjs().format('MMM D, YYYY h:mm A');
    setLastReviewed(now);
  };

  return (
    <Box sx={{ height: '95vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ bgcolor: 'grey.100', pt: 4, pb: 1, px: 3, borderRadius: 1, mb: 1 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: colors.blue[500] }}>
          Allergies / Contraindications
        </Typography>

        <Box display="flex" alignItems="center" mb={1} gap={2} >
          <AgentSearchMenu onAgentSelect={handleAgentSelect} />
          <Button
            variant="outlined"
            startIcon={<Icon sx={{ color: 'green' }}>add_task</Icon>}
            onClick={handleAddClick}>
            Add
          </Button>
        </Box>

      </Box>


      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 1, mb: 1 }}>
        <AllergiesTable
          allergies={allergies}
          onEdit={handleEdit}
          onDelete={handleDeleteAllergy}
        />
        {isEditingMode && (
          <AllergyEditor
            initialData={editingAllergy}
            onSave={handleSaveAllergy}
            onCancel={handleCancelEdit}
          />
        )}
      </Box>

      <Box
        sx={{
          bgcolor: 'grey.100',
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'

        }}>
        <Button variant="outlined" onClick={handleMarkAsReviewed} sx={{
          color: colors.grey[700],
          borderColor: colors.grey[700],
          '&:hover': {
            borderColor: colors.grey[700],
            backgroundColor: colors.grey[300], // subtle hover effect
          },
        }}> <Icon>check</Icon>Mark as Reviewed </Button>
        <Button variant="outlined" sx={{
          color: colors.grey[700],
          borderColor: colors.grey[700],
          '&:hover': {
            borderColor: colors.grey[700],
            backgroundColor: colors.grey[300], // subtle hover effect
          },
        }}>Unable to Assess</Button>
        <Typography variant="body2" sx={{ color: lastReviewed ? 'green' : 'gray', fontStyle: 'italic' }}>
          {lastReviewed ? `Last Reviewed at ${lastReviewed}` : 'Not Reviewed'}
        </Typography>

      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>

  );

};
