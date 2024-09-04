import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button'; // Import Button component
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import DWVViewer from './DWVViewer.js';

// The following are nice utilities but should be cleaned up eventually.

// Clamp: The default math library doesn't have a clamp for some reason; fill it in
let clamp = (num, lowerbound, upperbound) => {
  if (num < lowerbound) return(lowerbound)
  else if (num > upperbound) return(upperbound)
  else return(num)
}

// put in paths to the scans and scan lengths. Eventually this should all come
// from the patient data object, but until then we'll have it hardcoded in for
// demo purposes.
const scans = ['/img/4206942069/1298822400000/', '/img/4206942069/1303490940000/'];
const numImages = [28, 1];

// Load images into an array given the index of the scan from the array `scans`;
// Also for demo purposes only. The patient data object might include a filepath
// or have it built in as a base64 formatted image depending on how large that gets
let loadImages = (scanID) => {
  let paths = Array(numImages[scanID]).fill(scans[scanID]).map((prefix, i) => (prefix + (i+1) + '.png'))
  return paths.map(path => {let img = new Image; img.src = path; return(img)})
}

// The old RadiologyCanvas and ImageViewer components can be kept for reference but will not be used if DWV is fully integrated.

// ResultList component (unchanged)
const ResultList = () => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  if (patientMRN === null) { //FIXME this should NEVER be null!!!
    return (
      <List>
        <ListItem alignItems="flex-start" sx={{ border: 1 }}>
          <ListItemText primary="10-10-2023" secondary="CT Brain" />
        </ListItem>
        <ListItem alignItems="flex-start" sx={{ border: 1 }}>
          <ListItemText primary="10-10-2023" secondary="Chest X-Ray" />
        </ListItem>
      </List>
    );
  }
  return <p>No MRN</p>;
};

const ImagingTabContent = () => {
  const [openImageViewer, setOpenImageViewer] = useState(false);

  const handleOpenImageViewer = () => {
    setOpenImageViewer(true);
  };

  const handleCloseImageViewer = () => {
    setOpenImageViewer(false);
  };

  const basePath = './img/Anonymized_20240903/series-00001/';
  const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box sx={{ textAlign: 'center', padding: 2 }}>
          <Button
            onClick={handleOpenImageViewer}
            variant="contained"
            sx={{ backgroundColor: '#1976D2', color: 'white' }} 
          >
            Open DWV Viewer
          </Button>
        </Box>
      </Grid>
      <DWVViewer
        open={openImageViewer}
        onClose={handleCloseImageViewer}
        images={dicomFiles}
      />
    </Grid>
  );
};


export default ImagingTabContent;