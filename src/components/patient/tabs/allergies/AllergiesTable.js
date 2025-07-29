// AllergiesTable.js
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { blue } from '@mui/material/colors';


// NOTE: dummyAllergies will now be managed by the parent AllergiesTab to allow edits
// and additions to be reflected. This component will receive them via props.

const AllergiesTable = ({ allergies, onEdit, onDelete }) => {
  const handleDelete = (id) => {
    onDelete && onDelete(id); // Callback for parent
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
        Allergies
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="allergies table">
          <TableHead>
            <TableRow>
              <TableCell>Allergen</TableCell>
              <TableCell>Allergen Type</TableCell>
              <TableCell>Reaction</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Reaction Type</TableCell>
              <TableCell>Noted</TableCell> 
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies.map((allergy) => (
              //               const isHighSeverity = allergy.severity === 'High';
//               const severityNotSpecified =
//                 !allergy.severity || allergy.severity === 'Not Specified';

              <TableRow
                key={allergy.id}
                onClick={() => onEdit(allergy)} // Click anywhere on the row to edit
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: allergy.severity === 'High'? 'warning.light' : 'inherit',
                 cursor: 'pointer',
                 '&:hover': {
                 backgroundColor: (allergy.severity === 'High') ? 'warning.main' : 'action.hover',
              },
                }}
              >
                <TableCell component="th" scope="row" sx= {{color: blue[500]}}>
                  {allergy.agent}
                </TableCell>
                <TableCell >{allergy.type}</TableCell>
                <TableCell>{allergy.reaction}</TableCell>
                <TableCell
                  sx={{
                    fontWeight:
                      allergy.severity === 'Not Specified' ? 'bold' : 'normal',
                  }}
                >
                  {allergy.severity || 'Not Specified'}
                </TableCell>

                <TableCell>{allergy.reactionType}</TableCell>
                <TableCell>{allergy.onsetDate ? dayjs(allergy.onsetDate).format('MM-DD-YYYY') : ''}</TableCell>

                <TableCell>{allergy.notes}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => { e.stopPropagation(); onEdit(allergy); }} // Stop propagation to prevent row click
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(allergy.id); }} // Stop propagation
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllergiesTable;

// import React from 'react';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Box,
//   Typography,
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import dayjs from 'dayjs';

// const AllergiesTable = ({ allergies, onEdit, onDelete }) => {
//   const handleDelete = (id) => {
//     onDelete && onDelete(id); // Callback for parent
//   };

//   return (
//     <Box sx={{ mt: 2 }}>
//       <Typography variant="h6" component="div" sx={{ mb: 1 }}>
//         Allergies
//       </Typography>
//       <TableContainer component={Paper}>
//         <Table sx={{ minWidth: 650 }} aria-label="allergies table">
//           <TableHead>
//             <TableRow>
//               <TableCell>Allergen</TableCell>
//               <TableCell>Allergen Type</TableCell>
//               <TableCell>Reaction</TableCell>
//               <TableCell>Severity</TableCell>
//               <TableCell>Reaction Type</TableCell>
//               <TableCell>Noted</TableCell>
//               <TableCell>Notes</TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {allergies.map((allergy) => {
//               const isHighSeverity = allergy.severity === 'High';
//               const severityNotSpecified =
//                 !allergy.severity || allergy.severity === 'Not Specified';

//               return (
//                 <TableRow
//                   key={allergy.id}
//                   onClick={() => onEdit(allergy)}
//                   sx={{
//                     '&:last-child td, &:last-child th': { border: 0 },
//                     backgroundColor: isHighSeverity ? 'warning.light' : 'inherit',
//                     cursor: 'pointer',
//                     '&:hover': {
//                       backgroundColor: isHighSeverity ? 'warning.main' : 'action.hover',
//                     },
//                   }}
//                 >
//                   <TableCell
//                     component="th"
//                     scope="row"
//                     sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}
//                   >
//                     {allergy.agent}
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}>
//                     {allergy.type}
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}>
//                     {allergy.reaction}
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       fontWeight: severityNotSpecified ? 'bold' : isHighSeverity ? 'bold' : 'normal',
//                     }}
//                   >
//                     {severityNotSpecified ? 'Not Specified' : allergy.severity}
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}>
//                     {allergy.reactionType}
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}>
//                     {allergy.onsetDate ? dayjs(allergy.onsetDate).format('MM-DD-YYYY') : ''}
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}>
//                     {allergy.notes}
//                   </TableCell>
//                   <TableCell
//                     align="right"
//                     sx={{ fontWeight: isHighSeverity ? 'bold' : 'normal' }}
//                   >
//                     <IconButton
//                       aria-label="edit"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onEdit(allergy);
//                       }}
//                       size="small"
//                     >
//                       <EditIcon fontSize="small" />
//                     </IconButton>
//                     <IconButton
//                       aria-label="delete"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(allergy.id);
//                       }}
//                       size="small"
//                     >
//                       <DeleteIcon fontSize="small" />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default AllergiesTable;
