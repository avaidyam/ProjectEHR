import React, { useState, useContext } from 'react'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import { usePatientMRN } from '../../../../util/urlHelpers.js'
import histschema from '../../../../util/data/history_schema.json'
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js'
import { AuthContext } from '../../../login/AuthContext';

export const HistoryTabContent = ({ children, ...props }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()
  const { encounters } = TEST_PATIENT_INFO({ patientMRN });
  const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters
  const enabledEncounterNumber = enabledEncounters[patientMRN];

  const { history } = encounters?.[enabledEncounterNumber]
  const { schema, uischema } = histschema
  const [data, setData] = useState(history)
  return (
    <JsonForms
      schema={schema}
      uischema={uischema}
      data={data}
      renderers={materialRenderers}
      cells={materialCells}
    />
  )
}