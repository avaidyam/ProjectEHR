import React, { useState,useEffect } from 'react';

import { usePatientMRN } from '../../../util/urlHelpers.js';

import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';

import SurgicalHistoryTableRenderer from './SurgicalHistoryTabRenderer.js';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { registerRenderer } from '@jsonforms/core';

import { JsonForms } from '@jsonforms/react';

import histschema from '../../../util/data/historyschema.json';

import histuischema from '../../../util/data/historyuischema.json';

const HistoryTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()

  const [data, setData] = useState({
    "medical": [
      {
        "diagnosis": "Hypertension",
        "date": "2010-01-15",
        "age": "52"
      },
      {
        "diagnosis": "Hyperlipidemia",
        "date": "2015-02-20",
        "age": "57"
      },
      {
        "diagnosis": "Non-insulin-dependent diabetes mellitus",
        "date": "2018-03-10",
        "age": "60"
      },
      {
        "diagnosis": "Osteoarthritis",
        "date": "2020-04-05",
        "age": "62"
      },
      {
        "diagnosis": "Prior history of right foot fracture",
        "date": "2021-05-20",
        "age": "63"
      },
      {
        "diagnosis": "Gastro-esophageal reflux disease",
        "date": "2022-06-10",
        "age": "64"
      }
    ],
    "surgical": [
      {
        "procedure": "Cholecystectomy",
        "laterality": "",
        "date": "1994-06-15",
        "age": "48",
        "comment": ""
      },
      {
        "procedure": "Foot surgery",
        "laterality": "",
        "date": "2019-04-22",
        "age": "61",
        "comment": ""
      }
    ],
    "family": [
      {
        "relationship": "Father",
        "name": "",
        "status": "Deceased",
        "age": 65,
        "problems": [
          {
            "description": "Heart disease",
            "ageOfOnset": "65"
          }
        ]
      },
      {
        "relationship": "Mother",
        "name": "",
        "status": "Deceased",
        "age": 78,
        "problems": [
          {
            "description": "Breast cancer",
            "ageOfOnset": "78"
          }
        ]
      },
      {
        "relationship": "Brother",
        "name": "",
        "status": "",
        "age": 62,
        "problems": [
          {
            "description": "Coronary artery disease with MI",
            "ageOfOnset": "62"
          },
          {
            "description": "Coronary artery bypass graft surgery",
            "ageOfOnset": "62"
          }
        ]
      }
    ],
    "SubstanceSexualHealth": {
      "tobacco": {
        "smokingStatus": "Everyday",
        "types": [
          "Cigarette"
        ],
        "startDate": "1980-01-01",
        "packsPerDay": 1,
        "packYears": 50,
        "smokelessStatus": {
          "smokelessStatus": "Never",
          "comments": ""
        }
      },
      "alcohol": {
        "alcoholStatus": "Yes",
        "drinksPerWeek": {
          "wineGlasses": 0,
          "beerCans": 3,
          "liquorShots": 0,
          "drinksContainingAlcohol": 0,
          "standardDrinks": 0
        }
      },
      "drugs": {
        "drugStatus": "Not Currently",
        "drugTypes": [],
        "usePerWeek": "",
        "comments": ""
      }
    },
    "Socioeconomic": {
      "occupation": "Delivery truck driver",
      "employer": "Local furniture store",
      "occupationalHistory": [
        {
          "occupation": "Floor manager",
          "employer": "Printing facility"
        },
        {
          "occupation": "Delivery truck driver",
          "employer": "Local furniture store"
        },
        {
          "occupation": "Odd jobs worker",
          "employer": "Local construction and concrete laying companies"
        }
      ],
      "demographics": {
        "maritalStatus": "Married",
        "spouseName": "Unknown",
        "numberOfChildren": 2,
        "yearsOfEducation": 0,
        "highestEducationLevel": "Some College",
        "preferredLanguage": "",
        "ethnicGroup": "",
        "race": ""
      }
    },
    "SocialDocumentation": {
      "textbox":"- John Hanson was a floor manager at a printing facility in Mattoon, IL, where he worked for 22 years before the factory shut down and he lost his job. \n- He currently works as a part-time delivery truck driver for a local furniture store. \n- He also works odd jobs at a local construction company and a concrete laying company. \n- He lives with his wife of 35 years who has multiple sclerosis. She is unable to walk and uses a wheelchair for mobility. \n- He is her primary caregiver. \n- They have two sons who do not live in the area. \n- He has smoked since he was a teenager and currently smokes a pack per day. \n- He has 3-4 beers a week. \n- He denies recreational drug use. \n- Since his fall and right foot fracture 5 years ago, he has gained 70 lbs., which he attributes to lack of exercise since his injury and resultant chronic right foot and knee pain. \n- His diet is mostly take-out fast food. \n- He remembers to take his medications. However, it is hard for him to take them regularly, given his odd shift hours including night shifts."

    }
  }
  );

  const schema = histschema;
  const uischema = histuischema;


// Register the custom renderer with JSONForms
registerRenderer({
  tester: (uischema) => uischema.type === 'Control' && uischema.scope.$ref === '#/properties/surgical',
  renderer: SurgicalHistoryTableRenderer
});

const renderers = [
  ...materialRenderers,
  { tester: (uischema) => uischema.type === 'Control' && uischema.scope.$ref === '#/properties/surgical', renderer: SurgicalHistoryTableRenderer }
];

  return (
   
<div >   
   
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={renderers}
        cells={materialCells}
      />
  </div>  
  );
};


export default HistoryTabContent;