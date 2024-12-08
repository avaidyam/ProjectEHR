import React from 'react';
import { usePatientMRN, useEncounterID } from '../../../../util/urlHelpers.js';

const RoomingTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()
  const [enc, setEnc] = useEncounterID()
  return (
    <div className="tab-content-container">
      rooming stuff goes here for {patientMRN}
    </div>
  );
};

export default RoomingTabContent;
