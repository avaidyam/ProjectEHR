import React from 'react';
import { Box, Stack, Divider, Label, RichText } from 'components/ui/Core';
import { useDatabase } from 'components/contexts/PatientContext.jsx';

const NoteViewer = ({ selectedRow }) => {
  const [providers] = useDatabase().providers();
  const data = selectedRow.data || selectedRow;

  const authorProv = providers.find(p => p.id === data.author);

  const incomplete = data.status === "Incomplete"
  return (
    <Stack direction="column" sx={{ p: 2 }}>
      <Divider />
      <Stack direction="row" spacing={4}>
        <Stack direction="column">
          <Label bold>{authorProv?.name ?? data.author}</Label>
          <Label>{authorProv?.specialty ?? ""}</Label>
          <Label>{authorProv?.role ?? ""}</Label>
        </Stack>
        <Stack direction="column">
          <Label>{data.type}</Label>
          <Label>{data.status}</Label>
        </Stack>
      </Stack>
      <Label><span style={{ color: '#888' }}>Date of Service:</span> {data.serviceDate}</Label>
      <Divider sx={{ mb: 1 }} />
      <Label bold sx={incomplete ? { color: 'error.main' } : { display: "none" }}>Incomplete</Label>
      <Box sx={{ p: 1, pt: 0, ...(incomplete ? { borderLeft: 4, borderColor: "error.main" } : {}) }}>
        <RichText>{data.content}</RichText>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Stack>
  )
}

export default NoteViewer;