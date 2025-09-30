import React from 'react';
import { Box, Stack, Divider, Label, RichText } from 'components/ui/Core.jsx';

const NoteViewer = ({ selectedRow }) => {
  const incomplete = selectedRow.data["status"] === "Incomplete"
  return (
    <Stack direction="column" sx={{ p: 2 }}>
      <Divider />
      <Stack direction="row" spacing={4}>
        <Stack direction="column">
          <Label bold>{selectedRow.data["author"]}</Label>
          <Label>{selectedRow.data["encDept"]}</Label>
          <Label>Physician</Label>
        </Stack>
        <Stack direction="column">
          <Label>{selectedRow.data["noteType"]}</Label>
          <Label>{selectedRow.data["status"]}</Label>
        </Stack>
      </Stack>
      <Label><span style={{ color: '#888' }}>Date of Service:</span> {selectedRow.data["filingDate"]}</Label>
      <Divider sx={{ mb: 1 }} />
      <Label bold sx={incomplete ? { color: 'error.main' } : { display: "none" } }>Incomplete</Label>
      <Box sx={{ p: 1, pt: 0, ...(incomplete ? { borderLeft: 4, borderColor: "error.main" } : {}) }}>
        <RichText>{selectedRow.data.content}</RichText>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Stack>
  )
}

export default NoteViewer;