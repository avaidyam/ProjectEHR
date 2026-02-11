import * as React from 'react';
import { Stack, Button, Label, Window } from 'components/ui/Core';
import { usePatientLists } from 'components/contexts/PatientListContext';

export const AddToListModal = ({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: any;
}) => {
  const { lists, setLists } = usePatientLists();
  const userLists = lists.filter((list: any) => list.type === 'my');

  const handleAddToList = (targetList: any) => {
    // Check if patient is already in the list
    if (targetList.patients.some((p: any) => p.id === patient.id)) {
      return;
    }

    // Add patient to the selected list
    setLists((prevLists: any[]) =>
      prevLists.map((list: any) =>
        list.id === targetList.id
          ? { ...list, patients: [...list.patients, patient] }
          : list
      )
    );

    onClose();
  };

  return (
    <Window title="Add Patient to List" open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <Label variant='subtitle1' gutterBottom>
        Select a list to add {patient.name}
      </Label>
      <Stack direction="column" spacing={1} sx={{ p: 1 }}>
        {userLists.map((list: any) => (
          <Stack direction="row" key={list.id}>
            <Button
              fullWidth
              onClick={() => handleAddToList(list)}
              disabled={list.patients.some((p: any) => p.id === patient.id)}
              sx={{ textTransform: 'none', justifyContent: "space-between" }}
            >
              <Label>{list.name}</Label>
              <Label variant="subtitle2">{
                list.patients.some((p: any) => p.id === patient.id)
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
