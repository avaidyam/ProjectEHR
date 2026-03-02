import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Button, Label, Icon, Table, TableHead, TableBody, TableRow, TableCell, Autocomplete } from 'components/ui/Core';
import { TextField } from '@mui/material'
import { AuthContext, AuthContextType } from 'components/contexts/AuthContext';
import { AlertColor } from '@mui/material';
import { ConfigureDialog } from './components/ConfigureDialog';
import { Notification } from './components/Notification';
import { PromptDialog } from './components/PromptDialog';
import { useDatabase, Database } from 'components/contexts/PatientContext';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [patientsDB] = useDatabase().patients();
  const [schedules] = useDatabase().schedules();
  const [departments] = useDatabase().departments();

  const [displayDepts, setDisplayDepts] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [department, setDepartment] = React.useState<Database.Department>();
  const navigate = useNavigate();
  const { login, verifyPassword, updateEncounters, enabledEncounters } = React.useContext(AuthContext) as AuthContextType;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [patients, setPatients] = React.useState<string[]>([]);
  const [encounterCounts, setEncounterCounts] = React.useState<Record<string, number>>({});

  const [notification, setNotification] = React.useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'info' });

  const showNotification = (message: string, severity: AlertColor = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const [promptState, setPromptState] = React.useState<{ open: boolean; title: string; placeholder: string; onConfirm: ((value: string) => void) | null }>({ open: false, title: '', placeholder: '', onConfirm: null });

  const showPrompt = (title: string, placeholder: string, onConfirm: (value: string) => void) => {
    setPromptState({ open: true, title, placeholder, onConfirm });
  };

  const closePrompt = () => {
    setPromptState({ ...promptState, open: false });
  };

  React.useEffect(() => {
    const allAppointments = schedules.flatMap((s) => s.appointments);
    const uniqueMRNs = Array.from(new Set(allAppointments.map((appt) => appt.patient.mrn))) as string[];
    setPatients(uniqueMRNs);
  }, [schedules]);

  React.useEffect(() => {
    const allAppointments = schedules.flatMap((s) => s.appointments)
    const uniqueMRNs = Array.from(new Set(allAppointments.map((appt) => appt.patient.mrn)))

    const encountersHash = uniqueMRNs.reduce((acc, mrn) => {
      const patientInfo = patientsDB[mrn];
      acc[mrn] = Object.keys(patientInfo.encounters).length;
      return acc;
    }, {} as Record<Database.Patient.ID, number>);

    setEncounterCounts(encountersHash);
  }, [schedules, patientsDB]);

  React.useEffect(() => {
    if (Object.keys(enabledEncounters).length === 0 && patients.length > 0) {
      const defaultEncounters: Record<string, number | null> = {};
      patients.forEach((mrn) => {
        defaultEncounters[mrn] = 0;
      });
      updateEncounters(defaultEncounters as any);
    }
  }, [enabledEncounters, patients, updateEncounters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password, department!.name);
    setIsLoggedIn(true);
  };

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
          resolve(true);
        } else {
          showNotification('Incorrect password. Access denied.', 'error');
          resolve(false);
        }
      });
    });
  };

  const handleConfigure = async () => {
    const isAuthorized = await handlePasswordValidation();
    if (isAuthorized) {
      setIsModalOpen(true);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", position: "relative", bgcolor: "primary.dark" }}>
      <Box paper elevation={6} sx={{ p: 4, minHeight: "98vh", width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", position: "relative" }}>
        <Label variant="h2" sx={{ color: "primary.main", fontStyle: "italic", fontWeight: 900 }}>ProjectEHR</Label>
        <Box component="form" sx={{ display: !displayDepts ? 'block' : 'none', width: "100%" }} onSubmit={(e) => { setDisplayDepts(true); e.preventDefault() }}>
          <Autocomplete
            freeSolo
            fullWidth
            value={username}
            onInputChange={(_e, newValue) => setUsername(newValue)}
            label="User ID"
            options={[]}
            sx={{ mt: 2, mb: 2 }}
          />
          <Autocomplete
            freeSolo
            fullWidth
            value={password}
            onInputChange={(_e, newValue) => setPassword(newValue)}
            label="Password"
            options={[]}
            TextFieldProps={{ type: "password" }}
            sx={{ mb: 2 }}
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
            onChange={(e, v) => setDepartment(v || undefined)}
            options={departments}
            getOptionLabel={(option) => option.name}
            groupBy={(_) => '1' /* we only want one group total to draw the table header */}
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
              <TableRow key={key} component="li" {...(optionProps as any)} className={undefined} sx={{ p: 0 }}>
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
            <Button fullWidth sx={{}} variant="contained" type="submit">
              Continue
            </Button>
            <Button fullWidth sx={{}} variant="outlined" type="submit">
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
      </Box>

      <ConfigureDialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        onSubmit={(selectedEncounters) => {
          updateEncounters(selectedEncounters as any)
          setIsModalOpen(false)
        }}
        patients={patients}
        encounterCounts={encounterCounts}
      />

      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />

      <PromptDialog
        open={promptState.open}
        onClose={closePrompt}
        title={promptState.title}
        placeholder={promptState.placeholder}
        onConfirm={promptState.onConfirm!}
      />
    </Box>
  );
};
