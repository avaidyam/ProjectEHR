import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Avatar } from '@mui/material';
import { Box, Grid, Label, DatePicker, Button, Autocomplete, Chip } from 'components/ui/Core';
import { useDatabase, Database } from 'components/contexts/PatientContext';

interface LocationState {
  location: Database.Location,
  appointment: Database.Appointment | null,
  patient: Database.Patient | null
}

export function Snapboard() {
  const [schedulesDB] = useDatabase().schedules();
  const [patientsDB] = useDatabase().patients();
  const [departments] = useDatabase().departments();
  const [locations] = useDatabase().locations();

  const { department, _date } = useParams();
  const date = !!_date ? Temporal.PlainDate.from(_date).toZonedDateTime('UTC').toInstant().toString() as Database.JSONDate : undefined
  const navigate = useNavigate();

  // Initialize state from URL or defaults
  const initialDept = department ?? (schedulesDB[0]?.department || (departments[0]?.id));
  const initialDate = date ?? Temporal.Instant.from('2026-01-01T00:00:00.000Z').toString();

  const [selectedDate, setSelectedDate] = React.useState<Database.JSONDate>(initialDate as Database.JSONDate);
  const [selectedDept, setSelectedDept] = React.useState<Database.Department.ID>(initialDept);

  // Update URL function
  const updateUrl = (dept: Database.Department.ID, dateObj: Database.JSONDate) => {
    const dateStr = Temporal.Instant.from(dateObj).toZonedDateTimeISO('UTC').toPlainDate().toString();
    navigate(`/snapboard/${dept}/${dateStr}`, { replace: true });
  };

  // Wrapper setters
  const handleSetSelectedDept = (dept: Database.Department.ID) => {
    setSelectedDept(dept);
    updateUrl(dept, selectedDate);
  };

  const handleSetSelectedDate = (date: Database.JSONDate) => {
    setSelectedDate(date);
    updateUrl(selectedDept, date);
  };

  // Effect to sync state if URL changes externally
  React.useEffect(() => {
    if (department) {
      setSelectedDept(department);
    }
    if (date) {
      setSelectedDate(date);
    }
  }, [department, date]);

  // 1. Filter locations by department
  const deptLocations = React.useMemo(() => {
    return locations.filter((l) => l.departmentId === selectedDept);
  }, [locations, selectedDept]);

  // 2. Get appointments for the date and department
  const deptAppointments = React.useMemo(() => {
    const deptSchedule = schedulesDB.find(s => s.department === selectedDept)?.appointments || [];
    return deptSchedule.filter((appt: any) => {
      const apptDate = Temporal.Instant.from(appt.apptTime).toZonedDateTimeISO('UTC').toPlainDate();
      const selectedPlainDate = Temporal.Instant.from(selectedDate).toZonedDateTimeISO('UTC').toPlainDate()
      return apptDate.equals(selectedPlainDate);
    });
  }, [schedulesDB, selectedDept, selectedDate]);

  // 3. Map patients to locations
  const locationState = React.useMemo<LocationState[]>(() => {
    const state = {} as Record<Database.Location.ID, LocationState>;

    // Initialize with empty
    deptLocations.forEach((loc: Database.Location) => {
      state[loc.id] = { location: loc, appointment: null, patient: null };
    });

    // Fill with appointments
    deptAppointments.forEach((appt: Database.Appointment) => {
      if (appt.location && state[appt.location]) {
        state[appt.location].appointment = appt;
        state[appt.location].patient = patientsDB[appt.patient.mrn];
      }
    });
    return Object.values(state).sort((a, b) => a.location.name.localeCompare(b.location.name));
  }, [deptLocations, deptAppointments, patientsDB]);

  const deptOptions = React.useMemo(() => schedulesDB.map((s) => ({
    id: s.department,
    label: departments.find((d) => d.id === s.department)?.name || `Dept ${s.department}`
  })), [schedulesDB, departments]);

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Label variant="h5">Snapboard</Label>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            convertString
            value={selectedDate}
            onChange={(newValue) => handleSetSelectedDate(newValue)}
          />
          <Autocomplete
            options={deptOptions}
            value={deptOptions.find(o => o.id === selectedDept)}
            onChange={(_e, newValue: any) => handleSetSelectedDept(newValue?.id)}
            getOptionLabel={(option: any) => option.label}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Box>
      <Grid container spacing={3}>
        {locationState.map(({ location, appointment, patient }) => (
          <Grid
            key={location.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3
            }}>
            <Card variant="outlined" sx={{ height: '100%', borderColor: appointment ? 'primary.main' : 'divider', borderWidth: appointment ? 2 : 1 }}>
              <CardContent>
                <Label variant="h6" gutterBottom color="text.secondary" sx={{ fontSize: 14 }}>
                  {location.name}
                </Label>

                {appointment ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        {patient?.firstName?.[0]}{patient?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Label variant="subtitle1" component="div">
                          {patient?.lastName}, {patient?.firstName}
                        </Label>
                        <Label variant="caption" color="text.secondary">
                          MRN: {patient?.id}
                        </Label>
                      </Box>
                    </Box>

                    <Label variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {appointment.officeStatus}
                    </Label>
                    <Label variant="body2" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {Temporal.Instant.from(appointment.apptTime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </Label>
                    <Label variant="body2" sx={{ mb: 1 }}>
                      <strong>CC:</strong> {appointment.cc}
                    </Label>

                    <Chip
                      label={appointment.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
                    <Label variant="body2">Empty</Label>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {locationState.length === 0 && (
          <Grid size={12}>
            <Label variant="body1" color="text.secondary" textAlign="center">
              No locations found for this department.
            </Label>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
