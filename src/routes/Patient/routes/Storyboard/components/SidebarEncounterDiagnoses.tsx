import * as React from 'react';
import { Typography } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';
import { getICD10CodeDescription } from 'util/helpers';

export const SidebarEncounterDiagnoses = () => {
  const { useEncounter } = usePatient();
  const [problems] = useEncounter().problems();

  const encounterDiagnoses = (problems || []).filter((p: any) => p.encounterDx);

  return (
    <>
      <Typography variant="h6" style={{ fontSize: '1.25em' }}>
        Diagnoses ({encounterDiagnoses.length})
      </Typography>
      {encounterDiagnoses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {encounterDiagnoses.map((p: any) => (
            <div key={p.id || JSON.stringify(p)}>
              {p.displayAs ?? `${getICD10CodeDescription(p.diagnosis) || 'Unknown'} (${p.diagnosis})`}
            </div>
          ))}
        </div>
      ) : (
        <i>No diagnoses for this encounter</i>
      )}
    </>
  )
}
