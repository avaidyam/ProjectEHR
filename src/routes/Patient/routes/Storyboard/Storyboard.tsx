import * as React from 'react';
import { Divider, Label, ErrorBoundary } from 'components/ui/Core';
import { Database, usePatient } from 'components/contexts/PatientContext';

import { SidebarPatientInfo } from './components/SidebarPatientInfo';
import { SidebarSepsisAlert } from './components/SidebarSepsisAlert';
import { SidebarCareTeam } from './components/SidebarCareTeam';
import { SidebarAllergies } from './components/SidebarAllergies';
import { SidebarVitals } from './components/SidebarVitals';
import { SidebarClinicalImpressions } from './components/SidebarClinicalImpressions';
import { SidebarEncounterDiagnoses } from './components/SidebarEncounterDiagnoses';
import { SidebarProblemList } from './components/SidebarProblemList';

export const Storyboard = () => {
  const { useEncounter } = usePatient();
  const [encounter] = useEncounter()();

  console.log("sidebar got encounter:")
  console.dir(encounter)

  return (
    <>
      <ErrorBoundary><SidebarPatientInfo /></ErrorBoundary>
      <ErrorBoundary><SidebarSepsisAlert /></ErrorBoundary>
      <Divider sx={{ bgcolor: "primary.light" }} />
      <ErrorBoundary><SidebarCareTeam /></ErrorBoundary>
      <Divider sx={{ bgcolor: "primary.light" }} />
      <ErrorBoundary><SidebarAllergies /></ErrorBoundary>
      <Divider sx={{ bgcolor: "primary.light" }} />
      {!!encounter?.id ?
        <ErrorBoundary>
          <Label variant="h6">Encounter</Label>
          <Label>Type: {encounter?.type}</Label>
          <Label>Date: {Database.JSONDate.toDateString(encounter?.startDate)}</Label>
          <Label>Reason: {encounter?.concerns?.join(", ")}</Label>
          <Divider sx={{ bgcolor: "primary.light" }} />
          <ErrorBoundary><SidebarEncounterDiagnoses /></ErrorBoundary>
        </ErrorBoundary> :
        <Label variant="h6">Chart Review</Label>
      }
      <Divider sx={{ bgcolor: "primary.light" }} />
      <ErrorBoundary><SidebarVitals /></ErrorBoundary>
      <Divider sx={{ bgcolor: "primary.light" }} />
      <ErrorBoundary><SidebarClinicalImpressions /></ErrorBoundary>
      <Divider sx={{ bgcolor: "primary.light" }} />
      <ErrorBoundary><SidebarProblemList /></ErrorBoundary>
    </>
  );
};
