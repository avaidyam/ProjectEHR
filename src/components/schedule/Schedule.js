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
// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React from 'react';

import { useRouter } from '../../util/urlHelpers.js';

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
      // colors subject to change based on our future color theming
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
    renderCell: (params) => (
      <div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <Avatar>
            {params.row.patient.firstName.charAt(0).concat(params.row.patient.lastName.charAt(0))}
          </Avatar>
        </div>
        <div style={{ float: 'right' }}>
          <Typography>
            {params.row.patient.lastName}, {params.row.patient.firstName} ({params.row.patient.mrn})
          </Typography>
          <Typography color="textSecondary">
            {params.row.patient.age} years old / {params.row.patient.gender}
          </Typography>
        </div>
      </div>
    ),
    valueGetter: (params) =>
      `${params.row.patient.lastName || ''}, ${params.row.patient.firstName || ''} \n (${
        params.row.patient.mrn
      }) ${params.row.patient.age} years old / ${params.row.patient.gender}` /*
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value}</span>
      </Tooltip>
    ), */,
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
  },
  {
    field: 'fullProviderName',
    headerName: 'Provider Name',
    width: 200,
    valueGetter: (params) => `${params.row.provider.lastName}, ${params.row.provider.firstName}`,
  },
  { field: 'type', headerName: 'Type', width: 100 },
  {
    field: 'insurName',
    headerName: 'Coverage',
    width: 200,
    valueGetter: (params) => `${params.row.patient.insurName}`,
  },
];

// takes rows from json file and set columns to make table
export function Schedule() {
  const onHandleClickRoute = useRouter();


  const [open, setOpen] = React.useState(false); // preview checkbox on and off
  const [preview, setPreview] = React.useState(100); // set width of table
  const [hide, setHide] = React.useState(0); // patient info hidden, will incr when checkbox marked
  const [filterElem, setFilterElem] = React.useState(null); // for filter 
  return (
    <Box /* for future formatting if needed
      sx={{
        '#rightpanel': {
          display: 'none',
        },
        
        '& .scheduled': {
          color: '#3299ff',
        },
        '& .arrived': {
          backgroundColor: '#ff943975',
        }, 
      }} */
    >
      <div>{dateLocal()}</div>
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
          <DataGrid
            getRowHeight={() => 'auto'}
            rows={appt.appts}
            columns={columns}
            onRowDoubleClick={({
              row: {
                patient: { mrn: selectedMRN },
              },
            }) => onHandleClickRoute(`patient/${selectedMRN}`)}
            /* not needed for now
          getRowClassName={(params) => {
            if (params.row.officeStatus === 'Scheduled') {
              return 'scheduled';
            }
            return '';
          }} */
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
