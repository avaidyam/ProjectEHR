import * as React from 'react';
import { Box, DatePicker, Autocomplete, Label, Button, IconButton, Icon, Stack, Grid } from 'components/ui/Core';

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

export const ProblemListEditor = ({ data, index, expandedRows, onDelete, onOpenModal }: {
  data: any;
  index: number;
  expandedRows: any;
  onDelete: any;
  onOpenModal: any
}) => {
  // Since there is an accept button, we need to use a tempstate that we can modify and then accept or cancel
  const [tempData, setTempData] = React.useState({ ...data });

  const handleEditorTempChange = (key: string, value: any) => {
    setTempData({
      ...tempData,
      [key]: value,
    });
  };

  const handleEditorAccept = () => {
    Object.keys(tempData).forEach((key) => {
      data[key] = tempData[key];
    });
    expandedRows(index);
  };

  const handleEditorCancel = () => {
    setTempData({ ...data });
    expandedRows(index);
  };

  React.useEffect(() => {
    setTempData({ ...data });
  }, [data]);


  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={2}>
        <Label>Problem</Label>
      </Grid>
      <Grid size={10}>
        <Autocomplete
          freeSolo
          fullWidth
          label='Problem'
          value={tempData.diagnosis}
          onInputChange={(e, newVal) => handleEditorTempChange('diagnosis', newVal)}
          options={[]}
          TextFieldProps={{
            InputProps: {
              endAdornment: (
                <IconButton onClick={() => onOpenModal(index)}>
                  <Icon>search</Icon>
                </IconButton>
              )
            }
          }}
        />
      </Grid>
      <EditorGridItem
        label="Display"
        typographyCols={2}
        textFieldCols={10}
        value={tempData.display}
        onChange={value => handleEditorTempChange('display', value)}
      />
      <Grid size={2}>
        <Button
          variant={tempData.isChronicCondition ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isChronicCondition', !tempData.isChronicCondition)}
        >
          Chronic Condition
        </Button>
      </Grid>
      <Grid size={2}>
        <Button
          variant={tempData.isShareWithPatient ? 'contained' : 'outlined'}
          onClick={() => handleEditorTempChange('isShareWithPatient', !tempData.isShareWithPatient)}
        >
          Share with Patient
        </Button>
      </Grid>
      <Grid style={{ width: '100%' }} />
      <Grid size={2}>
        <Label>Priority</Label>
      </Grid>
      <Grid size={4}>
        <Autocomplete
          fullWidth
          label="Priority"
          options={['Low', 'Medium', 'High']}
          value={tempData.priority || null}
          onChange={(_e, newValue) => handleEditorTempChange('priority', newValue || '')}
        />
      </Grid>
      <EditorGridItem
        label="Class"
        typographyCols={2}
        textFieldCols={4}
        value={tempData.class}
        onChange={value => handleEditorTempChange('class', value)}
        options={['Acute', 'Chronic', 'Resolved', 'Recurrent']}
      />
      <EditorDateGridItem
        label="Noted"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.notedDate}
        onChange={date => handleEditorTempChange('notedDate', date)}
      />
      <EditorDateGridItem
        label="Diagnosed"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.diagnosedDate}
        onChange={date => handleEditorTempChange('diagnosedDate', date)}
      />
      <EditorDateGridItem
        label="Resolved"
        typographyCols={1}
        textFieldCols={3}
        value={tempData.resolvedDate}
        onChange={date => handleEditorTempChange('resolvedDate', date)}
      />
      <Grid size={2}>
        <Button variant="contained" color='error' onClick={() => onDelete(index)}>Delete</Button>
      </Grid>
      <Grid size={2}>
        <Button variant="outlined">Add to History</Button>
      </Grid>
      <Grid size={4} />
      <Grid size={2}>
        <Button variant="outlined" color="success" onClick={handleEditorAccept}><Icon>check</Icon>Accept</Button>
      </Grid>
      <Grid size={2}>
        <Button variant="outlined" color="error" onClick={handleEditorCancel}><Icon>close</Icon>Cancel</Button>
      </Grid>
    </Grid>
  );
};
