import React from 'react';
import { Masonry } from '@mui/lab';
import groupBy from 'lodash/groupBy';
import { Box, TitledCard } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';

// FIXME: TitledCard
// At some point I will need to use a URLBuilder to link the title to corresponding pages
// Leaving it for now because I don't know if that's within scope

const SnapshotTabContent = ({ children, ...other }) => {
  const { patient, encounter: enc, data: ptInfo, updateData } = usePatient()
  // const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters

  const isSectionEmpty = (section) => {
    return !section || section.length === 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Masonry sequential columns={{ md: 1, lg: 2 }} spacing={2}>
        <TitledCard title="Patient" color='#5EA1F8'>
          <b>Name:</b> {ptInfo.firstName + ' ' + ptInfo.lastName}<br/>
          <b>Age:</b> {ptInfo.age}<br/>
          <b>Date of Birth:</b> {ptInfo.dateOfBirth}<br/>
          <b>Address:</b> {ptInfo.address}<br/>
        </TitledCard>
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
      </Masonry>
    </Box>
  );
};

export default SnapshotTabContent;
