import React from 'react';
import { Box, RichText } from 'components/ui/Core.jsx';

const NoteViewer = ({ selectedRow }) => {
  return (
    <>
    {Object.keys(selectedRow.data).map((key, index) => (
        (key !== 'content' && key !== 'image') && (
          <Box key={index}>
            <strong>{key}:</strong> {selectedRow.data[key]}
          </Box>
        )
      ))}
    <RichText>{selectedRow.data.content}</RichText>
    </>
  );
};

export default NoteViewer;