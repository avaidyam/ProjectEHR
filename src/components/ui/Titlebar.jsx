import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Tooltip, Tab, Tabs, Menu, MenuItem, Avatar } from '@mui/material'
import { Button, HStack, Label, IconButton, Divider, Icon } from './Core.jsx'
import { TEST_PATIENT_INFO } from '../../util/data/PatientSample.js';

export const Titlebar = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
  
  const [tabHistory, setTabHistory] = useState([])
  useEffect(() => { 
    if (tabHistory.find(tab => tab === location.pathname) === undefined)
      setTabHistory((prev) => [...prev, location.pathname])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  const removePathnameFromHistory = (pathname) => {
    setTabHistory((prev) => prev.filter(t => t !== pathname))
    if (pathname === location.pathname) 
      navigate('/')
  }
  const pathnameToTab = (path) => {
    const mrn = path.split('/')?.[2] ?? null
    const info = TEST_PATIENT_INFO({ patientMRN: mrn })
    return `${info.firstName} ${info.lastName}`
  }

  return (
    <>
      <AppBar elevation={0} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <HStack alignItems="center">
            <Button text sx={{ textTransform: 'none' }}><Label bold italic variant="h6">ProjectEHR</Label></Button>
          </HStack>
          <Tabs 
            variant="scrollable" 
            textColor="inherit"
            scrollButtons={false} 
            TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
            value={location.pathname}
            onChange={(event, newValue) => {}}
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <Tab value="/schedule" label={<Icon>calendar_month</Icon>} onClick={() => navigate('/schedule')} sx={{ minWidth: 45 }} />
            <Tab value="/list" label={<Icon>people</Icon>} onClick={() => navigate('/list')} sx={{ minWidth: 45 }} />
            {tabHistory.filter(x => x.startsWith('/patient')).map((pathname, index) => (
              <Tab onClick={() => navigate(pathname)} value={pathname} label={
                <span>
                  {pathnameToTab(pathname)}
                  <IconButton size="small" sx={{ p: 0, ml: 1 }} onClick={() => removePathnameFromHistory(pathname)}>close</IconButton>
                </span>
              } />
            ))}
          </Tabs>
          <HStack>
            <Tooltip title="Account settings">
              <IconButton onClick={(event) => setOpen(event.currentTarget)}><Icon avatar size={24}>person</Icon></IconButton>
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
