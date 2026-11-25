import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Button,
  Label,
  Icon,
  Grid,
  Divider,
  Popover,
  JSONTree,
} from 'components/ui/Core';
import { AuthContext, AuthContextType } from 'components/contexts/AuthContext';
import { useDatabase, Database } from 'components/contexts/PatientContext';
import { useDatabaseOperations } from 'components/ui/databaseManagement/useDatabaseOperations';
import { SinglePatientAppointmentModal } from 'components/ui/databaseManagement/SinglePatientAppointmentModal';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  // Backend code for department context (preserved so nothing breaks)
  const [departments] = useDatabase().departments();
  const [department, setDepartment] = React.useState<Database.Department | undefined>();
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext) as AuthContextType;
  const [isDragging, setIsDragging] = React.useState(false);

  const {
    db,
    selectedPath,
    setSelectedPath,
    selectedEntity,
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
    importFiles,
    singlePatientPrompt,
    setSinglePatientPrompt,
    handleCreateAppointment,
  } = useDatabaseOperations();

  // Set default department when loaded (backend logic)
  React.useEffect(() => {
    if (!department && departments && departments.length > 0) {
      setDepartment(departments[0]);
    }
  }, [departments, department]);

  const handleEnterEHR = () => {
    const deptToUse = department || departments?.[0];
    login('User', '', deptToUse ? deptToUse.name : 'Emergency');
    setIsLoggedIn(true);
  };

  const handleOpenPatientChart = (patientId: Database.Patient.ID) => {
    const deptToUse = department || departments?.[0];
    login('User', '', deptToUse ? deptToUse.name : 'Emergency');
    setIsLoggedIn(true);
    navigate(`/patient/${patientId}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await importFiles(files);
    }
  };

  const totalPatients = Object.keys(db?.patients || {}).length;
  const totalEncounters = Object.values(db?.patients || {}).reduce(
    (sum, p) => sum + Object.keys(p.encounters || {}).length,
    0
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: { xs: 1, sm: 2 },
        bgcolor: 'primary.dark',
      }}
    >
      <Box
        paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3 },
          width: '98%',
          maxWidth: 1200,
          height: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Label variant="h3" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 900 }}>
                ProjectEHR
              </Label>
              <Label
                variant="caption"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                Welcome
              </Label>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
              <Label variant="body2" color="textSecondary">
                Clinical Simulation & Case Management
              </Label>
              <Label variant="caption" sx={{ color: 'text.secondary' }}>•</Label>
              <Label variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {totalPatients} {totalPatients === 1 ? 'Case' : 'Cases'} Loaded
              </Label>
              <Label variant="caption" sx={{ color: 'text.secondary' }}>•</Label>
              <Label variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {totalEncounters} {totalEncounters === 1 ? 'Encounter' : 'Encounters'}
              </Label>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleEnterEHR}
              startIcon={<Icon>play_arrow</Icon>}
              sx={{ px: 3, py: 1.2, fontWeight: 700, fontSize: '1rem' }}
            >
              Enter EHR
            </Button>
          </Stack>
        </Box>

        {/* Main Content: Explorer (Left) & Actions (Right) */}
        <Grid container sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Pane: Live Data Explorer */}
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: { md: '1px solid' },
              borderColor: 'divider',
              minHeight: 0,
            }}
          >
            <Box p={2} sx={{ pb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Label variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <Icon size={20}>account_tree</Icon> Live Case Explorer
                </Label>
                {selectedEntity.type && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label
                      variant="caption"
                      sx={{
                        bgcolor: 'info.light',
                        color: 'info.contrastText',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      Selected: {selectedEntity.type === 'patient'
                        ? `Patient ${selectedEntity.patient?.lastName || ''} (MRN: ${selectedEntity.patientId})`
                        : `Encounter ${selectedEntity.encounterId}`}
                    </Label>
                    {selectedEntity.type === 'patient' && selectedEntity.patientId && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenPatientChart(selectedEntity.patientId!)}
                        startIcon={<Icon size={16}>folder_shared</Icon>}
                      >
                        Open Chart
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
              <Label variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                Browse cases and records. Select a patient or encounter to export or delete individually.
              </Label>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              <JSONTree
                data={db}
                label="Database (Root)"
                path="root"
                selectedItems={selectedPath}
                onSelectedItemsChange={(_, id) => setSelectedPath(id as string)}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>

          {/* Right Pane: Actions (Import, Export, Database Maintenance) */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              height: '100%',
              p: 2.5,
              bgcolor: 'grey.50',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Stack spacing={3}>
              {/* Import Section */}
              <Box>
                <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon color="primary">upload</Icon> Import Cases
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Easily import one or multiple cases (.json). New patients and encounters will be merged seamlessly into the database.
                </Label>

                {/* Drag and Drop Zone */}
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'grey.400',
                    bgcolor: isDragging ? 'primary.50' : 'background.paper',
                    borderRadius: 2,
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    mb: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon size={32} color={isDragging ? 'primary' : 'action'} sx={{ mb: 1 }}>
                    upload_file
                  </Icon>
                  <Label variant="body2" sx={{ fontWeight: 600, display: 'block' }}>
                    Drag & drop case JSON file(s) here
                  </Label>
                  <Label variant="caption" color="textSecondary">
                    or click to browse multiple files
                  </Label>
                </Box>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  multiple
                  onChange={handleFileChange}
                />

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<Icon>file_open</Icon>}
                    fullWidth
                  >
                    Select JSON Files
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={(e) => setUrlImportAnchor(e.currentTarget)}
                    startIcon={<Icon>link</Icon>}
                    fullWidth
                  >
                    Import URL
                  </Button>
                </Stack>

                <Popover
                  open={Boolean(urlImportAnchor)}
                  anchorEl={urlImportAnchor}
                  onClose={() => setUrlImportAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  slotProps={{ paper: { sx: { p: 2, width: 320 } } }}
                >
                  <Stack spacing={2}>
                    <Label variant="subtitle2">Import Case/Database from URL</Label>
                    <input
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '0.875rem',
                      }}
                      placeholder="https://example.com/case.json"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      disabled={isFetchingUrl}
                    />
                    <Button
                      variant="contained"
                      onClick={handleImportFromUrl}
                      disabled={!importUrl || isFetchingUrl}
                      fullWidth
                    >
                      {isFetchingUrl ? 'Importing...' : 'Import from URL'}
                    </Button>
                  </Stack>
                </Popover>
              </Box>

              <Divider />

              {/* Export Section */}
              <Box>
                <Label variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon color="primary">download</Icon> Export
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Export individual patient cases or the entire database to JSON files.
                </Label>
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={handleExportSelected}
                    disabled={!isSelectedExportable}
                    startIcon={<Icon>person_search</Icon>}
                    fullWidth
                  >
                    Export Selected Case
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

              {/* Database Controls / Maintenance */}
              <Box sx={{ mt: 'auto' }}>
                <Label variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon>settings_backup_restore</Icon> Database Controls
                </Label>
                <Label variant="body2" color="textSecondary" paragraph>
                  Reset or erase data. Permanent operations require confirmation.
                </Label>
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleLoadSample}
                    startIcon={<Icon>restore</Icon>}
                    fullWidth
                  >
                    Load Sample Database
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteSelected}
                    disabled={!isSelectedExportable}
                    startIcon={<Icon>person_remove</Icon>}
                    fullWidth
                  >
                    Delete Selected Case
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteEntire}
                    startIcon={<Icon>delete_forever</Icon>}
                    fullWidth
                  >
                    Erase Entire Database
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Footer Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Label variant="caption" color="textSecondary">
            ProjectEHR • Welcome Screen
          </Label>
        </Box>
      </Box>

      <SinglePatientAppointmentModal
        open={Boolean(singlePatientPrompt)}
        onClose={() => setSinglePatientPrompt(null)}
        patientId={singlePatientPrompt?.patientId || null}
        patientName={singlePatientPrompt?.patientName}
        onConfirm={handleCreateAppointment}
      />
    </Box>
  );
};
