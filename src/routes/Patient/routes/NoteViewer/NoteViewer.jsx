import React from 'react';
import { Box } from '@mui/material';

export const NoteViewer = ({ selectedRow }) => {
  return (
    <>
    {Object.keys(selectedRow.data).map((key, index) => (
        (key !== 'content' && key !== 'image') && (
          <Box key={index}>
            <strong>{key}:</strong> {selectedRow.data[key]}
          </Box>
        )
      ))}
    <Box sx={{ whiteSpace: "pre-wrap" }}>{selectedRow.data.content}</Box>
    </>
  );
};

export default NoteViewer;