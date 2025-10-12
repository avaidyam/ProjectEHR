// // import React, { useState } from 'react';
// // import {
// //   Box,
// //   Typography,
// //   Button,
// //   Stack,
// //   Collapse,
// //   Icon,
// //   IconButton,
// //   colors,
// // } from '@mui/material';
// // import { ExpandMore, ExpandLess } from '@mui/icons-material';
// // import { usePatient } from 'components/contexts/PatientContext.jsx';
// // import { Editor } from 'components/ui/Editor.jsx';

// // const Handoff = () => {
// //   const { useChart } = usePatient();
// //   const chart = useChart();

  // // Patient info (not encounter)
  // const [firstName] = chart.firstName();
  // const [lastName] = chart.lastName();
  // const [patientId] = chart.id(); // Patient-scoped

// //   // Local state only
// //   const [summaryState, setSummaryState] = useState('');
// //   const [todoState, setTodoState] = useState('');
// //   const [showSummary, setShowSummary] = useState(true);
// //   const [showTodo, setShowTodo] = useState(true);

// //   // Actions
// //   const handleSave = () => {
// //     console.log('✅ Saved handoff for patient:', patientId);
// //     console.log('Summary:', summaryState);
// //     console.log('To Do:', todoState);
// //   };

// //   const handleCancel = () => {
// //     setSummaryState('');
// //     setTodoState('');
// //   };

// //   const handleClose = () => {
// //     console.log('Handoff closed for patient:', patientId);
// //   };

// //   return (
// //     <Box
// //       sx={{
// //         height: '95vh',
// //         display: 'flex',
// //         flexDirection: 'column',
// //         bgcolor: 'grey.100',
// //         p: 3,
// //         overflow: 'hidden',
// //       }}
// //     >
// //       {/* ===== Header ===== */}
// //       <Box sx={{ pb: 1, mb: 1 }}>
// //         <Typography
// //           variant="h5"
// //           sx={{
// //             mb: 1,
// //             fontWeight: 'bold',
// //             color: colors.grey[900],
// //           }}
// //         >
// //           {lastName}, {firstName}
// //         </Typography>
// //       </Box>

// //       {/* ===== Summary Box ===== */}
// //       <Box
// //         sx={{
// //           border: 1,
// //           borderColor: 'divider',
// //           borderRadius: 0,
// //           bgcolor: 'background.paper',
// //           mb: 3,
// //           overflow: 'hidden',
// //         }}
// //       >
// //         {/* Header */}
// //         <Box
// //           sx={{
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             bgcolor: 'background.100',
// //             borderBottom: 1,
// //             borderColor: 'divider',
// //             px: 2,
// //             py: 1.5,
// //             cursor: 'pointer',
// //           }}
// //           onClick={() => setShowSummary(!showSummary)}
// //         >
// //           <Typography
// //             variant="h6"
// //             sx={{ fontWeight: 'bold', color: colors.blue[500] }}
// //           >
// //             Summary
// //           </Typography>
// //           <IconButton size="small">
// //             {showSummary ? <ExpandLess /> : <ExpandMore />}
// //           </IconButton>
// //         </Box>

// //         {/* Collapsible Editor */}
// //         <Collapse in={showSummary} timeout="auto" unmountOnExit>
// //           <Box sx={{ p: 0 }}>
// //             <Editor
// //               initialContent={summaryState}
// //               onSave={setSummaryState}
// //               placeholder="Enter summary details..."
// //             />
// //           </Box>
// //         </Collapse>
// //       </Box>

// //       {/* ===== To Do Box ===== */}
// //       <Box
// //         sx={{
// //           border: 1,
// //           borderColor: 'divider',
// //           borderRadius: 0,
// //           bgcolor: 'background.paper',
// //           mb: 3,
// //           overflow: 'hidden',
// //         }}
// //       >
// //         {/* Header */}
// //         <Box
// //           sx={{
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between',
// //             bgcolor: 'background.100',
// //             borderBottom: 1,
// //             borderColor: 'divider',
// //             px: 2,
// //             py: 1.5,
// //             cursor: 'pointer',
// //           }}
// //           onClick={() => setShowTodo(!showTodo)}
// //         >
// //           <Typography
// //             variant="h6"
// //             sx={{ fontWeight: 'bold', color: colors.blue[500] }}
// //           >
// //             To Do
// //           </Typography>
// //           <IconButton size="small">
// //             {showTodo ? <ExpandLess /> : <ExpandMore />}
// //           </IconButton>
// //         </Box>

