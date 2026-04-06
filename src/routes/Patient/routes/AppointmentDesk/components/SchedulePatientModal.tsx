import * as React from 'react';
import { Autocomplete, Box, Button, Window, TreeView, TreeItem, Icon, Label, Grid, usePrompts, DateTimePicker, TimePicker } from 'components/ui/Core';
import { DepartmentSelectField, ProviderSelectField, LocationSelectField } from 'components/ui/DataUI';
import * as Database from 'components/contexts/Database';

const VISIT_TYPES = [
  "Admission",
  "Inpatient",
  "Outpatient",
  "Emergency",
  "Observation",
  "Ambulatory Surgery",
  "ED Visit",
  "Office Visit",
  "Hospital Admission",
  "Physical",
  "Hospital Discharge Followup",
  "PCP Office Visit",
  "Emergency Room"
];

const VISIT_STATUSES = [
  "Scheduled",
  "Arrived",
  "Rooming In Progress",
  "Roomed",
  "Provider In Room",
  "Compassionate Service",
  "Visit in Progress",
  "Visit Complete",
  "Completed",
  "No Show",
  "Cancelled",
  "Checked Out",
  "Signed",
  "Waiting"
];

export const SchedulePatientModal = ({ open, onClose, onSubmit, patientsDB, departments, providers, locations, appointment, currentPatientId }: any) => {
  const { alert } = usePrompts()
  const [selectedPatientId, setSelectedPatientId] = React.useState(appointment?.patient?.mrn || currentPatientId || null);
  const [selectedEncounterId, setSelectedEncounterId] = React.useState(appointment?.patient?.enc || null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [formData, setFormData] = React.useState({
    department: appointment ? appointment.department : null,
    provider: appointment ? appointment.provider : null,
    location: appointment ? appointment.location : null,
    status: appointment ? (appointment.status || 'Scheduled') : 'Scheduled',
    date: appointment ? appointment.apptTime : Temporal.Instant.from('2026-01-01T08:00Z').toString(),
    type: appointment?.type || 'Office Visit',
    cc: appointment?.cc || '',
    notes: appointment?.notes || '',
    checkinTime: appointment?.checkinTime || '',
    checkoutTime: appointment?.checkoutTime || ''
  });

  React.useEffect(() => {
    if (open && appointment) {
      setSelectedPatientId(appointment.patient?.mrn || currentPatientId);
      setSelectedEncounterId(appointment.patient?.enc);
      setFormData({
        department: appointment.department,
        provider: appointment.provider,
        location: appointment.location,
        status: appointment.status || 'Scheduled',
        date: appointment.apptTime,
        type: appointment.type || 'Office Visit',
        cc: appointment.cc || '',
        notes: appointment.notes || '',
        checkinTime: appointment.checkinTime || '',
        checkoutTime: appointment.checkoutTime || ''
      });
      setShowAdvanced(!!appointment.checkinTime || !!appointment.checkoutTime);
    } else if (open && !appointment) {
      setSelectedPatientId(currentPatientId || null);
      setSelectedEncounterId(null);
      setFormData({
        department: null,
        provider: null,
        location: null,
        status: 'Scheduled',
        date: Temporal.Instant.from('2026-01-01T08:00Z').toString(),
        type: 'Office Visit',
        cc: '',
        notes: '',
        checkinTime: '',
        checkoutTime: ''
      });
      setShowAdvanced(false);
    }
  }, [open, appointment, currentPatientId]);

  const handleNodeSelect = (event: any, nodeId: any) => {
    if (nodeId && nodeId.startsWith('enc-')) {
      const [, patId, encId] = nodeId.split('-');
      setSelectedPatientId(patId);
      setSelectedEncounterId(encId);
    } else {
      setSelectedEncounterId(null);
    }
  };

  const handleSubmit = async () => {
    if (formData.department && formData.provider && formData.location && formData.date && selectedEncounterId) {
      onSubmit({
        patientId: selectedPatientId,
        encounterId: selectedEncounterId,
        department: formData.department,
        provider: formData.provider,
        location: formData.location,
        status: formData.status,
        date: formData.date,
        type: formData.type,
        cc: formData.cc,
        notes: formData.notes,
        id: appointment?.id,
        checkinTime: formData.checkinTime,
        checkoutTime: formData.checkoutTime
      });
      onClose();
    } else {
      await alert("Please select an encounter, department, and date.", "Incomplete Information");
    }
  };

  const targetPatientId = currentPatientId || selectedPatientId;
  const targetPatient = targetPatientId ? patientsDB[targetPatientId] : null;

  const footer = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
      <Button variant="outlined" onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!selectedEncounterId || !formData.department || !formData.provider || !formData.location || !formData.date}
      >
        {appointment ? "Save Changes" : "Schedule"}
      </Button>
    </Box>
  );

  return (
    <Window
      open={open}
      onClose={onClose}
      title={appointment ? "Edit Appointment" : "Schedule Patient"}
      footer={footer}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
        {/* Encounter Selection Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Label variant="subtitle2" color="primary">Linked Encounter</Label>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, maxHeight: 200, overflowY: 'auto', bgcolor: 'background.paper' }}>
            {targetPatient ? (
              <TreeView
                defaultCollapseIcon={<Icon>expand_more</Icon>}
                defaultExpandIcon={<Icon>chevron_right</Icon>}
                onSelectedItemsChange={handleNodeSelect}
                selectedItems={selectedEncounterId ? [`enc-${targetPatientId}-${selectedEncounterId}`] : []}
              >
                {!!targetPatient.encounters && Object.values(targetPatient.encounters).map((enc: any) => (
                  <TreeItem
                    key={`enc-${targetPatient.id}-${enc.id}`}
                    itemId={`enc-${targetPatient.id}-${enc.id}`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Label variant="body2" sx={{ fontWeight: 'bold' }}>Encounter {enc.id}</Label>
                        <Label variant="caption" color="textSecondary">{enc.status} • {enc.startDate}</Label>
                      </Box>
                    }
                  />
                ))}
              </TreeView>
            ) : (
              <Label color="textSecondary">No patient selected.</Label>
            )}
          </Box>
        </Box>

        {/* Schedule Details Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Label variant="subtitle2" color="primary">Appointment Details</Label>

          <Grid container spacing={2}>
            {/* Department - Autocomplete (Strict) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DepartmentSelectField
                fullWidth
                value={formData.department}
                onChange={(id) => setFormData((prev: any) => ({
                  ...prev,
                  department: id,
                  provider: null,
                  location: null
                }))}
              />
            </Grid>

            {/* Status - Autocomplete (Strict) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                label="Status"
                fullWidth
                options={VISIT_STATUSES}
                value={formData.status}
                onChange={(event, newValue) => {
                  setFormData((prev: any) => ({ ...prev, status: newValue || 'Scheduled' }));
                }}
              />
            </Grid>

            {/* Provider - Autocomplete (Strict) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ProviderSelectField
                fullWidth
                departmentIds={formData.department ? [formData.department as Database.Department.ID] : []}
                value={formData.provider}
                onChange={(id) => setFormData((prev: any) => ({ ...prev, provider: id }))}
              />
            </Grid>

            {/* Location - Autocomplete (Strict) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocationSelectField
                fullWidth
                departmentIds={formData.department ? [formData.department as Database.Department.ID] : []}
                value={formData.location}
                onChange={(id) => setFormData((prev: any) => ({ ...prev, location: id }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                freeSolo
                label="Appointment Type"
                fullWidth
                options={VISIT_TYPES}
                value={formData.type}
                onInputChange={(event, newInputValue) => {
                  setFormData((prev: any) => ({ ...prev, type: newInputValue || '' }));
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                fullWidth
                convertString
                label="Appointment Time"
                value={formData.date}
                onChange={(date: any) => setFormData({ ...formData, date })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                freeSolo
                label="Chief Complaint (CC)"
                fullWidth
                value={formData.cc}
                onInputChange={(_e, newValue) => setFormData({ ...formData, cc: newValue })}
                options={[]}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                freeSolo
                label="Notes"
                fullWidth
                value={formData.notes}
                onInputChange={(_e, newValue) => setFormData({ ...formData, notes: newValue })}
                options={[]}
                TextFieldProps={{ multiline: true, rows: 3 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                startIcon={<Icon>{showAdvanced ? 'expand_less' : 'expand_more'}</Icon>}
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="small"
              >
                Advanced Options
              </Button>
            </Grid>

            {showAdvanced && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TimePicker
                    fullWidth
                    convertString
                    label="Check-in Time"
                    value={formData.checkinTime}
                    onChange={(date: any) => setFormData({ ...formData, checkinTime: date })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TimePicker
                    fullWidth
                    convertString
                    label="Check-out Time"
                    value={formData.checkoutTime}
                    onChange={(date: any) => setFormData({ ...formData, checkoutTime: date })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>
    </Window>
  );
};
