import React from 'react'
import { AppBar, Toolbar } from '@mui/material'
import { HStack, Label, Button, IconButton } from './Core.jsx'

export const Titlebar = ({ onHandleClickRoute, onLogout }) => {
  return (
    <>
      <AppBar elevation={0} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <HStack alignItems="center">
            <Label bold italic variant="h6" component="div">ProjectEHR</Label>
            <IconButton onClick={() => onHandleClickRoute('/schedule')}>calendar_month</IconButton>
            <IconButton onClick={() => onHandleClickRoute('/patients-list')}>people</IconButton>
          </HStack>
          <HStack>
            <Button onClick={onLogout}>Secure</Button>
            <Button onClick={onLogout}>Logout</Button>
          </HStack>
        </Toolbar>
      </AppBar>
      {/* Spacer to prevent content from being hidden behind the AppBar */}
      <Toolbar variant="dense" />
    </>
  )
}
