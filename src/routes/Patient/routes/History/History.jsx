// HistoryTabContent.jsx
import React, { useState } from 'react';
import { Tab, Divider } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Label, Stack } from 'components/ui/Core.jsx';
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
  const { useChart } = usePatient();
  const [gender] = useChart().gender();
  const [value, setValue] = useState("Medical")

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Label variant="h6" sx={{ px: 2, pt: 1, pb: 0 }}>History</Label>
      <TabContext value={value}>
        <Box sx={{
          px: 1,
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
        }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 'max-content', py: 0.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', px: 1, fontSize: '0.65rem' }}>GENERAL</Label>
              <TabList onChange={(event, newValue) => { setValue(newValue) }} aria-label="general history tabs" sx={{ minHeight: 32 }}>
                <Tab value="Medical" label="Medical" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Surgical" label="Surgical" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Family" label="Family" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </TabList>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', px: 1, fontSize: '0.65rem' }}>SOCIAL</Label>
              <TabList onChange={(event, newValue) => { setValue(newValue) }} aria-label="social history tabs" sx={{ minHeight: 32 }}>
                <Tab value="Substance & Sexual History" label="Substance & Sexual" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="E-cigarette/Vaping" label="E-cigarette" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Socioeconomic" label="Socioeconomic" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="ADL" label="ADL" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Social Documentation" label="Social Doc" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </TabList>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', px: 1, fontSize: '0.65rem' }}>SPECIALTY</Label>
              <TabList onChange={(event, newValue) => { setValue(newValue) }} aria-label="specialty history tabs" sx={{ minHeight: 32 }}>
                <Tab value="Birth" label="Birth" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                {gender === 'Female' && <Tab value="OB/Gyn" label="OB/Gyn" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />}
                <Tab value="Pap Tracking" label="Pap Tracking" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </TabList>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
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
          {gender === 'Female' && (
            <TabPanel value="OB/Gyn">
              <SpecialtyOB />
            </TabPanel>
          )}
          <TabPanel value="Pap Tracking">
            <SpecialtyPap />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
}