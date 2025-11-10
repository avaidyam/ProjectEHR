import React, { useState, useContext, useEffect, useRef } from 'react';
import { Divider, Alert, Typography, Avatar, Fade, Paper, Popper, colors, Box, FormControl, Select, MenuItem, Tooltip, IconButton, TextField } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import DateHelpers from 'util/helpers.js';
import { Icon, Label, Window } from 'components/ui/Core.jsx';

const _isBPProblematic = ({ systolic, diastolic }) => systolic > 130 || diastolic > 90; // htn
const _isBMIProblematic = ({ bmi }) => bmi > 30; // obese

export const VitalsPopup = ({ vitals, ...props }) => {
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
  const {
    measurementDate,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    height,
    weight,
    bmi,
    respiratoryRate,
    heartRate,
    SpO2,
    Temp
  } = vitals[0] ?? {};
  return (
    <div style={{ display: 'flex', flexDirection: "column" }} onMouseEnter={handleMenuOpen} onMouseLeave={handleMenuClose}>
      <span>Temp: {Temp}</span>
      <span
        style={_isBPProblematic({systolic: bloodPressureSystolic, diastolic: bloodPressureDiastolic}) ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BP: {bloodPressureSystolic}/{bloodPressureDiastolic}
      </span>
      <span>HR: {heartRate}</span>
      <span
        style={_isBMIProblematic({ bmi }) ? { backgroundColor: 'rgb(219, 40, 40, 0.7)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BMI: {bmi} ({weight} lbs)
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
                <span>Temperature (˚C)</span>
                <span>Blood Pressure (mmHg)</span>
                <span>Pulse Rate (bpm)</span>
                <span>Respiratory Rate (bpm)</span>
                <span>SpO2 (%)</span>
                <span>Height (cm)</span>
                <span>Weight (kg)</span>
                <span>BMI (kg/m2)</span>
              </div>
              <div style={{ display: "flex", flex: 1 }}>
                {vitals.map((vitals) => (
                  <div
                    key={vitals.measurementDate}
                    style={{ display: 'flex', flexDirection: "column", textAlign: "right", padding: "10px 10px 10px 10px" }}
                  >
                    <span>{DateHelpers.convertToDateTime(vitals.measurementDate).toFormat('MM/dd/yy')}</span>
                    <span>{vitals.Temp ?? <br />}</span>
                    <span>{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</span>
                    <span>{vitals.heartRate ?? <br />}</span>
                    <span>{vitals.respiratoryRate ?? <br />}</span>
                    <span>{vitals.SpO2 ?? <br />}</span>
                    <span>{vitals.height ?? <br />}</span>
                    <span>{vitals.weight ?? <br />}</span>
                    <span>{vitals.bmi ?? <br />}</span>
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

const StickyNote = () => {
  const { useChart, useEncounter } = usePatient();
  const chart = useChart();

  // Wait until chart is loaded
  if (!chart) return null;

  // separate state for private note and department note so both can be open
  const [privateOpen, setPrivateOpen] = useState(false);
  const [privateContent, setPrivateContent] = useState('');

  const [deptOpen, setDeptOpen] = useState(false);
  const [deptContent, setDeptContent] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentDept, setCurrentDept] = useState('');
  const saveTimeoutRef = useRef(null);
  const lastOpenedRef = useRef({ popupOpen: false, popupType: null, currentDept: '' });
  const privateContentRef = useRef(privateContent);
  const deptContentRef = useRef(deptContent);
  const currentDeptRef = useRef(currentDept);

  // Use useEncounter for persistent data like handoff
  const [stickyNoteData, setStickyNoteData] = useEncounter().stickyNotes({});

  // Ensure stickyNoteData is always an object
  const safeStickyNoteData = stickyNoteData && typeof stickyNoteData === 'object' ? stickyNoteData : {};

  // Load note content when private or dept windows open or department changes
  useEffect(() => {
    const data = safeStickyNoteData;
    if (privateOpen) {
      const content = data.private;
      setPrivateContent(content ? String(content) : '');
      privateContentRef.current = content ? String(content) : '';
    } else {
      // clear local when closed
      // (keep persisted content in store)
    }

    if (deptOpen) {
      const depts = data.departments || {};
      const content = (currentDept && depts[currentDept]) || '';
      setDeptContent(content ? String(content) : '');
      deptContentRef.current = content ? String(content) : '';
    }
  }, [privateOpen, deptOpen, currentDept, safeStickyNoteData]);

  // Persist helper - ensures immediate save when closing or switching
  const persistNow = (type, dept, content) => {
    if (!setStickyNoteData) return;
    if (type === 'private') {
      setStickyNoteData(prev => ({ ...(prev || {}), private: content }));
    } else if (type === 'department' && dept) {
      setStickyNoteData(prev => ({
        ...(prev || {}),
        departments: {
          ...((prev && prev.departments) || {}),
          [dept]: content
        }
      }));
    }
  };

  // Auto-save when privateContent or deptContent changes (debounced)
  useEffect(() => {
    if (!setStickyNoteData) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (privateOpen) {
        persistNow('private', '', privateContentRef.current);
      }
      if (deptOpen) {
        persistNow('department', currentDeptRef.current, deptContentRef.current);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [privateContent, deptContent, privateOpen, deptOpen, currentDept, setStickyNoteData]);

  const handleOpenPrivate = () => {
    setPrivateOpen(true);
  };

  const handleOpenDept = (dept = '') => {
    setSelectedDepartment(dept);
    setCurrentDept(dept);
    currentDeptRef.current = dept;
    setDeptOpen(true);
  };

  const handleClosePrivate = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    persistNow('private', '', privateContentRef.current);
    setPrivateOpen(false);
    setPrivateContent('');
  };

  const handleCloseDept = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    persistNow('department', currentDeptRef.current, deptContentRef.current);
    setDeptOpen(false);
    setDeptContent('');
    setSelectedDepartment('');
    setCurrentDept('');
  };

  const handleDepartmentChange = (newDepartment) => {
    // save current dept content before switching
    if (deptOpen && currentDept) {
      persistNow('department', currentDeptRef.current, deptContentRef.current);
    }
    setCurrentDept(newDepartment);
    setSelectedDepartment(newDepartment);
    currentDeptRef.current = newDepartment;
    // load the content for the newly selected department from persisted data
    const depts = safeStickyNoteData.departments || {};
    const content = depts[newDepartment] || '';
    setDeptContent(content);
    deptContentRef.current = content;
  };

  const handlePrivateContentChange = (e) => {
    setPrivateContent(e.target.value);
    privateContentRef.current = e.target.value;
  };

  const handleDeptContentChange = (e) => {
    setDeptContent(e.target.value);
    deptContentRef.current = e.target.value;
  };

  // Persist any pending content on unmount (or when component is removed)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // persist latest values from refs
      if (privateContentRef.current) {
        persistNow('private', '', privateContentRef.current);
      }
      if (deptContentRef.current && currentDeptRef.current) {
        persistNow('department', currentDeptRef.current, deptContentRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="My Sticky Note" arrow>
          <IconButton
            onClick={handleOpenPrivate}
            size="small"
            sx={{
              color: '#fbc02d',
              backgroundColor: '#fff9c4',
              '&:hover': { backgroundColor: '#fff59d' },
            }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Department Comments" arrow>
          <IconButton
            onClick={() => handleOpenDept()}
            size="small"
            sx={{
              color: '#2196f3',
              backgroundColor: '#e3f2fd',
              '&:hover': { backgroundColor: '#bbdefb' },
            }}
          >
            <Icon>sticky_note_2</Icon>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Private sticky note window */}
      <Window
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ color: '#fbc02d' }}>sticky_note_2</Icon>
            <Label variant="h6" sx={{ fontWeight: 'bold', color: '#fbc02d' }}>
              My Sticky Note
            </Label>
          </Box>
        }
        open={privateOpen}
        onClose={handleClosePrivate}
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: '#fff9c4',
            border: `2px solid #fbc02d`,
            borderRadius: 2,
            minHeight: 160,
            minWidth: 300,
            width: 360,
            height: 240,
            resize: 'both',
            overflow: 'auto'
          }
        }}
        sx={{ '& .MuiPaper-root': { left: 'calc(50% - 360px)', top: '20vh', position: 'absolute' } }}
      >
        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={12}
          value={privateContent}
          onChange={handlePrivateContentChange}
          placeholder={"Enter your private notes..."}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '& fieldset': { borderColor: '#fbc02d' },
              '&:hover fieldset': { borderColor: '#fbc02d' },
              '&.Mui-focused fieldset': { borderColor: '#fbc02d' },
              '& .MuiInputBase-input': { color: 'text.primary' },
            },
            width: '100%'
          }}
        />
      </Window>

      {/* Department sticky note window */}
      <Window
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ color: '#2196f3' }}>sticky_note_2</Icon>
            <Label variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
              {currentDept || 'Department'} Comments
            </Label>
          </Box>
        }
        open={deptOpen}
        onClose={handleCloseDept}
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: '#e3f2fd',
            border: `2px solid #2196f3`,
            borderRadius: 2,
            minHeight: 160,
            minWidth: 300,
            width: 360,
            height: 240,
            resize: 'both',
            overflow: 'auto'
          }
        }}
        sx={{ '& .MuiPaper-root': { left: 'calc(50% + 40px)', top: '25vh', position: 'absolute' } }}
      >
        <Box sx={{ mb: 1 }}>
          <FormControl fullWidth size="small">
            <Select
              value={currentDept}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              displayEmpty
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' },
              }}
            >
              <MenuItem value="">Select Department</MenuItem>
              <MenuItem value="Adult Medicine">Adult Medicine</MenuItem>
              <MenuItem value="Emergency Department">Emergency Department</MenuItem>
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Internal Medicine">Internal Medicine</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={12}
          value={deptContent}
          onChange={handleDeptContentChange}
          placeholder={
            currentDept ? `Enter notes for ${currentDept}...` : "Please select a department first"
          }
          disabled={!currentDept}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '& fieldset': { borderColor: '#2196f3' },
              '&:hover fieldset': { borderColor: '#2196f3' },
              '&.Mui-focused fieldset': { borderColor: '#2196f3' },
              '& .MuiInputBase-input': { color: 'text.primary' },
            },
            width: '100%'
          }}
        />
      </Window>
    </>
  );
};

