import { Box, Typography } from '@mui/material';
import React from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { Icon } from '@mui/material'; // Import your icon from Material UI or any icon library you're using


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
      name: 'Opioid Use Disorder',
      date: 'Date Unknown'
    },
    {
      id: 'whywhy', 
      name: 'Heart Failure with preserved ejection fraction',
      date: '9/2/2018'
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
      date: '01/04/2017' 
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

  const TitledCard = ({ children, title, color}) => {
    // At some point I will need to use a URLBuilder to link the title to corresponding pages
    // Leaving it for now because I don't know if that's within scope
    return(
      <div style={{ 
        borderLeftWidth: 15,
        borderLeftColor: color,
        borderLeftStyle: 'solid',  // Define the left border style
        borderTop: '1px solid #ccc',  // Other borders individually defined
        borderRight: '1px solid #ccc',
        borderBottom: '1px solid #ccc', 
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
        marginBottom: '8px',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <h3 style={{ fontSize: "1.2em", marginTop: 0, color: color}}>{title}</h3>
        <div style={{ margin: 0 }}>{children}</div>
      </div>
    )
  }

  const ptInfo = TEST_PATIENT_INFO({ patientMRN });

  return (
    <div>
      <TitledCard title="Patient" color='#5EA1F8'>
        <b>Name:</b> {ptInfo.firstName + ' ' + ptInfo.lastName}<br/>
        <b>Age:</b> {ptInfo.age}<br/>
        <b>Date of Birth:</b> {ptInfo.dateOfBirth}<br/>
        <b>Address:</b> {ptInfo.address}<br/>
      </TitledCard>
      <TitledCard title="Allergies" color='#9F3494'>
        <div>
        {ptInfo.allergies.map((allergy) => {
          return (
            <div key={allergy.id}>
              <span style={{ color: '#9F3494'}}>{allergy.allergen}</span> {allergy.reaction}
                  </div>
                );
              })}
        </div>
      </TitledCard>
      <TitledCard title="Medical History" color='#9F3494'>
        <div>
          {ptInfo.medicalHistory.map((condition) => {
            return (
              <div key={condition.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {condition.date}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.name}</span>
              </div>
            );
          })}
        </div>
      </TitledCard>
      <TitledCard title="Medications" color='#9E49E2'>
        <div>
          {ptInfo.medications.map((medication) => {
            return(<div key={medication.id} style={{ color: '#9E49E2' }}>{medication.name} {medication.dosage} {medication.frequency}</div>)
          })}
        </div>
      </TitledCard>
      <TitledCard title="Surgical History" color= '#9F3494'>
        <div>
          {ptInfo.surgicalHistory.map((condition) => {
            return (
              <div key={condition.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {condition.date}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.name}</span>
              </div>
            );
          })}
        </div>
      </TitledCard>
      <TitledCard title="Family History" color= '#9F3494'>
        <div>
          {ptInfo.familyHistory.map((relative) => {
            return(<div key={relative.id}> <span style={{color:'#bbbbbb'}}>{relative.relation}</span> <span style={{marginLeft:'35px'}}>{relative.conditions}</span></div>)
          })}
        </div>
      </TitledCard>
    </div>
  );
};

export default SnapshotTabContent;
