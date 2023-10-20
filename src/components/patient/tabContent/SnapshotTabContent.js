import { Box, Typography } from '@mui/material';
import React from 'react';
import { usePatientMRN } from '../../../util/urlHelpers.js';

const TEST_PATIENT_INFO = ({ patientMRN }) => ({
  firstName: 'Patient',
  lastName: 'Sherman',
  dateOfBirth: '05/15/1995',
  age: 28,
  avatarUrl: null,
  preferredLanguage: 'English',
  gender: 'Male',
  address: '42 Wallaby Way, Sydney, Australia',
  phone: '1 (205) 867-5309',
  allergies: [{id: 'uiduid', allergen: 'Peanuts', reaction: 'Death'}],
  medicalHistory: [{
      id: 'jakjak',
      name: 'Opioid Use Disorder'
    },
    {
      id: 'whywhy', 
      name: 'Heart Failure with preserved ejection fraction'
    }
  ],
  medications: [{
      id: '123123',
      name: 'Metoprolol',
      dosage: '25mg',
      frequency: 'BID',
      route: 'tab',
      startDate: '',
      endDate: '',
    },
    {
      id: 'abcabc',
      name: 'Suboxone (buprenorphine-naltrexone)',
      dosage: '25mg/5mg',
      frequency: 'QD',
      route: 'tab',
      startDate: '',
      endDate: '',
    },
  ],
  surgicalHistory: [{
      id: '123123',
      name: 'ulnar collateral reconstruction (R)',
      date: '2014-01-07' 
    },
  ],
  familyHistory: [
    {
      id: 'xyzxyz',
      relation: 'Brother',
      alive: true,
      conditions: ['Autobrewery Syndrome']
    }
  ],
});

const SnapshotTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();

  const TitledCard = ({ children, title}) => {
    // At some point I will need to use a URLBuilder to link the title to corresponding pages
    // Leaving it for now because I don't know if that's within scope
    return(
      <div style={{ 
        margin: "1em 1em 1em 1em", 
        padding: "0.5em 1em 0.5em 1em", 
        border: "1px solid rgba(255,255,255,0.25)" 
      }}>
        <h3 style={{ fontSize: "1.5em", margin: 0 }}>{title}</h3>
        <div style={{ margin: 0 }}>{children}</div>
      </div>
    )
  }

  const ptInfo = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div>
      <TitledCard title="Patient Info">
        <b>Name:</b> {ptInfo.firstName + ' ' + ptInfo.lastName}<br/>
        <b>Age:</b> {ptInfo.age}<br/>
        <b>Date of Birth:</b> {ptInfo.dateOfBirth}<br/>
        <b>Address:</b> {ptInfo.address}<br/>
      </TitledCard>
      <TitledCard title="Allergies">
        <ul>
          {ptInfo.allergies.map((allergy) => {
            return(<li key={allergy.id}>{allergy.allergen} ({allergy.reaction})</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Medical History">
        <ul>
          {ptInfo.medicalHistory.map((condition) => {
            return(<li key={condition.id}>{condition.name}</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Medications">
        <ul>
          {ptInfo.medications.map((medication) => {
            return(<li key={medication.id}>{medication.name} {medication.dosage} {medication.frequency}</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Surgical History">
        <ul>
          {ptInfo.surgicalHistory.map((procedure) => {
            return(<li key={procedure.id}>{procedure.name} ({(new Date(procedure.date)).toLocaleDateString("en-US")})</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Family History">
        <ul>
          {ptInfo.familyHistory.map((relative) => {
            return(<li key={relative.id}>{relative.relation} ({relative.conditions.join(' ')})</li>)
          })}
        </ul>
      </TitledCard>
    </div>
  );
};

export default SnapshotTabContent;
