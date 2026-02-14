import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from 'components/contexts/AuthContext';
import { Avatar, Badge, Checkbox, FormControlLabel, Tooltip, Typography } from '@mui/material';
import { GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid-premium';
import { DataGrid, DatePicker, Box, Icon, Autocomplete } from 'components/ui/Core';
import { useRouter } from 'util/helpers';
import { Notification } from '../Login/components/Notification';
import { useDatabase, Database } from 'components/contexts/PatientContext'

function customFilterBar({
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
  setHide
}: {
  setFilterElem: React.RefObject<HTMLButtonElement>,
  selectedDate: Temporal.PlainDate,
  setSelectedDate: (date: Temporal.PlainDate | null) => void,
  selectedDept: string,
  setSelectedDept: (dept: string) => void,
  schedulesDB: Database.Schedule[],
  departments: Database.Department[],
  open: boolean,
  setOpen: (open: boolean) => void,
  preview: number,
  setPreview: (preview: number) => void,
  hide: number,
  setHide: (hide: number) => void
}) {
  return (
    <GridToolbarContainer sx={{ gap: 2, alignItems: 'center', justifyContent: "flex-start" }}>
      <GridToolbarFilterButton ref={setFilterElem} />
      <DatePicker
        convertString
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
      />
      <Autocomplete
        disableClearable
        options={schedulesDB.map(s => ({ id: s.department, label: departments.find(d => d.id === s.department)?.name || `Dept ${s.department}` }))}
        value={selectedDept}
        onChange={(_e, newValue: any) => setSelectedDept(newValue?.id)}
        getOptionLabel={(option: any) => typeof option === 'string' ? (departments.find(d => d.id === option)?.name || option) : option.label}
        sx={{ width: 250 }}
      />
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

// display bar by noted color and style
function changeBarColor(statusColor: React.CSSProperties['color']) {
  return <div style={{ background: statusColor, height: '100%', width: '50%' }} />;
}

// text to display status w/ designated text color and concat string of additional info
function changeTextColor(statusColor: React.CSSProperties['color'], statusName: string, secondaryStatus: string) {
  return (
    <>
      <Typography color={statusColor}>{statusName}</Typography>
      <Typography color="gray">{secondaryStatus}</Typography>
    </>
  );
}

// decide on color of bar based on what status is
function changeBarColorByStatus(officeStatus: Database.Appointment.Status) {
  if (officeStatus === Database.Appointment.Status.Scheduled) {
    return changeBarColor('blue');
  }
  if (officeStatus === Database.Appointment.Status.Arrived) {
    return changeBarColor('indigo');
  }
  if (officeStatus === Database.Appointment.Status.RoomingInProgress) {
    return changeBarColor('pink');
  }
  if (officeStatus === Database.Appointment.Status.Waiting) {
    return changeBarColor('orange');
  }
  if (officeStatus === Database.Appointment.Status.VisitInProgress) {
    return changeBarColor('yellow');
  }
  if (officeStatus === Database.Appointment.Status.VisitComplete) {
    return changeBarColor('purple');
  }
  if (officeStatus === Database.Appointment.Status.CheckedOut) {
    return changeBarColor('green');
  }
  if (officeStatus === Database.Appointment.Status.Signed) {
    return changeBarColor('cyan');
  }
  return changeBarColor('gray');
}

// decide on color of text in status column based on what status is
function changeTextByStatus(officeStatus: Database.Appointment.Status, checkinTime: string, checkoutTime: string, locationId: string, locations: Database.Location[]) {
  const roomName = locationId ? (locations.find((l: Database.Location) => l.id === locationId)?.name || 'Unknown Room') : 'Unknown Room';

  if (officeStatus === Database.Appointment.Status.Scheduled) {
    return changeTextColor('blue', officeStatus, '');
  }
  if (officeStatus === Database.Appointment.Status.Arrived) {
    return changeTextColor('indigo', officeStatus, 'Checked In: '.concat(checkinTime));
  }
  if (officeStatus === Database.Appointment.Status.RoomingInProgress) {
    return changeTextColor(
      'pink',
      officeStatus,
      'Exam Room: '.concat(roomName, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === Database.Appointment.Status.Waiting) {
    return changeTextColor(
      'orange',
      officeStatus,
      'Exam Room: '.concat(roomName, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === Database.Appointment.Status.VisitInProgress) {
    return changeTextColor(
      'yellow',
      officeStatus,
      'Exam Room: '.concat(roomName, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === Database.Appointment.Status.VisitComplete) {
    return changeTextColor(
      'green',
      officeStatus,
      'Exam Room: '.concat(roomName, ' (', checkinTime, ')')
    );
  }
  if (officeStatus === Database.Appointment.Status.CheckedOut) {
    return changeTextColor('green', officeStatus, 'Checked Out: '.concat(checkoutTime));
  }
  if (officeStatus === Database.Appointment.Status.Signed) {
    return changeTextColor('cyan', officeStatus, '');
  }
  return changeTextColor('gray', officeStatus, 'No Show');
}

// takes rows from json file and set columns to make table
export function Schedule() {
  const [patientsDB] = useDatabase().patients()
  const [schedulesDB, setSchedulesDB] = useDatabase().schedules()
  const [departments] = useDatabase().departments()
  const [locations] = useDatabase().locations()
  const [providers] = useDatabase().providers()

  const onHandleClickRoute = useRouter();
  const [open, setOpen] = React.useState(false); // preview checkbox on and off
  const [preview, setPreview] = React.useState(100); // set width of table
  const [hide, setHide] = React.useState(0); // patient info hidden, will incr when checkbox marked
  const [filterElem, setFilterElem] = React.useState(null); // for filter
  const { enabledEncounters } = React.useContext(AuthContext) as any; // Access the enabled encounters

  const { department, _date } = useParams();
  const date = !!_date ? Temporal.PlainDate.from(_date).toZonedDateTime('UTC').toInstant().toString() as Database.JSONDate : undefined
  const navigate = useNavigate();

  const [selPatient, setPatient] = React.useState<Database.Appointment | null>(null);

  const initialDept = department ?? (schedulesDB[0]?.department || (departments[0]?.id));
  const initialDate = date ?? Temporal.Now.instant().toString()//"2026-01-01"

  const [selectedDept, setSelectedDept] = React.useState(initialDept);
  const [selectedDate, setSelectedDate] = React.useState(initialDate as Database.JSONDate);

  // Update URL function
  const updateUrl = (dept: Database.Department.ID, dateObj: Database.JSONDate) => {
    const dateStr = Temporal.Instant.from(dateObj).toZonedDateTimeISO('UTC').toPlainDate().toString();
    navigate(`/schedule/${dept}/${dateStr}`, { replace: true });
  };

  // Wrapper setters to sync with URL
  const handleSetSelectedDept = (dept: Database.Department.ID) => {
    setSelectedDept(dept);
    updateUrl(dept, selectedDate);
  };

  const handleSetSelectedDate = (date: Database.JSONDate) => {
    setSelectedDate(date);
    updateUrl(selectedDept, date);
  };

  // Effect to sync state if URL changes externally (e.g. back button)
  React.useEffect(() => {
    if (department) {
      setSelectedDept(department);
    }
    if (date) {
      setSelectedDate(date);
    }
  }, [department, date]);

  const scheduleDB = React.useMemo(() => {
    const deptSchedule = schedulesDB.find((s) => s.department === selectedDept)?.appointments || [];
    return deptSchedule.filter((appt) => {
      const apptDate = Temporal.Instant.from(appt.apptTime).toZonedDateTimeISO('UTC').toPlainDate();
      const selectedPlainDate = Temporal.Instant.from(selectedDate).toZonedDateTimeISO('UTC').toPlainDate()
      return apptDate.equals(selectedPlainDate);
    });
  }, [schedulesDB, selectedDept, selectedDate]);

  const [notification, setNotification] = React.useState<{ open: boolean, message: string, severity: 'info' | 'warning' | 'error' | 'success' }>({ open: false, message: '', severity: 'info' });

  const showNotification = (message: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>Schedule</Typography>
      </Box>

      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
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
                  Age: {Database.JSONDate.toAge(patientsDB[selPatient.patient.mrn].birthdate)} <br />
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
                renderCell: (params: any) => {
                  return changeBarColorByStatus(params.row.officeStatus);
                },
              },
              {
                field: 'badge',
                headerName: '',
                sortable: false,
                width: 100,
                renderCell: (params) => {
                  return (
                    <Autocomplete
                      disableClearable
                      options={['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple']}
                      defaultValue="gray"
                      sx={{ width: 64 }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Badge><Icon style={{ color: option }}>circle</Icon></Badge>
                        </li>
                      )}
                      renderValue={(value) => <Badge><Icon style={{ color: value }}>circle</Icon></Badge>}
                    />
                  );
                },
              },
              {
                field: 'apptTime',
                headerName: 'Time',
                width: 100,
                renderCell: (params) => (
                  <Tooltip title={Temporal.Instant.from(params.value).toLocaleString()}>
                    <span>{Temporal.Instant.from(params.value).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
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
                      params.row.location,
                      locations
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
                          {Database.JSONDate.toAge(data.birthdate)} years old / {data.gender}
                        </Typography>
                      </Box>
                    </Box>
                  );
                },
                valueGetter: (value, row) => {
                  const data = patientsDB[row.patient.mrn]
                  return `${data.lastName || ''}, ${data.firstName || ''} \n (${data.id}) ${Database.JSONDate.toAge(data.birthdate)} years old / ${data.gender}`;
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
                  const providerId = data.encounters[row.patient.enc]?.provider;
                  const provider = providers.find((p: Database.Provider) => p.id === providerId);
                  return provider ? provider.name : providerId;
                },
              },
              { field: 'type', headerName: 'Type', width: 100 },
              {
                field: 'insurName',
                headerName: 'Coverage',
                width: 200,
                valueGetter: (value, row) => {
                  const data = patientsDB[row.patient.mrn]
                  return `${data.insurance?.carrierName ?? "No insurance on file"}`;
                },
              },
            ]}
            onRowClick={(params) => {
              setPatient(params.row);
            }}
            onRowDoubleClick={({
              row: {
                patient: { mrn: selectedMRN, enc: selectedEnc },
              },
            }) => {
              if (!!enabledEncounters && Object.keys(enabledEncounters).length > 0 && (enabledEncounters)[selectedMRN] == null) {
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
                  .encounters)).map((x: any) => x.id)
                  .includes(selectedEnc)
              ) {
                alert(
                  'You cannot view this chart because this encounter DOES NOT EXIST [system error].'
                );
                return; // Prevent routing
              }
              onHandleClickRoute(`patient/${selectedMRN}/encounter/${selectedEnc}`); // Proceed with routing if an encounter is selected
            }}
            showToolbar
            slots={{ toolbar: customFilterBar as any }} // FIXME
            slotProps={{
              panel: {
                anchorEl: filterElem,
              } as any, // FIXME
              // Update slotProps to pass the wrapper setters
              toolbar: {
                setFilterElem,
                selectedDate,
                setSelectedDate: handleSetSelectedDate,
                selectedDept,
                setSelectedDept: handleSetSelectedDept,
                schedulesDB,
                departments,
                open,
                setOpen,
                preview,
                setPreview,
                hide,
                setHide,
              } as any, // FIXME
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