// //         {/* Collapsible Editor */}
// //         <Collapse in={showTodo} timeout="auto" unmountOnExit>
// //           <Box sx={{ p: 0 }}>
// //             <Editor
// //               initialContent={todoState}
// //               onSave={setTodoState}
// //               placeholder="Enter to-do tasks or follow-ups..."
// //             />
// //           </Box>
// //         </Collapse>
// //       </Box>

// //       {/* ===== Buttons ===== */}
// //       <Box flexGrow={0}>
// //         <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
// //           <Button variant="outlined" color="success" onClick={handleSave}>
// //             <Icon>check</Icon>Save
// //           </Button>
// //           <Button variant="outlined" color="error" onClick={handleCancel}>
// //             <Icon>clear</Icon>Cancel
// //           </Button>
// //         </Stack>
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default Handoff;
// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Button,
//   Stack,
//   Collapse,
//   Icon,
//   IconButton,
//   colors,
// } from '@mui/material';
// import { ExpandMore, ExpandLess } from '@mui/icons-material';
// import { usePatient } from 'components/contexts/PatientContext.jsx';
// import { Editor } from 'components/ui/Editor.jsx';

// const Handoff = () => {
//   const { useChart } = usePatient();
//   const chart = useChart();

//   const [firstName] = chart.firstName();
//   const [lastName] = chart.lastName();
//   const [patientId] = chart.id();

//   const [summaryState, setSummaryState] = useState('');
//   const [todoState, setTodoState] = useState('');
//   const [showSummary, setShowSummary] = useState(true);
//   const [showTodo, setShowTodo] = useState(true);

//   const handleSave = () => {
//     console.log('✅ Saved handoff for patient:', patientId);
//     console.log('Summary:', summaryState);
//     console.log('To Do:', todoState);
//     // TODO: save to backend or context here
//   };

//   const handleCancel = () => {
//     setSummaryState('');
//     setTodoState('');
//   };

//   return (
//     <Box
//       sx={{
//         height: '95vh',
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: 'grey.100',
//         p: 3,
//         overflow: 'hidden',
//       }}
//     >
//       <Box sx={{ pb: 1, mb: 1 }}>
//         <Typography
//           variant="h5"
//           sx={{ mb: 1, fontWeight: 'bold', color: colors.grey[900] }}
//         >
//           {lastName}, {firstName}
//         </Typography>
//       </Box>

//       {/* ===== Summary Box ===== */}
//       <Box
//         sx={{
//           border: 1,
//           borderColor: 'divider',
//           borderRadius: 0,
//           bgcolor: 'background.paper',
//           mb: 3,
//         }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             bgcolor: 'background.100',
//             borderBottom: 1,
//             borderColor: 'divider',
//             px: 2,
//             py: 1.5,
//             cursor: 'pointer',
//           }}
//           onClick={() => setShowSummary(!showSummary)}
//         >
//           <Typography
//             variant="h6"
//             sx={{ fontWeight: 'bold', color: colors.blue[500] }}
//           >
//             Summary
//           </Typography>
//           <IconButton size="small">
//             {showSummary ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         <Collapse in={showSummary} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 0 }}>
//             <Editor
//               value={summaryState}
//               onChange={setSummaryState}
//               placeholder="Enter summary details..."
//             />
//           </Box>
//         </Collapse>
//       </Box>

//       {/* ===== To Do Box ===== */}
//       <Box
//         sx={{
//           border: 1,
//           borderColor: 'divider',
//           borderRadius: 0,
//           bgcolor: 'background.paper',
//           mb: 3,
//         }}
//       >
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             bgcolor: 'background.100',
//             borderBottom: 1,
//             borderColor: 'divider',
//             px: 2,
//             py: 1.5,
//             cursor: 'pointer',
//           }}
//           onClick={() => setShowTodo(!showTodo)}
//         >
//           <Typography
//             variant="h6"
//             sx={{ fontWeight: 'bold', color: colors.blue[500] }}
//           >
//             To Do
//           </Typography>
//           <IconButton size="small">
//             {showTodo ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         <Collapse in={showTodo} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 0 }}>
//             <Editor
//               value={todoState}
//               onChange={setTodoState}
//               placeholder="Enter to-do tasks or follow-ups..."
//             />
//           </Box>
//         </Collapse>
//       </Box>

