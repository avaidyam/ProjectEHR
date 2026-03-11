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
import { filterDocuments } from 'util/helpers';

export function SocialHistorySocioeconomic() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSocialHistory = React.useMemo(() => {
    return filterDocuments(socialHistory || [], conditionals, orders);
  }, [socialHistory, conditionals, orders]);

  const socioeconomicData = visibleSocialHistory[0] || {};
  const setSocioeconomicData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentSocio = next[0] || {};
      const newSocio = typeof update === 'function' ? update(currentSocio) : update;
      next[0] = { ...next[0], ...newSocio };
      return next;
    });
  };

  // Current occupation handlers
  const handleCurrentOccupationChange = (field: string, value: any) => {
    setSocioeconomicData((prev: any) => ({
      ...prev,
      occupational: {
        ...prev.occupational,
        [field]: value
      }
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
              value={socioeconomicData?.occupational?.occupation || ''}
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
              value={socioeconomicData?.occupational?.employer || ''}
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
            value={socioeconomicData?.occupational?.history || []}
            onChange={(val) => setSocioeconomicData((prev: any) => ({ ...prev, occupational: { ...prev.occupational, history: val } }))}
            template={{ occupation: '', employer: '', comment: '' }}
            columns={[
              { field: 'occupation', headerName: 'Occupation', flex: 1 },
              { field: 'employer', headerName: 'Employer', flex: 1 },
              { field: 'comment', headerName: 'Comment', flex: 1.5 }
            ]}
            getRowId={(row: any) => row.id}
            addNewLabel="Add New Occupation"
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
              options={Object.values(Database.SocialHistoryItem.MaritalStatus)}
              value={socioeconomicData?.demographics?.maritalStatus}
              onChange={(_e, val) => handleDemographicsChange('maritalStatus', val)}
            />
          </Grid>
          <Grid size={12}>
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
          <Grid size={12}>
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
            <Autocomplete
              size="small"
              fullWidth
              label="Highest education level:"
              options={Object.values(Database.SocialHistoryItem.HighestEducationLevel)}
              value={socioeconomicData?.demographics?.highestEducationLevel}
              onInputChange={(_e, val) => handleDemographicsChange('highestEducationLevel', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              fullWidth
              label="Preferred Language:"
              options={Object.values(Database.SocialHistoryItem.PreferredLanguage)}
              value={socioeconomicData?.demographics?.preferredLanguage}
              onInputChange={(_e, val) => handleDemographicsChange('preferredLanguage', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              fullWidth
              label="Ethnic Group:"
              options={Object.values(Database.SocialHistoryItem.EthnicGroup)}
              value={socioeconomicData?.demographics?.ethnicGroup}
              onInputChange={(_e, val) => handleDemographicsChange('ethnicGroup', val)}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              size="small"
              freeSolo
              fullWidth
              label="Race:"
              options={Object.values(Database.SocialHistoryItem.Race)}
              value={socioeconomicData?.demographics?.race}
              onInputChange={(_e, val) => handleDemographicsChange('race', val)}
            />
          </Grid>
        </Grid>
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}