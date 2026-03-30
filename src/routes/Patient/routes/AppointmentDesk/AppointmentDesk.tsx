import * as React from 'react';
import { Box, DataGrid, Label, Button, Window, IconButton } from 'components/ui/Core';
import { Database, useDatabase, usePatient } from 'components/contexts/PatientContext';
import { SchedulePatientModal } from './components/SchedulePatientModal';

export const AppointmentDesk = () => {
  const { useChart } = usePatient();
  const [chart] = useChart()(); // This is the patient object

  const [appointmentsDB, setAppointmentsDB] = useDatabase().appointments();
  const [departments] = useDatabase().departments();
  const [providers] = useDatabase().providers();
  const [locations] = useDatabase().locations();
  const [patientsDB] = useDatabase().patients();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<any>(null);

  // 1. Flatten all appointments from all schedules
  // 2. Filter for the current patient
  const patientAppointments = React.useMemo(() => {
    if (!chart || !appointmentsDB) return [];

    return appointmentsDB
      .filter((appt) => appt.patient?.mrn === chart.id) // Filter by MRN
      .map((appt) => {
        // Resolve related entities
        const deptDetails = departments.find((d: any) => d.id === appt.department);
        const encounter = chart.encounters?.[appt.patient.enc];
        const providerId = encounter?.provider;
        const provider = providers.find((p: any) => p.id === providerId);
        const location = locations.find((l: any) => l.id === appt.location);

        return {
          id: appt.id,
          date: appt.apptTime,
          status: appt.status,
          type: appt.type,
          department: appt.department,
          provider: providerId || '',
          location: appt.location || '',
          notes: appt.notes,
          patient: appt.patient, // Needed for modal
          cc: appt.cc, // Needed for modal
          departmentName: deptDetails?.name || `Dept ${appt.department}`
        };
      });
  }, [appointmentsDB, chart, departments, providers, locations]);

  const handleEditAppointment = (appointment: any) => {
    // Reconstruct the appointment object for the modal
    // The modal expects simple 'department' ID
    const apptForModal = {
      ...appointment,
      department: appointment.department,
      apptTime: appointment.date
    };
    setEditingAppointment(apptForModal);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteClick = (appointment: any) => {
    setDeleteConfirmation(appointment);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation) {
      setAppointmentsDB((prev: any) => prev.filter((appt: any) => appt.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);
    }
  };

  const handleSchedulePatient = ({ patientId, encounterId, department, date, type, cc, notes, id, provider, location, status, checkinTime, checkoutTime }: any) => {
    if (id) {
      // Edit existing
      setAppointmentsDB((prev: any) => prev.map((appt: any) => {
        if (appt.id === id) {
          return {
            ...appt,
            department: department || appt.department,
            apptTime: date,
            type: type || appt.type,
            notes: notes,
            cc: cc,
            provider: provider !== undefined ? provider : appt.provider,
            location: location !== undefined ? location : appt.location,
            status: status || appt.status || 'Scheduled',
            checkinTime: checkinTime !== undefined ? checkinTime : appt.checkinTime,
            checkoutTime: checkoutTime !== undefined ? checkoutTime : appt.checkoutTime
          };
        }
        return appt;
      }));
    } else {
      // Create new
      const newAppointment: Database.Appointment = {
        id: Database.Appointment.ID.create(),
        department: department,
        apptTime: date,
        status: status || "Scheduled",
        patient: { mrn: patientId, enc: encounterId },
        checkinTime: checkinTime || "",
        checkoutTime: checkoutTime || "",
        location: location || null,
        type: type || "Office Visit",
        notes: notes || "",
        cc: cc || "",
        provider: provider || null
      };

      setAppointmentsDB((prev: any) => [...prev, newAppointment]);
    }
    setEditingAppointment(null);
  };

  // Pre-fill modal with current patient if creating new
  const handleOpenNewSchedule = () => {
    setEditingAppointment(null);
    setIsScheduleModalOpen(true);
  }

  const COLUMN_DEFS = [
    {
      field: 'date',
      headerName: 'Date/Time',
      width: 155,
      valueFormatter: (value: any) => value ? Temporal.Instant.from(value).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''
    },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'department',
      headerName: 'Department',
      width: 200,
      valueGetter: (value: any) => {
        const dept = departments.find((d: any) => d.id === value);
        return dept ? dept.name : value;
      }
    },
    {
      field: 'provider',
      headerName: 'Provider',
      width: 200,
      valueGetter: (value: any) => {
        const prov = providers.find((p: any) => p.id === value);
        return prov ? prov.name : value;
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      valueGetter: (value: any) => {
        const loc = locations.find((l: any) => l.id === value);
        return loc ? loc.name : value;
      }
    },
    { field: 'notes', headerName: 'Notes', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditAppointment(params.row);
            }}
          >
            edit
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row);
            }}
          >
            delete
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label variant="h6">Appointment Desk</Label>
        <Button variant="contained" size="small" onClick={handleOpenNewSchedule}>
          Schedule Patient
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <DataGrid
          rows={patientAppointments}
          columns={COLUMN_DEFS}
          initialState={{
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Schedule Modal */}
      <SchedulePatientModal
        open={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setEditingAppointment(null); }}
        onSubmit={handleSchedulePatient}
        patientsDB={patientsDB}
        departments={departments}
        providers={providers}
        locations={locations}
        appointment={editingAppointment}
        currentPatientId={chart?.id}
      />

      {/* Delete Confirmation */}
      <Window
        open={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirm Delete"
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
            <Button onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
          </Box>
        }
        maxWidth="sm"
      >
        <Label>
          Are you sure you want to delete the appointment?
        </Label>
      </Window>
    </Box>
  );
};
