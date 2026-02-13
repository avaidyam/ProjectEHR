import * as React from 'react';
import { Stack, Button, Label, Window } from 'components/ui/Core';
import { Database } from 'components/contexts/PatientContext';

export const AddToListModal = ({
  open,
  onClose,
  patient,
  lists,
  setLists,
}: {
  open: boolean;
  onClose: () => void;
  patient: Database.Patient;
  lists: Database.PatientList[];
  setLists: (val: Database.PatientList[] | ((prev: Database.PatientList[]) => Database.PatientList[])) => void;
}) => {
  const userLists = lists.filter((list) => list.type === 'my');

  const handleAddToList = (targetList: Database.PatientList) => {
    if (targetList.patients.some((p) => p === patient.id)) {
      return;
    }
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === targetList.id
          ? { ...list, patients: [...list.patients, patient.id] }
          : list
      )
    );
    onClose();
  };

  return (
    <Window title="Add Patient to List" open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <Label variant='subtitle1' gutterBottom>
        Select a list to add {patient.firstName + ' ' + patient.lastName}
      </Label>
      <Stack direction="column" spacing={1} sx={{ p: 1 }}>
        {userLists.map((list) => (
          <Stack direction="row" key={list.id}>
            <Button
              fullWidth
              onClick={() => handleAddToList(list)}
              disabled={list.patients.some((p) => p === patient.id)}
              sx={{ textTransform: 'none', justifyContent: "space-between" }}
            >
              <Label>{list.name}</Label>
              <Label variant="subtitle2">{
                list.patients.some((p) => p === patient.id)
                  ? 'Patient already in list'
                  : undefined
              }</Label>
            </Button>
          </Stack>
        ))}
        {userLists.length === 0 && (
          <Stack direction="row">
            <Label>No lists available</Label>
            <Label variant="subtitle2">Create a new list first</Label>
          </Stack>
        )}
      </Stack>
      <Button onClick={onClose}>Cancel</Button>
    </Window>
  );
};
