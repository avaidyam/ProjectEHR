import * as React from 'react';
import { Box, Label, Stack, Button, Autocomplete, RichTextEditor } from 'components/ui/Core';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import * as Database from 'components/contexts/Database';

interface HandoffDeptData {
  summary: string;
  todo: string;
}

interface HandoffData {
  [key: string]: HandoffDeptData;
}

export const Handoff: React.FC = () => {
  const [departmentsDB] = useDatabase().departments()
  const { useEncounter } = usePatient();
  const [] = useEncounter().smartData({} as any) // FIXME: force-init smartData object if null
  const [handoffData, setHandoffData] = useEncounter().smartData.handoff({});
  const [currentDepartment, setCurrentDepartment] = React.useState<string>('');

  // Local state for current department's data
  const [localSummary, setLocalSummary] = React.useState<string>('');
  const [localTodo, setLocalTodo] = React.useState<string>('');

  // Helper functions for department data management
  const getDepartmentData = (dept: string): HandoffDeptData => {
    return (handoffData as HandoffData)?.[dept] || { summary: '', todo: '' };
  };

  const saveDepartmentData = (dept: string, data: HandoffDeptData) => {
    setHandoffData((prev: HandoffData | undefined) => ({
      ...(prev || {}),
      [dept]: data
    }));
  };

  // Load department-specific data when department changes
  React.useEffect(() => {
    if (currentDepartment) {
      const data = getDepartmentData(currentDepartment);
      setLocalSummary(data.summary);
      setLocalTodo(data.todo);
    } else {
      setLocalSummary('');
      setLocalTodo('');
    }
  }, [currentDepartment, handoffData]);

  // Auto-save when local data changes (only if department is selected)
  React.useEffect(() => {
    if (!currentDepartment) {
      return;
    }

    const handler = setTimeout(() => {
      const data: HandoffDeptData = {
        summary: localSummary,
        todo: localTodo
      };
      saveDepartmentData(currentDepartment, data);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localSummary, localTodo, currentDepartment]);

  const handleDepartmentChange = (newDepartment: string) => {
    setCurrentDepartment(newDepartment);
  };

  const currentDeptName = departmentsDB.find((d: Database.Department) => d.id === currentDepartment)?.name || '';

  return (
    <Stack spacing={3} sx={{ height: '100%', overflow: 'hidden', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Label variant="h6">Handoff</Label>
        <Autocomplete
          label="Select Department"
          size="small"
          sx={{ width: 250 }}
          options={departmentsDB}
          getOptionLabel={(option: Database.Department) => option.name}
          value={departmentsDB.find((d: Database.Department) => d.id === currentDepartment) || null}
          onChange={(_, newValue) => handleDepartmentChange(newValue?.id || '')}
        />
      </Stack>
      <Stack spacing={1} flex={1} sx={{ overflow: 'hidden' }}>
        <Label variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Summary</Label>
        <RichTextEditor
          key={`summary-${currentDepartment}`}
          editable={!!currentDepartment}
          placeholder={currentDepartment ? `Enter summary details for ${currentDeptName}...` : "Please select a department first"}
          initialContent={localSummary}
          onUpdate={setLocalSummary}
          disableStickyFooter
          sx={{ height: "100%", overflow: "auto" }}
        />
      </Stack>
      <Stack spacing={1} flex={1} sx={{ overflow: 'hidden' }}>
        <Label variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>To Do</Label>
        <RichTextEditor
          key={`todo-${currentDepartment}`}
          editable={!!currentDepartment}
          placeholder={currentDepartment ? `Enter to-do tasks or follow-ups for ${currentDeptName}...` : "Please select a department first"}
          initialContent={localTodo}
          onUpdate={setLocalTodo}
          disableStickyFooter
          sx={{ height: "100%", overflow: "auto" }}
        />
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" color="success" onClick={() => { }}>Close</Button>
        <Button variant="outlined" color="error" onClick={() => { }}>Cancel</Button>
      </Stack>
    </Stack>
  );
};
