import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback, useEffect, useRef, useState, WheelEvent } from 'react';
import Carousel from 'react-elastic-carousel';
import { usePatientMRN } from '../../../util/urlHelpers.js';


let clamp = (num, lowerbound, upperbound) => {
  if (num < lowerbound) return(lowerbound)
  else if (num > upperbound) return(upperbound)
  else return(num)
}

const scans = ['/img/4206942069/1298822400000/', '/img/4206942069/1303490940000/'];
const numImages = [28, 1];

let loadImages = (scanID) => {
  let paths = Array(numImages[scanID]).fill(scans[scanID]).map((prefix, i) => (prefix + (i+1) + '.png'))
  return paths.map(path => {let img = new Image; img.src = path; return(img)})
}

const RadiologyCanvas = (props) => {
  
  const imageSeq = props.img;

  console.log(imageSeq);

  const canvasRef = useRef(null);
  const [imgIndex, setimgIndex] = useState(0);

  function handleScroll(e) {
    setimgIndex(clamp(imgIndex + Math.sign(e.deltaY), 0, imageSeq.length - 1));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.drawImage(imageSeq[imgIndex], 0, 0)
  }, [imgIndex])
  
  return <canvas ref={canvasRef} height={props.height} width={props.width} onWheel={(e) => {handleScroll(e)}}/>
}

const ImageViewer = (props) => {
  return(
    <Box>
      <RadiologyCanvas {...props} img={props.images}></RadiologyCanvas>
    </Box>
  )
}

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
  const [patientMRN, setPatientMRN] = usePatientMRN();
  return (
    <>
      <Box container sx={{ border: 1 }}>
        <Box sx={{ m: 2 }}>
          <h1>Patient Name</h1>
          <h2>MRN: {patientMRN}</h2>
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <ResultList />
        </Grid>
        <Grid item xs={9}>
          <Box sx={{ border: 1 }}>
            <ImageViewer height={400} width={400} images={loadImages(0)}/>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ImagingTabContent;