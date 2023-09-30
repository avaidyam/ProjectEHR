import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import React from 'react';

import { useRouter } from '../../util/urlHelpers.js';

import './Navigation.css';

const NavDrawer = ({ open, anchor, onClose }) => {
  const onSetNewRoute = useRouter({ onAfterRoute: onClose });

  return (
    <Drawer anchor={anchor} open={open} onClose={onClose} className="nav-drawer">
      <div className="flex flex-col flex-grow inner">
        <List>
          <ListItem key="schedule" disablePadding>
            <ListItemButton onClick={() => onSetNewRoute('')}>
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem key="notewriter" disablePadding>
            <ListItemButton onClick={() => onSetNewRoute('notes')}>
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary="NoteWriter" />
            </ListItemButton>
          </ListItem>
          <ListItem key="schedule" disablePadding>
            <ListItemButton onClick={() => onSetNewRoute('schedule')}>
              <ListItemIcon>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItemButton>
          </ListItem>
          <ListItem key="orders" disablePadding>
            <ListItemButton onClick={() => onSetNewRoute('orders')}>
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default NavDrawer;
