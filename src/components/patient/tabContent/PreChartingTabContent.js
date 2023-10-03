import { Typography } from '@mui/material';
import React from 'react';

const PreChartingTabContent = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      <div className="flex flex-col">
        <Typography variant="h6" color="inherit" component="div">
          History
        </Typography>
        <div className="sub-content-container" />
      </div>
      <div>
        <Typography variant="h6" color="inherit" component="div">
          Allergies
        </Typography>
        <div className="sub-content-container" />
      </div>
      <div>
        <Typography variant="h6" color="inherit" component="div">
          Medications
        </Typography>
        <div className="sub-content-container" />
      </div>
    </div>
  );
};

export default PreChartingTabContent;
