// BirthHistory.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  DatePicker,
  AutocompleteButtons,
  Grid,
  RichTextEditor
} from 'components/ui/Core';
import { MarkReviewed } from 'components/ui/MarkReviewed';
import { usePatient, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export function BirthHistory() {
  const { useChart, useEncounter } = usePatient();
  const [{ birthdate }] = useChart()();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSocialHistory = React.useMemo(() => {
    return filterDocuments(socialHistory || [], conditionals, orders);
  }, [socialHistory, conditionals, orders]);

  const birthHistoryData = visibleSocialHistory[0]?.birth || {};
  const setBirthHistoryData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentBirth = next[0].birth || {};
      const newBirth = typeof update === 'function' ? update(currentBirth) : update;
      next[0] = { ...next[0], birth: newBirth };
      return next;
    });
  };

  const handleFieldChange = (field: string, value: any) => {
    setBirthHistoryData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommentsChange = (content: any) => {
    setBirthHistoryData((prev: any) => ({
      ...prev,
      comments: content
    }));
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Birth History</>} color="#9F3494">
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Birth length"
                  fullWidth
                  value={birthHistoryData?.birthLength || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthLength', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Birth weight"
                  fullWidth
                  value={birthHistoryData?.birthWeight || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthWeight', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Birth head circ"
                  fullWidth
                  value={birthHistoryData?.birthHeadCirc || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthHeadCirc', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Discharge weight"
                  fullWidth
                  value={birthHistoryData?.dischargeWeight || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('dischargeWeight', parseFloat(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Birth Date"
                  fullWidth
                  value={birthdate || ''}
                  options={[]}
                  TextFieldProps={{
                    disabled: true,
                    sx: {
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'black',
                        color: 'black'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Age"
                  fullWidth
                  value={Database.JSONDate.toAge(birthdate)}
                  options={[]}
                  TextFieldProps={{
                    disabled: true,
                    sx: {
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'black',
                        color: 'black'
                      }
                    }
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Birth Time"
                  fullWidth
                  value={birthHistoryData?.birthTime || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('birthTime', newValue)}
                  options={[]}
                  TextFieldProps={{ type: 'time', InputLabelProps: { shrink: true } }}
                />
              </Grid>

              <Grid size={6}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Gestation age (Weeks)"
                  fullWidth
                  value={birthHistoryData?.gestationWeeks || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('gestationWeeks', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 50 } }}
                />
              </Grid>

              <Grid size={6}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Gestation age (Days)"
                  fullWidth
                  value={birthHistoryData?.gestationDays || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('gestationDays', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 6 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="APGAR 1"
                  fullWidth
                  value={birthHistoryData?.apgar1 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar1', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="APGAR 5"
                  fullWidth
                  value={birthHistoryData?.apgar5 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar5', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="APGAR 10"
                  fullWidth
                  value={birthHistoryData?.apgar10 || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('apgar10', parseInt(newValue) || 0)}
                  options={[]}
                  TextFieldProps={{ type: 'number', inputProps: { min: 0, max: 10 } }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Full Width Fields */}
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <AutocompleteButtons
                  label="Delivery method"
                  options={Object.values(Database.SocialHistoryItem.DeliveryMethod)}
                  value={birthHistoryData?.deliveryMethod}
                  onChange={(_e, val) => handleFieldChange('deliveryMethod', val)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  size="small"
                  freeSolo
                  label="Duration of labor"
                  fullWidth
                  value={birthHistoryData?.durationOfLabor || ''}
                  onInputChange={(_e, newValue) => handleFieldChange('durationOfLabor', newValue)}
                  options={[]}
                />
              </Grid>

              <Grid size={12}>
                <AutocompleteButtons
                  label="Feeding method"
                  options={Object.values(Database.SocialHistoryItem.FeedingMethod)}
                  value={birthHistoryData?.feedingMethod}
                  onChange={(_e, val) => handleFieldChange('feedingMethod', val)}
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </Box>

      {/* Hospital Information */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Hospital information</Label>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DatePicker
              size="small"
              convertString
              fullWidth
              label="Date in hospital"
              value={birthHistoryData?.dateInHospital || ''}
              onChange={(date: any) => handleFieldChange('dateInHospital', date)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Hospital name"
              fullWidth
              value={birthHistoryData?.hospitalName || ''}
              onInputChange={(_e, newValue) => handleFieldChange('hospitalName', newValue)}
              options={[]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              size="small"
              freeSolo
              label="Hospital location"
              fullWidth
              value={birthHistoryData?.hospitalLocation || ''}
              onInputChange={(_e, newValue) => handleFieldChange('hospitalLocation', newValue)}
              options={[]}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Comments */}
      <Box paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <Label variant="h6">Comments:</Label>
        <RichTextEditor
          initialContent={birthHistoryData?.comments || ''}
          onSave={handleCommentsChange}
          disableStickyMenuBar={true}
          disableStickyFooter={true}
        />
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}