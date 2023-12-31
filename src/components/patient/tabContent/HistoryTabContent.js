import React, { useState,useEffect } from 'react';
import { Box } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { usePatientMRN } from '../../../util/urlHelpers.js';
import GeneralSchema from '../../../util/history_schema.json'

const SocialSchema = GeneralSchema.Social
const categories = [
  {
    general: ['Medical', 'Surgical', 'Family'],
    social: ['SubstanceSexualHealth', 'Socioeconomic', 'SocialDeterminants'],
  },
];

const HistoryTabContent = ({ children, ...other }) => {
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

      {/* Render content based on the selected subcategory */}
      {selectedCategory === 'General' && <GeneralContent key={selectedSubcategory} subcategory={selectedSubcategory} />}
      {selectedCategory === 'Social' && <SocialContent key={selectedSubcategory} subcategory={selectedSubcategory} />}
    </Box>
  );
};

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