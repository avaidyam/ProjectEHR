import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box, Typography, Grid, IconButton, Checkbox } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const PhysicalExamBodySystemComponent = React.memo(({ title, checkboxes, symptoms, onCheckboxChange }) => {

  const handleCustomNote = () => {
    // Add custom note handling logic here if needed
  };

  return (
    <Box sx={{ border: '1px solid #ddd', padding: 2, marginBottom: 2, width: '100%' }}>
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
        <Grid item>
          <IconButton onClick={handleCustomNote}>
            <DescriptionIcon />
          </IconButton>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ marginLeft: 2 }}>
            {title}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          {checkboxes.map((checkbox, idx) => (
            <Grid item xs={6} key={idx}> {/* 2 columns layout */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  borderRadius: 1,
                  color: 'black',
                  cursor: 'pointer',
                  width: '100%',
                  height: '30px',
                }}
              >
                <Typography sx={{ marginLeft: 2 }}>
                  {checkbox.label}
                </Typography>
                <Checkbox
                  checked={checkbox.checked}
                  onChange={() => onCheckboxChange(checkbox.label)}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          {symptoms.map((symptom, idx) => (
            <Grid item xs={6} key={idx}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  borderRadius: 1,
                  color: 'black',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Typography sx={{ marginLeft: 2 }}>
                  {symptom}
                </Typography>
                <Box>
                  <IconButton>
                    <AddIcon />
                  </IconButton>
                  <IconButton>
                    <RemoveIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
});

const PhysicalExamComponent = ({ physicalExamState, setPhysicalExamState }) => {

  const handleCheckboxChange = (systemKey, checkboxLabel) => {
    setPhysicalExamState(prevState => ({
      ...prevState,
      [systemKey]: {
        ...prevState[systemKey],
        checkboxes: {
          ...prevState[systemKey].checkboxes,
          [checkboxLabel]: !prevState[systemKey].checkboxes[checkboxLabel]
        }
      }
    }));
  };

  return (
    <Box>
      {Object.keys(physicalExamState).map((systemKey) => {
        const system = physicalExamState[systemKey];
        return (
          <PhysicalExamBodySystemComponent
            key={systemKey}
            title={systemKey.charAt(0).toUpperCase() + systemKey.slice(1)}
            checkboxes={Object.keys(system.checkboxes).map(label => ({
              label,
              checked: system.checkboxes[label],
            }))}
            symptoms={Object.keys(system.symptoms).filter(symptom => symptom !== 'custom')}
            onCheckboxChange={(checkboxLabel) => handleCheckboxChange(systemKey, checkboxLabel)}
          />
        );
      })}
    </Box>
  );
};

const physicalExamBodySystems = [
  {
    title: 'Constitutional',
    checkboxes: ['Alert', 'Normal Weight', 'Normal Appearance', 'Obese'],
    symptoms: ['Toxic Appearing', 'Acute Distress', 'Ill-Appearing', 'Diaphoretic'],
  },
];

const NoteWriterPE = () => {
  const [selectedSubTab, setSelectedSubTab] = useState('Basic');

  const handleSubTabChange = (event, newValue) => {
    setSelectedSubTab(newValue);
  };

  const generateInitialPhysicalExamBodySystemsState = (physicalExamSystems) => {
    const initialState = {};

    physicalExamSystems.forEach(system => {
      const symptomState = {};
      const checkboxState = {};
      system.symptoms.forEach(symptom => {
        symptomState[symptom] = null;
      });
      system.checkboxes.forEach(checkbox => {
        checkboxState[checkbox] = false;
      });
      symptomState['custom'] = null;
      initialState[system.title.toLowerCase()] = { 'symptoms': symptomState, 'checkboxes': checkboxState };
    });

    return initialState;
  };

  const [physicalExamState, setPhysicalExamState] = useState(generateInitialPhysicalExamBodySystemsState(physicalExamBodySystems));

  useEffect(() => {
    console.log(physicalExamState);
  }, [physicalExamState]);

  return (
    <Box sx={{ padding: 2 }}>
      <Tabs
        value={selectedSubTab}
        onChange={handleSubTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="Basic" label="Basic" />
        <Tab value="Const" label="Const" />
      </Tabs>

      <Box sx={{ paddingTop: 2 }}>
        {selectedSubTab === 'Basic' && <PhysicalExamComponent physicalExamState={physicalExamState} setPhysicalExamState={setPhysicalExamState} />}
        {selectedSubTab === 'Const' && <div>Const Content</div>}
      </Box>
    </Box>
  );
};

export default NoteWriterPE;
