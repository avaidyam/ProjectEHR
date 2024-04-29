import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
//import Carousel from 'react-elastic-carousel'; // FIXME
import { usePatientMRN } from '../../../../util/urlHelpers.js';

const scans = [1298822400000, 1303490940000];
const numImages = [28, 1];

const ImageViewer = () => {
  const wheeling = useRef(false);
  const wheelingTimeout = useRef(false);
  const slider = useRef(null);
  const sliderContainer = useRef(null);
  const currentIndex = useRef(0);
  const IMAGES_LENGTH = 28;

  const getNextCurrentIndex = (index) => {
    if (index === IMAGES_LENGTH) {
      return index;
    }

    return index + 1;
  };

  const getPrevCurrentIndex = (index) => {
    if (index === 0) {
      return index;
    }

    return index - 1;
  };

  const shouldPreventDefault = useCallback(({ isNext }) => {
    if (!isNext && currentIndex.current > 0) {
      return true;
    }

    if (isNext && currentIndex.current < IMAGES_LENGTH) {
      return true;
    }

    return false;
  }, []);

  const scroll = useCallback(
    (e) => {
      const isNext = e.wheelDelta > 0;
      if (shouldPreventDefault({ isNext })) {
        e.preventDefault();
      }
      if (slider === null) return null;

      clearTimeout(wheelingTimeout.current);
      wheelingTimeout.current = setTimeout(function () {
        wheeling.current = false;
      }, 100);

      if (wheeling.current === true) {
        return null;
      }

      if (isNext) {
        slider.current.slideNext();
        currentIndex.current = getNextCurrentIndex(currentIndex.current);
      } else {
        slider.current.slidePrev();
        currentIndex.current = getPrevCurrentIndex(currentIndex.current);
      }
      wheeling.current = true;
    },
    [slider]
  );

  const stopWheeling = useCallback(() => {
    wheeling.current = false;
  }, []);

  useEffect(() => {
    if (!sliderContainer.current) {
      return null;
    }
    const sliderContainerCurrent = sliderContainer.current;
    sliderContainerCurrent.addEventListener('wheel', scroll, true);

    return () => {
      sliderContainerCurrent.removeEventListener('wheel', scroll, false);
    };
  }, [scroll, stopWheeling]);

  const imageHTML = [];
  for (let i = 1; i <= 28; i++) {
    const temp = `img/4206942069/1298822400000/${i}.png`;
    imageHTML.push(<img src={temp} />);
  }

  return (
    <div className="tenants-container">
      <div ref={sliderContainer} className="tenants-middle">
        {/*<Carousel
          onScroll={scroll}
          verticalMode
          itemsToShow={1}
          enableSwipe
          ref={slider}
          showArrows={false}
          pagination={false}
          transitionMs={0}
  >*/}
          {imageHTML}
        {/*</Carousel> FIXME!! */}
      </div>
    </div>
  );
};

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
            <ImageViewer />
          </Box>
        </Grid>
      </Grid>
  );
};

export default ImagingTabContent;