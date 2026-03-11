// SocioeconomicHistory.jsx
import * as React from 'react';
import {
  Box,
  Button,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TitledCard,
  Icon,
  Autocomplete,
  MarkReviewed,
  AutocompleteButtons,
  Grid,
} from 'components/ui/Core';
import { usePatient, Database } from 'components/contexts/PatientContext';

export function SocialHistorySocioeconomic() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const socioeconomicData = socialHistory[0]?.Socioeconomic || {};
  const setSocioeconomicData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentSocio = next[0].Socioeconomic || {};
      const newSocio = typeof update === 'function' ? update(currentSocio) : update;
      next[0] = { ...next[0], Socioeconomic: newSocio };
      return next;
    });
  };

  const [editingEntry, setEditingEntry] = React.useState<any>(null);
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newEntry, setNewEntry] = React.useState({
    id: null,
    occupation: '',
    employer: '',
    comment: '',
  });

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


  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Socioeconomic</>} color="#9F3494">

      {/* Current Occupation */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6" sx={{ mb: 1 }}>Current Occupation</Label>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Occupation"
              fullWidth
              value={socioeconomicData?.occupation || ''}
              onInputChange={(_e, newValue) => handleCurrentOccupationChange('occupation', newValue)}
              options={[]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Employer"
              fullWidth
              value={socioeconomicData?.employer || ''}
              onInputChange={(_e, newValue) => handleCurrentOccupationChange('employer', newValue)}
              options={[]}
              TextFieldProps={{ placeholder: "NOT EMPLOYED" }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Occupation History */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Label variant="h6">Occupation History</Label>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsAddingNew(true)}
          >
            Add New Occupation
          </Button>
        </Box>
        <Box paper variant="outlined">
          <Table sx={{ minWidth: 650 }}>
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
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { background: '#f5f5f5' }, '&:hover': { background: '#f0f0f0' } }}>
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
                </TableRow>
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
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Occupation"
                  fullWidth
                  value={newEntry.occupation}
                  onInputChange={(_e, newValue) => setNewEntry({ ...newEntry, occupation: newValue })}
                  options={[]}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Employer"
                  fullWidth
                  value={newEntry.employer}
                  onInputChange={(_e, newValue) => setNewEntry({ ...newEntry, employer: newValue })}
                  options={[]}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Comment"
                  fullWidth
                  value={newEntry.comment}
                  onInputChange={(_e, newValue) => setNewEntry({ ...newEntry, comment: newValue })}
                  options={[]}
                  TextFieldProps={{ multiline: true, rows: 3 }}
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
      </Box>

      {/* Demographics */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Demographics</Label>
        <Grid container spacing={2}>
          <Grid size={12}>
            <AutocompleteButtons
              label="Marital Status:"
              options={maritalStatusOptions}
              value={socioeconomicData?.demographics?.maritalStatus}
              onChange={(_e, val) => handleDemographicsChange('maritalStatus', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Religion:"
              options={['Buddhism', 'Christianity', 'Hinduism', 'Islam', 'Judaism', 'Sikhism', 'Catholicism', 'None', 'Other']}
              value={socioeconomicData?.demographics?.religion}
              onChange={(_e, val) => handleDemographicsChange('religion', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Spouse Name:"
              fullWidth
              value={socioeconomicData?.demographics?.spouseName || ''}
              onInputChange={(_e, newValue) => handleDemographicsChange('spouseName', newValue)}
              options={[]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Spouse Occupation:"
              fullWidth
              value={socioeconomicData?.demographics?.spouseOccupation || ''}
              onInputChange={(_e, newValue) => handleDemographicsChange('spouseOccupation', newValue)}
              options={[]}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Preferred Language:"
              options={['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean']}
              value={socioeconomicData?.demographics?.preferredLanguage}
              onChange={(_e, val) => handleDemographicsChange('preferredLanguage', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Number of Children:"
              fullWidth
              value={socioeconomicData?.demographics?.numberOfChildren?.toString() || ''}
              onInputChange={(_e, newValue) => handleDemographicsChange('numberOfChildren', parseInt(newValue) || 0)}
              options={['0', '1', '2', '3', '4', '5', '6+']}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Ethnic Group:"
              options={['Non-Hispanic', 'Latino', 'Hispanic']}
              value={socioeconomicData?.demographics?.ethnicGroup}
              onChange={(_e, val) => handleDemographicsChange('ethnicGroup', val)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Years of Education:"
              fullWidth
              value={socioeconomicData?.demographics?.yearsOfEducation?.toString() || ''}
              onInputChange={(_e, newValue) => handleDemographicsChange('yearsOfEducation', parseInt(newValue) || 0)}
              options={['12', '14', '16', '18', '20+']}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="Race:"
              options={['White', 'Black or African American', 'Asian', 'American Indian', 'Native Hawaiian', 'Other']}
              value={socioeconomicData?.demographics?.race}
              onChange={(_e, val) => handleDemographicsChange('race', val)}
            />
          </Grid>
          <Grid size={12}>
            <AutocompleteButtons
              label="What is the highest level of school you have completed or the highest degree you have received?"
              options={['High School', 'Associate Degree', 'Bachelor Degree', 'Master Degree', 'Doctoral Degree']}
              value={socioeconomicData?.demographics?.highestEducationLevel}
              onChange={(_e, val) => handleDemographicsChange('highestEducationLevel', val)}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}