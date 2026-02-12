import * as React from 'react';
import {
  Box,
  Button,
  Label,
  TextField,
  IconButton,
  Icon,
  DataGrid,
  Divider
} from 'components/ui/Core';
import { Autocomplete, Grid, createFilterOptions } from '@mui/material';
import { useSplitView } from 'components/contexts/SplitViewContext';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';

const filterOptions = createFilterOptions({ limit: 50 });

const ComponentEditCell = ({ componentList, id, value, field, api }: { componentList: any[]; id: any; value: any; field: string; api: any }) => {
  const handleChange = (event: any, newValue: any) => {
    api.setEditCellValue({ id, field, value: newValue ? newValue.id : null });
    api.stopCellEditMode({ id, field });
  };
  return (
    <Autocomplete
      options={componentList}
      filterOptions={filterOptions}
      getOptionLabel={(option: any) => option.label}
      value={componentList.find((c: any) => c.id === value) ?? null}
      onChange={handleChange}
      renderInput={(params: any) => <TextField {...params} fullWidth autoFocus />}
      fullWidth
      disableClearable
    />
  );
};

export const EditResult = ({ ...props }) => {
  const { closeTab } = useSplitView();
  const [orderables] = (useDatabase() as any).orderables()
  const [providers] = (useDatabase() as any).providers()
  const { useEncounter } = usePatient();
  const [labs, setLabs] = (useEncounter() as any).labs();
  const [imaging, setImaging] = (useEncounter() as any).labs();
  const procedures = Object.entries(orderables.procedures).map(([key, value]: [string, any]) => ({ label: value, id: key }));
  const componentList = Object.entries(orderables.components).map(([key, value]: [string, any]) => ({ label: value, id: key }));

  const [testDate, setTestDate] = React.useState(new Date().toISOString().slice(0, 16));
  const [selectedTest, setSelectedTest] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);

  // Imaging specific state
  const [status, setStatus] = React.useState('Final Result');
  const [provider, setProvider] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageBase64, setImageBase64] = React.useState('');

  const handleAddRow = () => {
    setResults([...results, { id: Date.now(), component: null, value: '', units: '', low: '', high: '', comment: '' }]);
  };

  const handleRemoveRow = (id: any) => {
    setResults(results.filter((r: any) => r.id !== id));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    closeTab("Edit Result", "main");
  };

  const handleSave = () => {
    if (!selectedTest && !imageBase64) return;
    if (imageBase64) { // Imaging
      setImaging((prev: any) => [...prev, {
        "date": new Date(testDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        "status": status,
        "statusDate": new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        "test": selectedTest ? selectedTest.label : "Unknown Exam",
        "abnormal": false,
        "acuity": "",
        "provider": provider,
        "image": imageBase64
      }])
    } else { // Labs
      setLabs((prev: any) => [...[prev, {
        "date": new Date(testDate).toLocaleString(),
        "test": selectedTest ? selectedTest.label : "Unknown Test",
        "status": "Completed",
        "abnormal": false,
        "expectedDate": null,
        "expirationDate": null,
        "components": results.map((r: any) => {
          const comp = componentList.find((c: any) => c.id === r.component);
          return {
            name: comp ? comp.label : '',
            value: r.value,
            units: r.units,
            low: r.low,
            high: r.high,
            comment: r.comment
          };
        }).filter((r: any) => r.name !== ''),
        "collected": null,
        "resulted": null,
        "comment": null,
        "resultingAgency": null
      }]])
    }
    closeTab("Edit Result", "main");
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1 }}>
        <Label variant="h6" color="primary">New Result</Label>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              type="datetime-local"
              label="Date/Time"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              options={procedures}
              filterOptions={filterOptions}
              getOptionLabel={(option: any) => option.label}
              value={selectedTest}
              onChange={(event: any, newValue: any) => setSelectedTest(newValue)}
              renderInput={(params: any) => <TextField {...params} label="Test / Exam Name" fullWidth />}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              options={["Final Result", "Preliminary"]}
              value={status}
              onChange={(event: any, newValue: any) => setStatus(newValue)}
              renderInput={(params: any) => <TextField {...params} label="Status" fullWidth />}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              options={providers}
              getOptionLabel={(option: any) => option.name}
              value={providers.find((p: any) => p.name === provider) || null}
              onChange={(event: any, newValue: any) => setProvider(newValue ? newValue.name : '')}
              renderInput={(params: any) => <TextField {...params} label="Provider" fullWidth />}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
          <input
            accept="image/*,.dicom"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple={false}
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="outlined" component="span" startIcon={<Icon>upload</Icon>}>
              Upload Image (for Imaging)
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ mt: 2 }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Label>Lab Components (Optional)</Label>
        <div style={{ height: 300, width: '100%', marginTop: 8 }}>
          <DataGrid
            rows={results}
            hideFooter
            disableColumnMenu
            disableColumnSorting
            columns={[
              {
                field: 'component',
                headerName: 'Component',
                width: 200,
                editable: true,
                renderCell: (params: any) => {
                  const comp = componentList.find((c: any) => c.id === params.value);
                  return comp ? comp.label : params.value;
                },
                renderEditCell: (params: any) => <ComponentEditCell {...params} componentList={componentList} />
              },
              { field: 'value', headerName: 'Value', width: 120, editable: true },
              { field: 'units', headerName: 'Units', width: 100, editable: true },
              { field: 'low', headerName: 'Low', width: 100, editable: true },
              { field: 'high', headerName: 'High', width: 100, editable: true },
              { field: 'comment', headerName: 'Comment', flex: 1, editable: true },
              {
                field: 'actions',
                headerName: '',
                width: 50,
                renderCell: (params: any) => (
                  <IconButton onClick={() => handleRemoveRow(params.id)} color="error" size="small">
                    <Icon>delete</Icon>
                  </IconButton>
                )
              }
            ]}
            processRowUpdate={(newRow: any) => {
              setResults(results.map((r: any) => r.id === newRow.id ? newRow : r));
              return newRow;
            }}
          />
        </div>

        <Button startIcon={<Icon>add</Icon>} onClick={handleAddRow} variant="outlined" sx={{ alignSelf: 'start', mt: 2 }}>
          Add Component
        </Button>
      </Box>
      <Box sx={{
        p: 1,
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        mt: 'auto'
      }}>
        <Button variant="outlined" color="success" startIcon={<Icon>check</Icon>} onClick={handleSave} disabled={!selectedTest && !imageBase64}>Accept</Button>
        <Button variant="outlined" color="error" startIcon={<Icon>close</Icon>} onClick={handleCancel}>Cancel</Button>
      </Box>
    </Box>
  );
};
