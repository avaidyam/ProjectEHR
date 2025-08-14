import React, { useState } from 'react';
import { Box } from '@mui/material';
import DWVViewer from './components/DWVViewer.jsx';

export const ImagingTabContent = ({ selectedRow }) => {
  const basePath = './img/Anonymized_20240903/series-00001/';
  const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
  return (
    <>
      {Object.keys(selectedRow.data).map((key, index) => (
        (key !== 'content' && key !== 'image') && (
          <Box key={index}>
            <strong>{key}:</strong> {selectedRow.data[key]}
          </Box>
        )
      ))}
      <DWVViewer images={selectedRow?.data?.image ? [selectedRow?.data?.image] : dicomFiles} />
    </>
  );
};

export default ImagingTabContent;