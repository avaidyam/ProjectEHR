import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Box, Typography, Card, CardContent, Grid, FormControl, Select, MenuItem, Chip, Avatar } from '@mui/material';
import { DatePicker, Button } from 'components/ui/Core';
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

  const { department, date } = useParams();
  const navigate = useNavigate();

  // Initialize state from URL or defaults
  const initialDept = department ?? (schedulesDB[0]?.department || (departments[0]?.id));
  const initialDate = date ? dayjs(date) : dayjs('2026-01-01');

  const [selectedDate, setSelectedDate] = React.useState(initialDate);
  const [selectedDept, setSelectedDept] = React.useState(initialDept);

  // Update URL function
  const updateUrl = (dept: Database.Department.ID, dateObj: dayjs.Dayjs) => {
    const dateStr = dateObj.format('YYYY-MM-DD');
    navigate(`/snapboard/${dept}/${dateStr}`, { replace: true });
  };

  // Wrapper setters
  const handleSetSelectedDept = (dept: Database.Department.ID) => {
    setSelectedDept(dept);
    updateUrl(dept, selectedDate);
  };

  const handleSetSelectedDate = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    updateUrl(selectedDept, date);
  };

  // Effect to sync state if URL changes externally
  React.useEffect(() => {
    if (department) {
      setSelectedDept(department);
    }
    if (date) {
      setSelectedDate(dayjs(date));
    }
  }, [department, date]);

  // 1. Filter locations by department
  const deptLocations = React.useMemo(() => {
    return locations.filter((l) => l.departmentId === selectedDept);
  }, [locations, selectedDept]);

  // 2. Get appointments for the date and department
  const deptAppointments = React.useMemo(() => {
    const deptSchedule = schedulesDB.find((s) => s.department === selectedDept)?.appointments || [];
    return deptSchedule.filter((appt) => dayjs(appt.apptTime).isSame(selectedDate, 'day'));
  }, [schedulesDB, selectedDept, selectedDate]);

  // 3. Map patients to locations
  const locationState = React.useMemo<LocationState[]>(() => {
    const state = {} as Record<Database.Location.ID, LocationState>;

    // Initialize with empty
    deptLocations.forEach((loc) => {
      state[loc.id] = { location: loc, appointment: null, patient: null };
    });

    // Fill with appointments
    deptAppointments.forEach((appt) => {
      if (appt.location && state[appt.location]) {
        state[appt.location].appointment = appt;
        state[appt.location].patient = patientsDB[appt.patient.mrn];
      }
    });
    return Object.values(state).sort((a, b) => a.location.name.localeCompare(b.location.name));
  }, [deptLocations, deptAppointments, patientsDB]);

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Snapboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            value={selectedDate}
            onChange={(newValue) => handleSetSelectedDate(newValue ?? dayjs())}
          />
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <Select
              value={selectedDept}
              onChange={(e) => handleSetSelectedDept(e.target.value)}
              displayEmpty
            >
              {schedulesDB.map((s) => (
                <MenuItem key={s.department} value={s.department}>
                  {departments.find((d) => d.id === s.department)?.name || `Dept ${s.department}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
                <Typography variant="h6" gutterBottom color="text.secondary" sx={{ fontSize: 14 }}>
                  {location.name}
                </Typography>

                {appointment ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        {patient?.firstName?.[0]}{patient?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {patient?.lastName}, {patient?.firstName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          MRN: {patient?.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {appointment.officeStatus}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {dayjs(appointment.apptTime).format('h:mm A')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>CC:</strong> {appointment.cc}
                    </Typography>

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
                    <Typography variant="body2">Empty</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {locationState.length === 0 && (
          <Grid size={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No locations found for this department.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
