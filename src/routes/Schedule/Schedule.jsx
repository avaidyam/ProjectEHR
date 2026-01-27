import React, { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { AuthContext } from 'components/contexts/AuthContext.jsx';
import { Avatar, Badge, Box, Checkbox, FormControl, FormControlLabel, MenuItem, Select, Icon, Tooltip, Typography, Button } from '@mui/material';
import { GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid-premium';
import { DataGrid, DatePicker } from 'components/ui/Core.jsx';
import { useRouter } from 'util/helpers.js';
import Notification from '../Login/components/Notification.jsx';
import { SchedulePatientModal } from './components/SchedulePatientModal.jsx';

import { useDatabase } from 'components/contexts/PatientContext'



// filter bar
function customFilterBar({ setFilterElem, selectedDate, setSelectedDate, selectedDept, setSelectedDept, schedulesDB, departments, open, setOpen, preview, setPreview, hide, setHide }) {
  return (
    <GridToolbarContainer sx={{ gap: 2, alignItems: 'center' }}>
      <GridToolbarFilterButton ref={setFilterElem} />
      <DatePicker
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
      />
      <FormControl variant="outlined" sx={{ minWidth: 200 }}>
        <Select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          displayEmpty
        >
          {schedulesDB.map((s) => (
            <MenuItem key={s.department} value={s.department}>
              {departments.find(d => d.id === s.department)?.name || `Dept ${s.department}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        onClick={() => {
          setOpen(!open);
          setPreview(preview === 50 ? 100 : 50);
          setHide(hide === 0 ? 50 : 0);
        }}
        control={<Checkbox checked={open} />}
        label="Preview"
      />
    </GridToolbarContainer>
  );
}

// display circle badge by noted color
function changeBadge(badgeColor) {
  return (
    <Badge>
      <Icon style={{ color: badgeColor }}>circle</Icon>
    </Badge>
  );
}

// display bar by noted color and style
function changeBarColor(statusColor) {
  return <div style={{ background: statusColor, height: '100%', width: '50%' }} />;
}

// text to display status w/ designated text color and concat string of additional info
function changeTextColor(statusColor, statusName, secondaryStatus) {
  return (
    <>
      <Typography color={statusColor}>{statusName}</Typography>
      <Typography color="gray">{secondaryStatus}</Typography>
    </>
  );
}

// decide on color of bar based on what status is
function changeBarColorByStatus(officeStatus) {
  if (officeStatus === 'Scheduled') {
    return changeBarColor('blue');
  }
  if (officeStatus === 'Arrived') {
    return changeBarColor('indigo');
  }
  if (officeStatus === 'Rooming in Progress') {
    return changeBarColor('pink');
  }
  if (officeStatus === 'Waiting') {
    return changeBarColor('orange');
  }
  if (officeStatus === 'Visit in Progress') {
    return changeBarColor('yellow');
  }
  if (officeStatus === 'Visit Complete') {
    return changeBarColor('purple');
  }
  if (officeStatus === 'Checked Out') {
    return changeBarColor('green');
  }
  if (officeStatus === 'Signed') {
    return changeBarColor('cyan');
  }
  return changeBarColor('gray');
}

// decide on color of text in status column based on what status is
function changeTextByStatus(officeStatus, checkinTime, checkoutTime, room) {
  if (officeStatus === 'Scheduled') {
    return changeTextColor('blue', officeStatus, '');
  }
  if (officeStatus === 'Arrived') {
    return changeTextColor('indigo', officeStatus, 'Checked In: '.concat(checkinTime));
  }
  if (officeStatus === 'Rooming in Progress') {
    return changeTextColor(
      'pink',
      officeStatus,
      'Exam Room: '.concat(room, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === 'Waiting') {
    return changeTextColor(
      'orange',
      officeStatus,
      'Exam Room: '.concat(room, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === 'Visit in Progress') {
    return changeTextColor(
      'yellow',
      officeStatus,
      'Exam Room: '.concat(room, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === 'Visit Complete') {
    return changeTextColor(
      'green',
      officeStatus,
      'Exam Room: '.concat(room, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === 'Checked Out') {
    return changeTextColor('green', officeStatus, 'Checked Out: '.concat(checkoutTime));
  }
  if (officeStatus === 'Signed') {
    return changeTextColor('cyan', officeStatus, '');
  }
  return changeTextColor('gray', officeStatus, 'No Show');
}

// takes rows from json file and set columns to make table
export function Schedule() {
  const [patientsDB] = useDatabase().patients()
  const [schedulesDB, setSchedulesDB] = useDatabase().schedules()
  const [departments] = useDatabase().departments()

  const onHandleClickRoute = useRouter();
  const [open, setOpen] = React.useState(false); // preview checkbox on and off
  const [preview, setPreview] = React.useState(100); // set width of table
  const [hide, setHide] = React.useState(0); // patient info hidden, will incr when checkbox marked
  const [filterElem, setFilterElem] = React.useState(null); // for filter
  const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters

  const [selPatient, setPatient] = React.useState(null);
  const [selectedDept, setSelectedDept] = React.useState(schedulesDB[0]?.department || (departments[0]?.id));
  const [selectedDate, setSelectedDate] = React.useState(dayjs('2026-01-01'));
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState(null);

  const scheduleDB = React.useMemo(() => {
    const deptSchedule = schedulesDB.find(s => s.department === selectedDept)?.appointments || [];
    return deptSchedule.filter(appt => dayjs(appt.apptTime).isSame(selectedDate, 'day'));
  }, [schedulesDB, selectedDept, selectedDate]);

  const patientScheduleClick = (params) => {
    setPatient(params.row);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsScheduleModalOpen(true);
  };

  const handleSchedulePatient = ({ patientId, encounterId, department, date, type, cc, notes, id }) => {
    const targetDeptId = parseInt(department);

    // If editing (id exists)
    if (id) {
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
                  cc: cc
                };
              }
              return appt;
            })
          };
        }
        return s;
      }));
      showNotification("Appointment updated successfully", "success");
    } else {
      const newAppointment = {
        id: Math.floor(Math.random() * 100000), // Generate random ID
        apptTime: date, // ISO format from modal
        status: "Scheduled",
        patient: { mrn: patientId, enc: encounterId },
        officeStatus: "Scheduled",
        checkinTime: "",
        checkoutTime: "",
        room: "",
        type: type || "Office Visit",
        notes: notes || "",
        cc: cc || ""
      };

      setSchedulesDB(prev => {
        const index = prev.findIndex(s => s.department === targetDeptId);
        if (index >= 0) {
          // Update existing
          const newSchedules = [...prev];
          newSchedules[index] = {
            ...newSchedules[index],
            appointments: [...newSchedules[index].appointments, newAppointment]
          };
          return newSchedules;
        } else {
          // Create new entry
          return [...prev, { department: targetDeptId, appointments: [newAppointment] }];
        }
      });

      // Auto-switch to the scheduled department
      setSelectedDept(targetDeptId);
      showNotification("Patient scheduled successfully", "success");
    }
    setEditingAppointment(null);
  };

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Schedule</Typography>
        <Button variant="contained" onClick={() => { setEditingAppointment(null); setIsScheduleModalOpen(true); }}>Schedule Patient</Button>
      </Box>

      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />
      <SchedulePatientModal
        open={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setEditingAppointment(null); }}
        onSubmit={handleSchedulePatient}
        patientsDB={patientsDB}
        departments={departments}
        appointment={editingAppointment}
      />
      <div style={{ display: 'inline-block', width: `${preview}%` }}>

        <div>
          {open && ( // shows text if preview box is checked
            <Typography
              sx={{
                position: 'absolute',
                top: '150px',
                left: 'calc(50% + 100px)',
                zIndex: -1,
                fontSize: '20px',
              }}
            >
              {selPatient ? (
                <>
                  Name: {patientsDB[selPatient.patient.mrn].firstName} {patientsDB[selPatient.patient.mrn].lastName} <br />
                  Age: {new Date(patientsDB[selPatient.patient.mrn].birthdate).age()} <br />
                  Gender: {patientsDB[selPatient.patient.mrn].gender} <br />
                  CC: {selPatient.cc} <br />
                  Notes: {selPatient.notes}
                </>
              ) : (
                <>No Patient Selected.</>
              )}
            </Typography>
          )}
        </div>
        <div>
          <DataGrid
            getRowHeight={() => 'auto'}
            rows={scheduleDB}
            columns={[
              {
                field: 'bar',
                headerName: '',
                width: 10,
                renderCell: (params) => {
                  return changeBarColorByStatus(params.row.officeStatus);
                },
              },
              {
                field: 'badge',
                headerName: '',
                sortable: false,
                width: 100,
                renderCell: () => {
                  return (
                    <FormControl>
                      <Select defaultValue="gray">
                        <MenuItem value="white">{changeBadge('white')}</MenuItem>
                        <MenuItem value="gray">{changeBadge('gray')}</MenuItem>
                        <MenuItem value="red">{changeBadge('red')}</MenuItem>
                        <MenuItem value="orange">{changeBadge('orange')}</MenuItem>
                        <MenuItem value="yellow">{changeBadge('yellow')}</MenuItem>
                        <MenuItem value="green">{changeBadge('green')}</MenuItem>
                        <MenuItem value="blue">{changeBadge('blue')}</MenuItem>
                        <MenuItem value="purple">{changeBadge('purple')}</MenuItem>
                      </Select>
                    </FormControl>
                  );
                },
              },
              {
                field: 'apptTime',
                headerName: 'Time',
                width: 100,
                renderCell: (params) => (
                  <Tooltip title={new Date(params.value).toLocaleString()}>
                    <span>{new Date(params.value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  </Tooltip>
                ),
              },
              {
                field: 'status',
                headerName: 'Status',
                width: 200,
                renderCell: (params) => (
                  <div>
                    {changeTextByStatus(
                      params.row.officeStatus,
                      params.row.checkinTime,
                      params.row.checkoutTime,
                      params.row.room
                    )}
                  </div>
                ),
              },
              {
                field: 'fullName',
                headerName: 'Patient Name/MRN/Age/Gender',
                width: 300,
                renderCell: (params) => {
                  const data = patientsDB[params.row.patient.mrn]
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar>{data.firstName.charAt(0).concat(data.lastName.charAt(0))}</Avatar>
                      <Box sx={{ marginLeft: 1 }}>
                        <Typography>
                          {data.lastName}, {data.firstName} ({data.id})
                        </Typography>
                        <Typography color="textSecondary" fontSize="12px">
                          {new Date(data.birthdate).age()} years old / {data.gender}
                        </Typography>
                      </Box>
                    </Box>
                  );
                },
                valueGetter: (value, row) => {
                  const data = patientsDB[row.patient.mrn]
                  return `${data.lastName || ''}, ${data.firstName || ''} \n (${data.mrn}) ${new Date(data.birthdate).age()
                    } years old / ${data.gender}`;
                },
              },
              {
                field: 'cc',
                headerName: 'CC',
                width: 100,
                renderCell: (params) => (
                  <Tooltip title={params.value}>
                    <span>{params.value}</span>
                  </Tooltip>
                ),
                /* valueGetter: (params) => {
                  const data = patientsDB[params.row.patient.mrn]
                  const data2 = data.encounters[params.row.patient.enc]?.concerns[0] ?? ""
                  return data2
                },// */
              },
              {
                field: 'notes',
                headerName: 'Notes',
                width: 200,
                renderCell: (params) => (
                  <Tooltip title={params.value}>
                    <span>{params.value}</span>
                  </Tooltip>
                ),
                /* valueGetter: (params) => {
                  const data = patientsDB[params.row.patient.mrn]
                  const data2 = data.encounters[params.row.patient.enc]?.concerns[1] ?? ""
                  return data2 // FIXME we need an actual appointment object still but this will do for now
                },// */
              },
              {
                field: 'fullProviderName',
                headerName: 'Provider Name',
                width: 200,
                valueGetter: (value, row) => {
                  const data = patientsDB[row.patient.mrn]
                  const data2 = data.encounters[row.patient.enc]?.provider;
                  return data2; // `${data2.provider.lastName}, ${data2.provider.firstName}`
                },
              },
              { field: 'type', headerName: 'Type', width: 100 },
              {
                field: 'insurName',
                headerName: 'Coverage',
                width: 200,
                valueGetter: (value, row) => {
                  const data = patientsDB[row.patient.mrn]
                  return `${data.insurance.carrierName}`;
                },
              },
              {
                field: 'edit',
                headerName: 'Actions',
                width: 100,
                renderCell: (params) => (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row selection
                      // Need to construct the appointment object with department info since it's flattened
                      const appt = {
                        ...params.row,
                        department: selectedDept
                      };
                      handleEditAppointment(appt);
                    }}
                  >
                    Edit
                  </Button>
                ),
              },
            ]}
            onRowClick={patientScheduleClick}
            onRowDoubleClick={({
              row: {
                patient: { mrn: selectedMRN, enc: selectedEnc },
              },
            }) => {
              if (!!enabledEncounters && Object.keys(enabledEncounters).length > 0 && enabledEncounters[selectedMRN] == null) {
                showNotification(
                  'You cannot view this chart because no encounter is associated with this MRN.',
                  'warning'
                );
                return; // Prevent routing
              }
              // if (!enabledEncounters[selectedMRN].includes(selectedEnc)) {
              //  alert("You cannot view this chart because this encounter is marked CONFIDENTIAL.");
              //  return; // Prevent routing
              // } // FIXME later
              if (
                !(Object.values(patientsDB[selectedMRN]
                  .encounters)).map((x) => x.id)
                  .includes(selectedEnc)
              ) {
                alert(
                  'You cannot view this chart because this encounter DOES NOT EXIST [system error].'
                );
                return; // Prevent routing
              }

              onHandleClickRoute(`patient/${selectedMRN}/encounter/${selectedEnc}`); // Proceed with routing if an encounter is selected
            }}
            slots={{ toolbar: customFilterBar }}
            slotProps={{
              panel: {
                anchorEl: filterElem,
              },
              toolbar: {
                setFilterElem,
                selectedDate,
                setSelectedDate,
                selectedDept,
                setSelectedDept,
                schedulesDB,
                departments,
                open,
                setOpen,
                preview,
                setPreview,
                hide,
                setHide,
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'apptTime', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[5, 10]}
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          />
        </div>
      </div>
      <div style={{ display: 'inline-block', width: `${hide}%` }}>
        <p />
      </div>
    </Box>
  );
}
