import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback, useEffect, useRef, useState, WheelEvent } from 'react';
import { usePatientMRN } from '../../../util/urlHelpers.js';

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

const RadiologyCanvas = (props) => {
  
  // Internalize images:
  const imageSeq = props.images;
  console.log('rerender')

  // Canvas setup:
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  // Controls setup:
  const [controlState, setcontrolState] = useState('zoom');
  // Scroll setup:
  const [imgIndex, setimgIndex] = useState(0);
  // Zoom setup:
  const [imgScale, setimgScale] = useState(1);
  const [lastMouseDownX, setlastMouseDownX] = useState(0);
  const [lastMouseDownY, setlastMouseDownY] = useState(0);
  // Pan setup:
  const [imgX, setimgX] = useState(0);
  const [imgY, setimgY] = useState(0);
  // Windowing setup:
  const [windowWidth, setwindowWidth] = useState(1);
  const [windowLevel, setwindowLevel] = useState(0);
  // Note to self: Windowing is an affine transform of the brightness in Hounsfield Units
  // For greyscale images, think of the following: W:[level - width/2, level + width/2] -> [0, 255]
  // Basically, leave the Alpha channel untouched and map R,G,B to clamp(255*(x - level + width/2)/width, 0, 255)
  // https://www.kaggle.com/code/redwankarimsony/ct-scans-dicom-files-windowing-explained

  // Scroll logic
  let handleScroll = (e) => {
    e.preventDefault();
    let direction = Math.sign(e.deltaY);
    setimgIndex(x => clamp(x + direction, 0, imageSeq.length - 1));
  }

  let handleMouseDown = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    setlastMouseDownX(e.clientX - targetRect.x);
    setlastMouseDownY(e.clientY - targetRect.y);
  }

  // Drag logic
  let handleMouseMotion = (e) => {
    if (e.buttons !== 0) {
      switch(controlState) {
        case 'pan':
          pan(e.movementX, e.movementY);
          break;
        case 'zoom':
          scale(e.movementX, e.movementY);
          break;
      }
    }
  }

  let pan = (deltaX, deltaY) => {
    setimgX(x => x + deltaX);
    setimgY(y => y + deltaY);
  }

  let scale = (deltaX, deltaY) => {
    // Scaling: I would want to be able to scale a total of 4x in the window
    let scaleRate = 2 / props.height;
    setimgScale(scale => scale * (2 ** (scaleRate * -deltaY)));
    console.log(lastMouseDownX, lastMouseDownY);
  };

  let paint = (ctx, img) => {
    ctx.drawImage(img, (imgX - lastMouseDownX) * imgScale + lastMouseDownX, (imgY - lastMouseDownY) * imgScale + lastMouseDownY, imgScale * img.width, imgScale * img.height)
  }
  
  // Run for event handlers & canvas initialization:
  useEffect(() => {
    console.log("Initialize RadiologyCanvas");
    // Initialize canvas:
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext('2d');
    
    // Draw in the first image:
    let img = imageSeq[0];
    paint(ctxRef.current, img);

    // Add the event listeners:
    canvas.addEventListener('wheel', handleScroll, {passive: false});
    canvas.addEventListener('pointermove', handleMouseMotion);
    canvas.addEventListener('pointerdown', handleMouseDown);

    // Clean up our event listeners when removing our RadiologyCanvas:
    return(() => {
      canvas.removeEventListener('wheel', handleScroll);
      canvas.removeEventListener('mousemove', handleMouseMotion);
      canvas.removeEventListener('pointerdown', handleMouseDown);
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    });
  }, [canvasRef]);

  // Run every time the image index, scale, or window parameters are updated.
  useEffect(() => {
    const ctx = ctxRef.current;

    // Image update logic:
    // Something is buggy here. The first image will draw only on component rerenders.
    // 
    let img = imageSeq[imgIndex];
    paint(ctxRef.current, img);

    return(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    })
  }, [imgIndex, imgX, imgY, imgScale]);

  return <canvas ref={canvasRef} height={props.height} width={props.width} onLoad={() => {alert('test')}}/>
}

const ImageViewer = (props) => {
  return(
    <Box>
      <RadiologyCanvas {...props}></RadiologyCanvas>
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
            <ImageViewer height={600} width={600} images={loadImages(0)}/>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ImagingTabContent;