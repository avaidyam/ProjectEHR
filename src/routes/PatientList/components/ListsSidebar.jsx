import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Icon, TreeView } from 'components/ui/Core.jsx';
import { usePatientLists } from 'components/contexts/PatientListContext.jsx';
import patient_sample from 'util/data/patient_sample.json';

const ExpandMoreIcon = () => <Icon>expand_more</Icon>
const ChevronRightIcon = () => <Icon>chevron_right</Icon>

// TODO: Remove this once we have a real list
const transformPatientData = (patients) => {
  // Randomly assign patients to primary care or specialist
  const primaryCarePatients = Object.values(patients).filter(patient => patient.PCP?.role === 'Primary Care Physician');
  const specialistPatients = Object.values(patients).filter(patient => patient.PCP?.role !== 'Primary Care Physician');
  const recentEncounterPatients = Object.values(patients).filter(patient => {
    const hasRecentEncounter = Object.values(patient.encounters).some(encounter => {
      const encounterDate = new Date(encounter.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return encounterDate >= thirtyDaysAgo;
    });
    return hasRecentEncounter;
  });

  const transformPatient = (patient) => {
    // Get the most recent encounter
    const latestEncounter = Object.values(patient.encounters).reduce((latest, current) => {
      return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
    }, Object.values(patient.encounters)[0]);

    return {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      mrn: patient.id,
      dob: patient.birthdate,
      location: patient.address || 'Carle Foundation Hospital',
      age: new Date(patient.birthdate).age(),
      sex: patient.gender,
      insuranceType: patient.insurance?.carrierName || 'Unknown',
      attendingMD: latestEncounter?.provider || 'Not Assigned',
      status: latestEncounter?.status || 'No encounters',
      bedStatus: Math.random() > 0.5 ? 'In Room' : 'Out of Room',
      admissionDate: latestEncounter?.startDate?.split(' ')[0] || 'N/A',
      dischargeDate: latestEncounter?.endDate?.split(' ')[0] || 'N/A',
      patientClass: latestEncounter?.type || 'N/A',
      roomNumber: Math.random() > 0.5 ? '123' : '456',
      visitReason: latestEncounter?.concerns?.[0] || 'N/A',
      encounterData: latestEncounter ? {
        patientId: patient.id,
        encounterId: latestEncounter.id
      } : null
    };
  };

  // TODO: Look into re-ordering best practices
  return [
    {
      id: 'my-1',
      name: 'Primary Care Patients',
      type: 'my',
      patients: primaryCarePatients.map(transformPatient),
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
      name: 'Recent Encounters (30 days)',
      type: 'my',
      patients: recentEncounterPatients.map(transformPatient),
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
      name: 'Specialist Patients',
      type: 'available',
      patients: specialistPatients.map(transformPatient),
      columns: [
        { id: 'name', label: 'Patient Name', selected: true, order: 0 },
        { id: 'mrn', label: 'MRN', selected: true, order: 1 },
        { id: 'dob', label: 'Date of Birth', selected: true, order: 2 },
        { id: 'location', label: 'Location', selected: true, order: 3 },
        { id: 'status', label: 'Status', selected: true, order: 4 },
      ],
    },
  ];
};

const initialLists = transformPatientData(patient_sample);

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { lists, setLists } = usePatientLists();
  const selectedListId = searchParams.get('listId');
  const [expandedItems, setExpandedItems] = useState(['my-lists', 'available-lists']);

  useEffect(() => {
    if (lists.length === 0) {
      setLists(initialLists);
    }
  }, [lists.length, setLists]);

  const handleItemClick = (event, itemId) => {
    if (itemId !== 'my-lists' && itemId !== 'available-lists') {
      setSearchParams({ listId: itemId });
    }
  };

  const handleExpansionChange = (_event, nodeIds) => {
    setExpandedItems(nodeIds);
  };

  return (
    <Box paper
      variant='outlined'
      sx={{
        minWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TreeView rich
        items={createTreeItems(lists)}
        slots={{
          expandIcon: ChevronRightIcon,
          collapseIcon: ExpandMoreIcon,
        }}
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpansionChange}
        selectedItems={selectedListId ? [selectedListId] : []}
        onItemClick={handleItemClick}
        disableSelection
        sx={{
          p: 1,
          flex: 1,
          overflowY: 'auto',
        }}
      />
    </Box>
  );
};
