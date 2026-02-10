import React, { useState } from 'react';
import { Box, DataGrid, Label, Button, Window, IconButton } from 'components/ui/Core';
import { useDatabase, usePatient } from 'components/contexts/PatientContext';
import dayjs from 'dayjs';
import { SchedulePatientModal } from './components/SchedulePatientModal';

export const AppointmentDesk = () => {
    const { useChart } = usePatient();
    const [chart] = useChart()(); // This is the patient object

    const [schedules, setSchedulesDB] = useDatabase().schedules();
    const [departments] = useDatabase().departments();
    const [providers] = useDatabase().providers();
    const [locations] = useDatabase().locations();
    const [patientsDB] = useDatabase().patients();

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    // 1. Flatten all appointments from all schedules
    // 2. Filter for the current patient
    const patientAppointments = React.useMemo(() => {
        if (!chart || !schedules) return [];

        return schedules.flatMap(schedule => {
            const deptDetails = departments.find(d => d.id === schedule.department);

            return (schedule.appointments || [])
                .filter(appt => appt.patient?.mrn === chart.id) // Filter by MRN
                .map(appt => {
                    // Resolve related entities
                    const encounter = chart.encounters?.[appt.patient.enc];
                    const providerId = encounter?.provider;
                    const provider = providers.find(p => p.id === providerId);
                    const location = locations.find(l => l.id === appt.location);

                    return {
                        id: appt.id,
                        date: appt.apptTime,
                        status: appt.officeStatus || appt.status,
                        type: appt.type,
                        department: schedule.department,
                        provider: providerId || '',
                        location: appt.location || '',
                        notes: appt.notes,
                        patient: appt.patient, // Needed for modal
                        cc: appt.cc, // Needed for modal
                        departmentName: deptDetails?.name || `Dept ${schedule.department}`, // Provide fallback/name if needed for sorting or other
                        // Original raw data if needed
                        ...appt
                    };
                });
        });
    }, [schedules, chart, departments, providers, locations]);

    const handleEditAppointment = (appointment) => {
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

    const handleDeleteClick = (appointment) => {
        setDeleteConfirmation(appointment);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation) {
            const targetDeptId = deleteConfirmation.department;
            setSchedulesDB(prev => prev.map(s => {
                if (s.department === targetDeptId) {
                    return {
                        ...s,
                        appointments: s.appointments.filter(appt => appt.id !== deleteConfirmation.id)
                    };
                }
                return s;
            }));
            setDeleteConfirmation(null);
        }
    };

    const handleSchedulePatient = ({ patientId, encounterId, department, date, type, cc, notes, id, provider, location, status, checkinTime, checkoutTime }) => {
        const targetDeptId = parseInt(department);

        if (id) {
            // Edit existing
            setSchedulesDB(prev => prev.map(s => {
                if (s.department === targetDeptId) {
                    return {
                        ...s,
                        appointments: s.appointments.map(appt => {
                            if (appt.id === id) {
                                return {
                                    ...appt,
                                    apptTime: date,
                                    type: type || appt.type,
                                    notes: notes,
                                    cc: cc,
                                    // Update new fields if provided, otherwise keep existing
                                    provider: provider !== undefined ? provider : appt.provider, // provider might be null/empty string
                                    location: location !== undefined ? location : appt.location,
                                    officeStatus: status || appt.officeStatus || 'Scheduled', // Map status to officeStatus as per existing schema usage
                                    status: status || appt.status || 'Scheduled',
                                    checkinTime: checkinTime !== undefined ? checkinTime : appt.checkinTime,
                                    checkoutTime: checkoutTime !== undefined ? checkoutTime : appt.checkoutTime
                                };
                            }
                            return appt;
                        })
                    };
                }
                return s;
            }));
        } else {
            // Create new
            const newAppointment = {
                id: Math.floor(Math.random() * 100000),
                apptTime: date,
                status: status || "Scheduled",
                patient: { mrn: patientId, enc: encounterId },
                officeStatus: status || "Scheduled",
                checkinTime: checkinTime || "",
                checkoutTime: checkoutTime || "",
                location: location || null,
                type: type || "Office Visit",
                notes: notes || "",
                cc: cc || "",
                provider: provider || null // Add provider
            };

            setSchedulesDB(prev => {
                const index = prev.findIndex(s => s.department === targetDeptId);
                if (index >= 0) {
                    const newSchedules = [...prev];
                    newSchedules[index] = {
                        ...newSchedules[index],
                        appointments: [...newSchedules[index].appointments, newAppointment]
                    };
                    return newSchedules;
                } else {
                    return [...prev, { department: targetDeptId, appointments: [newAppointment] }];
                }
            });
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
            valueFormatter: (value) => value ? dayjs(value).format('MM/DD/YYYY h:mm A') : ''
        },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        {
            field: 'department',
            headerName: 'Department',
            width: 200,
            valueGetter: (value) => {
                const dept = departments.find(d => d.id === value);
                return dept ? dept.name : value;
            }
        },
        {
            field: 'provider',
            headerName: 'Provider',
            width: 200,
            valueGetter: (value) => {
                const prov = providers.find(p => p.id === value);
                return prov ? prov.name : value;
            }
        },
        {
            field: 'location',
            headerName: 'Location',
            width: 150,
            valueGetter: (value) => {
                const loc = locations.find(l => l.id === value);
                return loc ? loc.name : value;
            }
        },
        { field: 'notes', headerName: 'Notes', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
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

export default AppointmentDesk;
