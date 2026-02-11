import * as React from 'react';
import { Box, Stack, Divider, Label, RichText } from 'components/ui/Core';
import { useDatabase } from 'components/contexts/PatientContext';

export const NoteViewer = ({ data }: { data: any }) => {
  const [providers] = (useDatabase() as any).providers();
  const authorProv = (providers as any[]).find((p: any) => p.id === data.author);
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
      <Label bold sx={data.status === "Incomplete" ? { color: 'error.main' } : { display: "none" }}>Incomplete</Label>
      <Box sx={{ p: 1, pt: 0, ...(data.status === "Incomplete" ? { borderLeft: 4, borderColor: "error.main" } : {}) }}>
        <RichText>{data.content}</RichText>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Stack>
  )
}
