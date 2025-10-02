import React from 'react';
import groupBy from 'lodash/groupBy';
import { Box, Grid, Button, Icon, TitledCard } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';

// FIXME: TitledCard
// At some point I will need to use a URLBuilder to link the title to corresponding pages
// Leaving it for now because I don't know if that's within scope

const SnapshotTabContent = ({ children, ...other }) => {
  const { useChart, useEncounter } = usePatient()
  const [{
    firstName,
    lastName,
    birthdate,
    address
  }, setChart] = useChart()()
  const [encounter, setEncounter] = useEncounter()()
  const [allergiesHx, setAllergiesHx] = useEncounter().allergies()
  const [immunizationHx, setImmunizationHx] = useEncounter().immunizations()
  const [medicalHx, setMedicalHx] = useEncounter().history.medical()
  const [surgicalHx, setSurgicalHx] = useEncounter().history.surgical()
  const [familyHx, setFamilyHx] = useEncounter().history.family()
  const [medicationHx, setMedicationHx] = useEncounter().medications()

  // const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters

  const isSectionEmpty = (section) => {
    return !section || section.length === 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* The wrapping Box is necessary to avoid the last element of the Masonry from wrapping incorrectly */}
      <Grid masonry sequential columns={{ md: 1, lg: 2 }} spacing={2}>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Patient</>} color='#5EA1F8'>
          <b>Name:</b> {`${firstName} ${lastName}`}<br/>
          <b>Age:</b> {new Date(birthdate).age()}<br/>
          <b>Date of Birth:</b> {birthdate}<br/>
          <b>Address:</b> {address}<br/>
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Allergies</>} color='#9F3494'>
          {isSectionEmpty(allergiesHx ) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            allergiesHx.map((allergy) => (
              <div key={`${allergy.allergen}-${allergy.reaction}`}>
                <span style={{ color: '#9F3494'}}>{allergy.allergen}</span> {allergy.reaction}
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Immunizations</>} color="#74c9cc">
          {isSectionEmpty(immunizationHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            Object.entries(
              groupBy(immunizationHx, 'vaccine')
            ).map(([vaccine, records]) => (
              <div key={vaccine}>
                <strong>{vaccine}</strong>{' '}
                <span style={{ color: '#9F3494' }}>
                  {records.map(rec => rec.received).join(', ')}
                </span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medical History</>} color='#9F3494'>
          {isSectionEmpty(medicalHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            medicalHx.map((condition) => (
              <div key={`${condition.date}-${condition.diagnosis}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {condition.date}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.diagnosis}</span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medications</>} color='#9E49E2'>
          {isSectionEmpty(medicationHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : medicationHx.map((medication) => (
            <React.Fragment key={`${medication.name}-${medication.dose}`}>
              <span style={{ color: '#9E49E2' }}>
                {medication.name}{" "}
              </span>
              <span style={{ color: '#666' }}>
                {medication.dose} {medication.unit} {medication.frequency}
              </span>
              <br />
            </React.Fragment>
          ))}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Surgical History</>} color='#9F3494'>
          {isSectionEmpty(surgicalHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            surgicalHx.map((condition) => (
              <div key={`${condition.date}-${condition.procedure}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {condition.date}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.procedure}</span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Family History</>} color='#9F3494'>
          {isSectionEmpty(familyHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            familyHx.map((relative) => (
              <div key={`${relative.relationship}-${relative.problems.length}`}>
                <span style={{color:'#bbbbbb'}}>{relative.relationship}</span>
                <span style={{marginLeft:'35px'}}>{relative.problems.map(x => x.description).join(', ')}</span>
              </div>
            ))
          )}
        </TitledCard>
      </Grid>
    </Box>
  )
}

export default SnapshotTabContent
