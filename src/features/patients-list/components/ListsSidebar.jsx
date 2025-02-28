import { Paper } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import {
  usePatientLists
} from '../../../routes/app/patients-list';

// Mock data - in a real app, this would come from an API
const initialLists = [
  {
    id: 'my-1',
    name: 'Primary Care Patients',
    type: 'my',
    patients: [
      {
        id: '1',
        name: 'John Doe',
        mrn: 'MRN001',
        dob: '1980-01-01',
        location: 'Room 101',
        status: 'Admitted',
      },
      {
        id: '2',
        name: 'Jane Smith',
        mrn: 'MRN002',
        dob: '1975-03-15',
        location: 'Room 102',
        status: 'Discharged',
      },
    ],
    columns: [
      { id: 'name', label: 'Patient Name', selected: true, order: 0 },
      { id: 'mrn', label: 'MRN', selected: true, order: 1 },
      { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
      { id: 'location', label: 'Location', selected: true, order: 3 },
      { id: 'status', label: 'Status', selected: true, order: 4 },
    ],
  },
  {
    id: 'my-2',
    name: "Today's Appointments",
    type: 'my',
    patients: [
      {
        id: '3',
        name: 'Bob Johnson',
        mrn: 'MRN003',
        dob: '1990-07-22',
        location: 'Room 201',
        status: 'Admitted',
      },
    ],
    columns: [
      { id: 'name', label: 'Patient Name', selected: true, order: 0 },
      { id: 'mrn', label: 'MRN', selected: true, order: 1 },
      { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
      { id: 'location', label: 'Location', selected: true, order: 3 },
      { id: 'status', label: 'Status', selected: true, order: 4 },
    ],
  },
  {
    id: 'available-1',
    name: 'Emergency Department',
    type: 'available',
    patients: [
      {
        id: '4',
        name: 'Alice Brown',
        mrn: 'MRN004',
        dob: '1988-12-10',
        location: 'ED Bay 1',
        status: 'Waiting',
      },
      {
        id: '5',
        name: 'Charlie Davis',
        mrn: 'MRN005',
        dob: '1995-06-25',
        location: 'ED Bay 2',
        status: 'In Treatment',
      },
    ],
  },
  {
    id: 'available-2',
    name: 'Inpatient Ward',
    type: 'available',
    patients: [
      {
        id: '6',
        name: 'Eve Franklin',
        mrn: 'MRN006',
        dob: '1970-03-30',
        location: 'Room 301',
        status: 'Admitted',
      },
    ],
  },
];

const createTreeItems = (lists) => {
  const myLists = lists.filter((list) => list.type === 'my');
  const availableLists = lists.filter((list) => list.type === 'available');

  return [
    {
      id: 'my-lists',
      label: 'My Lists',
      children: myLists.map((list) => ({
        id: list.id,
        label: list.name,
      })),
    },
    {
      id: 'available-lists',
      label: 'Available Lists',
      children: availableLists.map((list) => ({
        id: list.id,
        label: list.name,
      })),
    },
  ];
};

export const ListsSidebar = () => {
  const { selectedListId, setSelectedListId, lists, setLists } = usePatientLists();

  useEffect(() => {
    if (lists.length === 0) {
      setLists(initialLists);
    }
  }, [lists.length, setLists]);

  const handleSelectionChange = (
    _event,
    itemId,
    isSelected
  ) => {
    if (itemId !== 'my-lists' && itemId !== 'available-lists') {
      if (isSelected) {
        setSelectedListId(itemId);
      } else {
        setSelectedListId(null);
      }
    }
  };

  return (
    <Paper
      variant='outlined'
      sx={{
        width: 280,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <RichTreeView
        items={createTreeItems(lists)}
        slots={{
          expandIcon: ChevronRightIcon,
          collapseIcon: ExpandMoreIcon,
        }}
        expandedItems={['my-lists', 'available-lists']}
        selectedItems={selectedListId || null}
        onItemSelectionToggle={handleSelectionChange}
        multiSelect={false}
        sx={{
          p: 1,
          flex: 1,
          overflowY: 'auto',
        }}
      />
    </Paper>
  );
};
