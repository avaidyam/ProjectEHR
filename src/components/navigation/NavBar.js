import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { GridMenuIcon } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useRouter } from '../../util/urlHelpers.js';

const NavBar = () => {
  const onHandleClickRoute = useRouter();
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
          onClick={() => onHandleClickRoute(`schedule`)}
        >
          <GridMenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          EHR
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
