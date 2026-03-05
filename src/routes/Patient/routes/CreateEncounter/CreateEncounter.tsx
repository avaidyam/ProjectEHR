import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Window, Autocomplete, DateTimePicker } from '../../../../components/ui/Core';
import { DepartmentSelectField, SpecialtySelectField, ProviderSelectField } from '../../../../components/ui/DataUI';
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
    startDate: Temporal.Now.plainDateTimeISO().toZonedDateTime('UTC').toInstant(),
    endDate: Temporal.Now.plainDateTimeISO().add({ minutes: 30 }).toZonedDateTime('UTC').toInstant(),
    department: '',
    type: 'Office Visit',
    provider: '',
    specialty: '',
    status: 'Scheduled'
  } as any) // FIXME

  const handleSubmit = () => {
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
          family: [],
          familyStatus: []
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

  return (
    <Window
      open={open}
      onClose={onClose}
      title="Create New Encounter"
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </Box>
      }
      fullWidth
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <DateTimePicker
          fullWidth
          convertString
          label="Start Date/Time"
          value={formData.startDate}
          onChange={(date) => setFormData(prev => ({ ...prev, startDate: date.toString() }))}
        />
        <DateTimePicker
          fullWidth
          convertString
          label="End Date/Time"
          value={formData.endDate}
          onChange={(date) => setFormData(prev => ({ ...prev, endDate: date.toString() }))}
        />
        <DepartmentSelectField
          value={formData.department}
          onChange={(id) => setFormData(prev => ({ ...prev, department: id || '' as Database.Department.ID }))}
        />
        <Autocomplete
          label="Type"
          options={Object.values(Database.Encounter.VisitType)}
          value={formData.type}
          onChange={(_e, newValue) => setFormData(prev => ({ ...prev, type: newValue ?? Database.Encounter.VisitType.OfficeVisit }))}
        />
        <SpecialtySelectField
          value={formData.specialty}
          onChange={(val) => setFormData(prev => ({ ...prev, specialty: val || '' as Database.Specialty }))}
        />
        <ProviderSelectField
          departmentIds={formData.department ? [formData.department] : []}
          value={formData.provider}
          onChange={(id) => setFormData(prev => ({ ...prev, provider: id || '' as Database.Provider.ID }))}
        />
      </Box>
    </Window>
  );
};
