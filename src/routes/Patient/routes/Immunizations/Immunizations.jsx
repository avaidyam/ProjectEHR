import React, { useState } from 'react';
import { 
  Icon, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  TableHead, 
  Paper, 
  IconButton, 
  Collapse, 
  Typography,
  colors
} from '@mui/material';
import { Box, Label, Button, TitledCard } from 'components/ui/Core.jsx';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import ImmunizationItemEditor from './components/ImmunizationItemEditor.jsx';
import {
  formatDose,
  formatDate,
  groupImmunizationsByType,
  sortImmunizationsByDate
} from './utils/immunizationUtils.js';

export default function Immunizations() {
  const { useChart, useEncounter } = usePatient()
  const [immunizations, setImmunizations] = useEncounter().immunizations()
  const [editingImmunization, setEditingImmunization] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const grouped = groupImmunizationsByType(immunizations ?? []);

  const initialState = Object.keys(grouped).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});
  const [openGroups, setOpenGroups] = useState(initialState);

  const toggleGroup = (vaccine) => {
    setOpenGroups(prev => ({ ...prev, [vaccine]: !prev[vaccine] }));
  };

  const handleEdit = (immunization) => {
    setEditingImmunization(immunization);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingImmunization({
      vaccine: '',
      received: '',
      recorder: '',
      recorded: '',
      given_by: '',
      facility: '',
      dose: { value: 0, unit: { mass: '', volume: '', time: '' } },
      site: '',
      route: '',
      lot: '',
      manufacturer: ''
    });
    setIsAddingNew(true);
  };

  const handleSave = (updatedImmunization) => {
    if (isAddingNew) {
      // Add new immunization
      const newId = immunizations?.length > 0 ? Math.max(...(immunizations ?? []).map(imm => imm.id || 0)) + 1 : 1;
      setImmunizations(prev => [...prev, { ...updatedImmunization, id: newId }]);
      setIsAddingNew(false);
    } else {
      // Edit existing immunization
      setImmunizations((prevImmunizations) =>
        prevImmunizations.map((imm) => {
          const immId = imm.id || imm.vaccine + imm.received;
          const updatedId = updatedImmunization.id || updatedImmunization.vaccine + updatedImmunization.received;
          return immId === updatedId ? updatedImmunization : imm;
        })
      );
    }
    setEditingImmunization(null);
  };

  const handleCancel = () => {
    setEditingImmunization(null);
    setIsAddingNew(false);
  };

  const handleDelete = (immunizationId) => {
    setImmunizations(prev => prev.filter(imm => {
      // Create a unique identifier for comparison
      const immId = imm.id || imm.vaccine + imm.received;
      return immId !== immunizationId;
    }));
  };

  return (
    <Box sx={{height: '95vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper'}}>
      <Box sx={{ bgcolor: 'grey.100',pt: 4, pb: 1, px:3, borderRadius: 1, mb: 1 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' , color: colors.blue[500]}}> 
          Immunizations - All Types
        </Typography>

        <Box display="flex" alignItems="center" mb={1} gap={2}>
          <Button
            variant="outlined"
            startIcon={<Icon sx={{ color: 'green' }}>add_task</Icon>} 
            onClick={handleAddNew}
            sx={{
              color: colors.blue[500],
              borderColor: colors.blue[500],
              '&:hover': {
                borderColor: colors.blue[700],
                backgroundColor: colors.blue[50],
              },
            }}>
            Add
          </Button>
        </Box>
      </Box>

      <Box sx={{flexGrow: 1, overflowY: 'auto',px: 3, py:1 , mb: 1}}>
        <Box sx={{ mt: 2 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="immunizations table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: '5%' }} />
                  <TableCell>Immunization Family</TableCell>
                  <TableCell>Admin Dates</TableCell>
                  <TableCell>Next Due</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(grouped).map(([vaccine, records]) => {
                  // Sort records by date, most recent first
                  const sortedRecords = sortImmunizationsByDate(records);
                  const adminDates = sortedRecords.map(r => formatDate(r.received)).join(', ');
                  
                  return (
                    <React.Fragment key={vaccine}>
                      <TableRow
                        onClick={() => toggleGroup(vaccine)}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                          '& td': {
                            verticalAlign: 'top',
                          },
                        }}
                      >
                        <TableCell>
                          <IconButton onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(vaccine);
                          }}>
                            {openGroups[vaccine] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            color: colors.blue[500],
                            fontWeight: 'normal',
                          }}
                        >
                          <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                            {vaccine}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {adminDates}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" style={{ fontStyle: 'italic', color: '#666' }}>
                            {/* Next due calculation would go here */}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} style={{ padding: 0 }}>
                          <Collapse in={openGroups[vaccine]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Recorder</TableCell>
                                    <TableCell>Given By</TableCell>
                                    <TableCell>Facility</TableCell>
                                    <TableCell>Dose</TableCell>
                                    <TableCell>Route/Site</TableCell>
                                    <TableCell>Lot/Manufacturer</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sortedRecords.map((record, idx) => (
                                    <React.Fragment key={record.id || idx}>
                                      <TableRow>
                                        <TableCell>{formatDate(record.received)}</TableCell>
                                        <TableCell>{record.vaccine}</TableCell>
                                        <TableCell>{record.recorder}</TableCell>
                                        <TableCell>{record.given_by || 'N/A'}</TableCell>
                                        <TableCell>{record.facility || 'N/A'}</TableCell>
                                        <TableCell>{formatDose(record.dose) || 'N/A'}</TableCell>
                                        <TableCell>
                                          {record.route || 'N/A'} {record.site && `• ${record.site}`}
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {record.lot || 'N/A'}
                                          </Typography>
                                          <Typography variant="caption" color="textSecondary">
                                            {record.manufacturer || 'N/A'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <IconButton
                                            aria-label="edit"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(record);
                                            }}
                                            size="small"
                                          >
                                            <Icon fontSize="small">edit</Icon>
                                          </IconButton>
                                          <IconButton
                                            aria-label="delete"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(record.id || record.vaccine + record.received);
                                            }}
                                            size="small"
                                          >
                                            <Icon fontSize="small">delete</Icon>
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                      {editingImmunization && (() => {
                                          const editingId = editingImmunization.id || editingImmunization.vaccine + editingImmunization.received;
                                          const recordId = record.id || record.vaccine + record.received;
                                          return editingId === recordId;
                                        })() && (
                                          <TableRow>
                                            <TableCell colSpan={9}>
                                              <ImmunizationItemEditor
                                                immunization={editingImmunization}
                                                onSave={handleSave}
                                                onCancel={handleCancel}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        )}
                                    </React.Fragment>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
                {immunizations?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
                        No immunizations on file
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Editor for new immunizations */}
      {editingImmunization && isAddingNew && (
        <Box sx={{ mt: 2, px: 3 }}>
          <ImmunizationItemEditor
            immunization={editingImmunization}
            onSave={handleSave}
            onCancel={handleCancel}
            isAddingNew={true}
          />
        </Box>
      )}
    </Box>
  );
}
