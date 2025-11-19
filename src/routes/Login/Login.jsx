import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Autocomplete, Box, Stack, Paper, Button, TextField, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { AuthContext } from 'components/contexts/AuthContext.jsx';
import ConfigureDialog from './components/ConfigureDialog.jsx'; // Import the dialog component
import Notification from './components/Notification.jsx';
import PromptDialog from './components/PromptDialog.jsx';

import patient_sample from 'util/data/patient_sample.json';

const departments = [
  { id: 20, name: "ABSTRACTION", identityId: 200302050, specialty: "Hospital Services", location: "Pre-Registration", serviceArea: "CARLE FOUNDATION HOSPITAL" },
  { id: 26, name: "ADULT MEDICINE PWAM PBB", identityId: 200612664, specialty: "Windsor Primary Care", location: "URBANA ON WINDSOR", serviceArea: "CARLE FOUNDATION HOSPITAL" },
  { id: 30, name: "EMERGENCY DEPARTMENT", identityId: 200703416, specialty: "Emergency Medicine", location: "Main Building", serviceArea: "CARLE FOUNDATION HOSPITAL" },
  { id: 30, name: "CARDIOLOGY", identityId: 200703456, specialty: "Heart Care", location: "Main Building", serviceArea: "CARLE FOUNDATION HOSPITAL" },
  // Add more rows as needed...
];

