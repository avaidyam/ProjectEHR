import * as React from 'react'
import { Window, Button, Stack, Label, Icon, Box, Grid, Divider, Popover, Autocomplete, JSONTree } from './Core'
import { useDatabaseOperations } from './databaseManagement/useDatabaseOperations'
import { SinglePatientAppointmentModal } from './databaseManagement/SinglePatientAppointmentModal'

export const DatabaseManagementWindow = ({ open, onClose, currentMrn }: {
  open: boolean;
  onClose: () => void;
  currentMrn?: string;
}) => {
  const {
    db,
    selectedPath,
    setSelectedPath,
    isSelectedExportable,
    isFetchingUrl,
    importUrl,
    setImportUrl,
    urlImportAnchor,
    setUrlImportAnchor,
    fileInputRef,
    handleExport,
    handleExportSelected,
    handleDeleteSelected,
    handleDeleteEntire,
    handleLoadSample,
    handleImportFromUrl,
    handleFileChange,
    singlePatientPrompt,
    setSinglePatientPrompt,
    handleCreateAppointment,
  } = useDatabaseOperations()

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['root'])

  React.useEffect(() => {
    if (open) {
      if (currentMrn && db?.patients?.[currentMrn]) {
        setSelectedPath(`root.patients.${currentMrn}`)
        setExpandedItems(['root', 'root.patients'])
      } else {
        setSelectedPath(null)
        setExpandedItems(['root'])
      }
    } else {
      setSelectedPath(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMrn])

  return (
    <>
      <Window
        title={(
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon color="primary">settings_applications</Icon>
            <Label variant="h6">Database Management</Label>
          </Stack>
        ) as any}
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        ContentProps={{ sx: { p: 0, overflow: 'hidden' } }}
      >
        <Grid container sx={{ height: '70vh' }}>
          {/* Left Pane: Explorer */}
          <Grid size={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
            <Stack sx={{ flex: 1, overflow: 'hidden' }}>
              <Box p={2}>
                <Label variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon size={18}>account_tree</Icon> Live Data Explorer
                </Label>
                <Label variant="caption" color="textSecondary">
                  Select a Patient or Encounter to export individually with all linked records.
                </Label>
              </Box>
              <Divider />
              <JSONTree
                data={db}
                label="Root"
                path="root"
                expandedItems={expandedItems}
                onExpandedItemsChange={(_, ids) => setExpandedItems(ids)}
                selectedItems={selectedPath}
                onSelectedItemsChange={(_, id) => setSelectedPath(id as string)}
                sx={{ flex: 1, overflow: 'auto' }}
              />
            </Stack>
          </Grid>

          {/* Right Pane: Actions */}
          <Grid size={4} sx={{ height: '100%', p: 3, bgcolor: 'grey.50', overflowY: 'auto' }}>
            <Stack spacing={4}>
              <Box>
                <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon>download</Icon> Export
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Download data from the database. Linked records (departments, providers, etc.) are included automatically.
                </Label>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleExportSelected}
                    disabled={!isSelectedExportable}
                    startIcon={<Icon>person_search</Icon>}
                    fullWidth
                  >
                    Export Selected
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleExport}
                    startIcon={<Icon>database</Icon>}
                    fullWidth
                  >
                    Export Entire Database
                  </Button>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon>upload</Icon> Import
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Import a previously exported JSON file. New records will be appended. Existing patients will be updated with new encounters.
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  multiple
                  onChange={handleFileChange}
                />
                <Stack spacing={2}>
                  <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<Icon>upload</Icon>} fullWidth>
                    Import from JSON
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={(e) => setUrlImportAnchor(e.currentTarget)}
                    startIcon={<Icon>link</Icon>}
                    fullWidth
                  >
                    Import from URL
                  </Button>
                </Stack>
                <Popover
                  open={Boolean(urlImportAnchor)}
                  anchorEl={urlImportAnchor}
                  onClose={() => setUrlImportAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  slotProps={{ paper: { sx: { p: 2, width: 300 } } }}
                >
                  <Stack spacing={2}>
                    <Label variant="subtitle2">Import Database from URL</Label>
                    <Autocomplete
                      freeSolo
                      options={[]}
                      fullWidth
                      size="small"
                      placeholder="https://example.com/database.json"
                      value={importUrl}
                      onInputChange={(_, val) => setImportUrl(val)}
                      disabled={isFetchingUrl}
                    />
                    <Button
                      variant="contained"
                      onClick={handleImportFromUrl}
                      disabled={!importUrl || isFetchingUrl}
                      fullWidth
                    >
                      {isFetchingUrl ? 'Importing...' : 'Import'}
                    </Button>
                  </Stack>
                </Popover>
              </Box>

              <Divider />

              <Box sx={{ mt: 'auto' }}>
                <Label variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon>delete_forever</Icon> Delete
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Warning: These actions are permanent and cannot be undone.
                </Label>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    disabled={!isSelectedExportable}
                    startIcon={<Icon>person_remove</Icon>}
                    fullWidth
                  >
                    Delete Selected
                  </Button>
                  <Button variant="outlined" color="primary" onClick={handleLoadSample} startIcon={<Icon>restore</Icon>} fullWidth>
                    Load Sample Database
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleDeleteEntire} startIcon={<Icon>delete_forever</Icon>} fullWidth>
                    Erase Entire Database
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Window>

      <SinglePatientAppointmentModal
        open={Boolean(singlePatientPrompt)}
        onClose={() => setSinglePatientPrompt(null)}
        patientId={singlePatientPrompt?.patientId || null}
        patientName={singlePatientPrompt?.patientName}
        onConfirm={handleCreateAppointment}
      />
    </>
  )
}
