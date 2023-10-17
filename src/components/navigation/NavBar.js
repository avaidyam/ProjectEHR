import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { GridMenuIcon } from '@mui/x-data-grid';
import React, { useState } from 'react';

import NavDrawer from './NavDrawer.js';

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar
      position="static"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => setDrawerOpen(true)}
        >
          <GridMenuIcon />
        </IconButton>
        <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Typography variant="h6" color="inherit" component="div">
          EHR
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
