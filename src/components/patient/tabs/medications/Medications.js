import { Card, Table, TableHead, TableRow, TableCell, Typography, ToggleButton, ToggleButtonGroup, Icon, Box, TextField, Button, Dialog, DialogActions, List, ListItem, ListItemText, ListItemButton, Tooltip} from '@mui/material';
import React from 'react';

export default function Medications() {

  return(
    <Box>
      <div>
        <div style={{ display: "flex" }}>
          <TextField
            label="Search Medications"
            variant="outlined"
          />
          <Button variant="outlined">
            <Icon color="success">add_task</Icon>Add
          </Button>
          <div style={{ marginLeft: "auto" }}>
            <Button variant="outlined">
              Check Interactions
            </Button>
            <Button variant="outlined">
              Informants
            </Button>
            <Button variant="outlined">
              Find Medications Needing Review
            </Button>
            <Button variant="outlined">
              Mark all Unselected Today 
            </Button>
            <Button variant="outlined">
              Mark all Unselected Yesterday 
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          <div style={{ flex: '1', transition: 'max-width 0.5s', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell>Medication</TableCell>
                </TableRow>
              </TableHead>
              <tbody>
                <TableRow >
                  <TableCell>as</TableCell> 
                </TableRow>
              </tbody>
            </Table>
          </div>
        </div>
        <li>
          Metoprolol - 25mg / BID
        </li>
        <li>
          Lisinopril - 10mg / QD
        </li>
      </div>
    </Box>
  );
}