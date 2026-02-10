import React, { useEffect, useState } from 'react';
import {
  Collapse,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Box,
  Label,
  IconButton,
  Stack,
  Button,
  Icon,
  RichTextEditor
} from 'components/ui/Core';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';

const Handoff = () => {
  const [departmentsDB] = useDatabase().departments()
  const { useChart, useEncounter } = usePatient();
  const chart = useChart();

  // Wait until chart is loaded
  if (!chart) return null;

  //patient info
  const [patientId] = chart.id();

  // Use useEncounter for persistent data like other components
  const [handoffData, setHandoffData] = useEncounter().handoff({});
  const [currentDepartment, setCurrentDepartment] = useState('');

  // Local state for current department's data
  const [localSummary, setLocalSummary] = useState('');
  const [localTodo, setLocalTodo] = useState('');

  const [showSummary, setShowSummary] = useState(true);
  const [showTodo, setShowTodo] = useState(true);

  // Helper functions for department data management
  const getDepartmentData = (dept) => {
    return handoffData[dept] || { summary: '', todo: '' };
  };

  const saveDepartmentData = (dept, data) => {
    setHandoffData(prev => ({
      ...prev,
      [dept]: data
    }));
  };

  // Load department-specific data when department changes
  useEffect(() => {
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
  useEffect(() => {
    if (!currentDepartment) {
      return;
    }

    const handler = setTimeout(() => {
      const data = {
        summary: localSummary,
        todo: localTodo
      };
      saveDepartmentData(currentDepartment, data);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localSummary, localTodo, currentDepartment]);

  const handleDepartmentChange = (newDepartment) => {
    setCurrentDepartment(newDepartment);
  };

  const handleClose = () => {
    // Close functionality - for now just a placeholder
  };

  const handleCancel = () => {
    // Cancel functionality - for now just a placeholder
  };


  const currentDeptName = departmentsDB.find(d => d.id === currentDepartment)?.name || '';

  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        overflowY: 'auto',
      }}
    >
      {/* Header & Department */}
      <Box
        sx={{
          pb: 1,
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Label variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
          Handoff
        </Label>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={currentDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Department</MenuItem>
            {departmentsDB.map(x => (<MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper', mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => setShowSummary(!showSummary)}
        >
          <Label variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Summary
          </Label>
          <IconButton size="small">
            <Icon>{showSummary ? 'expand_less' : 'expand_more'}</Icon>
          </IconButton>
        </Box>

        <Collapse in={showSummary} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2 }}>
            {/*<RichTextEditor
              placeholder={currentDepartment ? "Enter summary details..." : "Please select a department first"}
              initialContent={localSummary}
              onSave={(e) => setLocalSummary(e)}
            />*/}
            <TextField
              fullWidth
              multiline
              minRows={6}
              maxRows={20}
              variant="outlined"
              value={localSummary}
              onChange={(e) => setLocalSummary(e.target.value)}
              placeholder={currentDepartment ? `Enter summary details for ${currentDeptName}...` : "Please select a department first"}
              disabled={!currentDepartment}
              sx={{
                minHeight: '200px',
                '& .MuiOutlinedInput-root': { borderRadius: 0 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  minWidth: 'auto',
                  padding: 0,
                }}
              >
                History
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* ToDo */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => setShowTodo(!showTodo)}
        >
          <Label variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            To Do
          </Label>
          <IconButton size="small">
            <Icon>{showTodo ? 'expand_less' : 'expand_more'}</Icon>
          </IconButton>
        </Box>

        <Collapse in={showTodo} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              maxRows={20}
              variant="outlined"
              value={localTodo}
              onChange={(e) => setLocalTodo(e.target.value)}
              placeholder={currentDepartment ? `Enter to-do tasks or follow-ups for ${currentDeptName}...` : "Please select a department first"}
              disabled={!currentDepartment}
              sx={{
                minHeight: '200px',
                '& .MuiOutlinedInput-root': { borderRadius: 0 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  minWidth: 'auto',
                  padding: 0,
                }}
              >
                History
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Close / Cancel */}
      <Box flexGrow={0}>
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button variant="outlined" color="success" onClick={handleClose}>
            <Icon>check</Icon> Close
          </Button>
          <Button variant="outlined" color="error" onClick={handleCancel}>
            <Icon>clear</Icon> Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Handoff;


