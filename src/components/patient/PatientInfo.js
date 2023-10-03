import { Avatar, TextField } from '@mui/material';
import { blue, deepOrange, purple } from '@mui/material/colors';
import React from 'react';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  firstName: 'Anthony',
  lastName: 'Bosshardt',
  dateOfBirth: '',
  age: 28,
  avatarUrl: null,
  preferredLanguage: 'English',
  gender: 'Male',
});

const PatientInfoCareOverview = () => (
  <div className="flex flex-col" style={{ fontSize: '0.75em' }}>
    <div className="flex" style={{ marginBottom: '0.5em' }}>
      <Avatar sx={{ bgcolor: blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}>
        JD
      </Avatar>
      <div className="flex flex-col" style={{ margin: 'auto 0 auto 0' }}>
        <span>John David Squire III, RN</span>
        <strong>PCP</strong>
      </div>
    </div>
    <span>
      Coverage: <span style={{ textTransform: 'uppercase' }}>UnitedHealthcare</span>
    </span>
  </div>
);

const PatientInfoVitalsOverview = () => <div />;
const PatientInfoCareGapsOverview = () => <div />;

const PatientInfo = ({ patientMRN }) => {
  const { firstName, lastName, dateOfBirth, preferredLanguage, avatarUrl, gender } =
    TEST_PATIENT_INFO({
      patientMRN,
    });

  return (
    <div className="flex flex-col patient-info">
      <div className="flex flex-col demographic-overview-container">
        <Avatar
          source={avatarUrl}
          sx={{ bgcolor: deepOrange[500], height: 120, width: 120, margin: '0 auto 1em auto' }}
        >
          AB
        </Avatar>
        <div className="flex flex-col" style={{ textAlign: 'center', marginBottom: '1em' }}>
          <strong>
            {firstName} {lastName}
          </strong>
          <span>
            {gender}, {28} years old
          </span>
          <span>MRN: {patientMRN}</span>
          <strong>Preferred language: {preferredLanguage}</strong>
        </div>
        <TextField id="outlined-basic" label="Search ..." variant="outlined" size="small" />
      </div>
      <div className="flex flex-col" style={{ overflowY: 'auto' }}>
        <PatientInfoCareOverview />
        <PatientInfoVitalsOverview />
        <PatientInfoCareGapsOverview />
      </div>
    </div>
  );
};

export default PatientInfo;
