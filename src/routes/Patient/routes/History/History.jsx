// HistoryTabContent.jsx
import React, { useState } from 'react';
import { Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { HStack, Box, Label } from '../../../../components/ui/Core.jsx';

import { MedicalHistory } from './routes/MedicalHistory/MedicalHistory.jsx';
import { SurgicalHistory } from './routes/SurgicalHistory/SurgicalHistory.jsx';
import { FamilyHistory } from './routes/FamilyHistory/FamilyHistory.jsx';
import { SocialHistorySubstance } from './routes/SocialHistory/SocialHistorySubstance.jsx';
import { SocialHistoryECig } from './routes/SocialHistory/SocialHistoryECig.jsx';
import { SocialHistorySocioeconomic } from './routes/SocialHistory/SocialHistorySocioeconomic.jsx';
import { SocialHistoryADL } from './routes/SocialHistory/SocialHistoryADL.jsx';

export default function HistoryTabContent() {
  const [value, setValue] = useState("Medical")
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Label variant="h4" sx={{ fontWeight: 'bold' }}>History</Label>
      </Box>
      <TabContext value={value}>
      <HStack>
          <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200, display: 'flex', flexDirection: 'column' }}>
            <TabList
              orientation="vertical"
              variant="scrollable"
              onChange={(event, newValue) => { setValue(newValue) }}
            >
              <Label variant="overline">GENERAL</Label>
              <Tab value="Medical" label="Medical" />
              <Tab value="Surgical" label="Surgical" />
              <Tab value="Family" label="Surgical" />
              <Label variant="overline">SOCIAL</Label>
              <Tab value="Substance & Sexual History" label="Substance & Sexual History" />
              <Tab value="E-cigarette/Vaping" label="E-cigarette/Vaping" />
              <Tab value="Socioeconomic" label="Socioeconomic" />
              <Tab value="ADL" label="ADL" />
              <Tab value="Social Documentation" label="Social Documentation" />
              <Tab value="Social Determinants" label="Social Determinants" />
              <Label variant="overline">SPECIALTY</Label>
              <Tab value="Birth" label="Birth" />
              <Tab value="OB/Gyn" label="OB/Gyn" />
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
            <Label variant="h6">Social Documentation</Label>
            <Label>Placeholder for Social Documentation content.</Label>
          </TabPanel>
          <TabPanel value="Social Determinants">
            <Label variant="h6">Social Determinants</Label>
            <Label>Placeholder for Social Determinants content.</Label>
          </TabPanel>
          <TabPanel value="Birth">
            <Label variant="h6">Birth</Label>
            <Label>Placeholder for Birth content.</Label>
          </TabPanel>
          <TabPanel value="OB/Gyn">
            <Label variant="h6">OB/Gyn</Label>
            <Label>Placeholder for OB/Gyn content.</Label>
          </TabPanel>
          <TabPanel value="Pap Tracking">
            <Label variant="h6">Pap Tracking</Label>
            <Label>Placeholder for Pap Tracking content.</Label>
          </TabPanel>
          </Box>
      </HStack>
      </TabContext>
    </Box>
  );
}