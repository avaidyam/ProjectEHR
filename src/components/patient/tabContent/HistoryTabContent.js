import React, { useState,useEffect } from 'react';

import { usePatientMRN } from '../../../util/urlHelpers.js';

import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';


import { createTheme, ThemeProvider } from '@mui/material/styles';

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
        "spouseName": "John's wife",
        "numberOfChildren": 2,
        "yearsOfEducation": 0,
        "highestEducationLevel": "Some College",
        "preferredLanguage": "",
        "ethnicGroup": "",
        "race": ""
      }
    },
    "SocialDocumentation": {
      "SocialDocumentation": "- John Hanson was a floor manager at a printing facility in Mattoon, IL, where he worked for 22 years before the factory shut down and he lost his job. \n- He currently works as a part-time delivery truck driver for a local furniture store. \n- He also works odd jobs at a local construction company and a concrete laying company. \n- He lives with his wife of 35 years who has multiple sclerosis. She is unable to walk and uses a wheelchair for mobility. \n- He is her primary caregiver. \n- They have two sons who do not live in the area. \n- He has smoked since he was a teenager and currently smokes a pack per day. \n- He has 3-4 beers a week. \n- He denies recreational drug use. \n- Since his fall and right foot fracture 5 years ago, he has gained 70 lbs., which he attributes to lack of exercise since his injury and resultant chronic right foot and knee pain. \n- His diet is mostly take-out fast food. \n- He remembers to take his medications. However, it is hard for him to take them regularly, given his odd shift hours including night shifts."
    }
  }
  );

  const schema = histschema;

  const uischema = histuischema;

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiTabs: {
      defaultProps: {
        orientation: 'vertical',
      },
    },
    MuiAppBar: {
      defaultProps: {
        sx: {
          width: 'inherit',
          marginRight: '16px'
        }
      }
    }
  },
});

  return (
   
<div style={{display: 'flex'}}>    
    <ThemeProvider theme={theme}>
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
      />
      </ThemeProvider>
    </div>  
  );
};


/*const HistoryTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0); // Default selected tab index

  const handleCategoryChange = (event, newIndex) => {
    setSelectedTabIndex(newIndex);
  };

  const generalSubcategories = categories[0].general;
  const socialSubcategories = categories[0].social;

  let selectedCategory;
  let selectedSubcategory;

  if (selectedTabIndex >= 0 && selectedTabIndex < generalSubcategories.length) {
    selectedCategory = 'General';
    selectedSubcategory = generalSubcategories[selectedTabIndex];
  } else if (selectedTabIndex >= generalSubcategories.length && selectedTabIndex < generalSubcategories.length + socialSubcategories.length) {
    selectedCategory = 'Social';
    selectedSubcategory = socialSubcategories[selectedTabIndex - generalSubcategories.length];
  }
  return (
    <Box sx={{ flexGrow:1, bgcolor: 'background.paper', display: 'flex' }}>
      <Tabs
        value={selectedTabIndex}
        onChange={handleCategoryChange}
        orientation="vertical"
        variant="scrollable"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        {[...generalSubcategories, ...socialSubcategories].map((subcategory, index) => (
          <Tab key={index} label={subcategory} />
        ))}
      </Tabs>

      {/* Render content based on the selected subcategory */ //}
     /* {selectedCategory === 'General' && <GeneralContent key={selectedSubcategory} subcategory={selectedSubcategory} />}
      {selectedCategory === 'Social' && <SocialContent key={selectedSubcategory} subcategory={selectedSubcategory} />}
    </Box>
  );
};*/

async function resolveRefs(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    // If obj is an array, return it as is without iterating through its elements
    return obj;
  }

  if ('$ref' in obj) {
    const response = await fetch(obj['$ref']);
    const resolvedObject = await response.json();
    return resolveRefs(resolvedObject);
  }

  const resolvedObj = {};
  await Promise.all(Object.entries(obj).map(async ([key, value]) => {
    resolvedObj[key] = await resolveRefs(value);
  }));

  return resolvedObj;
}

const GeneralContent = ({ subcategory }) => {
  const [existingConditions, setExistingConditions] = useState([]);

  const [resolvedSchema, setResolvedSchema] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleAddCondition = () => {
    if (formData.diagnosis.trim() !== '') {
      setExistingConditions([...existingConditions, { ...formData }]);
      setDialogOpen(false);
      setFormData({});
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {
        setResolvedSchema(await resolveRefs(GeneralSchema[subcategory]));
      } catch (error) {
        console.error('Error resolving schemas:', error);
      }
    }

    fetchData();
  }, []); 
  if (!resolvedSchema) {
    return null;
  }

  const {schema} = resolvedSchema;
  const columns = Object.keys(schema.properties);

  return (
    <div>
       <Button variant="outlined" onClick={() => setDialogOpen(true)}>
          Add Entry
        </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Entry</DialogTitle>
        <DialogContent>
          <Form validator={validator} schema={schema} formData={formData} onChange={({ formData2 }) => setFormData(formData2)} onSubmit={handleAddCondition}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} align="left">
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {existingConditions.map((condition, index) => (
              <TableRow key={index}>
                {Object.keys(condition).map((key) => (
                  <TableCell key={key} align="left">
                    {condition[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

 const SocialContent = ({subcategory}) => {
  const [formData, setFormData] = useState({}); // State variable to store form data
  const [resolvedSchema,setResolvedSchema] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedSchema = await resolveRefs(SocialSchema[subcategory]);
        setResolvedSchema(resolvedSchema);
      } catch (error) {
        console.error('Error resolving schemas:', error);
      }
    }

    fetchData();
  }, []); 
  if (!resolvedSchema) {
    return null;
  }

const onFormDataSubmit = (formState) => {
  setFormData(formState.formData)
}

  const {schema, UISchema} = resolvedSchema;

  return (
    <div>
      <Form validator={validator} schema={schema} uiSchema={UISchema} formData={formData}
      onSubmit={onFormDataSubmit}/>
     
    </div>
  )
};


export default HistoryTabContent;