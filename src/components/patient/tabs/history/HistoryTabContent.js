import React, { useState,useEffect } from 'react';

import { usePatientMRN } from '../../../../util/urlHelpers.js';

import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';

import { JsonForms } from '@jsonforms/react';

import histschema from '../../../../util/data/historyschema.json';

import histuischema from '../../../../util/data/historyuischema.json';

import { TEST_PATIENT_HISTORY } from '../../../../util/data/PatientSample.js'


const HistoryTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()

  const [data, setData] = useState(TEST_PATIENT_HISTORY({ patientMRN }));

  const schema = histschema;
  const uischema = histuischema;


return (
   
<div >   
   
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
      />
  </div>  
  );
};


export default HistoryTabContent;