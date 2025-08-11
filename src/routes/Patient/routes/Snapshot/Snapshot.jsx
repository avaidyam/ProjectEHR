import React from 'react';
import { Grid } from '@mui/material';
import groupBy from 'lodash/groupBy';
import { TitledCard } from '../../../../components/ui/Core.jsx';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js'

// FIXME: TitledCard
// At some point I will need to use a URLBuilder to link the title to corresponding pages
// Leaving it for now because I don't know if that's within scope

const SnapshotTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const [enc, setEnc] = useEncounterID()
  const ptInfo = TEST_PATIENT_INFO({ patientMRN });
//  const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters

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
            {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.allergies ) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.find(x => x.id === enc)?.allergies.map((allergy) => (
                <div key={allergy.id}>
                  <span style={{ color: '#9F3494'}}>{allergy.allergen}</span> {allergy.reaction}
                </div>
              ))
            )}
          </div>
        </TitledCard>
      </Grid>

      <Grid item xs={12} md={6}>
      <TitledCard title="Immunizations" color="#74c9cc">
        <div>
          {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.immunizations) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            Object.entries(
              groupBy(ptInfo.encounters?.find(x => x.id === enc)?.immunizations, 'vaccine')
            ).map(([vaccine, records]) => (
              <div key={vaccine}>
                <strong>{vaccine}</strong>{' '}
                <span style={{ color: '#9F3494' }}>
                  {records.map(rec => rec.received).join(', ')}
                </span>
              </div>
            ))
          )}
        </div>
      </TitledCard>
    </Grid>
      <Grid item xs={12} md={6}>
        <TitledCard title="Medical History" color='#9F3494'>
          <div>
            {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.history.medical) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.find(x => x.id === enc)?.history.medical.map((condition) => (
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
            {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.medications) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.find(x => x.id === enc)?.medications.map((medication) => (
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
            {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.history.surgical) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.find(x => x.id === enc)?.history.surgical.map((condition) => (
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
            {isSectionEmpty(ptInfo.encounters?.find(x => x.id === enc)?.history.family) ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
            ) : (
              ptInfo.encounters?.find(x => x.id === enc)?.history.family.map((relative) => (
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
