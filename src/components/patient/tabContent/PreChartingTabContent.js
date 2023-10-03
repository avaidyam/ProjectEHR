import React from 'react';

const PreChartingTabContent = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      <div>
        <strong>History</strong>
      </div>
      <div>
        <strong>Allergies</strong>
      </div>
      <div>
        <strong>Medications</strong>
      </div>
    </div>
  );
};

export default PreChartingTabContent;
