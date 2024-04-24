import React from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';

const RoomingTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()
  return (
    <div className="tab-content-container">
      rooming stuff goes here for {patientMRN}
    </div>
  );
};

export default RoomingTabContent;
