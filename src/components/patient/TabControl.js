import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import PreChartingTabContent from './tabContent/PreChartingTabContent.js';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const TabControl = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Pre-Charting" />
          <Tab label="SnapShot" />
          <Tab label="Chart Review" />
          <Tab label="Rooming" />
        </Tabs>
      </Box>
      <PreChartingTabContent value={value} index={0} />
      <CustomTabPanel value={value} index={1}>
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        Item Three
      </CustomTabPanel>
    </>
  );
};

export default TabControl;
