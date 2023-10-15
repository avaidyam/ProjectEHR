import { Box, Typography } from '@mui/material';
import './SnapshotTabContent.css';
import React from 'react';

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
  allergies: [{allergen: 'Peanuts', reaction: 'Death'}],
  medicalHistory: ['Opioid Use Disorder', 'Heart Failure with preserved ejection fraction'],
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
      relation: 'Brother',
      alive: true,
      conditions: ['Autobrewery Syndrome']
    }
  ],
});

const SnapshotTabContent = ({ children, value, index, patientMRN, ...other }) => {

  const TitledCard = ({ children, index, title}) => {
    // At some point I will need to use a URLBuilder to link the title to corresponding pages
    // Leaving it for now because I don't know if that's within scope
    return(
      <div index={index} class="titledCard">
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    )
  }

  const ptInfo = TEST_PATIENT_INFO(patientMRN);

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
            return(<li>{allergy.allergen} ({allergy.reaction})</li>)
          })}
        </ul>
      </TitledCard>
    </div>
  );
};

export default SnapshotTabContent;
