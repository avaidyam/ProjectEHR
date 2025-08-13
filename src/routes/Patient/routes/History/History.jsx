// HistoryTabContent.jsx
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import MedicalHistory from './MedicalHistory';
import SurgicalHistory from './SurgicalHistory';
import FamilyHistory from './FamilyHistory';
import SocialHistorySubstance from './SocialHistorySubstance';
import SocialHistoryECig from './SocialHistoryECig';
import SocialHistorySocioeconomic from './SocialHistorySocioeconomic';
import SocialHistoryADL from './SocialHistoryADL';

const VerticalTabs = styled(Tabs)({
  borderRight: `1px solid #e0e0e0`,
  '& .MuiTabs-indicator': {
    left: 0,
  },
});

const StyledTab = styled(Tab)({
  textAlign: 'left',
  justifyContent: 'flex-start',
  paddingLeft: 16,
  minHeight: 48,
  textTransform: 'none',
});

const SectionHeader = styled(Typography)({
  padding: '16px 16px 8px 16px',
  textAlign: 'left',
  color: 'text.secondary',
  fontSize: '0.8rem',
  fontWeight: 'bold',
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function HistoryTabContent() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>History</Typography>
      </Box>
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid item>
          <Box sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader>GENERAL</SectionHeader>
            <VerticalTabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Vertical history tabs"
            >
              <StyledTab label="Medical" {...a11yProps(0)} />
              <StyledTab label="Surgical" {...a11yProps(1)} />
              <StyledTab label="Family" {...a11yProps(2)} />
              <SectionHeader>SOCIAL</SectionHeader>
              <StyledTab label="Substance & Sexual..." {...a11yProps(3)} />
              <StyledTab label="E-cigarette/Vaping" {...a11yProps(4)} />
              <StyledTab label="Socioeconomic" {...a11yProps(5)} />
              <StyledTab label="ADL" {...a11yProps(6)} />
              <StyledTab label="Social Documentation" {...a11yProps(7)} />
              <StyledTab label="Social Determinants" {...a11yProps(8)} />
              <SectionHeader>SPECIALTY</SectionHeader>
              <StyledTab label="Birth" {...a11yProps(9)} />
              <StyledTab label="OB/Gyn" {...a11yProps(10)} />
              <StyledTab label="Pap Tracking" {...a11yProps(11)} />
            </VerticalTabs>
          </Box>
        </Grid>
        <Grid item xs sx={{ backgroundColor: 'background.paper' }}>
          <TabPanel value={value} index={0}>
            <MedicalHistory />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SurgicalHistory />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <FamilyHistory />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <SocialHistorySubstance />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <SocialHistoryECig />
          </TabPanel>
          <TabPanel value={value} index={5}>
            <SocialHistorySocioeconomic />
          </TabPanel>
          <TabPanel value={value} index={6}>
            <SocialHistoryADL />
          </TabPanel>
          <TabPanel value={value} index={7}>
            <Typography variant="h6">Social Documentation</Typography>
            <Typography>Placeholder for Social Documentation content.</Typography>
          </TabPanel>
          <TabPanel value={value} index={8}>
            <Typography variant="h6">Social Determinants</Typography>
            <Typography>Placeholder for Social Determinants content.</Typography>
          </TabPanel>
          <TabPanel value={value} index={9}>
            <Typography variant="h6">Birth</Typography>
            <Typography>Placeholder for Birth content.</Typography>
          </TabPanel>
          <TabPanel value={value} index={10}>
            <Typography variant="h6">OB/Gyn</Typography>
            <Typography>Placeholder for OB/Gyn content.</Typography>
          </TabPanel>
          <TabPanel value={value} index={11}>
            <Typography variant="h6">Pap Tracking</Typography>
            <Typography>Placeholder for Pap Tracking content.</Typography>
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
}