export const Login = ({ setIsLoggedIn }) => {
  const [displayDepts, setDisplayDepts] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState();
  const navigate = useNavigate();
  const { login, verifyPassword, updateEncounters, enabledEncounters } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

  const [patients, setPatients] = useState([]); // State to store the extracted patients
  const [encounterCounts, setEncounterCounts] = useState({}); // State as a hash object

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const [promptState, setPromptState] = useState({ open: false, title: '', placeholder: '', onConfirm: null });

  const showPrompt = (title, placeholder, onConfirm) => {
    setPromptState({ open: true, title, placeholder, onConfirm });
  };

  const closePrompt = () => {
    setPromptState({ ...promptState, open: false });
  };

  // Extract unique MRNs from patient_sample.json -> schedule
  useEffect(() => {
    const uniqueMRNs = Array.from(new Set(patient_sample.schedule.map((appt) => appt.patient.mrn)));
    setPatients(uniqueMRNs); // Set patients as a unique array of MRNs
  }, []);

  // Will get encounters in form {MRN: # of enc, MRN2: # of enc}
  useEffect(() => {
    const uniqueMRNs = Array.from(new Set(patient_sample.schedule.map((appt) => appt.patient.mrn)));

    // Retrieve encounters for each MRN and store in a hash
    const encountersHash = uniqueMRNs.reduce((acc, mrn) => {
      const patientInfo = patient_sample.patients[mrn]
      acc[mrn] = patientInfo?.encounters?.length || 0; // Use MRN as key and number of encounters as value
      return acc;
    }, {});

    setEncounterCounts(encountersHash); // Update state with the hash
  }, []);

  useEffect(() => {
    if (Object.keys(enabledEncounters).length === 0 && patients.length > 0) {
      const defaultEncounters = {};
      patients.forEach((mrn) => {
        defaultEncounters[mrn] = 0; // Default Encounter 0
      });
      updateEncounters(defaultEncounters);
    }
  }, [enabledEncounters, patients, updateEncounters]);

  // Handle login submission
  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password, department); // Authenticate user
    setIsLoggedIn(true); // Update parent state
  };

  // Handle password validation flow
  const handlePasswordValidation = async () => {
    return new Promise((resolve) => {
      showPrompt('Administrator Password', 'Enter your password', async (enteredPassword) => {
        if (!enteredPassword) {
          showNotification('No password entered. Access denied.', 'warning');
          resolve(false);
          return;
        }

        const isValid = await verifyPassword(enteredPassword);
        if (isValid) {
          // showNotification('Password verified successfully.', 'success');
          resolve(true);
        } else {
          showNotification('Incorrect password. Access denied.', 'error');
          resolve(false);
        }
      });
    });
  };

  // Open the configuration dialog after password validation
  const handleConfigure = async () => {
    const isAuthorized = await handlePasswordValidation(); // Validate password first
    if (isAuthorized) {
      setIsModalOpen(true); // Open the configuration modal if authorized
    }
  };

  // Close the configuration dialog
  const handleCloseDialog = () => {
    setIsModalOpen(false);
  };

  // Handle submitting the selected encounters
  const handleSubmitEncounters = (selectedEncounters) => {
    updateEncounters(selectedEncounters);
    handleCloseDialog();
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", position: "relative", bgcolor: "primary.dark" }}>
      <Paper elevation={6} sx={{ p: 4, minHeight: "98vh", width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", position: "relative" }}>
        <Typography variant="h2" sx={{ color: "primary.main", fontStyle: "italic", fontWeight: 900 }}>ProjectEHR</Typography>
        <Box component="form" sx={{ display: !displayDepts ? 'block' : 'none', width: "100%" }} onSubmit={(e) => { setDisplayDepts(true); e.preventDefault()}}>
          <TextField
            fullWidth
            margin="normal"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="User ID"
            required
          />
          <TextField
            fullWidth
            margin="normal"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <Button fullWidth sx={{ mt: 2, mb: 2 }} variant="contained" type="submit">
            Log In
          </Button>
        </Box>
        <Box component="form" sx={{ display: displayDepts ? 'block' : 'none', width: "100%" }} onSubmit={handleSubmit}>
          <Autocomplete
            fullWidth
            autoHighlight
            openOnFocus
            value={department}
            onChange={(e, v) => setDepartment(v)}
            options={departments}
            getOptionLabel={(option) => option.name}
            groupBy={(option) => 1 /* we only want one group total to draw the table header */}
            componentsProps={{ popper: { style: { width: 'fit-content' } } }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="normal"
                label="Select a department"
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    autoComplete: 'new-password', // disable autocomplete and autofill
                  },
                }}
              />
            )}
            renderGroup={({ key, group, children }) => (
              <Table key={key} sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Identity ID</TableCell>
                    <TableCell>Specialty</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Service Area</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {children}
                </TableBody>
              </Table>
            )}
            renderOption={({ key, ...optionProps }, option) => (
              <TableRow key={key} component="li" {...optionProps} className={null} sx={{ p: 0 }}>
                {/* className=MuiAutocomplete-option causes rendering problems */}
                <TableCell>{option.id}</TableCell>
                <TableCell>{option.name}</TableCell>
                <TableCell>{option.identityId}</TableCell>
                <TableCell>{option.specialty}</TableCell>
                <TableCell>{option.location}</TableCell>
                <TableCell>{option.serviceArea}</TableCell>
              </TableRow>
            )}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
            <Button fullWidth sx={{ }} variant="contained" type="submit">
              Continue
            </Button>
            <Button fullWidth sx={{ }} variant="outlined" type="submit">
              Cancel
            </Button>
          </Stack>
        </Box>
        <Box 
          sx={{ position: "absolute", bottom: 20, left: 20, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }} 
          onClick={handleConfigure}
        >
          <Icon style={{ fontSize: '36px', cursor: 'pointer' }}>settings</Icon>
        </Box>
      </Paper>

      {/* Configure Dialog Component */}
      <ConfigureDialog
        open={isModalOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitEncounters}
        patients={patients}
        encounterCounts={encounterCounts}
      />

      {/* Notification Component */}
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />

      {/* Prompt Dialog Component */}
      <PromptDialog
        open={promptState.open}
        onClose={closePrompt}
        title={promptState.title}
        placeholder={promptState.placeholder}
        onConfirm={promptState.onConfirm}
      />
    </Box>
  );
};
