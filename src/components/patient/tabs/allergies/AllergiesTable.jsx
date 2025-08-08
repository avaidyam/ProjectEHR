// AllergiesTable.jsx
import React, { useState } from 'react';
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
              <TableCell>Noted</TableCell> {/* Renamed Onset Date to Noted as per screenshot */}
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies.map((allergy) => (
              <TableRow
                key={allergy.id}
                onClick={() => onEdit(allergy)} // Click anywhere on the row to edit
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor:
                    allergy.severity === 'High' ? 'warning.light' : 'inherit', // Yellow highlight
                  fontWeight: allergy.severity === 'High' ? 'bold' : 'normal',
                  cursor: 'pointer', // Indicate clickable row
                  '&:hover': {
                    backgroundColor: 'action.hover', // Visual feedback on hover
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  {allergy.agent}
                </TableCell>
                <TableCell>{allergy.type}</TableCell>
                <TableCell>{allergy.reaction}</TableCell>
                <TableCell>{allergy.severity}</TableCell>
                <TableCell>{allergy.reactionType}</TableCell>
                <TableCell>{allergy.onsetDate}</TableCell>
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Button variant="outlined" sx={{ mr: 1 }}>
          Mark as Reviewed
        </Button>
        <Button variant="outlined">
          Unable to Assess
        </Button>
      </Box>
    </Box>
  );
};

export default AllergiesTable;