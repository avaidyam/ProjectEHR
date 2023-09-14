import React from "react";
import Drawer from "@mui/material/Drawer";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useNavigate } from "react-router-dom";

import "./Navigation.css";

const NavDrawer = ({ open, anchor, onClose }) => {
  const navigator = useNavigate();

  const onRoute = (location) => {
    onClose();
    navigator(`/${location}`);
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      className="nav-drawer"
    >
      <div className="flex flex-col flex-grow inner">
        <List>
          <ListItem key="schedule" disablePadding>
            <ListItemButton onClick={() => onRoute("")}>
              <ListItemIcon>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItemButton>
          </ListItem>
          <ListItem key="notewriter" disablePadding>
            <ListItemButton onClick={() => onRoute("notes")}>
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary="NoteWriter" />
            </ListItemButton>
          </ListItem>
          <ListItem key="schedule" disablePadding>
            <ListItemButton onClick={() => onRoute("schedule")}>
              <ListItemIcon>
                <EditNoteIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItemButton>
          </ListItem>
          <ListItem key="orders" disablePadding>
            <ListItemButton onClick={() => onRoute("orders")}>
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
