
export const PROVIDER_ROLE_TYPES = {
    PCP: 'PCP',
}

export const PROVIDER_TITLE = {
    DO: 'DO',
    MD: 'MD',
    RN: 'RN',
}

export const TEST_PATIENT_INFO = ({ patientMRN }) => ({
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
    careGaps: [
      { id: '1', name: 'COVID Booster #8' },
      { id: '2', name: 'COVID Booster #9' },
      { id: '3', name: 'Hypertension' },
    ],
    problems: [],
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