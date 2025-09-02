import React, { useState, useContext  } from 'react';
import _ from 'lodash';
import { Divider, Alert, Typography, Avatar, Fade, Paper, Popper, colors } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import DateHelpers from 'util/helpers.js';

const _isBPProblematic = ({ systolic, diastolic }) => systolic > 130 || diastolic > 90; // htn
const _isBMIProblematic = ({ bmi }) => bmi > 30; // obese

export const VitalsDisplay = ({ mostRecentVitals, olderVitals, ...props }) => {
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
  } = mostRecentVitals;
  return (
    <div style={{ display: 'flex', flexDirection: "column" }} onMouseEnter={handleMenuOpen} onMouseLeave={handleMenuClose}>
      <span
        style={_isBPProblematic({systolic: bloodPressureSystolic, diastolic: bloodPressureDiastolic}) ? { backgroundColor: 'rgb(219, 40, 40, 0.33)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
      >
        BP: {bloodPressureSystolic}/{bloodPressureDiastolic}
      </span>
      <span>HR: {heartRate}</span>
      <span>Resp: {respiratoryRate}</span>
      <span
        style={_isBMIProblematic({ bmi }) ? { backgroundColor: 'rgb(219, 40, 40, 0.33)', borderColor: 'rgb(219, 40, 40, 1)' } : {}}
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
              <div style={{ display: 'flex', flexDirection: "column" }}>
                <span style={{ visibility: 'hidden' }}>hidden</span>
                <span>BP</span>
                <span>HR</span>
                <span>Resp</span>
                <span>BMI</span>
              </div>
              <div style={{ display: "flex", flex: 1 }}>
                {olderVitals.map((vitals) => (
                  <div
                    key={vitals.id}
                    style={{ display: 'flex', flexDirection: "column", textAlign: "right" }}
                  >
                    <span>
                      {DateHelpers.convertToDateTime(vitals.measurementDate).toFormat('MM/yy')}
                    </span>
                    <span>
                      {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
                    </span>
                    <span>{vitals.heartRate}</span>
                    <span>{vitals.respiratoryRate}</span>
                    <span>{vitals.bmi}</span>
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

export const PatientSidebarVitalsOverview = ({ ...props }) => {
  const { useChart, useEncounter } = usePatient()
  const [{ vitals }, setEncounter] = useEncounter()()

  /** sort most recent to older */
  const [mostRecentVitals, ...olderVitals] = _.sortBy(
    vitals || [],
    (v) => -DateHelpers.convertToDateTime(v.measurementDate).toMillis()
  );
  return (
    <div style={{ display: 'flex', flexDirection: "column" }}>
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Vitals {DateHelpers.standardFormat(mostRecentVitals.measurementDate)}
      </Typography>
      {mostRecentVitals ? (
        <VitalsDisplay mostRecentVitals={mostRecentVitals} olderVitals={olderVitals} />
      ) : (
        <i>No vitals to display</i>
      )}
    </div>
  );
};

export const Storyboard = () => {
  const { useChart, useEncounter } = usePatient();
  const [chart] = useChart()();
  const [encounter] = useEncounter()();

  const {
    firstName,
    lastName,
    birthdate,
    preferredLanguage,
    avatarUrl,
    gender,
    PCP,
    insurance,
  } = chart;

  const { type, startDate, concerns, problems, allergies, history } = encounter;

  const careGaps = [
    { id: '1', name: 'COVID Booster #8' },
    { id: '2', name: 'COVID Booster #9' },
  ];

  return (
    <>
      {/* Patient Header */}
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
          <span>MRN: {chart.id}</span>
          <strong>Preferred language: {preferredLanguage}</strong>
          {preferredLanguage !== 'English' && 
            <Alert variant="filled" severity="warning">Needs Interpreter</Alert>
          }
        </div>
      </div>

      <Divider color="inherit" />

      {/* PCP + Insurance */}
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

      {/* Allergies with high-severity highlight */}
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

      <Divider color="inherit" />

      {/* Encounter Info */}
      <Typography variant="h6">Encounter</Typography>
      <Typography>Type: {type}</Typography>
      <Typography>Date: {startDate}</Typography>
      <Typography>Reason: {concerns?.join(", ")}</Typography>

      <Divider color="inherit" />
      <PatientSidebarVitalsOverview />
      <Divider color="inherit" />

      {/* Care Gaps */}
      <Typography variant="h6" style={{ fontSize: '1.25em' }}>Care Gaps ({careGaps.length})</Typography>
      <div style={{ display: 'flex', flexDirection: "column" }}>
        {careGaps.map(c => <span key={c.id}>{c.name}</span>)}
      </div>

    <Divider color="inherit" />
      <Typography
        variant="h6"
        color="inherit"
        component="div"
        style={{ fontSize: '1.25em'}}
      >
        Clinical Impressions
      </Typography>
      {encounter?.clinicalImpressions && encounter.clinicalImpressions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {encounter.clinicalImpressions.map((ci, idx) => (
            <div key={idx}>
              {idx + 1}. {ci.name}
            </div>
          ))}
        </div>
      ) : (
        <i>No clinical impressions on file</i>
      )}
      <Divider color="inherit" />

      {/* Problem List */}
      <Typography variant="h6" style={{ fontSize: '1.25em' }}>Problem List ({problems?.length})</Typography>
      {history?.medical.map(cond => (
        <div key={cond.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{cond.diagnosis}</span>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: "column" }}>
        {problems?.map(p => <div key={p.id}>{p.name}</div>)}
      </div>
    </>
  );
};
