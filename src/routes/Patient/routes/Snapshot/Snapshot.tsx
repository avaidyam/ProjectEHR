import * as React from 'react';
// @ts-ignore
import { Box, Grid, Button, Icon, TitledCard } from 'components/ui/Core';
import { Database, usePatient } from 'components/contexts/PatientContext';
import { groupBy, getICD10CodeDescription, filterDocuments } from 'util/helpers';

// FIXME: TitledCard
// At some point I will need to use a URLBuilder to link the title to corresponding pages
// Leaving it for now because I don't know if that's within scope

export const SnapshotTabContent: React.FC = () => {
  const { useChart, useEncounter } = usePatient()
  const [{
    firstName,
    lastName,
    birthdate,
    address
  }] = useChart()()
  const [allergiesHx] = useEncounter().allergies()
  const [immunizationHx] = useEncounter().immunizations()
  const [medicalHx] = useEncounter().history.medical()
  const [surgicalHx] = useEncounter().history.surgical()
  const [familyHx] = useEncounter().history.family([])
  const [familyStatus] = useEncounter().history.familyStatus([])
  const [medicationHx] = useEncounter().medications()
  const [problems] = useEncounter().problems()
  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders()

  const visibleAllergies = React.useMemo(() => filterDocuments(allergiesHx || [], conditionals, orders), [allergiesHx, conditionals, orders]);
  const visibleImmunizations = React.useMemo(() => filterDocuments(immunizationHx || [], conditionals, orders), [immunizationHx, conditionals, orders]);
  const visibleMedicalHx = React.useMemo(() => filterDocuments(medicalHx || [], conditionals, orders), [medicalHx, conditionals, orders]);
  const visibleSurgicalHx = React.useMemo(() => filterDocuments(surgicalHx || [], conditionals, orders), [surgicalHx, conditionals, orders]);
  const visibleFamilyStatus = React.useMemo(() => filterDocuments(familyStatus || [], conditionals, orders), [familyStatus, conditionals, orders]);
  const visibleFamilyHx = React.useMemo(() => filterDocuments(familyHx || [], conditionals, orders), [familyHx, conditionals, orders]);
  const visibleMedications = React.useMemo(() => filterDocuments(medicationHx || [], conditionals, orders), [medicationHx, conditionals, orders]);
  const visibleProblems = React.useMemo(() => filterDocuments(problems || [], conditionals, orders), [problems, conditionals, orders]);

  const isSectionEmpty = (section: any[] | null | undefined) => {
    return !section || section.length === 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* The wrapping Box is necessary to avoid the last element of the Masonry from wrapping incorrectly */}
      <Grid masonry sequential columns={{ md: 1, lg: 2 }} spacing={2}>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Patient</>} color='#5EA1F8'>
          <b>Name:</b> {`${firstName} ${lastName}`}<br />
          <b>Age:</b> {Database.JSONDate.toAge(birthdate)}<br />
          <b>Date of Birth:</b> {Database.JSONDate.toDateString(birthdate)}<br />
          <b>Address:</b> {address}<br />
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Allergies</>} color='#9F3494'>
          {isSectionEmpty(visibleAllergies) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            visibleAllergies?.map((allergy) => (
              <div key={`${allergy.allergen}-${allergy.reaction}`}>
                <span style={{ color: '#9F3494' }}>{allergy.allergen}</span> {allergy.reaction}
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Problem List</>} color='#9F3494'>
          {isSectionEmpty(visibleProblems) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>No active problems</div>
          ) : (
            (visibleProblems ?? []).map((p: any) => (
              <div key={p.id || JSON.stringify(p)}>
                {p.displayAs ?? `${getICD10CodeDescription(p.diagnosis) || p.diagnosis || 'Unknown'} (${p.diagnosis})`}
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Immunizations</>} color="#74c9cc">
          {isSectionEmpty(visibleImmunizations) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            Object.entries(
              groupBy(visibleImmunizations, 'vaccine')
            ).map(([vaccine, records]) => (
              <div key={vaccine}>
                <strong>{vaccine}</strong>{' '}
                <span style={{ color: '#9F3494' }}>
                  {records?.map?.((rec) => !!rec.received ? Database.JSONDate.toDateString(rec.received as Database.JSONDate) : 'N/A').join(', ')}
                </span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medical History</>} color='#9F3494'>
          {isSectionEmpty(visibleMedicalHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            visibleMedicalHx?.map((condition) => (
              <div key={`${condition.date}-${condition.diagnosis}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {!!condition.date ? Database.JSONDate.toDateString(condition.date) : 'N/A'}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>
                  {condition.displayAs ?? `${getICD10CodeDescription(condition.diagnosis) || condition.diagnosis || 'Unknown'} (${condition.diagnosis})`}
                </span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medications</>} color='#9E49E2'>
          {isSectionEmpty(visibleMedications) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : visibleMedications?.map((medication) => (
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
          {isSectionEmpty(visibleSurgicalHx) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            visibleSurgicalHx?.map((condition) => (
              <div key={`${condition.date}-${condition.procedure}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: condition.date === "Date Unknown" ? '#bbbbbb' : 'inherit', textAlign: 'right', minWidth: '110px' }}>
                  {Database.JSONDate.toDateString(condition.date!)}
                </span>
                <span style={{ flex: '1', textAlign: 'left', marginLeft: '25px' }}>{condition.procedure}</span>
              </div>
            ))
          )}
        </TitledCard>
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Family History</>} color='#9F3494'>
          {isSectionEmpty(visibleFamilyStatus) ? (
            <div style={{ fontStyle: 'italic', color: '#666' }}>Not on file</div>
          ) : (
            visibleFamilyStatus?.map((relative) => {
              const conditions = (visibleFamilyHx ?? []).filter((fh: any) => fh.person === relative.id).map((fh: any) => fh.description);
              return (
                <div key={relative.id}>
                  <span style={{ color: '#bbbbbb' }}>{relative.relationship}</span>
                  <span style={{ marginLeft: '35px' }}>{conditions.length > 0 ? conditions.join(', ') : 'No pertinent history'}</span>
                </div>
              )
            })
          )}
        </TitledCard>
      </Grid>
    </Box>
  )
}
