import React, { useState } from 'react';

import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import { useEncounterID, usePatientMRN } from '../../../../util/urlHelpers.js';

import histschema from '../../../../util/data/history_schema.json';

export const HistoryTabContent = ({ children, ...props }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const [enc, setEnc] = useEncounterID();
  const { encounters } = TEST_PATIENT_INFO({ patientMRN });

  const { history } = encounters?.find((x) => x.id === enc);
  const { schema, uischema } = histschema;
  const [data, setData] = useState(history);
  return <></>;
};
