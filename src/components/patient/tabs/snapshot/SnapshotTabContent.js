import { Box, Typography } from '@mui/material';
import React from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js'

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

const SnapshotTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
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
          {ptInfo.history.medical.map((condition) => {
            return(<li key={condition.id}>{condition.diagnosis}</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Medications">
        <ul>
          {(ptInfo.medications ?? []).map((medication) => {
            return(<li key={medication.id}>{medication.name} {medication.dosage} {medication.frequency}</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Surgical History">
        <ul>
          {ptInfo.history.surgical.map((procedure) => {
            return(<li key={procedure.id}>{procedure.procedure} ({(new Date(procedure.date)).toLocaleDateString("en-US")})</li>)
          })}
        </ul>
      </TitledCard>
      <TitledCard title="Family History">
        <ul>
          {ptInfo.history.family.map((relative) => {
            return(<li key={relative.id}>{relative.relationship} ({relative.problems.map(x => x.description).join(', ')})</li>)
          })}
        </ul>
      </TitledCard>
    </div>
  );
};

export default SnapshotTabContent;
