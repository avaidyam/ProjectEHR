import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  TextField,
  IconButton,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  colors,
  Icon,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const Handoff = () => {
  const { useChart } = usePatient();
  const chart = useChart();

  // Wait until chart is loaded
  if (!chart) return null;

  // ===== Ensure smartData.handoff structure exists =====
  if (!chart.smartData) chart.smartData = {};
  if (!chart.smartData.handoff) chart.smartData.handoff = {};

  // // Initialize missing Teaful stores once
  // if (!chart.smartData.handoff.summary) chart.smartData.handoff.summary = chart.useStore('');
  // if (!chart.smartData.handoff.todo) chart.smartData.handoff.todo = chart.useStore('');
  // if (!chart.smartData.handoff.department) chart.smartData.handoff.department = chart.useStore('');

    // Teaful stores are initialized
  chart.smartData.handoff.summary ??= chart.useStore('');
  chart.smartData.handoff.todo ??= chart.useStore('');
  chart.smartData.handoff.department ??= chart.useStore('');

   //patient info
  const [patientId] = chart.id();
  const [firstName] = chart.firstName();
  const [lastName] = chart.lastName();

  // Teaful stores
  const [summary, setSummary] = chart.smartData.handoff.summary();
  const [todo, setTodo] = chart.smartData.handoff.todo();
  const [department, setDepartment] = chart.smartData.handoff.department();

  const [localSummary, setLocalSummary] = useState(summary);
  const [localTodo, setLocalTodo] = useState(todo);
  const [localDepartment, setLocalDepartment] = useState(department || '');

  const [showSummary, setShowSummary] = useState(true);
  const [showTodo, setShowTodo] = useState(true);

  // Expand sections if they have content
  useEffect(() => {
    if (summary?.trim()) setShowSummary(true);
    if (todo?.trim()) setShowTodo(true);
  }, [summary, todo]);

 // auto save
  useEffect(() => {
    const handler = setTimeout(() => {
      setSummary(localSummary);
      setTodo(localTodo);
      setDepartment(localDepartment);
      console.log('💾 Autosaved handoff for patient:', patientId);
    }, 1000);
    return () => clearTimeout(handler);
  }, [localSummary, localTodo, localDepartment]);

  const handleSave = () => {
  if (!localDepartment || localDepartment === '') {
    alert('Please select a department.');
  }
  setSummary(localSummary);
  setTodo(localTodo);
  setDepartment(localDepartment);
};

  const handleCancel = () => {
    setLocalSummary(summary);
    setLocalTodo(todo);
    setLocalDepartment(department || '');
  };

  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100',
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
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: colors.grey[900] }}>
          {lastName}, {firstName}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
          <Select
            value={localDepartment}
            onChange={(e) => setLocalDepartment(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Department</MenuItem>
            <MenuItem value="Adult Medicine">Adult Medicine</MenuItem>
            <MenuItem value="Emergency Department">Emergency Department</MenuItem>
            <MenuItem value="Cardiology">Cardiology</MenuItem>
            <MenuItem value="Internal Medicine">Internal Medicine</MenuItem>
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
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.blue[500] }}>
            Summary
          </Typography>
          <IconButton size="small">{showSummary ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </Box>

        <Collapse in={showSummary} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              maxRows={20}
              variant="outlined"
              value={localSummary}
              onChange={(e) => setLocalSummary(e.target.value)}
              placeholder="Enter summary details..."
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 0 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                sx={{
                  color: colors.blue[500],
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
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.blue[500] }}>
            To Do
          </Typography>
          <IconButton size="small">{showTodo ? <ExpandLess /> : <ExpandMore />}</IconButton>
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
              placeholder="Enter to-do tasks or follow-ups..."
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 0 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                sx={{
                  color: colors.blue[500],
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

      {/* Save / Cancel */}
      <Box flexGrow={0}>
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button variant="outlined" color="success" onClick={handleSave}>
            <Icon>check</Icon> Save
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


