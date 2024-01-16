import React, { useState,useEffect } from 'react';




import { usePatientMRN } from '../../../util/urlHelpers.js';

import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';

import { createTheme, ThemeProvider } from '@mui/material/styles';


import { JsonForms } from '@jsonforms/react';


const HistoryTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN()

  const [data, setData] = useState({});

  const schema = {
    "type": "object",
    "properties": {
      "medical":{
        "type": "array",
        "items":{
          "type": "object",
          "properties": {
          "diagnosis": {
            "type": "string"
          },
          "date": {
            "type": "string"
          },
          "age": {
            "type": "string",
          },
          "comment": {
            "type": "string"
          }
        }
      }
    },
    "surgical": {
        "type": "array",
        "items":{
          "type": "object",
          "properties": {
            "procedure": {
              "type": "string",
            },
            "laterality": {
              "type": "string",
            },
            "date": {
              "type": "string",
            },
            "age": {
              "type": "string",
            },
            "comment": {
              "type": "string",
            },
            "chartLink": {
              "type": "string",
            }
          }
        }
      },
      "family": {
        "type": "array",
        "items":{
          "type": "object",
          "properties": {
            "relationship": {
              "type": "string",
            },
            "name": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "age": {
              "type": "integer",
            },
            "problems": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": {
                    "type": "string",
                  },
                  "ageOfOnset": {
                    "type": "string",
                  }
                }
              }
            }
          }
        }
      },
      "SubstanceSexualHealth": {
        "type": "object",
        "properties": {
          "tobacco":{
            "type":"object",
            "title": "Tobacco",
            "properties": {
              "smokingStatus": {
                "type": "string",
                "title": "Smoking",
                "enum": [
                  "None",
                  "Former",
                  "Everyday",
                  "Some Days",
                  "Unknown"
                ]
              },
	           "types": {
      	        "type": "array",
      	        "title": "Types",
      	        "uniqueItems": true,
      	        "items": {
      	          "type": "string",
      	          "enum": [
      	            "Cigarette",
      	            "Pipe",
      	            "Cigar"
      	          ]
      	        }
	           },
            "startDate": {
              "type": "string",
              "title": "Start Date",
              "format": "date"
            },
            "endDate": {
              "type": "string",
              "title": "End Date",
              "format": "date"
            },
            "packsPerDay": {
              "type": "number",
              "title": "Packs/Day"
            },
            "packYears": {
              "type": "number",
              "title": "Pack Years"
            },
            "smokelessStatus": {
              "type": "object",
              "title": "Smokeless",
              "properties": {
                "smokelessStatus": {
                  "type": "string",
                  "enum": [
                    "Never",
                    "Former",
                    "Current",
                    "Unknown"
                  ]
                },
                "comments": {
                  "type": "string",
                  "title": "Comments"
                }
              }
            }
          }
      },
      "alcohol": {
        "type": "object",
        "title": "Alcohol",
        "properties": {
          "alcoholStatus": {
            "type": "string",
            "title": "Alcohol Status",
            "enum": [
              "Yes",
              "Not Currently",
              "Never"
            ]
          },
          "drinksPerWeek": {
            "type": "object",
            "title": "Drinks Per Week",
            "properties": {
              "wineGlasses": {
                "type": "integer",
                "title": "Glasses of Wine"
              },
              "beerCans": {
                "type": "integer",
                "title": "Cans of Beer"
              },
              "liquorShots": {
                "type": "integer",
                "title": "Shots of Liquor"
              },
              "drinksContainingAlcohol": {
                "type": "integer",
                "title": "Drinks Containing .5oz of Alcohol"
              },
              "standardDrinks": {
                "type": "integer",
                "title": "Standard Drinks or Equivalent"
              }
            }
          }
        }
      },
      "drugs": {
        "type": "object",
        "title": "Drugs",
        "properties": {
          "drugStatus": {
            "type": "string",
            "title": "Drug Use",
            "enum": [
              "Yes",
              "Not Currently",
              "Never"
            ]
          },
          "drugTypes": {
            "type": "array",
            "title": "Types of Drugs Used",
            "uniqueItems": true,
            "items": {
              "type": "string",
              "enum": [
                "Anabolic Steroids",
                "Barbiturates",
                "Benzodiazepine",
                "Cannabinoids",
                "Hallucinogens",
                "Inhalants",
                "Opioids",
                "Stimulants",
                "Other"
              ]
            }              
          },
          "usePerWeek": {
            "type": "integer",
            "title": "Use per Week"
          },
          "comments": {
            "type": "string",
            "title": "Comments"
          }
        }
      },
      "sexualActivity": {
        "type": "object",
        "title": "Sexual Activity",
        "properties": {
          "sexuallyActiveStatus": {
            "type": "string",
            "title": "Sexually Active",
            "enum": [
              "Yes",
              "Not Currently",
              "Never"
            ]
          },
          "birthControlMethods": {
            "type": "array",
            "title": "Birth Control Methods",
            "uniqueItems": true,
            "items": {
              "type": "string",
              "enum": [
                "Abstinence",
                "Coitus Interruptus",
                "Condom",
                "Diaphragm",
                "I.U.D",
                "Implant",
                "Injection",
                "Inserts",
                "None",
                "Patch",
                "Pill",
                "Progesterone Only Pill",
                "Rhythm",
                "Ring",
                "Spermicide",
                "Sponge",
                "Partner w/ Vasectomy"
              ]
            }
          },
          "partners": {
            "type": "array",
            "title": "Partners",
            "uniqueItems": true,
            "items":{
              "type": "string",
              "enum": [
                "Female",
                "Male",
                "Other"
              ]
            }
          },
          "comments": {
            "type": "string",
            "title": "Comments"
          }
        }
        }
      }
    },
    "Socioeconomic": {
      "type": "object",
      "properties": {
        "occupation": {
          "type": "string",
          "title": "Occupation"
        },
        "employer": {
          "type": "string",
          "title": "Employer"
        },
        "occupationalHistory": {
          "type": "array",
          "title": "Occupation History",
          "items": {
            "type": "object",
            "properties": {
              "occupation": {
                "type": "string",
                "title": "Occupation"
              },
              "employer": {
                "type": "string",
                "title": "Employer"
              }
            }
          }
        },
        "demographics": {
          "type": "object",
          "properties": {
            "maritalStatus": {
              "type": "string",
              "title": "Marital Status",
              "enum": [
                "Divorced",
                "Legally Separated",
                "Life Partner",
                "Married",
                "Single",
                "Unknown",
                "Widow/Widower"
              ]
            },
            "spouseName": {
              "type": "string",
              "title": "Spouse Name"
            },
            "numberOfChildren": {
              "type": "integer",
              "title": "Number of Children"
            },
            "yearsOfEducation": {
              "type": "integer",
              "title": "Years of Education"
            },
            "highestEducationLevel": {
              "type": "string",
              "title": "Highest Education Level",
              "enum": [
                "Less than high school diploma",
                "High School or Equivalent",
                "Some College",
                "Associate's degree",
                "Bachelor's degree",
                "Advanced Degree"
              ]
            },
            "preferredLanguage": {
              "type": "string",
              "title": "Preferred Language"
            },
            "ethnicGroup": {
              "type": "string",
              "title": "Ethnic Group"
            },
            "race": {
              "type": "string",
              "title": "Race"
            }
          }
        }
      }
    },
    "SocialDocumentation": {
      "type": "object",
      "properties": {
        "SocialDocumentation": {
          "type": "string",
        }
      }
    }
  }
}

  const uischema = {
    "type": "Categorization",
    "elements": [
      {
        "type": "Category",
        "label": "Medical",
        "elements": [
          {
            "type": "VerticalLayout",
            "elements": [
              {
                "type": "Control",
                "scope": "#/properties/medical"
              }
            ]
          }
        ]
      },
      {
        "type": "Category",
        "label": "Surgical",
        "elements": [
          {
            "type": "VerticalLayout",
            "elements": [
              {
                "type": "Control",
                "scope": "#/properties/surgical"
              }
            ]
          },
        ]
      },
      {
        "type": "Category",
        "label": "Family",
        "elements": [
          {
            "type": "HorizontalLayout",
            "elements": [
              {
                "type": "Control",
                "scope": "#/properties/family"
              }
            ]
          },
        ]
      },
      {
        "type": "Category",
        "label": "Substance & Sexual Activity",
        "elements": [
          {
            "type": "Group",
            "label": "Tobacco",
            "elements": [
              {
                "type": "VerticalLayout",
                "elements": [
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/smokingStatus",
                    "options": {
                      "format": "radio"
                    }
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/types"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/startDate",
                    "options": {
                      "format": "date"
                    }
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/endDate",
                    "options": {
                      "format": "date"
                    }
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/packsPerDay"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/packYears"
                  },
                  {
                    "type": "Group",
                    "label": "Smokeless",
                    "elements": [
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/smokelessStatus/properties/smokelessStatus",
                        "options": {
                          "format": "radio"
                        }
                      },
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/tobacco/properties/smokelessStatus/properties/comments"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "Group",
            "label": "Alcohol",
            "elements": [
              {
                "type": "VerticalLayout",
                "elements": [
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/alcoholStatus",
                    "options": {
                      "format": "radio"
                    }
                  },
                  {
                    "type": "Group",
                    "label": "Drinks Per Week",
                    "elements": [
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/drinksPerWeek/properties/wineGlasses"
                      },
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/drinksPerWeek/properties/beerCans"
                      },
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/drinksPerWeek/properties/liquorShots"
                      },
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/drinksPerWeek/properties/drinksContainingAlcohol"
                      },
                      {
                        "type": "Control",
                        "scope": "#/properties/SubstanceSexualHealth/properties/alcohol/properties/drinksPerWeek/properties/standardDrinks"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "Group",
            "label": "Drugs",
            "elements": [
              {
                "type": "VerticalLayout",
                "elements": [
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/drugs/properties/drugStatus",
                    "options": {
                      "format": "radio"
                    }
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/drugs/properties/drugTypes"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/drugs/properties/usePerWeek"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/drugs/properties/comments"
                  }
                ]
              }
            ]
          },
          {
            "type": "Group",
            "label": "Sexual Activity",
            "elements": [
              {
                "type": "VerticalLayout",
                "elements": [
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/sexualActivity/properties/sexuallyActiveStatus",
                    "options": {
                      "format": "radio"
                    }
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/sexualActivity/properties/birthControlMethods"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/sexualActivity/properties/partners"
                  },
                  {
                    "type": "Control",
                    "scope": "#/properties/SubstanceSexualHealth/properties/sexualActivity/properties/comments"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "Category",
        "label": "Socieconomic",
        "elements": [
          {
            "type": "VerticalLayout",
            "elements": [
              {
                "type": "Control",
                "scope": "#/properties/Socioeconomic"
              }
            ]
          },
        ]
      },
      {
        "type": "Category",
        "label": "Social Documentation",
        "elements": [
          {
            "type": "VerticalLayout",
            "elements": [
              {
                "type": "Control",
                "scope": "#/properties/SocialDocumentation"
              }
            ]
          },
        ]
      },
    ]

  };


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