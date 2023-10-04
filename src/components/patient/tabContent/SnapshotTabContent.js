import React from 'react';

const SnapshotTabContent = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      snapshot stuff goes here
    </div>
  );
};

export default SnapshotTabContent;
