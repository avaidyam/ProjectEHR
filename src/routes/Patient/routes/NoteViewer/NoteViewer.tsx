import * as React from 'react';
import { Box, Stack, Divider, Label, RichText, Button, Icon, Chip, usePrompts } from 'components/ui/Core';
import { useDatabase, usePatient, Database } from 'components/contexts/PatientContext';
import { useAuth } from 'components/contexts/AuthContext';
import { useSplitView } from 'components/contexts/SplitViewContext';
import { filterDocuments, findEncounterItemLocation, removeEncounterItem, closeTabsForItem } from 'util/helpers';

export const NoteViewer = ({ data }: { data: Database.Note }) => {
  const isFacultyMode = useAuth()?.isFacultyMode ?? false;
  const { confirm } = usePrompts();
  const [providers] = useDatabase().providers();
  const { useChart } = usePatient();
  const [chart, setChart] = useChart()();
  const splitView = useSplitView();
  const authorProv = providers.find((p) => p.id === data.author);
  const rawDoc = (data as any)?._rawDoc ?? data;

  const location = React.useMemo(
    () => findEncounterItemLocation(chart?.encounters, data as any, ['notes']),
    [chart?.encounters, data]
  );
  const owningEncounter = location ? chart?.encounters?.[location.encounterId] : undefined;
  const isConditionalHidden = React.useMemo(() => {
    if (!isFacultyMode || !owningEncounter || !location) return false;
    const docs = owningEncounter.notes || [];
    const targetDoc = docs.find((d) => d === rawDoc || (location.id != null && d?.id === location.id));
    if (!targetDoc) return (data as any)?._isConditionalHidden ?? false;
    const visible = filterDocuments(docs, owningEncounter.conditionals || {}, owningEncounter.orders || [], 'notes');
    return !visible.includes(targetDoc);
  }, [isFacultyMode, owningEncounter, location, data, rawDoc]);

  const handleDeleteNote = async () => {
    if (!location) return;
    const label = data.summary || data.type || 'this note';
    if (!(await confirm(`Are you sure you want to delete "${label}"? This cannot be undone.`, 'Delete Note'))) {
      return;
    }
    setChart((prev) => {
      const targetEnc = prev?.encounters?.[location.encounterId];
      if (!targetEnc) return prev;
      const updatedEnc = removeEncounterItem(targetEnc, {
        collection: 'notes',
        id: location.id,
        itemRef: location.itemRef ?? rawDoc,
      });
      return {
        ...prev,
        encounters: {
          ...prev.encounters,
          [location.encounterId]: updatedEnc,
        },
      };
    });
    closeTabsForItem(splitView, { id: location.id ?? data.id, itemRef: location.itemRef ?? rawDoc });
  };

  return (
    <Stack direction="column" sx={{ p: 2 }}>
      {isFacultyMode && (
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1} sx={{ mb: 1 }}>
          {isConditionalHidden && (
            <Chip label="Conditional (Hidden)" size="small" color="warning" variant="outlined" />
          )}
          {location && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Icon>delete</Icon>}
              onClick={handleDeleteNote}
            >
              Delete Note
            </Button>
          )}
        </Stack>
      )}
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
      <Label><span style={{ color: '#888' }}>Date of Service:</span> {Database.JSONDate.toDateString(data.serviceDate)}</Label>
      <Divider sx={{ mb: 1 }} />
      <Label bold sx={data.status === "Incomplete" ? { color: 'error.main' } : { display: "none" }}>Incomplete</Label>
      <Box sx={{ p: 1, pt: 0, ...(data.status === "Incomplete" ? { borderLeft: 4, borderColor: "error.main" } : {}) }}>
        <RichText>{data.content}</RichText>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Stack>
  )
}
