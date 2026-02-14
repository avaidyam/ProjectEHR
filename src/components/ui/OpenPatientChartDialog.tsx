import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Window, Stack, Label, Icon, IconButton, Divider, Autocomplete } from './Core';
import { useDatabase } from '../contexts/PatientContext';
import * as Database from '../contexts/Database';
import { List, ListItem, ListItemText, ListItemButton, InputAdornment } from '@mui/material';

export const OpenPatientChartDialog = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [patients] = useDatabase().patients()
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatientMRN, setSelectedPatientMRN] = React.useState<Database.Patient.ID | null>(null);

  // Reset state when closing or opening
  const handleClose = () => {
    setSearchQuery("");
    setSelectedPatientMRN(null);
    onClose();
  };

  const patientList = React.useMemo(() => {
    if (!searchQuery) return Object.values(patients);
    const lowerQuery = searchQuery.toLowerCase();
    return Object.values(patients).filter((p: Database.Patient) =>
      (p.firstName || "").toLowerCase().includes(lowerQuery) ||
      (p.lastName || "").toLowerCase().includes(lowerQuery) ||
      (p.id || "").toString().includes(lowerQuery)
    );
  }, [patients, searchQuery]);

  const handlePatientSelect = (mrn: Database.Patient.ID) => {
    setSelectedPatientMRN(mrn);
  };

  const handleEncounterSelect = (encID: Database.Encounter.ID) => {
    navigate(`/patient/${selectedPatientMRN}/encounter/${encID}`);
    handleClose();
  };

  const handleBack = () => {
    setSelectedPatientMRN(null);
  };

  const renderStep1 = () => (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Autocomplete
        freeSolo
        autoFocus
        placeholder="Search by Name or MRN..."
        value={searchQuery}
        onInputChange={(_e, newValue) => setSearchQuery(newValue)}
        TextFieldProps={{
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon>search</Icon>
              </InputAdornment>
            ),
          }
        }}
        fullWidth
        options={[]}
      />
      <List sx={{ overflow: 'auto', flex: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        {patientList.map(patient => (
          <React.Fragment key={patient.id}>
            <ListItemButton onClick={() => handlePatientSelect(patient.id)}>
              <ListItemText
                primary={`${patient.lastName}, ${patient.firstName}`}
                secondary={`MRN: ${patient.id} • DOB: ${Database.JSONDate.toDateString(patient.birthdate)}`}
              />
              <Icon color="action">chevron_right</Icon>
            </ListItemButton>
            <Divider component="li" />
          </React.Fragment>
        ))}
        {patientList.length === 0 && (
          <ListItem>
            <ListItemText primary="No patients found" sx={{ textAlign: 'center', color: 'text.secondary' }} />
          </ListItem>
        )}
      </List>
    </Stack>
  );

  const renderStep2 = () => {
    const patient = patients[selectedPatientMRN!];
    if (!patient) return <Box>Error: Patient not found</Box>;

    const encounters = Object.values(patient.encounters || {}).sort((a, b) => Temporal.Instant.compare(Temporal.Instant.from((b.startDate)), Temporal.Instant.from((a.startDate))));

    return (
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handleBack} size="small">
            <Icon>arrow_back</Icon>
          </IconButton>
          <Box>
            <Label bold>{patient.lastName}, {patient.firstName}</Label>
            <Label variant="caption" color="text.secondary">MRN: {patient.id}</Label>
          </Box>
        </Stack>
        <Divider />
        <Label variant="subtitle2" color="text.secondary">Select Encounter</Label>
        <List sx={{ overflow: 'auto', flex: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          {encounters.map((enc) => (
            <React.Fragment key={enc.id}>
              <ListItemButton onClick={() => handleEncounterSelect(enc.id)}>
                <ListItemText
                  primary={enc.type || "Unknown Type"}
                  secondary={`${Database.JSONDate.toDateString(enc.startDate)} • ${enc.specialty || "No Specialty"} • ${enc.provider || "No Provider"}`}
                />
                <Icon color="action">open_in_new</Icon>
              </ListItemButton>
              <Divider component="li" />
            </React.Fragment>
          ))}
          {encounters.length === 0 && (
            <ListItem>
              <ListItemText primary="No encounters found" sx={{ textAlign: 'center', color: 'text.secondary' }} />
            </ListItem>
          )}
        </List>
      </Stack>
    );
  };

  return (
    <Window
      open={open}
      onClose={handleClose}
      title="Open Patient Chart"
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { height: '60vh' } }}
    >
      {selectedPatientMRN ? renderStep2() : renderStep1()}
    </Window>
  );
};
