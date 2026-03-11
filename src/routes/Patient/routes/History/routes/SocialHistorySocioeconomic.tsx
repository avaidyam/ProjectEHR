// SocioeconomicHistory.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  DetailTable,
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
  const handleAddNew = () => {
    const nextId = `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { id: nextId, occupation: '', employer: '', comment: '', isNew: true };
  };

  const handleUpdateAfterSave = (updatedRow: any) => {
    setSocioeconomicData((prev: any) => {
      const history = prev.occupationalHistory || [];
      const exists = history.find((r: any) => r.id === updatedRow.id);
      return {
        ...prev,
        occupationalHistory: exists
          ? history.map((r: any) => r.id === updatedRow.id ? { ...updatedRow, isNew: false } : r)
          : [...history, { ...updatedRow, isNew: false }]
      };
    });
  };

  const handleDelete = (id: any) => {
    setSocioeconomicData((prev: any) => ({
      ...prev,
      occupationalHistory: (prev.occupationalHistory || []).filter((entry: any) => entry.id !== id)
    }));
  };

  const rows = React.useMemo(() => {
    return (socioeconomicData?.occupationalHistory || []).map((row: any, index: number) => {
      if (row.id) return row;
      return { ...row, id: `temp-${index}-${row.occupation}` };
    });
  }, [socioeconomicData?.occupationalHistory]);

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
        <Label variant="h6" sx={{ mb: 1 }}>Occupation History</Label>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, maxHeight: 'calc(100vh - 300px)' }}>
          <DetailTable
            rows={rows}
            columns={[
              { field: 'occupation', headerName: 'Occupation', flex: 1 },
              { field: 'employer', headerName: 'Employer', flex: 1 },
              { field: 'comment', headerName: 'Comment', flex: 1.5 }
            ]}
            getRowId={(row: any) => row.id}
            onAddNew={handleAddNew}
            addNewLabel="Add New Occupation"
            onSave={handleUpdateAfterSave}
            onDelete={handleDelete}
            renderEditPanel={(formData, setFormData) => (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Autocomplete
                    size="small"
                    freeSolo
                    label="Occupation"
                    fullWidth
                    value={formData.occupation}
                    onInputChange={(_e, newValue) => setFormData({ occupation: newValue })}
                    options={[]}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    size="small"
                    freeSolo
                    label="Employer"
                    fullWidth
                    value={formData.employer}
                    onInputChange={(_e, newValue) => setFormData({ employer: newValue })}
                    options={[]}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    size="small"
                    freeSolo
                    label="Comment"
                    fullWidth
                    value={formData.comment}
                    onInputChange={(_e, newValue) => setFormData({ comment: newValue })}
                    options={[]}
                    TextFieldProps={{ multiline: true, rows: 3 }}
                  />
                </Grid>
              </Grid>
            )}
          />
        </Box>
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