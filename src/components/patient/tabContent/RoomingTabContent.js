import React from 'react';

const RoomingTabContent = ({ children, value, index, patientMRN, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      rooming stuff goes here for {patientMRN}
    </div>
  );
};

export default RoomingTabContent;
