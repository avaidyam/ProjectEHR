import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, Divider, Card, Button, List, ListItem, Grid } from '@mui/material';
import {useOrder, Drug} from './OrdersContext.js';

// need to link to actions in orders later
const mockMedicationData = () => ({
  currentMedications: [
    {
      id: '1',
      name: 'clopidogrel',
      brandName: 'PLAVIX',
      dosage: '75 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '2',
      name: 'aspirin',
      brandName: 'ASPIRIN',
      dosage: '81 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '3',
      name: 'atorvastatin',
      brandName: 'LIPITOR',
      dosage: '80 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '4',
      name: 'carvedilol',
      brandName: 'COREG',
      dosage: '3.125 mg',
      frequency: 'twice a day',
      startDate: '',
      endDate: '',
    },
    {
      id: '5',
      name: 'lisinopril',
      brandName: 'QBRELIS',
      dosage: '10 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
    {
      id: '6',
      name: 'eplerenone',
      brandName: 'INSPRA',
      dosage: '25 mg',
      frequency: 'once daily',
      startDate: '',
      endDate: '',
    },
  ]
});

// Define TabPanel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export default function OrdersMgmt() {
  const [value, setValue] = useState(0);
  const { currentMedications } = mockMedicationData();
  const {orderList, setOrderList} = useOrder();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const addOrder = (med, medChangeType) => {
    orderList.push(new Drug(medChangeType, med.name, med.dose, med.frequency, med.brandName)); // This updates the context's orderList directly
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="Active" />
        <Tab label="Signed & Hold" />
        <Tab label="Home Meds" />
        <Tab label="Cosign" />
        <Tab label="Future Outpatient" />
        <Tab label="Order History" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Card sx={{ m: 1, p: 2}}>
        <Typography variant="h6">
              Medications
        </Typography>
          
        <List>
          {currentMedications.map((med) => (
            <Box>
              <Divider />
              <ListItem sx={{ mb: 1, p: 1 }}>
                  <Grid container spacing={3}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2">{med.name} {med.dosage}</Typography>
                      </Grid>

                      {/* Second Column: Dosage and Frequency */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">{med.dosage} {med.frequency}</Typography>
                      </Grid>

                      {/* Third Column: Action Buttons */}
                      <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Button variant="outlined" size="small" onClick={() => addOrder(med, 'Modify')}>Modify</Button>
                        <Button variant="outlined" size="small" onClick={() => addOrder(med, 'Hold')}>Hold</Button>
                        <Button variant="outlined" size="small" onClick={() => addOrder(med, 'Discontinue')}>Discontinue</Button>
                      </Box>
                      </Grid>
                    </Grid>

              </ListItem>
            </Box>
          ))}
        </List>
        </Card>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Signed & Held
      </TabPanel>
      <TabPanel value={value} index={2}>
        Home Meds
      </TabPanel>
      <TabPanel value={value} index={3}>
        Orders Needing Cosign
      </TabPanel>
      <TabPanel value={value} index={4}>
        Discharge Orders
      </TabPanel>
      <TabPanel value={value} index={5}>
        Order History
      </TabPanel>
    </Box>
  );
}