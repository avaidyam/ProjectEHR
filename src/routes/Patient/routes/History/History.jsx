// HistoryTabContent.jsx
import React, { useState } from 'react';
import { Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Box, Label } from 'components/ui/Core.jsx';
import { usePatient } from '../../../../components/contexts/PatientContext.jsx';

import MedicalHistory from './routes/MedicalHistory/MedicalHistory.jsx';
import SurgicalHistory from './routes/SurgicalHistory/SurgicalHistory.jsx';
import FamilyHistory from './routes/FamilyHistory/FamilyHistory.jsx';
import SocialHistorySubstance from './routes/SocialHistory/SocialHistorySubstance.jsx';
import SocialHistoryECig from './routes/SocialHistory/SocialHistoryECig.jsx';
import SocialHistorySocioeconomic from './routes/SocialHistory/SocialHistorySocioeconomic.jsx';
import SocialHistoryADL from './routes/SocialHistory/SocialHistoryADL.jsx';
import SocialHistoryDocumentation from './routes/SocialHistory/SocialHistoryDocumentation.jsx';
import SocialHistoryBirth from './routes/Specialty/SpecialtyBirth.jsx';
import SpecialtyOB from './routes/Specialty/SpecialtyOB.jsx';
import SpecialtyPap from './routes/Specialty/SpecialtyPap.jsx';


export default function HistoryTabContent() {
  const [value, setValue] = useState("Medical")

  const { useChart } = usePatient();
  const [{ gender }] = useChart()();
  
  const isFemale = gender === 'Female';
  

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Label variant="h4" sx={{ fontWeight: 'bold' }}>History</Label>
      </Box>
      <TabContext value={value}>
      <Stack horizontal>
          <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200, display: 'flex', flexDirection: 'column' }}>
            <TabList
              orientation="vertical"
              variant="scrollable"
              onChange={(event, newValue) => { setValue(newValue) }}
            >
              <Label variant="overline">GENERAL</Label>
              <Tab value="Medical" label="Medical" />
              <Tab value="Surgical" label="Surgical" />
              <Tab value="Family" label="Family" />
              <Label variant="overline">SOCIAL</Label>
              <Tab value="Substance & Sexual History" label="Substance & Sexual History" />
              <Tab value="E-cigarette/Vaping" label="E-cigarette/Vaping" />
              <Tab value="Socioeconomic" label="Socioeconomic" />
              <Tab value="ADL" label="ADL" />
              <Tab value="Social Documentation" label="Social Documentation" />
              <Label variant="overline">SPECIALTY</Label>
              <Tab value="Birth" label="Birth" />
              {isFemale && <Tab value="OB/Gyn" label="OB/Gyn" />}
              <Tab value="Pap Tracking" label="Pap Tracking" />
            </TabList>
          </Box>
          <Box>
          <TabPanel value="Medical">
            <MedicalHistory />
          </TabPanel>
          <TabPanel value="Surgical">
            <SurgicalHistory />
          </TabPanel>
          <TabPanel value="Family">
            <FamilyHistory />
          </TabPanel>
          <TabPanel value="Substance & Sexual History">
            <SocialHistorySubstance />
          </TabPanel>
          <TabPanel value="E-cigarette/Vaping">
            <SocialHistoryECig />
          </TabPanel>
          <TabPanel value="Socioeconomic">
            <SocialHistorySocioeconomic />
          </TabPanel>
          <TabPanel value="ADL">
            <SocialHistoryADL />
          </TabPanel>
          <TabPanel value="Social Documentation">
            <SocialHistoryDocumentation />
          </TabPanel>
          <TabPanel value="Birth">
            <SocialHistoryBirth />
          </TabPanel>
          {isFemale && (
            <TabPanel value="OB/Gyn">
              <SpecialtyOB />
            </TabPanel>
          )}
          <TabPanel value="Pap Tracking">
            <SpecialtyPap />
          </TabPanel>
          </Box>
      </Stack>
      </TabContext>
    </Box>
  );
}