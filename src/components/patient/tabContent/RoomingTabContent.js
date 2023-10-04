import React from 'react';

const RoomingTabContent = ({ children, value, index, ...other }) => {
  return (
    <div hidden={value !== index} className="tab-content-container">
      rooming stuff goes here
    </div>
  );
};

export default RoomingTabContent;
