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
//   const { useEncounter, useChart } = usePatient();
//   const chart = useChart();

//   const [firstName] = chart.firstName();
//   const [lastName] = chart.lastName();

//   const [summaryState, setSummaryState] = useState('');
//   const [todoState, setTodoState] = useState('');
//   const [showSummary, setShowSummary] = useState(true);
//   const [showTodo, setShowTodo] = useState(true);

//   const handleCancel = () => {
//     setSummaryState('');
//     setTodoState('');
//   };

//   const handleClose = () => {
//     console.log('Handoff closed');
//   };

//   return (
//     <Box
//       sx={{
//         height: '95vh',
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: 'grey.100',
//         p: 3,
//       }}
//     >
//       {/* ===== Header ===== */}
//       <Box
//         sx={{
//           bgcolor: 'grey.100',
//           pb: 1,
//           px: 3,
//           borderRadius: 1,
//           mb: 1,
//         }}
//       >
//         <Typography
//           variant="h5"
//           sx={{
//             mb: 1,
//             fontWeight: 'bold',
//           }}
//         >
//           {lastName}, {firstName} 
//         </Typography>
//       </Box>

//       {/* ===== Summary Box ===== */}
//       <Box
//         sx={{
//           border: 1,
//           borderColor: 'divider',
//           borderRadius: 2,
//           bgcolor: 'background.paper',
//           mb: 3,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Header */}
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
//            <Typography variant="h5"  sx={{ fontWeight: 'bold', color: colors.blue[500],}} >
//             Summary
//           </Typography>
//           <IconButton size="small">
//             {showSummary ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         {/* Collapsible Editor */}
//         <Collapse in={showSummary} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 0 }}>
//             <Editor
//               initialContent={summaryState}
//               onSave={setSummaryState}
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
//           borderRadius: 2,
//           bgcolor: 'background.paper',
//           mb: 3,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Header */}
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
//           <Typography variant="h5"  sx={{ fontWeight: 'bold', color: colors.blue[500],}} >
//             To Do
//           </Typography>
//           <IconButton size="small">
//             {showTodo ? <ExpandLess /> : <ExpandMore />}
//           </IconButton>
//         </Box>

//         {/* Collapsible Editor */}
//         <Collapse in={showTodo} timeout="auto" unmountOnExit>
//           <Box sx={{ p: 0 }}>
//             <Editor
//               initialContent={todoState}
//               onSave={setTodoState}
//               placeholder="Enter to-do tasks or follow-ups..."
//             />
//           </Box>
//         </Collapse>
//       </Box>

//       {/* ===== Buttons ===== */}
//       <Box flexGrow={0}>
//         <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
//           <Button variant="outlined" color="success" onClick={handleClose}>
//             <Icon>check</Icon>Close
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

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Collapse,
  Icon,
  IconButton,
  colors,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import { Editor } from 'components/ui/Editor.jsx';

const Handoff = () => {
  const { useEncounter, useChart } = usePatient();
  const chart = useChart();

  const [firstName] = chart.firstName();
  const [lastName] = chart.lastName();

  const [summaryState, setSummaryState] = useState('');
  const [todoState, setTodoState] = useState('');
  const [showSummary, setShowSummary] = useState(true);
  const [showTodo, setShowTodo] = useState(true);

  const handleCancel = () => {
    setSummaryState('');
    setTodoState('');
  };

  const handleClose = () => {
    console.log('Handoff closed');
  };

  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.100',
        p: 3,
        overflow: 'hidden',
      }}
    >
      {/* ===== Header ===== */}
      <Box
        sx={{
          pb: 1,
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            fontWeight: 'bold',
            color: colors.grey[900],
          }}
        >
          {lastName}, {firstName}
        </Typography>
      </Box>

      {/* ===== Summary Box ===== */}
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 0, // sharp corners
          bgcolor: 'background.paper',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.100',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => setShowSummary(!showSummary)}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: colors.blue[500] }}
          >
            Summary
          </Typography>
          <IconButton size="small">
            {showSummary ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Collapsible Editor */}
        <Collapse in={showSummary} timeout="auto" unmountOnExit>
          <Box sx={{ p: 0 }}>
            <Editor
              initialContent={summaryState}
              onSave={setSummaryState}
              placeholder="Enter summary details..."
            />
          </Box>
        </Collapse>
      </Box>

      {/* ===== To Do Box ===== */}
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 0, // sharp corners
          bgcolor: 'background.paper',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.100',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            py: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => setShowTodo(!showTodo)}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: colors.blue[500] }}
          >
            To Do
          </Typography>
          <IconButton size="small">
            {showTodo ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Collapsible Editor */}
        <Collapse in={showTodo} timeout="auto" unmountOnExit>
          <Box sx={{ p: 0 }}>
            <Editor
              initialContent={todoState}
              onSave={setTodoState}
              placeholder="Enter to-do tasks or follow-ups..."
            />
          </Box>
        </Collapse>
      </Box>

      {/* ===== Buttons ===== */}
      <Box flexGrow={0}>
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button variant="outlined" color="success" onClick={handleClose}>
            <Icon>check</Icon>Close
          </Button>
          <Button variant="outlined" color="error" onClick={handleCancel}>
            <Icon>clear</Icon>Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Handoff;

