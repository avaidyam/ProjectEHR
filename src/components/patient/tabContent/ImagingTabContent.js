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
  // Controls setup:
  const [controlState, setcontrolState] = useState('pan/zoom');
  // Scroll setup:
  const [imgIndex, setimgIndex] = useState(0);
  // Mouse state tracking setup:
  const [mouseState, setmouseState] = useState('up');
  // Zoom setup:
  const [imgScale, setimgScale] = useState(1);
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

  // Scroll logic - may need calibration to work with different kinds of mice
  let handleScroll = (e) => {
    //if 
    e.preventDefault();
    e.stopPropagation();

    let direction = Math.sign(e.deltaY);
    setimgIndex(x => clamp(x + direction, 0, imageSeq.length - 1));
  }

  // Mouse State logic for detecting drags:
  let handleMouseStateChange = (e) => {
    if (e.type == 'mousedown') {
      setmouseState('down');
    }
    else if (e.type == 'mouseup') {
      setmouseState('up');
    }
  }

  // Drag logic
  let handleMouseMotion = (e) => {
    if (mouseState == 'down') {
      pan(e.movementX, e.movementY)
    }
  }

  let pan = (deltaX, deltaY) => {
    setimgX(x => x + deltaX);
    setimgY(y => y + deltaY);
  }

  let scale = (deltaX, deltaY) => {
    setimgScale()
  };
  




  // Run every time the image Index is updated (by scrolling)
  useEffect(() => {
    // Canvas setup:
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleWheel = (e) => {
      e.preventDefault();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Image update logic:
    let img = imageSeq[imgIndex];
    ctx.drawImage(img, imgX, imgY, imgScale * img.width, imgScale * img.height);

    console.log('drew imgIndex ' + imgIndex);
    return(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); console.log('erased imgIndex ' + imgIndex);
      canvas.removeEventListener('wheel', handleWheel);
    })
  }, [imgIndex, imgX, imgY]);

  return <canvas ref={canvasRef} height={props.height} width={props.width} onMouseDown={(e) => handleMouseStateChange(e)} onMouseUp={(e) => handleMouseStateChange(e)} onMouseMove={(e) => handleMouseMotion(e)} onWheel={(e) => {e.preventDefault(); e.stopPropagation(); handleScroll(e);}}/>
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