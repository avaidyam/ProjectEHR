import { Box, Typography, Icon, Grid } from '@mui/material';
import React from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js'

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
  
const SnapshotTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const ptInfo = TEST_PATIENT_INFO({ patientMRN });

  // Helper function to check if a section is empty
  const isSectionEmpty = (section) => {
    return !section || section.length === 0;
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid item xs={12} md={6}>
        <TitledCard title="Patient" color='#5EA1F8'>
          <b>Name:</b> {ptInfo.firstName + ' ' + ptInfo.lastName}<br/>
          <b>Age:</b> {ptInfo.age}<br/>
          <b>Date of Birth:</b> {ptInfo.dateOfBirth}<br/>
          <b>Address:</b> {ptInfo.address}<br/>
        </TitledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Allergies" color='#9F3494'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.[0]?.allergies ) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.[0]?.allergies.map((allergy) => (
                <div key={allergy.id}>
                  <span style={{ color: '#9F3494'}}>{allergy.allergen}</span> {allergy.reaction}
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Medical History" color='#9F3494'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.[0]?.history.medical) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.[0]?.history.medical.map((condition) => (
                <div key={condition.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                    {condition.date}
                  </span>
                  <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.diagnosis}</span>
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Medications" color='#9E49E2'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.[0]?.medications) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.[0]?.medications.map((medication) => (
                <div key={medication.id} style={{ color: '#9E49E2' }}>
                  {medication.name} {medication.dosage} {medication.frequency}
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Surgical History" color='#9F3494'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.[0]?.history.surgical) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.[0]?.history.surgical.map((condition) => (
                <div key={condition.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                    {condition.date}
                  </span>
                  <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.procedure}</span>
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Family History" color='#9F3494'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.[0]?.history.family) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.[0]?.history.family.map((relative) => (
                <div key={relative.id}>
                  <span style={{color:'#bbbbbb'}}>{relative.relationship}</span>
                  <span style={{marginLeft:'35px'}}>{relative.problems.map(x => x.description).join(', ')}</span>
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>
    </Grid>
  );
};

export default SnapshotTabContent;
