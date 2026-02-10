import React, { useState } from 'react';
import DateHelpers from 'util/helpers.js';
import { Divider, Alert, Typography, Avatar, Fade, Paper, Popper, colors, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { usePatient, useDatabase } from 'components/contexts/PatientContext.jsx';
import { filterDocuments } from 'util/helpers'
import { StickyNote } from './StickyNote'
import {
  Window, Button, TextField, Icon, IconButton
} from 'components/ui/Core.jsx';

const _isBPProblematic = ({ systolic, diastolic }) => systolic > 130 || diastolic > 90; // htn
const _isBMIProblematic = ({ bmi }) => bmi > 30; // obese

export const VitalsPopup = ({ vitals, definition, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const handleMenuOpen = (e) => {
    setOpen(true);
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  // Determine which rows to show: only those that have at least one non-null value in the vitals array
  // and are defined in the flowsheet definition.
  const rowsToShow = definition?.rows?.filter(row => {
    return vitals.some(v => v[row.name] != null && v[row.name] !== "");
  }) ?? [];

  // Special handling to combine BP fields
  let bpRowAdded = false;
  const processedRows = rowsToShow.flatMap(row => {
    if (row.name.startsWith('bloodPressure')) {
      if (bpRowAdded) return [];
      bpRowAdded = true;
      return [{ name: 'bp', label: 'Blood Pressure (mmHg)' }];
    }
    return [row];
  });

  return (
    <div style={{ display: 'flex', flexDirection: "column" }} onMouseEnter={handleMenuOpen} onMouseLeave={handleMenuClose}>
      <span>Temp: {vitals[0]?.temp}</span>
      <span
        style={_isBPProblematic({ systolic: vitals[0]?.sbp, diastolic: vitals[0]?.dbp }) ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BP: {vitals[0]?.sbp}/{vitals[0]?.dbp}
      </span>
      <span>HR: {vitals[0]?.hr}</span>
      <span
        style={_isBMIProblematic({ bmi: vitals[0]?.bmi }) ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BMI: {vitals[0]?.bmi} ({vitals[0]?.weight} lbs)
      </span>
      <Popper open={open} anchorEl={anchorEl} placement="right" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={100}>
            <Paper
              style={{
                display: "flex",
                border: '1px solid',
                padding: '1em',
                fontSize: '0.9em',
              }}
            >
              <div style={{ display: 'flex', flexDirection: "column", padding: "10px 10px 10px 10px" }}>
                <span style={{ visibility: 'hidden' }}>hidden</span>
                {processedRows.map(row => (
                  <span key={row.name}>{row.label || row.name}</span>
                ))}
              </div>
              <div style={{ display: "flex", flex: 1 }}>
                {vitals.map((entry) => (
                  <div
                    key={entry.date}
                    style={{ display: 'flex', flexDirection: "column", textAlign: "right", padding: "10px 10px 10px 10px" }}
                  >
                    <span>{DateHelpers.convertToDateTime(entry.date).toFormat('MM/dd/yy')}</span>
                    {processedRows.map(row => {
                      if (row.name === 'bp') {
                        const { sbp: sys, dbp: dia } = entry;
                        if (sys == null && dia == null) return <br key={row.name} />;
                        return <span key={row.name}>{sys ?? 'x'} / {dia ?? 'x'}</span>;
                      }
                      return <span key={row.name}>{entry[row.name] ?? <br />}</span>
                    })}
                  </div>
                ))}
              </div>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export const SidebarVitals = ({ ...props }) => {
  const { useChart, useEncounter } = usePatient()
  const [flowsheets] = useEncounter().flowsheets([])

  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()
  const [flowsheetDefs] = useDatabase().flowsheets()

  const allFlowsheets = flowsheets?.filter(f => f.flowsheet === "1002339") ?? []
  const vitalsDefinition = flowsheetDefs?.find(f => f.id === "1002339")
  const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)

  /** sort most recent to older */
  const _t = (x) => DateHelpers.convertToDateTime(x.date).toMillis()
  const allVitals = (vitals2 ?? []).toSorted((a, b) => _t(b) - _t(a))
  const mostRecentDate = allVitals[0]?.date;
  const mostRecentDT = DateHelpers.convertToDateTime(mostRecentDate);
  const vitalsDateLabel = mostRecentDT && mostRecentDT.isValid ? ` ${DateHelpers.standardFormat(mostRecentDate)}` : '';
  return (
    <div style={{ display: 'flex', flexDirection: "column" }}>
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Vitals{vitalsDateLabel}
      </Typography>
      {allVitals[0] ? (
        <VitalsPopup vitals={allVitals} definition={vitalsDefinition} />
      ) : (
        <i>No vitals to display</i>
      )}
    </div>
  );
};

export const SidebarPatientInfo = () => {
  const { useChart, useEncounter } = usePatient();
  const [mrn] = useChart().id();
  const [firstName] = useChart().firstName();
  const [lastName] = useChart().lastName();
  const [birthdate] = useChart().birthdate();
  const [preferredLanguage] = useChart().preferredLanguage();
  const [avatarUrl] = useChart().avatarUrl();
  const [gender] = useChart().gender();
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
        <Avatar
          src={avatarUrl}
          sx={{ zIndex: 2, bgcolor: colors.deepOrange[500], height: 80, width: 80 }}
        >
          {[firstName, lastName].map(x => x?.charAt(0) ?? '').join("")}
        </Avatar>

        {/* Stacked sticky buttons positioned to the left of the centered avatar */}
        <Box sx={{ position: 'absolute', left: 'calc(50% - 84px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <StickyNote />
        </Box>
      </Box>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', marginBottom: '1em' }}>
        <strong>{firstName} {lastName}</strong>
        <span>Sex: {gender}</span>
        <span>Age: {new Date(birthdate).age()} years old</span>
        <span>DOB: {DateHelpers.standardFormat(birthdate)}</span>
        <span>MRN: {mrn}</span>
        <strong>Preferred language: {preferredLanguage}</strong>
        {preferredLanguage !== 'English' &&
          <Alert variant="filled" severity="warning">Needs Interpreter</Alert>
        }
      </div>
    </div>
  )
}



const CareTeamDialog = ({ open, onClose, careTeam, setCareTeam, allProviders }) => {
  const [localCareTeam, setLocalCareTeam] = useState(careTeam || []);
  const [newProviderId, setNewProviderId] = useState('');
  const [newProviderRole, setNewProviderRole] = useState('');

  // Sync local state when prop changes
  React.useEffect(() => {
    setLocalCareTeam(careTeam || []);
  }, [careTeam]);

  const handleSave = () => {
    setCareTeam(localCareTeam);
    onClose();
  };

  const handleAddMember = () => {
    if (newProviderId && newProviderRole) {
      // Check if already exists
      if (localCareTeam.some(m => m.provider === newProviderId)) {
        alert("Provider already in care team!");
        return;
      }
      setLocalCareTeam([...localCareTeam, { provider: newProviderId, role: newProviderRole }]);
      setNewProviderId('');
      setNewProviderRole('');
    }
  };

  const handleRemoveMember = (providerId) => {
    setLocalCareTeam(localCareTeam.filter(m => m.provider !== providerId));
  };

  const handleRoleChange = (providerId, newRole) => {
    setLocalCareTeam(localCareTeam.map(m =>
      m.provider === providerId ? { ...m, role: newRole } : m
    ));
  };

  // Filter out providers already in the team for the dropdown
  const availableProviders = allProviders.filter(p => !localCareTeam.some(m => m.provider === p.id));

  return (
    <Window
      open={open}
      onClose={onClose}
      title="Manage Care Team"
      maxWidth="md"
      fullWidth
      footer={
        <Button variant="contained" onClick={handleSave}>Save Changes</Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* List of current members */}
        {localCareTeam.map((member) => {
          const provider = allProviders.find(p => p.id === member.provider);
          return (
            <Box key={member.provider} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
              <Avatar
                src={provider?.avatarUrl}
                sx={{ bgcolor: colors.blue[500], height: 40, width: 40 }}
              >
                {provider?.name.split(" ").map(x => x?.charAt(0) ?? '').join("")}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{provider?.name}</Typography>
                <Typography variant="caption" color="textSecondary">{provider?.specialty}</Typography>
              </Box>
              <TextField
                label="Role"
                size="small"
                value={member.role}
                onChange={(e) => handleRoleChange(member.provider, e.target.value)}
                sx={{ width: 150 }}
              />
              <IconButton onClick={() => handleRemoveMember(member.provider)} color="error">
                <Icon>delete</Icon>
              </IconButton>
            </Box>
          );
        })}

        {localCareTeam.length === 0 && <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No care team members assigned.</Typography>}

        <Divider sx={{ my: 1 }}>Add New Member</Divider>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Provider</InputLabel>
            <Select
              value={newProviderId}
              label="Provider"
              onChange={(e) => setNewProviderId(e.target.value)}
            >
              {availableProviders.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name} - {p.specialty}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Role"
            size="small"
            fullWidth
            value={newProviderRole}
            onChange={(e) => setNewProviderRole(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddMember} disabled={!newProviderId || !newProviderRole}>
            Add
          </Button>
        </Box>
      </Box>
    </Window>
  );
};

export const SidebarCareTeam = () => {
  const { useChart } = usePatient();
  const [careTeam, setCareTeam] = useChart().careTeam();
  const [providers] = useDatabase().providers();
  const [insurance] = useChart().insurance();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={{ display: 'flex', flexDirection: "column", marginBottom: '1em', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        <Typography variant="h6" color="inherit" style={{ fontSize: '1.25em', marginBottom: '0.5em' }}>
          Care Team <Icon sx={{ fontSize: '0.8em', verticalAlign: 'middle', opacity: 0.5 }}>edit</Icon>
        </Typography>
        {(careTeam || []).map((member) => {
          const provider = providers.find(p => p.id === member.provider);
          return (
            <div key={member.provider} style={{ display: 'flex', marginBottom: '0.5em' }}>
              <Avatar
                src={provider?.avatarUrl}
                sx={{ bgcolor: colors.blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}
              >
                {provider?.name.split(" ").map(x => x?.charAt(0) ?? '').join("")}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: "column", margin: 'auto 0 auto 0' }}>
                <span>{provider?.name}</span>
                <strong>{member.role}</strong>
              </div>
            </div>
          )
        })}
        {(!careTeam || careTeam.length === 0) && <i>Click to add care team</i>}
      </div>
      <span>Coverage: <span style={{ textTransform: 'uppercase' }}>{insurance?.carrierName}</span></span>

      <CareTeamDialog
        open={open}
        onClose={() => setOpen(false)}
        careTeam={careTeam}
        setCareTeam={setCareTeam}
        allProviders={providers}
      />
    </>
  )
}

export const SidebarAllergies = () => {
  const { useChart, useEncounter } = usePatient();
  const [allergies, setAllergies] = useEncounter().allergies();
  return (
    <>
      {allergies && allergies.length > 0 ? (
        allergies.some(a => a.severity?.toLowerCase() === 'high') ? (
          <Alert
            icon={false}
            sx={{
              mt: .5, py: 0.1,
              bgcolor: '#ffcb00',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            Allergies: {allergies.map(a => a.allergen).join(", ")}
          </Alert>
        ) : (
          <span>Allergies: {allergies.map(a => a.allergen).join(", ")}</span>
        )
      ) : (
        <span>Allergies: None on file</span>
      )}
    </>
  )
}

export const SidebarClinicalImpressions = () => {
  const { useChart, useEncounter } = usePatient();
  const [clinicalImpressions, setClinicalImpressions] = useEncounter().clinicalImpressions();
  return (
    <>
      <Typography variant="h6" color="inherit" style={{ fontSize: '1.25em' }}>
        Clinical Impressions
      </Typography>
      {clinicalImpressions?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {clinicalImpressions.map((ci, idx) => (
            <div key={idx}>{idx + 1}. {ci.name}</div>
          ))}
        </div>
      ) : (
        <i>No clinical impressions on file</i>
      )}
    </>
  )
}

export const SidebarSepsisAlert = () => {
  const { useChart, useEncounter } = usePatient();
  const [flowsheets] = useEncounter().flowsheets([]);
  const [labs] = useEncounter().labs([]);
  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()

  const allFlowsheets = flowsheets?.filter(f => f.flowsheet === "1002339") ?? []
  const vitals2 = filterDocuments(allFlowsheets, conditionals, orders)
  const labsFiltered = filterDocuments(labs, conditionals, orders)

  /** sort most recent to older */
  const _t = (x) => DateHelpers.convertToDateTime(x.date).toMillis()
  const allVitals = (vitals2 ?? []).toSorted((a, b) => _t(b) - _t(a))

  const _t2 = (x) => DateHelpers.convertToDateTime(x["date"]).toMillis()
  const wbcLabs = labsFiltered
    .toSorted((a, b) => _t2(b) - _t2(a))
    .flatMap(d => d.components)
    .filter(x => x?.name === "WBC")
    .map(x => x?.value > x?.high)
    .filter(x => x)

  // SIRS criteria (4/4): T > 38, HR > 100, RR > 22, WBC > 11
  const isSepsis = (allVitals[0]?.rr > 22) && (allVitals[0]?.hr > 100) && (allVitals[0]?.temp > 38) && (wbcLabs.length > 0)

  return isSepsis ?
    <Alert
      icon={false}
      sx={{
        mt: .5, py: 0.1,
        bgcolor: '#ffcb00',
        color: 'black',
        fontWeight: 'bold',
      }}
    >
      Sepsis Alert
    </Alert> :
    <></>
}

export const SidebarProblemList = () => {
  const { useChart, useEncounter } = usePatient();
  const [problems, setProblems] = useEncounter().problems();
  return (
    <>
      <Typography variant="h6" style={{ fontSize: '1.25em' }}>
        Problem List ({problems?.length})
      </Typography>
      {problems?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {problems.map((p, idx) => (<div key={JSON.stringify(p)}>{p.display ? p.display : p.diagnosis}</div>))}
        </div>
      ) : (
        <i>No problems on file</i>
      )}
    </>
  )
}

export const Storyboard = () => {
  const { useChart, useEncounter } = usePatient();
  const [encounter] = useEncounter()();
  return (
    <>
      <SidebarPatientInfo />
      <SidebarSepsisAlert />
      <Divider sx={{ bgcolor: "primary.light" }} />
      <SidebarCareTeam />
      <Divider sx={{ bgcolor: "primary.light" }} />
      <SidebarAllergies />
      <Divider sx={{ bgcolor: "primary.light" }} />
      {!!encounter ?
        <>
          <Typography variant="h6">Encounter</Typography>
          <Typography>Type: {encounter?.type}</Typography>
          <Typography>Date: {encounter?.startDate}</Typography>
          <Typography>Reason: {encounter?.concerns?.join(", ")}</Typography>
        </> :
        <>
          <Typography variant="h6">Chart Review</Typography>
        </>
      }
      <Divider sx={{ bgcolor: "primary.light" }} />
      <SidebarVitals />
      <Divider sx={{ bgcolor: "primary.light" }} />
      <Divider sx={{ bgcolor: "primary.light" }} />
      <SidebarClinicalImpressions />
      <Divider sx={{ bgcolor: "primary.light" }} />
      <SidebarProblemList />
    </>
  );
};
