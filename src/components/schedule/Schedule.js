import CircleIcon from '@mui/icons-material/Circle';
// for badges/icons
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
// for tables
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';

// json data
import appt from './schedule.json';

// date
// function dateLocal() {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <DemoContainer components={['DatePicker']}>
//         <DatePicker label="Basic date picker" />
//       </DemoContainer>
//     </LocalizationProvider>
//   );
// }

// display circle
function StatusBadge() {
  return (
    <Badge color="primary">
      <CircleIcon />
    </Badge>
  );
}

// setting column fields for table
const columns = [
  {
    field: '',
    headerName: '',
    sortable: false,
    width: 50,
    renderCell: (/** params */) => {
      return <StatusBadge />;
    },
  },
  { field: 'apptTime', headerName: 'Time', width: 100 },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    valueGetter: (params) => `${params.row.officeStatus || ''} ${params.row.ptStatus || ''}`,
  },
  {
    field: 'fullName',
    headerName: 'Patient Name/MRN/Age/Gender',
    // sortable: false,
    width: 250,
    valueGetter: (params) =>
      `${params.row.patient.lastName || ''}, ${params.row.patient.firstName || ''} \n (${
        params.row.patient.mrn
      }) ${params.row.patient.age} years old / ${params.row.patient.gender}`,
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value}</span>
      </Tooltip>
    ),
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
    field: 'eventStatus',
    headerName: 'Event Status',
    width: 100,
  },
  {
    field: 'fullProviderName',
    headerName: 'Provider Name',
    width: 200,
    valueGetter: (params) => `${params.row.provider.lastName}, ${params.row.provider.firstName}`,
  },

  {
    field: 'fullPCPName',
    headerName: 'PCP',
    width: 200,
    valueGetter: (params) =>
      `${params.row.pcp.lastName}, ${params.row.pcp.firstName} ${params.row.pcp.middleName}`,
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
export default function Schedule() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        getRowHeight={() => 'auto'}
        rows={appt.appts}
        columns={columns}
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
  );
}
