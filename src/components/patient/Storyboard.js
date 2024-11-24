import React, { useState } from 'react';
import _ from 'lodash';
import { Box, Tab, Tabs, Divider, Toolbar, Typography, Avatar, Fade, Paper, Popper, TextField } from '@mui/material';
import { blue, deepOrange } from '@mui/material/colors';

import DateHelpers from '../../util/DateHelpers.js';
import { usePatientMRN } from '../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js'

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

export const PatientSidebarVitalsOverview = ({ patientMRN, ...props }) => {
  const { vitals } = TEST_PATIENT_INFO({ patientMRN });
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

export const Storyboard = ({ ...props }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const {
    firstName,
    lastName,
    dateOfBirth,
    preferredLanguage,
    avatarUrl,
    gender,
    PCP,
    insurance,
    encounter,
    careGaps,
    problems
  } = TEST_PATIENT_INFO({
    patientMRN,
  });
  const patientAgeInYears = DateHelpers.getDifference(dateOfBirth, 'years', 0);
  return (
    <>
      <div style={{ display: 'flex', flexDirection: "column" }}>
        <Avatar
          source={avatarUrl}
          sx={{ bgcolor: deepOrange[500], height: 80, width: 80, margin: '0 auto 0.5em auto' }}
        >
          {[firstName, lastName].map(x => x.charAt(0)).join("")}
        </Avatar>
        <div style={{ display: 'flex', flexDirection: "column", textAlign: 'center', marginBottom: '1em' }}>
          <strong>{firstName} {lastName}</strong>
          <span>Sex: {gender}</span>
          <span>Age: {patientAgeInYears} years old</span>
          <span>DOB: {DateHelpers.standardFormat(dateOfBirth)}</span>
          <span>MRN: {patientMRN}</span>
          <strong>Preferred language: {preferredLanguage}</strong>
        </div>
      </div>
      <Divider color="inherit" />
      <div style={{ display: 'flex', flexDirection: "column" }} {...props}>
      <div style={{ display: 'flex', marginBottom: '0.5em' }}>
        <Avatar
          source={PCP.avatarUrl}
          sx={{ bgcolor: blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}
        >
          {PCP.name.split(" ").map(x => x.charAt(0)).join("")}
        </Avatar>
        <div style={{ display: 'flex', flexDirection: "column", margin: 'auto 0 auto 0' }}>
          <span>{PCP.name}, {PCP.title}</span>
          <strong>{PCP.role}</strong>
        </div>
      </div>
      <span>Coverage: <span style={{ textTransform: 'uppercase' }}>{insurance.carrierName}</span></span>
    </div>
      <Divider color="inherit" />
      <Typography variant="h6" color="inherit">Encounter</Typography>
      <Typography color="inherit">Type: {encounter.type}</Typography>
      <Typography color="inherit">Date: {encounter.date}</Typography>
      <Typography color="inherit">Reason: {encounter.concerns.join(", ")}</Typography>
      <Divider color="inherit" />
      <PatientSidebarVitalsOverview patientMRN={patientMRN} />
      <Divider color="inherit" />
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Care Gaps ({careGaps.length})
      </Typography>
      <div style={{ display: 'flex', flexDirection: "column" }}>
        {careGaps.map((c) => (
          <span key={c.id}>{c.name}</span>
        ))}
      </div>
      <Divider color="inherit" />
      <Typography variant="h6" color="inherit" component="div" style={{ fontSize: '1.25em' }}>
        Problem List ({problems.length})
      </Typography>
      <div style={{ display: 'flex', flexDirection: "column" }}>
        {problems.map((p) => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
    </>
  );
};