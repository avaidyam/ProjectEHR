import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Tooltip, Tab, Tabs, Menu, MenuItem, Avatar } from '@mui/material'
import { HStack, Label, IconButton, Divider, Icon } from './Core.jsx'
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js';

export const Titlebar = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
  
  const patientMRN = location.pathname.split('/')?.[2] ?? null
  const [patientData, setPatientData] = useState(null);
  useEffect(() => { 
    setPatientData(TEST_PATIENT_INFO({ patientMRN })) 
  }, [patientMRN, location.pathname])

  return (
    <>
      <AppBar elevation={0} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <HStack alignItems="center">
            <Label bold italic variant="h6" component="div">ProjectEHR</Label>
            <IconButton onClick={() => navigate('/schedule')}>calendar_month</IconButton>
            <IconButton onClick={() => navigate('/list')}>people</IconButton>
          </HStack>
          <Tabs 
            variant="scrollable" 
            textColor="inherit"
            scrollButtons 
            allowScrollButtonsMobile 
            TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
            value="1"
            onChange={(event, newValue) => {}}
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          >
            {patientMRN && <Tab value="1" label={
              <span>
                {patientData?.firstName} {patientData?.lastName}
                <IconButton size="small" sx={{ p: 0, ml: 1 }} onClick={() => navigate('/')}>close</IconButton>
              </span>
            } />}
          </Tabs>
          <HStack>
            <Tooltip title="Account settings">
              <IconButton
                onClick={(event) => setOpen(event.currentTarget)}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 24, height: 24 }}>M</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={open}
              open={!!open}
              onClose={() => setOpen(null)}
              onClick={() => setOpen(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => setOpen(null)}>
                <Avatar /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setOpen(null)}>
                <Icon>settings</Icon> Settings
              </MenuItem>
              <MenuItem onClick={onLogout}>
                <Icon>person_add</Icon> Secure
              </MenuItem>
              <MenuItem onClick={onLogout}>
                <Icon>logout</Icon> Logout
              </MenuItem>
            </Menu>
          </HStack>
        </Toolbar>
      </AppBar>
      {/* Spacer to prevent content from being hidden behind the AppBar */}
      <Toolbar variant="dense" />
    </>
  )
}
