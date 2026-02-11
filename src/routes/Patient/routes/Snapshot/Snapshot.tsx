import * as React from 'react';
// @ts-ignore
import groupBy from 'lodash/groupBy';
import { Box, Grid, Button, Icon, TitledCard } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';

// FIXME: TitledCard
// At some point I will need to use a URLBuilder to link the title to corresponding pages
// Leaving it for now because I don't know if that's within scope

export const SnapshotTabContent = ({ children, ...other }: { children?: React.ReactNode;[key: string]: any }) => {
  const { useChart, useEncounter } = usePatient()
  const [{
    firstName,
    lastName,
    birthdate,
    address
  }, setChart]: [any, any] = (useChart() as any)()
  const [encounter, setEncounter]: [any, any] = (useEncounter() as any)()
  const [allergiesHx, setAllergiesHx]: [any[], any] = (useEncounter() as any).allergies()
  const [immunizationHx, setImmunizationHx]: [any[], any] = (useEncounter() as any).immunizations()
  const [medicalHx, setMedicalHx]: [any[], any] = (useEncounter() as any).history.medical()
  const [surgicalHx, setSurgicalHx]: [any[], any] = (useEncounter() as any).history.surgical()
  const [familyHx, setFamilyHx]: [any[], any] = (useEncounter() as any).history.family()
  const [medicationHx, setMedicationHx]: [any[], any] = (useEncounter() as any).medications()

  // const { enabledEncounters } = React.useContext(AuthContext); // Access the enabled encounters

  const isSectionEmpty = (section: any[] | null | undefined) => {
    return !section || section.length === 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* The wrapping Box is necessary to avoid the last element of the Masonry from wrapping incorrectly */}
      <Grid masonry sequential columns={{ md: 1, lg: 2 }} spacing={2}>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Patient</>} color='#5EA1F8'>
          <b>Name:</b> {`${firstName} ${lastName}`}<br />
          <b>Age:</b> {(new Date(birthdate) as any).age()}<br />
          <b>Date of Birth:</b> {birthdate}<br />
          <b>Address:</b> {address}<br />
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Allergies</>} color='#9F3494'>
          {isSectionEmpty(allergiesHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            allergiesHx.map((allergy: any) => (
              <div key={`${allergy.allergen}-${allergy.reaction}`}>
                <span style={{ color: '#9F3494' }}>{allergy.allergen}</span> {allergy.reaction}
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
                  {(records as any[]).map((rec: any) => rec.received).join(', ')}
                </span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medical History</>} color='#9F3494'>
          {isSectionEmpty(medicalHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            medicalHx.map((condition: any) => (
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
          ) : medicationHx.map((medication: any) => (
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
            surgicalHx.map((condition: any) => (
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
            familyHx.map((relative: any) => (
              <div key={`${relative.relationship}-${relative.problems.length}`}>
                <span style={{ color: '#bbbbbb' }}>{relative.relationship}</span>
                <span style={{ marginLeft: '35px' }}>{(relative.problems as any[]).map((x: any) => x.description).join(', ')}</span>
              </div>
            ))
          )}
        </TitledCard>
      </Grid>
    </Box>
  )
}