//       {/* ===== Buttons ===== */}
//       <Box flexGrow={0}>
//         <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
//           <Button variant="outlined" color="success" onClick={handleSave}>
//             <Icon>check</Icon>Save
//           </Button>
//           <Button variant="outlined" color="error" onClick={handleCancel}>
//             <Icon>clear</Icon>Cancel
//           </Button>
//         </Stack>
//       </Box>
//     </Box>
//   );
// };

// export default Handoff;


//fix save button 
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Collapse,
//   TextField,
//   IconButton,
//   colors,
//   Stack,
//   Button,
//   Icon,
// } from '@mui/material';
// import { ExpandMore, ExpandLess } from '@mui/icons-material';
// import { usePatient } from 'components/contexts/PatientContext.jsx';

// const Handoff = () => {
//   const { useChart } = usePatient();
//   const chart = useChart();

//   // Patient info (not encounter)
//   const [firstName] = chart.firstName();
//   const [lastName] = chart.lastName();
//   const [patientId] = chart.id();

//   // ===== Initialize Teaful-backed smartdata.handoff =====
//   if (!chart.smartData) chart.smartData = {};
//   if (!chart.smartData.handoff) chart.smartData.handoff = {};

//   if (!chart.smartData.handoff.summary) chart.smartData.handoff.summary = chart.useStore('');
//   if (!chart.smartData.handoff.todo) chart.smartData.handoff.todo = chart.useStore('');

//   const [summary, setSummary] = chart.smartData.handoff.summary();
//   const [todo, setTodo] = chart.smartData.handoff.todo();

//   // ===== Local state for editing (supports Cancel/Save) =====
//   const [localSummary, setLocalSummary] = useState(summary);
//   const [localTodo, setLocalTodo] = useState(todo);

//   // UI-only state for collapsible sections
//   const [showSummary, setShowSummary] = useState(true);
//   const [showTodo, setShowTodo] = useState(true);

//   // Automatically expand sections if they already contain content
//   useEffect(() => {
//     if (summary && summary.trim().length > 0) setShowSummary(true);
//     if (todo && todo.trim().length > 0) setShowTodo(true);
//   }, [summary, todo]);

//   // ===== Actions =====
//   const handleSave = () => {
//     setSummary(localSummary);
//     setTodo(localTodo);
//     console.log('✅ Saved handoff for patient:', patientId);
//     console.log('Summary:', localSummary);
//     console.log('To Do:', localTodo);
//   };

//   const handleCancel = () => {
//     setLocalSummary(summary);
//     setLocalTodo(todo);
//   };

//   return (
//     <Box
//       sx={{
//         height: '95vh',
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: 'grey.100',
//         p: 3,
//         overflowY: 'auto',
//       }}
//     >
//       {/* ===== Header ===== */}
//       <Box sx={{ pb: 1, mb: 1 }}>
//         <Typography
//           variant="h5"
//           sx={{ mb: 1, fontWeight: 'bold', color: colors.grey[900] }}
//         >
//           {lastName}, {firstName}
//         </Typography>
//       </Box>

//       {/* ===== Summary Box ===== */}
//       <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper', mb: 3 }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             bgcolor: 'background.paper',
//             borderBottom: 1,
//             borderColor: 'divider',
//             px: 2,
//             py: 1.5,
//             cursor: 'pointer',
//           }}
//           onClick={() => setShowSummary(!showSummary)}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.blue[500] }}>
//             Summary
//           </Typography>
//           <IconButton size="small">
//             {showSummary ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         {/* Collapsible TextField */}
//         <Collapse in={showSummary} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 2 }}>
//             <TextField
//               fullWidth
//               multiline
//               minRows={6}
//               maxRows={20}
//               variant="outlined"
//               value={localSummary}
//               onChange={(e) => setLocalSummary(e.target.value)}
//               placeholder="Enter summary details..."
//               sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
//             />
//           </Box>
//         </Collapse>
//       </Box>

