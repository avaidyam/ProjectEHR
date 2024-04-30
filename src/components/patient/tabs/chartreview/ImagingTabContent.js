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

  // Canvas setup:
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
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
  const [windowWidth, setwindowWidth] = useState(128);
  const [windowLevel, setwindowLevel] = useState(75);
  // Note to self: Windowing is an affine transform of the brightness in Hounsfield Units
  // For greyscale images, think of the following: W:[level - width/2, level + width/2] -> [0, 255]
  // Basically, leave the Alpha channel untouched and map R,G,B to clamp(255*(x - level + width/2)/width, 0, 255)
  // https://www.kaggle.com/code/redwankarimsony/ct-scans-dicom-files-windowing-explained

  // Scroll logic
  let handleScroll = (e) => {
    e.preventDefault();
    // Every scroll event, show the next or previous image depending on the scroll direction
    let direction = Math.sign(e.deltaY);
    // Clamp the index just so we don't run into an Out of Bounds error
    setimgIndex(x => clamp(x + direction, 0, imageSeq.length - 1));
  }

  // We need to track where the initial mouse down was when zooming. This important because
  // the IBM radiology viewer that our EPIC links us to zooms with the initial mouse click
  // location as the center. Since I'm using a mousemotion event, it's not always associated
  // with a mousedown event, so we have to do this shitty stateful thing and keep track of the
  // last mousedown coordinates. This practice is definitely going to introduce bugs, so if there's
  // a better way to do this (drag API, etc.) we should look into it when we're not as pressed for time.
  let handleMouseDown = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    if (props.mode == 'zoom') {
      setlastMouseDownX(e.clientX - targetRect.x);
      setlastMouseDownY(e.clientY - targetRect.y);
    }
  }

  // Drag logic: Depending on the component state, either pan, zoom, or change window.
  let handleMouseMotion = (e) => {
    if (e.buttons !== 0) {
      // ^ Check that we're dragging/some mouse button is down
      switch(props.mode) {
        case 'pan':
          pan(e);
          break;
        case 'zoom':
          scale(e);
          break;
        case 'window':
          window(e);
          break;
      }
    }
  }

  // Pan: change the state variables that tell us where to draw our image on the canvas.
  let pan = (e) => {
    setimgX(x => x + e.movementX);
    setimgY(y => y + e.movementY);
  }

  // Scale: zoom in or out on the image, but centered at the canvas (0,0).
  // You'll see later down that we have to conjugate this thing with a translation to get the image
  // to show up at the right place.
  // Also a potential source of bugs - I have a fair degree of confidence that the positioning logic
  // is sound, but I do notice that the image jumps when zooming. I think it's coming from the lastMouseDown
  // state not correctly updating, but this is another potential source of that bug.
  let scale = (e) => {
    let scaleRate = 2 / props.height;
    setimgScale(scale => scale * (2 ** (scaleRate * -e.movementY)));
  };

  // Windowing: change contrast and saturation of the image.
  let window = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    setwindowWidth((e.clientX - targetRect.x)/e.target.width * 500);
    setwindowLevel((e.clientY - targetRect.y)/e.target.height * 500);
  };

  // Paint functionality: transform and filter our image, then draw it on the canvas.
  let paint = (ctx, img) => {
    // Draw the image scaled and zoomed appropriately, but without windowing modifications first:
    ctx.drawImage(img, (imgX - lastMouseDownX) * imgScale + lastMouseDownX, (imgY - lastMouseDownY) * imgScale + lastMouseDownY, imgScale * img.width, imgScale * img.height)
    // Now get the pixel data from only the part of the image that shows up on the RadiologyCanvas
    let imageData = ctx.getImageData(0, 0, ctx.canvas.height, ctx.canvas.width);
    // Apply our windowing function to the R,G,B channels and leave the A channel untouched:
    for (let i = 0; i < imageData.data.length / 4; i +=1) {
      for (let j = 0; j < 3; j++) {
        let pixelData = imageData.data[i * 4 + j];
        imageData.data[i * 4 + j] = clamp(255 * (pixelData - windowLevel + windowWidth / 2)/windowWidth, 0, 255);
      }
    }
    // Draw the appropriately windowed image:
    ctx.putImageData(imageData, 0, 0);
  }
  
  // Run for event handlers & canvas initialization:
  useEffect(() => {
    // Initialize canvas:
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext('2d');
    
    // Draw in the first image:
    // TODO - there's a bug here where on component mount the first image in the series doesn't show up. Not certain what's going on
    // It may be a subtle misunderstanding on my part of the React component lifecycle, but switching this code to the other useEffect
    // hook doesn't seem to solve this issue. Leaving to solve when we're not on a time crunch.
    let img = imageSeq[0];
    paint(ctxRef.current, img);

    // Add the event listeners:
    canvas.addEventListener('wheel', handleScroll, {passive: false});
    canvas.addEventListener('pointermove', handleMouseMotion);
    canvas.addEventListener('pointerdown', handleMouseDown);

    // Clean up our event listeners when removing our RadiologyCanvas:
    return(() => {
      canvas.removeEventListener('wheel', handleScroll);
      canvas.removeEventListener('pointermove', handleMouseMotion);
      canvas.removeEventListener('pointerdown', handleMouseDown);
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    });
  }, [props.mode]);

  // Run every time the image index, scale, or window parameters are updated.
  useEffect(() => {
    const ctx = ctxRef.current;

    // Image update logic:
    let img = imageSeq[imgIndex];
    paint(ctxRef.current, img);

    // Canvas cleanup. I think this doesn't need to be done, actually, as to my knowledge React just dumps the whole canvas
    // so even if we don't clear, there shouldn't be anything visible.
    return(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    })
  }, [imgIndex, imgX, imgY, imgScale, windowWidth, windowLevel, props.mode]);

  return <canvas ref={canvasRef} height={props.height} width={props.width} key={props.mode}/>
}

// Parent component, handles the controls + the image currently displayed.
const ImageViewer = (props) => {
  // setup state for the radiobuttons that people will use to set whether they want to pan, zoom, or window
  const [mode, setmode] = useState();

  // Again I'm doing something shitty and stateful that I don't like. I feel like there should be a better way to do this.
  // Setup an event handler to change the state. Siince this is RadiologyCanvas' parent component, it will pass down the
  // state change to RadiologyCanvas so our mousemove has different effects depending on the radiobutton state.
  const handleRadioChange = (value) => {
    setmode(value);
  };

  return(
    <Box>
      <form>
        Left Click Control:
        <input type="radio" name="controlMode" value="pan" id="pan" onChange={() => handleRadioChange("pan")}/> <label for="pan">Pan</label>
        <input type="radio" name="controlMode" value="zoom" id="zoom" onChange={() => handleRadioChange("zoom")}/> <label for="zoom">Zoom</label>
        <input type="radio" name="controlMode" value="window" id="window" onChange={() => handleRadioChange("window")}/> <label for="window">Window</label>
      </form>
      <RadiologyCanvas {...props} mode={mode}></RadiologyCanvas>
    </Box>
  )
}

// I think this doesn't really fall under my scope for this task, so I'm leaving it.
// Intended behavior: when you click on a result, it should change the prop.images passed into the ImageViewer 
// (and respectively, the RadiologyCanvas). I believe this is a sibling of the ImageViewer, so to actually
// pass the state over to the imageViewer I'd have to fuck with the common parent. I don't know enough about
// the application architecture to say for sure, though.
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ border: 1 }}>
            <ImageViewer height={600} width={600} images={loadImages(0)}/>
          </Box>
        </Grid>
      </Grid>
  );
};

export default ImagingTabContent;