export const SidebarVitals = ({ ...props }) => {
  const { useChart, useEncounter } = usePatient()
  const [vitals, setVitals] = useEncounter().vitals()

  /** sort most recent to older */
  const _t = (x) => DateHelpers.convertToDateTime(x.measurementDate).toMillis()
  const allVitals = (vitals ?? []).toSorted((a, b) => _t(b) - _t(a))
  return (
    <div style={{ display: 'flex', flexDirection: "column" }}>
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Vitals {DateHelpers.standardFormat(allVitals[0]?.measurementDate)}
      </Typography>
      {allVitals[0] ? (
        <VitalsPopup vitals={allVitals} />
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

export const SidebarCareTeam = () => {
  const { useChart, useEncounter } = usePatient();
  const [PCP, setPCP] = useChart().PCP();
  const [insurance, setInsurance] = useChart().insurance();
  return (
    <>
      <div style={{ display: 'flex', flexDirection: "column", marginBottom: '1em' }}>
        <div style={{ display: 'flex', marginBottom: '0.5em' }}>
          <Avatar
            src={PCP?.avatarUrl}
            sx={{ bgcolor: colors.blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}
          >
            {PCP?.name.split(" ").map(x => x?.charAt(0) ?? '').join("")}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: "column", margin: 'auto 0 auto 0' }}>
            <span>{PCP?.name}, {PCP?.title}</span>
            <strong>{PCP?.role}</strong>
          </div>
        </div>
      </div>
      <span>Coverage: <span style={{ textTransform: 'uppercase' }}>{insurance?.carrierName}</span></span>
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
          icon ={false}
            sx={{ 
              mt: .5, py:0.1,
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
      <Typography variant="h6" color="inherit" style={{ fontSize: '1.25em'}}>
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
