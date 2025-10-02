import React, { useState, useContext  } from 'react';
import { Divider, Alert, Typography, Avatar, Fade, Paper, Popper, colors } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import DateHelpers from 'util/helpers.js';

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
      <Avatar
        src={avatarUrl}
        sx={{ bgcolor: colors.deepOrange[500], height: 80, width: 80, margin: '0 auto 0.5em auto' }}
      >
        {[firstName, lastName].map(x => x?.charAt(0) ?? '').join("")}
      </Avatar>
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
