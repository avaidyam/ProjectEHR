import * as React from 'react';
import { Window, Button, Label, Icon, Box, Stack } from '../Core';
import { LocationSelectField } from '../DataUI';
import { useDatabase } from '../../contexts/PatientContext';

export interface SinglePatientAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string | null;
  patientName?: string | null;
  onConfirm: (data: { date: string; locationId: string }) => void;
}

export const SinglePatientAppointmentModal: React.FC<SinglePatientAppointmentModalProps> = ({
  open,
  onClose,
  patientId,
  patientName,
  onConfirm,
}) => {
  const [locations] = useDatabase().locations();

  const getTodayStr = () => {
    try {
      if (typeof Temporal !== 'undefined' && Temporal.Now) {
        return Temporal.Now.plainDateISO().toString();
      }
    } catch {
      // Fallback
    }
    return new Date().toISOString().split('T')[0];
  };

  const defaultLocationId = React.useMemo(() => {
    if (!locations || locations.length === 0) return '';
    const emergencyLoc = locations.find(
      (l) =>
        l.name?.toLowerCase().includes('emergency') ||
        l.departmentId === '30' ||
        l.type?.toLowerCase().includes('emergency')
    );
    return emergencyLoc ? emergencyLoc.id : locations[0].id;
  }, [locations]);

  const [date, setDate] = React.useState(getTodayStr());
  const [locationId, setLocationId] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setDate(getTodayStr());
      setLocationId(defaultLocationId);
    }
  }, [open, defaultLocationId]);

  const handleConfirm = () => {
    onConfirm({
      date: date || getTodayStr(),
      locationId: locationId || defaultLocationId,
    });
    onClose();
  };

  return (
    <Window
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Icon color="primary">calendar_today</Icon>
          <Label variant="h6">Create Appointment for Patient</Label>
        </Stack>
      }
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            startIcon={<Icon>event_available</Icon>}
          >
            Create Appointment
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 1 }}>
        <Label variant="body1" paragraph>
          Would you like to automatically create an appointment for{' '}
          <strong>{patientName || (patientId ? `Patient (MRN: ${patientId})` : 'this patient')}</strong>?
        </Label>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          <Box>
            <Label variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
              Appointment Date
            </Label>
            <input
              type="date"
              aria-label="Appointment Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </Box>
          <Box>
            <Label variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
              Location
            </Label>
            <LocationSelectField
              value={(locationId || defaultLocationId) as any}
              onChange={(val) => setLocationId((val as string) || '')}
              label="Select Location"
              fullWidth
            />
          </Box>
        </Stack>
      </Box>
    </Window>
  );
};
