import React from 'react';

const SnapshotTabContent = ({ children, value, index, patientMRN, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      snapshot stuff goes here {patientMRN}
    </div>
  );
};

export default SnapshotTabContent;
