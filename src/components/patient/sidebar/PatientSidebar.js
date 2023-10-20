import React from 'react';
import DateHelpers from '../../../util/DateHelpers.js';
import PatientSidebarCareGapsOverview from './PatientSidebarCareGapsOverview.js';
import PatientSidebarCareOverview from './PatientSidebarCareOverview.js';
import PatientSidebarHeader from './PatientSidebarHeader.js';
import PatientSidebarProblemList from './PatientSidebarProblemList.js';
import PatientSidebarVitalsOverview from './PatientSidebarVitalsOverview.js';
import { usePatientMRN } from '../../../util/urlHelpers.js';

const PROVIDER_ROLE_TYPES = {
  PCP: 'PCP',
};

const PROVIDER_TITLE = {
  DO: 'DO',
  MD: 'MD',
  RN: 'RN',
};

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  firstName: 'Anthony',
  lastName: 'Bosshardt',
  dateOfBirth: '1995-05-15',
  age: 28,
  avatarUrl: null,
  preferredLanguage: 'English',
  gender: 'Male',
  mrn: patientMRN,
  primaryProvider: {
    providerFirstName: 'John',
    providerLastName: 'David Squire II, USAF',
    providerTitle: PROVIDER_TITLE.RN,
    providerRole: PROVIDER_ROLE_TYPES.PCP,
    providerAvatarUrl: null,
  },
  insurance: {
    carrierName: 'UnitedHealthcare',
  },
});

const PatientSidebar = () => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const {
    firstName,
    lastName,
    dateOfBirth,
    preferredLanguage,
    avatarUrl,
    gender,
    primaryProvider,
    insurance,
  } = TEST_PATIENT_INFO({
    patientMRN,
  });

  const patientAgeInYears = DateHelpers.getDifference(dateOfBirth, 'years', 0);

  return (
    <div style={{ display: 'flex', flexDirection: "column" }} className="patient-info">
      <PatientSidebarHeader
        avatarUrl={avatarUrl}
        firstName={firstName}
        lastName={lastName}
        dateOfBirth={dateOfBirth}
        gender={gender}
        patientAgeInYears={patientAgeInYears}
        patientMRN={patientMRN}
        preferredLanguage={preferredLanguage}
      />
      <div style={{ display: 'flex', flexDirection: "column", overflowY: 'auto' }}>
        <PatientSidebarCareOverview primaryProvider={primaryProvider} insurance={insurance} />
        <PatientSidebarVitalsOverview patientMRN={patientMRN} />
        <PatientSidebarCareGapsOverview patientMRN={patientMRN} />
        <PatientSidebarProblemList patientMRN={patientMRN} />
      </div>
    </div>
  );
};

export default PatientSidebar;
