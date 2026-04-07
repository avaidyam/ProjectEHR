import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Window, Stack, Label, Icon, IconButton, Divider, Autocomplete, TabView, TabList, Tab, TabPanel, Grid, Checkbox, DatePicker, Spacer } from '../../components/ui/Core';
import { Database, useDatabase } from 'components/contexts/PatientContext';
import { List, ListItem, ListItemText, ListItemButton, InputAdornment } from '@mui/material';

export const PatientLookup = ({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [patients, setPatientsDB] = useDatabase().patients()
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPatientMRN, setSelectedPatientMRN] = React.useState<Database.Patient.ID | null>(null);
  const [tabValue, setTabValue] = React.useState("2"); // Default to Recent Patients
  const [searchName, setSearchName] = React.useState("");
  const [searchSex, setSearchSex] = React.useState("");
  const [searchBirthDate, setSearchBirthDate] = React.useState<any>(null);

  // Reset state when closing or opening
  const handleClose = () => {
    setSearchQuery("");
    setSelectedPatientMRN(null);
    setTabValue("2");
    setSearchName("");
    setSearchSex("");
    setSearchBirthDate(null);
    onClose();
  };

  const patientList = React.useMemo(() => {
    if (!searchQuery) return Object.values(patients);
    const query = searchQuery.trim().toLowerCase();
    const isNumber = /^\d+$/.test(query);

    return Object.values(patients).filter((p: Database.Patient) => {
      if (isNumber) {
        return (p.id || "").toString().includes(query);
      }
      return (p.firstName || "").toLowerCase().includes(query) ||
             (p.lastName || "").toLowerCase().includes(query) ||
             (p.id || "").toString().includes(query);
    });
  }, [patients, searchQuery]);

  const handleFindPatient = () => {
    if (!searchName) return;
    const query = searchName.trim();
    const isNumber = /^\d+$/.test(query);

    if (isNumber) {
      const match = Object.values(patients).find(p => p.id === query);
      if (match) {
        handlePatientSelect(match.id);
        return;
      }
    }

    setSearchQuery(query);
    setTabValue("2");
  };

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

  const handleCreatePatient = () => {
    let mrnID = Database.Patient.ID.create()

    let firstName = "Doe";
    let lastName = Database.Patient.RANDOM_DOE_NAME();

    const query = searchName.trim();
    const isNumber = /^\d+$/.test(query);

    if (query && !isNumber) {
      const parts = query.split(/\s+/);
      if (parts.length > 1) {
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        lastName = parts[0];
      }
    } else if (query && isNumber) {
      // Ensure we don't treat numeric input as a name; just use it as the proposed MRN
      // or jump to patient if exact match exists.
      const existing = Object.values(patients).find(p => p.id === query);
      if (existing) {
        handlePatientSelect(existing.id);
        return;
      }
      mrnID = query as Database.Patient.ID;
    }

    setPatientsDB((prev: Record<string, Database.Patient>) => ({
      ...prev,
      [mrnID]: {
        id: mrnID,
        firstName,
        lastName,
        birthdate: searchBirthDate || "1890-01-01T00:00:00.000Z",
        gender: searchSex as Database.Patient.Gender || "Unknown",
        encounters: {}
      }
    }))
    handleClose()
    navigate(`/patient/${mrnID}`)
  }

  const handleClear = () => {
    setSearchName("");
    setSearchSex("");
    setSearchBirthDate(null);
  };

  const renderRecentPatients = () => (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Autocomplete
        freeSolo
        autoFocus
        placeholder="Filter Recent Patients..."
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

  const renderPatientSearch = () => (
    <Stack spacing={2} sx={{ height: '100%', p: 1 }}>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid size={6}>
          <Autocomplete
            fullWidth
            freeSolo
            size="small"
            options={[]}
            label="Name/MRN"
            value={searchName}
            onInputChange={(_e, val) => setSearchName(val)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFindPatient();
            }}
          />
        </Grid>
        <Grid size={6}>
          <Autocomplete fullWidth freeSolo size="small" options={[]} disabled label="EHR ID" />
        </Grid>

        {/* Row 2 */}
        <Grid size={6}>
          <Autocomplete
            fullWidth
            freeSolo
            size="small"
            disabled
            options={[]}
            label="SSN"
            TextFieldProps={{
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon sx={{ fontSize: 18, mr: 0.5 }}>calculator</Icon>
                    <Icon sx={{ fontSize: 18 }}>search</Icon>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={6}>
          <Autocomplete
            fullWidth
            freeSolo
            size="small"
            options={["Unknown", "Male", "Female", "Other"]}
            label="Sex"
            value={searchSex}
            onInputChange={(_e, val) => setSearchSex(val)}
            TextFieldProps={{
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon sx={{ fontSize: 18 }}>search</Icon>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        {/* Row 3 */}
        <Grid size={6}>
          <DatePicker
            fullWidth
            size="small"
            label="Birthdate"
            value={searchBirthDate}
            onChange={(val: any) => setSearchBirthDate(val)}
            convertString
          />
        </Grid>
      </Grid>

      <Spacer />

      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Button variant="outlined" onClick={handleCreatePatient}>New</Button>
        <Button variant="outlined" onClick={handleFindPatient}>Find Patient</Button>
        <Button variant="outlined" onClick={handleClear}>Clear</Button>
        <Spacer />
        <Button variant="outlined" disabled>Accept</Button>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
      </Stack>
    </Stack>
  );

  const renderStep2 = () => {
    const patient = patients[selectedPatientMRN!];
    if (!patient) return <Box>Error: Patient not found</Box>;

    const encounters = Object.values(patient.encounters || {})
      .filter(a => !!a.id) // remove undefined encounters
      .sort((a, b) => Temporal.Instant.compare(
        Temporal.Instant.from(b.startDate ?? "1970-01-01T00:00:00Z"), 
        Temporal.Instant.from(a.startDate ?? "1970-01-01T00:00:00Z")
      ));

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
          <ListItemButton onClick={() => { navigate(`/patient/${selectedPatientMRN}`); handleClose(); }}>
            <ListItemText
              primary="Chart Review"
            />
            <Icon>manage_search</Icon>
          </ListItemButton>
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
      ContentProps={{ sx: { p: 0 } }} // Remove padding for tabs
    >
      {selectedPatientMRN ? (
        <Box sx={{ p: 3, height: '100%' }}>
          {renderStep2()}
        </Box>
      ) : (
        <TabView value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={(_e, val) => setTabValue(val)}>
              <Tab label="Patient Search" value="1" />
              <Tab label="Recent Patients" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1" sx={{ height: 'calc(100% - 49px)', p: 2 }}>
            {renderPatientSearch()}
          </TabPanel>
          <TabPanel value="2" sx={{ height: 'calc(100% - 49px)', p: 2 }}>
            {renderRecentPatients()}
          </TabPanel>
        </TabView>
      )}
    </Window>
  );
};
