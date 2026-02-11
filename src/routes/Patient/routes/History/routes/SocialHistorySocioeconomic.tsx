// SocioeconomicHistory.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TitledCard,
  Icon,
} from 'components/ui/Core';
import {
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../components/contexts/PatientContext';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const SectionHeader = styled(Label)(({ theme }) => ({
  color: '#e91e63',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

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

export default function SocialHistorySocioeconomic() {
  const { useEncounter } = usePatient();
  const [socioeconomicData, setSocioeconomicData] = useEncounter().history.Socioeconomic();

  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({
    id: null,
    occupation: '',
    employer: '',
    comment: '',
  });
  const [reviewed, setReviewed] = useState(false);

  const maritalStatusOptions = [
    'Divorced',
    'Legally Separated',
    'Life Partner',
    'Married',
    'Single',
    'Unknown',
    'Widow/Widower'
  ];

  // Current occupation handlers
  const handleCurrentOccupationChange = (field: string, value: any) => {
    setSocioeconomicData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Demographics handlers
  const handleDemographicsChange = (field: string, value: any) => {
    setSocioeconomicData((prev: any) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value
      }
    }));
  };

  // Occupation history handlers
  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setNewEntry(entry);
  };

  const handleDelete = (id: any) => {
    const updatedHistory = socioeconomicData?.occupationalHistory?.filter((entry: any) => entry.id !== id) || [];
    setSocioeconomicData((prev: any) => ({
      ...prev,
      occupationalHistory: updatedHistory
    }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleSave = () => {
    let updatedHistory = [];
    const currentHistory = socioeconomicData?.occupationalHistory || [];

    if (editingEntry) {
      updatedHistory = currentHistory.map((entry: any) =>
        entry.id === editingEntry.id ? { ...newEntry, id: entry.id } : entry
      );
    } else {
      const newId = currentHistory.length > 0 ? Math.max(...currentHistory.map((e: any) => e.id)) + 1 : 1;
      updatedHistory = [...currentHistory, { ...newEntry, id: newId }];
    }

    setSocioeconomicData((prev: any) => ({
      ...prev,
      occupationalHistory: updatedHistory
    }));

    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      occupation: '',
      employer: '',
      comment: '',
    });
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setIsAddingNew(false);
    setNewEntry({
      id: null,
      occupation: '',
      employer: '',
      comment: '',
    });
  };

  const handleReviewedChange = (e: any) => {
    setReviewed(e.target.checked);
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Socioeconomic</>} color="#9F3494">
      {/* Current Occupation */}
      <SectionPaper>
        <SectionHeader>Current Occupation</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Occupation"
              fullWidth
              value={socioeconomicData?.occupation || ''}
              onChange={(e) => handleCurrentOccupationChange('occupation', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Employer"
              fullWidth
              value={socioeconomicData?.employer || ''}
              onChange={(e) => handleCurrentOccupationChange('employer', e.target.value)}
              placeholder="NOT EMPLOYED"
            />
          </Grid>
        </Grid>
      </SectionPaper>
      {/* Occupation History */}
      <SectionPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <SectionHeader>Occupation History</SectionHeader>
          <Button
            variant="contained"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsAddingNew(true)}
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
          >
            Add New Occupation
          </Button>
        </Box>

        <Box sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table sx={{ minWidth: 650 }} aria-label="occupation history table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Occupation</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Employer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(socioeconomicData?.occupationalHistory || []).map((entry: any, index: number) => (
                <StyledTableRow key={index}>
                  <TableCell component="th" scope="row" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
                    {entry.occupation}
                  </TableCell>
                  <TableCell>{entry.employer}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.comment}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(entry)} color="primary" size="small">
                      edit
                    </IconButton>
                    <IconButton onClick={() => handleDelete(entry.id)} color="secondary" size="small">
                      delete
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
              Details
            </Label>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  label="Occupation"
                  name="occupation"
                  value={newEntry.occupation}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Employer"
                  name="employer"
                  value={newEntry.employer}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Comment"
                  name="comment"
                  value={newEntry.comment}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    sx={{ color: '#f44336', borderColor: '#f44336', '&:hover': { backgroundColor: '#ffebee' } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ color: '#f44336', borderColor: '#f44336', '&:hover': { backgroundColor: '#ffebee' } }}
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </SectionPaper>
      {/* Demographics */}
      <SectionPaper>
        <SectionHeader>Demographics</SectionHeader>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Label variant="subtitle2" sx={{ mb: 1 }}>Marital Status:</Label>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {maritalStatusOptions.map(option => (
                <Button
                  key={option}
                  variant={socioeconomicData?.demographics?.maritalStatus === option ? 'contained' : 'outlined'}
                  onClick={() => handleDemographicsChange('maritalStatus', option)}
                  size="small"
                  sx={{
                    backgroundColor: socioeconomicData?.demographics?.maritalStatus === option ? '#1976d2' : 'transparent',
                    color: socioeconomicData?.demographics?.maritalStatus === option ? 'white' : '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: socioeconomicData?.demographics?.maritalStatus === option ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Spouse Name:"
              fullWidth
              value={socioeconomicData?.demographics?.spouseName || ''}
              onChange={(e) => handleDemographicsChange('spouseName', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Preferred Language:"
              fullWidth
              value={socioeconomicData?.demographics?.preferredLanguage || ''}
              onChange={(e) => handleDemographicsChange('preferredLanguage', e.target.value)}
              placeholder="English"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Number of Children:"
              type="number"
              fullWidth
              value={socioeconomicData?.demographics?.numberOfChildren || ''}
              onChange={(e) => handleDemographicsChange('numberOfChildren', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ethnic Group:"
              fullWidth
              value={socioeconomicData?.demographics?.ethnicGroup || ''}
              onChange={(e) => handleDemographicsChange('ethnicGroup', e.target.value)}
              placeholder="Non-Hispanic, Latino ..."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Years of Education:"
              type="number"
              fullWidth
              value={socioeconomicData?.demographics?.yearsOfEducation || ''}
              onChange={(e) => handleDemographicsChange('yearsOfEducation', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Race:"
              fullWidth
              value={socioeconomicData?.demographics?.race || ''}
              onChange={(e) => handleDemographicsChange('race', e.target.value)}
              placeholder="White"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="What is the highest level of school you have completed or the highest degree you have received?"
              fullWidth
              value={socioeconomicData?.demographics?.highestEducationLevel || ''}
              onChange={(e) => handleDemographicsChange('highestEducationLevel', e.target.value)}
            />
          </Grid>
        </Grid>
      </SectionPaper>
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            All socioeconomic information has been reviewed.
          </Label>
        )}
      </Box>
    </TitledCard>
  );
}