import React, { useState } from 'react'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import { JsonForms } from '@jsonforms/react'
import { usePatientMRN } from '../../../../util/urlHelpers.js'
import histschema from '../../../../util/data/historyschema.json'
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientDemo.js'

export const HistoryTabContent = ({ children, ...props }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()
  const { history } = TEST_PATIENT_INFO({ patientMRN })
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