import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, Divider, Card, Button, List, ListItem, Grid } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

// need to link to actions in orders later
const mockMedicationData = () => ({
  
  currentMedications: [
    {
      id: '1',
      name: 'metFORMIN',
      brandName: '',
      dosage: '500 mg',
      frequency: 'TWICE A DAY',
      route: 'oral',
      startDate: 'Sat 9/1/24',
      endDate: '',
    },
    {
      id: '2',
      name: 'lisinopril',
      brandName: '',
      dosage: '5 mg',
      frequency: 'ONCE DAILY',
      route: 'oral',
      startDate: 'Sat 9/1/24',
      endDate: '',
    },
    {
      id: '3',
      name: 'lovastatin',
      brandName: '',
      dosage: '20 mg',
      frequency: 'ONCE DAILY',
      route: 'oral',
      startDate: 'Sat 9/1/24',
      endDate: '',
    },
    {
      id: '4',
      name: 'omeprazole',
      brandName: '',
      dosage: '20 mg',
      frequency: 'ONCE DAILY',
      route: 'oral',
      startDate: 'Sat 9/1/24',
      endDate: '',
    },
    {
      id: '5',
      name: 'acetaminophen',
      brandName: '',
      dosage: '500 mg',
      frequency: 'AS NEEDED',
      route: 'oral',
      startDate: 'Sat 9/1/24',
      endDate: '',
    },
    {
      id: '6',
      name: 'ibuprofen',
      brandName: '',
      dosage: '200 mg',
      frequency: 'AS NEEDED',
      route: 'oral',
      startDate: 'Sat 9/1/24',
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
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderList, setOrderList] = useEncounter().orderCart["_currentUser"]([])

  const [value, setValue] = useState(0);
  const { currentMedications } = mockMedicationData();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // This updates the context's orderList directly
  const addOrder = (med, medChangeType) => {
    setOrderList(prev => [...prev, { type: medChangeType, name: med.name, dose: med.dosage, freq: med.frequency, route: med.route, refill: 0, startDate: undefined }])
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
                        <Typography variant="body2">{med.dosage}, {med.route}, {med.frequency}, started on {med.startDate}</Typography>
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