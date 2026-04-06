import * as React from 'react';
import { Box, DatePicker, Autocomplete, Label, Button, IconButton, Icon, Stack, Grid, Checkbox } from 'components/ui/Core';
import { getICD10CodeDescription } from 'util/helpers';
import { Database } from 'components/contexts/PatientContext';

// Quicker way to quickly generate generic Problem List Editor inputs
const EditorGridItem = ({ label, typographyCols, textFieldCols, value, onChange, options = [] }: {
  label: string;
  typographyCols: any;
  textFieldCols: any;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}) => {
  return (
    <>
      <Grid size={typographyCols}>
        <Label>{label}</Label>
      </Grid>
      <Grid size={textFieldCols}>
        <Autocomplete
          freeSolo
          fullWidth
          label={label}
          value={value}
          options={options}
          onInputChange={(_e, newInputValue) => onChange(newInputValue)}
        />
      </Grid>
    </>
  );
};

// For Noted, Diagnosed, and Resolved with Date Picker
const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }: {
  label: string;
  typographyCols: any;
  textFieldCols: any;
  value: any;
  onChange: (date: any) => void;
}) => {
  return (
    <>
      <Grid size={typographyCols}>
        <Label>{label}</Label>
      </Grid>
      <Grid size={textFieldCols}>
        <DatePicker convertString label={label} value={value} onChange={onChange} />
      </Grid>
    </>
  );
};

export const ProblemListEditor = ({ data, index, expandedRows, onDelete, onOpenModal, medicalHx, onSave }: {
  data: any;
  index: any;
  expandedRows: any;
  onDelete: any;
  onOpenModal: any;
  medicalHx: any[];
  onSave: (id: any, row: any, addToHistory?: boolean) => void;
}) => {
  const [tempData, setTempData] = React.useState({ ...data });
  const [shouldAddToHistory, setShouldAddToHistory] = React.useState(false);

  const handleEditorTempChange = (key: string, value: any) => {
    setTempData({
      ...tempData,
      [key]: value,
    });
  };

  React.useEffect(() => {
    setTempData({ ...data });
    setShouldAddToHistory(false);
  }, [data]);

  const handleEditorAccept = () => {
    onSave(index, tempData, shouldAddToHistory);
  };

  const handleEditorCancel = () => {
    setTempData({ ...data });
    expandedRows(index);
  };

  React.useEffect(() => {
    setTempData({ ...data });
  }, [data]);

  return (
    <Box paper elevation={5} sx={{ p: 2, mx: 4, my: 1, bgcolor: 'background.paper' }}>
      <Label variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Details
      </Label>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Autocomplete
                freeSolo
                fullWidth
                label="Problem"
                size="small"
                disabled={!tempData.isNew}
                value={tempData.diagnosis ? `${getICD10CodeDescription(tempData.diagnosis) || tempData.diagnosis} (${tempData.diagnosis})` : ''}
                onInputChange={(_e, newVal) => {
                  // If it looks like "Name (Code)", extract the code part
                  const match = newVal.match(/\(([^)]+)\)$/);
                  handleEditorTempChange('diagnosis', (match ? match[1] : newVal) as Database.DiagnosisCode);
                }}
                options={[]}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onOpenModal(index);
                  }
                }}
              />
              <Button outlined sx={{ minWidth: 40, p: 0, height: 40 }} onClick={() => onOpenModal(index, tempData.diagnosis)}>
                <Icon>search</Icon>
              </Button>
            </Stack>

            <Autocomplete
              freeSolo
              fullWidth
              label="Display"
              size="small"
              value={tempData.displayAs}
              onInputChange={(_e, newVal) => handleEditorTempChange('displayAs', newVal)}
              options={[]}
            />

            <Stack direction="row" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Checkbox
                  size="small"
                  checked={!!tempData.isChronicCondition}
                  onChange={(e: any) => handleEditorTempChange('isChronicCondition', e.target.checked)}
                />
                <Label variant="body2">Chronic Condition</Label>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Checkbox
                  size="small"
                  checked={!!tempData.encounterDx}
                  onChange={(e: any) => handleEditorTempChange('encounterDx', e.target.checked)}
                />
                <Label variant="body2">Encounter Diagnosis</Label>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Autocomplete
                fullWidth
                label="Priority"
                size="small"
                options={['Low', 'Medium', 'High']}
                value={tempData.priority || null}
                onChange={(_e, newValue) => handleEditorTempChange('priority', newValue || '')}
              />
              <Autocomplete
                freeSolo
                fullWidth
                label="Class"
                size="small"
                value={tempData.class}
                onInputChange={(_e, newVal) => handleEditorTempChange('class', newVal)}
                options={['Acute', 'Chronic', 'Resolved', 'Recurrent']}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <DatePicker
                convertString
                label="Noted"
                size="small"
                fullWidth
                value={tempData.notedDate}
                onChange={(date) => handleEditorTempChange('notedDate', date)}
              />
              <DatePicker
                convertString
                label="Diagnosed"
                size="small"
                fullWidth
                value={tempData.diagnosedDate}
                onChange={(date) => handleEditorTempChange('diagnosedDate', date)}
              />
              <DatePicker
                convertString
                label="Resolved"
                size="small"
                fullWidth
                value={tempData.resolvedDate}
                onChange={(date) => handleEditorTempChange('resolvedDate', date)}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" mt={4}>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onDelete(index)}
            variant="outlined"
            color="error"
            startIcon={<Icon>delete</Icon>}
            size="small"
          >
            Delete
          </Button>
          <Button
            variant={shouldAddToHistory ? "contained" : "outlined"}
            color="primary"
            size="small"
            startIcon={<Icon>{shouldAddToHistory ? "check_circle" : "history"}</Icon>}
            disabled={(medicalHx ?? []).some(m => m.diagnosis?.replace(/\./g, '') === tempData.diagnosis?.replace(/\./g, ''))}
            onClick={() => setShouldAddToHistory(!shouldAddToHistory)}
          >
            {shouldAddToHistory ? "Added to Session" : "Add to History"}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleEditorAccept}
            variant="outlined"
            color="success"
            size="small"
            startIcon={<Icon>check</Icon>}
            disabled={!tempData.diagnosis || tempData.diagnosis.trim() === ''}
          >
            Accept
          </Button>
          <Button
            onClick={handleEditorCancel}
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Icon>close</Icon>}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