//       {/* ===== To Do Box ===== */}
//       <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper' }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             bgcolor: 'background.paper',
//             borderBottom: 1,
//             borderColor: 'divider',
//             px: 2,
//             py: 1.5,
//             cursor: 'pointer',
//           }}
//           onClick={() => setShowTodo(!showTodo)}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.blue[500] }}>
//             To Do
//           </Typography>
//           <IconButton size="small">
//             {showTodo ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         {/* Collapsible TextField */}
//         <Collapse in={showTodo} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 2 }}>
//             <TextField
//               fullWidth
//               multiline
//               minRows={6}
//               maxRows={20}
//               variant="outlined"
//               value={localTodo}
//               onChange={(e) => setLocalTodo(e.target.value)}
//               placeholder="Enter to-do tasks or follow-ups..."
//               sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
//             />
//           </Box>
//         </Collapse>
//       </Box>

//       {/* ===== Buttons ===== */}
//       <Box flexGrow={0}>
//         <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
//           <Button variant="outlined" color="success" onClick={handleSave}>
//             <Icon>check</Icon> Save
//           </Button>
//           <Button variant="outlined" color="error" onClick={handleCancel}>
//             <Icon>clear</Icon> Cancel
//           </Button>
//         </Stack>
//       </Box>
//     </Box>
//   );
// };

// export default Handoff;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Collapse,
  TextField,
  IconButton,
  colors,
  Stack,
  Button,
  Icon,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const Handoff = () => {
  const { useChart } = usePatient();
  const chart = useChart();

  // Patient info (not encounter)
  const [firstName] = chart.firstName();
  const [lastName] = chart.lastName();
  const [patientId] = chart.id();

  // ===== Initialize Teaful-backed smartData.handoff =====
  if (!chart.smartData) chart.smartData = {};
  if (!chart.smartData.handoff) chart.smartData.handoff = {};

  if (!chart.smartData.handoff.summary) chart.smartData.handoff.summary = chart.useStore('');
  if (!chart.smartData.handoff.todo) chart.smartData.handoff.todo = chart.useStore('');
  if (!chart.smartData.handoff.department) chart.smartData.handoff.department = chart.useStore('');

  const [summary, setSummary] = chart.smartData.handoff.summary();
  const [todo, setTodo] = chart.smartData.handoff.todo();
  const [department, setDepartment] = chart.smartData.handoff.department();

  // ===== Local state for editing (supports Cancel/Save) =====
  const [localSummary, setLocalSummary] = useState(summary);
  const [localTodo, setLocalTodo] = useState(todo);
  const [localDepartment, setLocalDepartment] = useState(department || '');

  // UI-only state for collapsible sections
  const [showSummary, setShowSummary] = useState(true);
  const [showTodo, setShowTodo] = useState(true);

  // Automatically expand sections if they already contain content
  useEffect(() => {
    if (summary && summary.trim().length > 0) setShowSummary(true);
    if (todo && todo.trim().length > 0) setShowTodo(true);
  }, [summary, todo]);

  // ===== Actions =====
  const handleSave = () => {
    setSummary(localSummary);
    setTodo(localTodo);
    setDepartment(localDepartment);
    console.log('✅ Saved handoff for patient:', patientId);
    console.log('Summary:', localSummary);
    console.log('To Do:', localTodo);
    console.log('Department:', localDepartment);
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
      {/* ===== Header with department dropdown ===== */}
      <Box
        sx={{
          pb: 1,
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: colors.grey[900]}}>
          {lastName}, {firstName}
        </Typography>

          <FormControl size="small" sx={{ minWidth: 200, bgcolor:'background.paper',  }}>
            <Select
              value={localDepartment}
              onChange={(e) => setLocalDepartment(e.target.value)}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'backgroup.paper', // Sets the dropdown menu background to white
                  },
                },
              }}
            >
              <MenuItem value="">Select Department</MenuItem>
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Oncology">Oncology</MenuItem>
              <MenuItem value="Neurology">Neurology</MenuItem>
              <MenuItem value="Pediatrics">Pediatrics</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
            </Select>
          </FormControl>

      </Box>

      {/* ===== Summary Box ===== */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper', mb: 3 }}>
        {/* Header */}
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
          <IconButton size="small">
            {showSummary ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
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
              sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            {/* History Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, }}>
              <Button
                onClick={() => {}}
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

      {/* ===== To Do Box ===== */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper' }}>
        {/* Header */}
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
          <IconButton size="small">
            {showTodo ? <ExpandLess /> : <ExpandMore />}
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
              placeholder="Enter to-do tasks or follow-ups..."
              sx={{ bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            />
            {/* History Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                onClick={() => {}}
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

      {/* ===== Buttons ===== */}
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
