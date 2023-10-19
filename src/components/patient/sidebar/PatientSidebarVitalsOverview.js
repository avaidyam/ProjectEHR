import { Fade, Paper, Popper, Typography } from '@mui/material';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useState } from 'react';

import DateHelpers from '../../../util/DateHelpers.js';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  mrn: patientMRN,
  vitals: [
    {
      id: '123456789',
      measurementDate: '2023-10-02',
      bloodPressureSystolic: 148,
      bloodPressureDiastolic: 96,
      height: `6' 0"`,
      weight: 210,
      bmi: 28.5,
      respiratoryRate: 12,
      heartRate: 65,
    },
    {
      id: '123456790',
      measurementDate: '2023-09-15',
      bloodPressureSystolic: 142,
      bloodPressureDiastolic: 92,
      height: `6' 0"`,
      weight: 212,
      bmi: 28.5,
      respiratoryRate: 14,
      heartRate: 73,
    },
    {
      id: '123456790',
      measurementDate: '2023-04-01',
      bloodPressureSystolic: 152,
      bloodPressureDiastolic: 90,
      height: `6' 0"`,
      weight: 218,
      bmi: 29.5,
      respiratoryRate: 14,
      heartRate: 80,
    },
    {
      id: '123456791',
      measurementDate: '2022-12-03',
      bloodPressureSystolic: 158,
      bloodPressureDiastolic: 96,
      height: `6' 0"`,
      weight: 220,
      bmi: 29.5,
      respiratoryRate: 14,
      heartRate: 80,
    },
  ],
});

const _isBPProblematic = ({ systolic, diastolic }) => systolic > 130 || diastolic > 90; // htn
const _isBMIProblematic = ({ bmi }) => bmi > 30; // obese

const VitalsDisplay = ({ mostRecentVitals, olderVitals }) => {
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
    <div className="flex flex-col" onMouseEnter={handleMenuOpen} onMouseLeave={handleMenuClose}>
      <span
        className={classNames('vitals-badge', {
          bad: _isBPProblematic({
            systolic: bloodPressureSystolic,
            diastolic: bloodPressureDiastolic,
          }),
        })}
      >
        BP: {bloodPressureSystolic}/{bloodPressureDiastolic}
      </span>
      <span className={classNames('vitals-badge')}>HR: {heartRate}</span>
      <span className={classNames('vitals-badge')}>Resp: {respiratoryRate}</span>
      <span
        className={classNames('vitals-badge', {
          bad: _isBMIProblematic({ bmi }),
        })}
      >
        BMI: {bmi} ({weight} lbs)
      </span>
      <Popper open={open} anchorEl={anchorEl} placement="right" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={100}>
            <Paper
              style={{
                border: '1px solid',
                padding: '1em',
                fontSize: '0.9em',
              }}
              className="flex"
            >
              <div className="flex flex-col historical-vitals-container">
                <span style={{ visibility: 'hidden' }}>hidden</span>
                <span>BP</span>
                <span>HR</span>
                <span>Resp</span>
                <span>BMI</span>
              </div>
              <div className="flex" style={{ flex: 1 }}>
                {olderVitals.map((vitals) => (
                  <div
                    key={vitals.id}
                    className="flex flex-col historical-vitals-container"
                    style={{ textAlign: 'right' }}
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

const PatientSidebarVitalsOverview = ({ patientMRN }) => {
  const { vitals } = TEST_PATIENT_INFO({ patientMRN });

  /** sort most recent to older */
  const [mostRecentVitals, ...olderVitals] = _.sortBy(
    vitals || [],
    (v) => -DateHelpers.convertToDateTime(v.measurementDate).toMillis()
  );

  return (
    <div className="flex flex-col overview-card">
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

export default PatientSidebarVitalsOverview;
