import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Window, Autocomplete, DateTimePicker } from '../../../../components/ui/Core';
import { useDatabase } from '../../../../components/contexts/PatientContext';
import * as Database from '../../../../components/contexts/Database';

export interface EncounterFormData {
  startDate: Database.JSONDate;
  endDate: Database.JSONDate;
  department: Database.Department.ID;
  type: Database.Encounter.VisitType;
  provider: Database.Provider.ID;
  specialty: Database.Specialty;
  status: Database.Encounter.Status;
}

export const CreateEncounter = ({
  open,
  onClose,
  departments,
  providers
}: {
  open: boolean
  onClose: () => void
  departments: Database.Department[]
  providers: Database.Provider[]
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setPatientsDB] = useDatabase().patients();
  const [formData, setFormData] = React.useState<EncounterFormData>({
    startDate: Temporal.Now.plainDateTimeISO(), // Default to now
    endDate: Temporal.Now.plainDateTimeISO().add({ minutes: 30 }), // Default +30m
    department: '',
    type: 'Office Visit',
    provider: '',
    specialty: '',
    status: 'Scheduled'
  } as any) // FIXME

  const handleChange = (field: keyof EncounterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.department || !formData.provider) {
      alert("Please fill in Department and Provider");
      return;
    }

    const match = location.pathname.match(/^\/patient\/(\d+)/);
    if (!match) {
      alert("You must be on a patient chart to create an encounter.");
      return;
    }
    const mrn = match[1];
    const newID = Database.Encounter.ID.create();

    setPatientsDB((prev: Record<string, Database.Patient>) => {
      const patient = prev[mrn];
      if (!patient) return prev;

      const newEncounter: Database.Encounter = {
        id: newID,
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        status: formData.status,
        department: formData.department,
        specialty: formData.specialty,
        provider: formData.provider,
        concerns: [],
        problems: [],
        flowsheets: [],
        notes: [],
        history: {
          medical: [],
          surgical: [],
          family: []
        },
        immunizations: [],
        orders: []
      };

      return {
        ...prev,
        [mrn]: {
          ...patient,
          encounters: {
            ...patient.encounters,
            [newEncounter.id]: newEncounter
          }
        }
      };
    });

    onClose();
    navigate(`/patient/${mrn}/encounter/${newID}`);
  };

  const footer = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
      <Button variant="outlined" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleSubmit}>
        Create
      </Button>
    </Box>
  );

  return (
    <Window
      open={open}
      onClose={onClose}
      title="Create New Encounter"
      footer={footer}
      fullWidth
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <DateTimePicker
          convertString
          label="Start Date/Time"
          value={formData.startDate as any}
          onChange={(date: any) => handleChange('startDate', date)}
        />

        <DateTimePicker
          convertString
          label="End Date/Time"
          value={formData.endDate as any}
          onChange={(date: any) => handleChange('endDate', date)}
        />

        <Autocomplete
          label="Department"
          options={departments?.map(d => d.name) ?? []}
          value={formData.department as string}
          onChange={(_e, newValue) => handleChange('department', newValue || '')}
        />

        <Autocomplete
          label="Type"
          options={Object.values(Database.Encounter.VisitType)}
          value={formData.type}
          onChange={(_e, newValue) => handleChange('type', newValue || 'Office Visit')}
        />

        <Autocomplete
          freeSolo
          label="Specialty"
          options={['Internal Medicine', 'Family Medicine', 'Pediatrics', 'Obstetrics and Gynecology', 'Cardiology', 'Dermatology', 'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics', 'Psychiatry', 'Surgery']}
          value={formData.specialty}
          onChange={(_e, newValueArg) => handleChange('specialty', newValueArg || '')}
          onInputChange={(_e, newInputValue) => handleChange('specialty', newInputValue)}
        />

        <Autocomplete
          label="Provider"
          options={providers
            ?.filter(prov => {
              if (!formData.department) return true;
              const selectedDept = departments.find(d => d.name === formData.department);
              return selectedDept ? prov.department === selectedDept.id : true;
            })
            .map(p => p.name) ?? []}
          value={formData.provider as string}
          onChange={(_e, newValue) => handleChange('provider', newValue || '')}
        />
      </Box>
    </Window>
  );
};
