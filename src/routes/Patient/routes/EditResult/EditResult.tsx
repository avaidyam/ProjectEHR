import * as React from 'react';
import {
  Box,
  Button,
  Label,
  IconButton,
  Icon,
  DataGrid,
  Divider,
  Autocomplete,
  DateTimePicker,
  Grid
} from 'components/ui/Core';
import { ProviderSelectField, OrderSelectField, ComponentSelectField } from 'components/ui/DataUI';
import { createFilterOptions } from '@mui/material';
import { useSplitView } from 'components/contexts/SplitViewContext';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';


const ComponentEditCell = ({ id, value, field, api }: { id: any; value: any; field: string; api: any }) => {
  return (
    <ComponentSelectField
      value={value}
      onChange={(newValue) => {
        api.setEditCellValue({ id, field, value: newValue });
        api.stopCellEditMode({ id, field });
      }}
      fullWidth
      disableClearable
    />
  );
};

export const EditResult = ({ ...props }) => {
  const { closeTab } = useSplitView();
  const [orderables] = useDatabase().orderables()
  const { useEncounter } = usePatient();
  const [labs, setLabs] = useEncounter().labs();
  const [imaging, setImaging] = useEncounter().imaging();
  const componentList = Object.entries(orderables!.components).map(([key, value]) => ({ label: value, id: key }));

  const [testDate, setTestDate] = React.useState<string>(Temporal.Now.instant().toString());
  const [selectedTest, setSelectedTest] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);

  // Imaging specific state
  const [status, setStatus] = React.useState('Final Result');
  const [provider, setProvider] = React.useState<Database.Provider.ID | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageBase64, setImageBase64] = React.useState('');

  const handleAddRow = () => {
    setResults(prev => [...prev, { id: crypto.randomUUID(), component: null, value: '', units: '', low: '', high: '', comment: '' }]);
  };

  React.useEffect(() => {
    if (!selectedTest?.id || !orderables?.result_map) return;

    const targetIds = (orderables.result_map as any)[selectedTest.id] || [];
    if (targetIds.length === 0) return;

    setResults(prev => {
      // 1. Identify rows that have data we must preserve
      const hasData = (r: any) => r.value !== '' || r.units !== '' || r.low !== '' || r.high !== '' || r.comment !== '';
      const preservedRows = prev.filter(hasData);

      // 2. Construct new results list based on targetIds order
      const newResults: any[] = [];
      const seenComponentIds = new Set<string>();

      targetIds.forEach((compId: string) => {
        // Find existing match (prefer one with data if multiple exist)
        const existing = prev.find(r => r.component === compId && hasData(r)) || prev.find(r => r.component === compId);

        if (existing) {
          newResults.push(existing);
        } else {
          newResults.push({
            id: crypto.randomUUID(),
            component: compId,
            value: '', units: '', low: '', high: '', comment: ''
          });
        }
        seenComponentIds.add(compId);
      });

      // 3. Keep preserved rows that were NOT in the target list
      preservedRows.forEach(r => {
        if (r.component && !seenComponentIds.has(r.component)) {
          newResults.push(r);
        }
      });

      return newResults;
    });
  }, [selectedTest?.id, orderables]);

  const handleRemoveRow = (id: any) => {
    setResults(prev => prev.filter((r: any) => r.id !== id));
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
      setImaging((prev: any) => [...(prev || []), {
        "date": testDate,
        "status": status,
        "statusDate": Temporal.Now.instant().toString(),
        "test": selectedTest ? selectedTest.label : "Unknown Exam",
        "abnormal": false,
        "acuity": "",
        "provider": provider,
        "image": imageBase64
      }])
    } else { // Labs
      setLabs((prev: any) => [...(prev || []), {
        "date": testDate,
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
        "provider": provider,
        "resultingAgency": null
      }])
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
            <DateTimePicker
              convertString
              label="Date/Time"
              value={testDate}
              onChange={(date: any) => setTestDate(date)}
            />
          </Grid>
          <Grid size={6}>
            <OrderSelectField
              label="Test / Exam Name"
              fullWidth
              value={selectedTest?.id || null}
              onChange={(val) => { if (!val) setSelectedTest(null); }}
              onSelect={(val) => setSelectedTest(val ? { id: val.id, label: val.name } : null)}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              label="Status"
              fullWidth
              options={["Final Result", "Preliminary"]}
              value={status}
              onChange={(event: any, newValue: any) => setStatus(newValue)}
            />
          </Grid>
          <Grid size={6}>
            <ProviderSelectField
              label="Provider"
              fullWidth
              value={provider as any}
              onChange={(val) => setProvider(val)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
          <input
            accept="image/*,.dicom,.dcm"
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
                renderEditCell: (params: any) => <ComponentEditCell {...params} />
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
              setResults(prev => prev.map((r: any) => r.id === newRow.id ? newRow : r));
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
