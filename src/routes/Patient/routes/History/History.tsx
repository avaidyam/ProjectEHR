// HistoryTabContent.jsx
import * as React from 'react';
import { Tab, Tabs, Divider } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { Box, Label, Stack } from 'components/ui/Core';
import { usePatient } from '../../../../components/contexts/PatientContext';

import { MedicalHistory } from './routes/MedicalHistory';
import { SurgicalHistory } from './routes/SurgicalHistory';
import { FamilyHistory } from './routes/FamilyHistory';
import { SubstanceAndSexualHistory } from './routes/SocialHistorySubstance';
import { ECigaretteVapingHistory } from './routes/SocialHistoryECig';
import { SocialHistorySocioeconomic } from './routes/SocialHistorySocioeconomic';
import { SocialHistoryADL } from './routes/SocialHistoryADL';
import { SocialHistoryDocumentation } from './routes/SocialHistoryDocumentation';
import { BirthHistory } from './routes/SpecialtyBirth';
import { SpecialtyOB } from './routes/SpecialtyOB';
import { PapTracking } from './routes/SpecialtyPap';

export function HistoryTabContent() {
  const { useChart } = usePatient();
  const [gender] = useChart().gender();
  const [value, setValue] = React.useState("Medical")

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
              <Tabs onChange={(event: any, newValue: any) => { setValue(newValue) }} aria-label="general history tabs" sx={{ minHeight: 32 }} value={['Medical', 'Surgical', 'Family'].includes(value) ? value : false}>
                <Tab value="Medical" label="Medical" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Surgical" label="Surgical" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Family" label="Family" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </Tabs>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', px: 1, fontSize: '0.65rem' }}>SOCIAL</Label>
              <Tabs onChange={(event: any, newValue: any) => { setValue(newValue) }} aria-label="social history tabs" sx={{ minHeight: 32 }} value={['Substance & Sexual History', 'E-cigarette/Vaping', 'Socioeconomic', 'ADL', 'Social Documentation'].includes(value) ? value : false}>
                <Tab value="Substance & Sexual History" label="Substance & Sexual" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="E-cigarette/Vaping" label="E-cigarette" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Socioeconomic" label="Socioeconomic" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="ADL" label="ADL" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                <Tab value="Social Documentation" label="Social Doc" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </Tabs>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Label variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', px: 1, fontSize: '0.65rem' }}>SPECIALTY</Label>
              <Tabs onChange={(event: any, newValue: any) => { setValue(newValue) }} aria-label="specialty history tabs" sx={{ minHeight: 32 }} value={['Birth', 'OB/Gyn', 'Pap Tracking'].includes(value) ? value : false}>
                <Tab value="Birth" label="Birth" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
                {gender === 'Female' && <Tab value="OB/Gyn" label="OB/Gyn" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />}
                <Tab value="Pap Tracking" label="Pap Tracking" sx={{ minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' }} />
              </Tabs>
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
            <SubstanceAndSexualHistory />
          </TabPanel>
          <TabPanel value="E-cigarette/Vaping">
            <ECigaretteVapingHistory />
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
            <BirthHistory />
          </TabPanel>
          {gender === 'Female' && (
            <TabPanel value="OB/Gyn">
              <SpecialtyOB />
            </TabPanel>
          )}
          <TabPanel value="Pap Tracking">
            <PapTracking />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
}