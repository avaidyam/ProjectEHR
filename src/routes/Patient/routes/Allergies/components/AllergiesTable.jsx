//AllergiesTable.js

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
  Icon,
  colors
} from '@mui/material';
import dayjs from 'dayjs';

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
              {/* place holder to check id save */}
              {/* <TableCell>Id</TableCell> */}
              <TableCell>Allergen</TableCell>
              <TableCell>Allergen Type</TableCell>
              <TableCell>Reaction</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Reaction Type</TableCell>
              <TableCell>Noted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies.map((allergy) => (
              <TableRow
                key={allergy.id}
                onClick={() => onEdit(allergy)}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: allergy.severity === 'High' ? '#ffcb00' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: allergy.severity === 'High' ? '#FFB700' : 'action.hover',
                  },
                  '& td': {
                    fontWeight: allergy.severity === 'High' ? 'bold' : 'normal',
                    verticalAlign: 'top',
                  },
                }}
              >
                {/* placeholder to check id save */}
                {/* <TableCell>{allergy.id}</TableCell> */}
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    color: allergy.severity === 'High' ? 'text.primary' : colors.blue[500],
                    fontWeight: allergy.severity === 'High' ? 'bold' : 'normal',
                    
                  }}
                >
                   <Box>
      {allergy.agent}
      {allergy.notes && (
      <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontWeight: 'normal',
          pl: 4, // indent notes
        }}
      >
        {allergy.notes}
      </Typography>
    )}
  </Box>
                </TableCell>
              
                <TableCell>{allergy.type}</TableCell>
                <TableCell>{allergy.reaction}</TableCell>
                <TableCell
                  sx={{
                    fontWeight: allergy.severity === 'Not Specified' ? 'bold!important' : 'inherit',
                    backgroundColor: allergy.severity === 'Not Specified' ? '#ffcb00!important' : 'inherit',
                  }}
                >
                  {allergy.severity || 'Not Specified'}
                </TableCell>
                <TableCell>{allergy.reactionType}</TableCell>
                <TableCell>
                  {allergy.onsetDate ? dayjs(allergy.onsetDate).format('MM-DD-YYYY') : ''}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(allergy);
                    }}
                    size="small"
                  >
                    <Icon fontSize="small">edit</Icon>
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(allergy.id);
                    }}
                    size="small"
                  >
                    <Icon fontSize="small">delete</Icon>
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

