import React, { useContext, useState } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import Notification from '../../util/Notification';

// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

import { AuthContext } from '../login/AuthContext';
import { useRouter } from '../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js'

// json data
import appt from '../../util/data/schedule.json';

// get today's date and display in text box
function dateLocal() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        defaultValue={dayjs(
          `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`
        )}
      />
    </LocalizationProvider>
  );
}

// filter bar
function customFilterBar({ setFilterElem }) {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton ref={setFilterElem} />
    </GridToolbarContainer>
  );
}

// display circle badge by noted color
function changeBadge(badgeColor) {
  return (
    <Badge>
      <CircleIcon style={{ color: badgeColor }} />
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

// setting column fields for table
const columns = [
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
  { field: 'apptTime', headerName: 'Time', width: 100 },
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
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      return (<div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <Avatar>
            {data.firstName.charAt(0).concat(data.lastName.charAt(0))}
          </Avatar>
        </div>
        <div style={{ float: 'right' }}>
          <Typography>
            {data.lastName}, {data.firstName} ({data.mrn})
          </Typography>
          <Typography color="textSecondary">
            {data.age} years old / {data.gender}
          </Typography>
        </div>
      </div>)
    },
    valueGetter: (params) => {
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      return `${data.lastName || ''}, ${data.firstName || ''} \n (${
        data.mrn
      }) ${data.age} years old / ${data.gender}`
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
    /*valueGetter: (params) => {
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      const data2 = data.encounters.find(x => x.id === params.row.patient.enc)?.concerns[0] ?? ""
      return data2
    },//*/
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
    /*valueGetter: (params) => {
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      const data2 = data.encounters.find(x => x.id === params.row.patient.enc)?.concerns[1] ?? ""
      return data2 // FIXME we need an actual appointment object still but this will do for now
    },//*/
  },
  {
    field: 'fullProviderName',
    headerName: 'Provider Name',
    width: 200,
    valueGetter: (params) => {
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      const data2 = data.encounters.find(x => x.id === params.row.patient.enc)?.provider
      return data2//`${data2.provider.lastName}, ${data2.provider.firstName}`
    },
  },
  { field: 'type', headerName: 'Type', width: 100 },
  {
    field: 'insurName',
    headerName: 'Coverage',
    width: 200,
    valueGetter: (params) => {
      const data = TEST_PATIENT_INFO({ patientMRN: params.row.patient.mrn })
      return `${data.insurance.carrierName}`
    },
  },
];

// takes rows from json file and set columns to make table
export function Schedule() {
  const onHandleClickRoute = useRouter();
  const [open, setOpen] = React.useState(false); // preview checkbox on and off
  const [preview, setPreview] = React.useState(100); // set width of table
  const [hide, setHide] = React.useState(0); // patient info hidden, will incr when checkbox marked
  const [filterElem, setFilterElem] = React.useState(null); // for filter 
  const { enabledEncounters } = useContext(AuthContext); // Access the enabled encounters

  const [selPatient, setPatient] = React.useState(null);

  const patientScheduleClick = (params) => {
    setPatient(params.row);  
  };
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <div>{dateLocal()}</div>
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />
      <div style={{ display: 'inline-block', width: `${preview}%` }}>
        <div style={{ textAlign: 'right' }}>
          <FormControlLabel
            onClick={() => {
              setOpen(!open);
              setPreview(preview === 50 ? 100 : 50);
              setHide(hide === 0 ? 50 : 0);
            }}
            control={<Checkbox />}
            label="Preview"
          />
        </div>
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
            {selPatient ? 
            (<>
              Name: {selPatient.patient.firstName} {selPatient.patient.lastName} <br/>
              Age: {selPatient.patient.age} <br/>
              Gender: {selPatient.patient.gender} <br/>
              CC: {selPatient.cc} <br/>
              Notes: {selPatient.notes}
            </>): 
            <>No Patient Selected.</>
            }
          </Typography>
        )}
        </div>
        <div>
          <DataGrid
            getRowHeight={() => 'auto'}
            rows={appt.appts}
            columns={columns}
            onRowClick={patientScheduleClick}
            onRowDoubleClick={({
              row: {
                patient: { mrn: selectedMRN, enc: selectedEnc },
              },
            }) => {
              if (enabledEncounters[selectedMRN] == null) {
                showNotification('You cannot view this chart because no encounter is associated with this MRN.', 'warning');
                return; // Prevent routing
              }
              //if (!enabledEncounters[selectedMRN].includes(selectedEnc)) {
              //  alert("You cannot view this chart because this encounter is marked CONFIDENTIAL.");
              //  return; // Prevent routing
              //} // FIXME later
              if (!TEST_PATIENT_INFO({ patientMRN: selectedMRN }).encounters.map(x => x.id).includes(selectedEnc)) {
                alert("You cannot view this chart because this encounter DOES NOT EXIST [system error].");
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