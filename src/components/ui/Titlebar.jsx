import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Tooltip, Tab, Tabs, Menu, MenuItem, Avatar } from '@mui/material'
import { Button, Stack, Label, IconButton, Divider, Icon } from 'components/ui/Core.jsx'
import { useDatabase } from 'components/contexts/PatientContext'
import { CreateEncounterDialog } from './CreateEncounterDialog.jsx'
import { ManageDepartmentsWindow } from './ManageDepartmentsWindow.jsx'

const placeholders = [
  "Hammer", "Broom", "Table", "Chair", "Mug", "Plate", "Spoon", "Fork",
  "Knife", "Towel", "Pencil", "Globe", "Cloud", "River", "Mountain", "Ocean",
  "Forest", "Desert", "Castle", "Bridge", "Mirror", "Candle", "Glove", "Button",
  "Zipper", "Basket", "Feather", "String", "Rope", "Lantern", "Telescope", "Anvil",
  "Crayon", "Window", "Curtain", "Doorknob", "Carpet", "Pillow", "Blanket", "Clock",
  "Vase", "Statue", "Scroll", "Compass", "Shovel", "Rake", "Ladder", "Bucket",
  "Wrench", "Screwdriver", "Engine", "Wheel", "Bumper", "Hose", "Valve", "Gauge",
  "Filter", "Nozzle", "Gasket", "Lever", "Pulley", "Spring", "Gear", "Spanner",
  "Trowel", "Helmet", "Jacket", "Vest", "Scarf", "Boots", "Slipper", "Lace",
  "Marble", "Cobblestone", "Pebble", "Granite", "Copper", "Bronze", "Steel", "Saddle",
  "Harness", "Reins", "Wagon", "Cart", "Ferry", "Sailboat", "Bicycle", "Skateboard",
  "Headphone", "Speaker", "Monitor", "Keyboard", "Mouse", "Router", "Battery", "Charger",
  "Wallet", "Purse", "Backpack", "Couch", "Stool", "Fountain", "Crystal", "Obsidian"
];

export const Titlebar = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [patientsDB, setPatientsDB] = useDatabase().patients()
  const [departments] = useDatabase().departments()
  const [providers] = useDatabase().providers()

  const [createEncounterOpen, setCreateEncounterOpen] = useState(false)
  const [manageDeptsOpen, setManageDeptsOpen] = useState(false)

  const handleOpenCreateEncounter = () => {
    // Check if we are on a patient chart
    const match = location.pathname.match(/^\/patient\/(\d+)/);
    if (match) {
      setCreateEncounterOpen(true);
    } else {
      window.alert("You must be on a patient chart to create an encounter.");
    }
    setAnchorEl(null);
  }

  const handleCreateEncounter = (data) => {
    const match = location.pathname.match(/^\/patient\/(\d+)/);
    if (!match) return;
    const mrn = match[1];

    const newEncID = Math.floor((Math.random() * 9 + 1) * (10 ** 7)).toString();

    setPatientsDB(prev => {
      const patient = prev[mrn];
      if (!patient) return prev; // Should not happen given check above

      const newEncounter = {
        id: newEncID,
        startDate: data.startDate.replace('T', ' '),
        endDate: data.endDate.replace('T', ' '),
        type: data.type,
        status: data.status,
        department: data.department,
        specialty: data.specialty,
        provider: data.provider,
        concerns: [],
        diagnoses: [],
        problems: [],
        vitals: [],
        documents: []
      };

      return {
        ...prev,
        [mrn]: {
          ...patient,
          encounters: {
            ...patient.encounters,
            [newEncID]: newEncounter
          }
        }
      };
    });
    setCreateEncounterOpen(false);
    // Navigate to the new encounter? Optional but nice.
    navigate(`/patient/${mrn}/encounter/${newEncID}`);
  };

  const [tabHistory, setTabHistory] = useState([])
  useEffect(() => {
    if (tabHistory.find(tab => tab === location.pathname) === undefined)
      setTabHistory((prev) => [...new Set([...prev, location.pathname])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  const removePathnameFromHistory = (pathname) => {
    setTabHistory((prev) => [...new Set(prev.filter(t => t !== pathname))])
    if (pathname === location.pathname)
      navigate('/')
  }
  const pathnameToTab = (path) => {
    const mrn = path.split('/')?.[2] ?? null
    const info = patientsDB[mrn]
    return `${info.firstName} ${info.lastName}`
  }

  return (
    <>
      <AppBar elevation={0} enableColorOnDark position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button color="inherit" sx={{ textTransform: 'none' }} onClick={(event) => setAnchorEl(event.currentTarget)}>
              <Label bold italic variant="h6"><Icon sx={{ mb: -0.5 }}>menu</Icon>ProjectEHR</Label>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  style: {
                    height: '48ch',
                    width: '48ch',
                    marginLeft: -10
                  },
                }
              }}
            >
              <MenuItem onClick={() => setAnchorEl(null)} component="a" href="https://www.uptodate.com/" target="_blank">Open UpToDate</MenuItem>
              <MenuItem onClick={() => {
                const encID = Math.floor((Math.random() * 9 + 1) * (10 ** 7))
                const pt = {
                  id: Math.floor((Math.random() * 9 + 1) * (10 ** 7)),
                  firstName: "Doe",
                  lastName: placeholders[Math.floor(Math.random() * placeholders.length)],
                  birthdate: "1890-01-01",
                  encounters: { [encID]: { id: encID } }
                }
                setPatientsDB(prev => ({ ...prev, [pt.id]: pt }))
                setAnchorEl(null)
              }}>
                Create Patient
              </MenuItem>
              <MenuItem onClick={handleOpenCreateEncounter}>
                Create Encounter
              </MenuItem>
              <MenuItem onClick={() => {
                setManageDeptsOpen(true);
                setAnchorEl(null);
              }}>
                Manage Departments
              </MenuItem>
            </Menu>
          </Stack>
          <Tabs
            variant="scrollable"
            textColor="inherit"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
            value={location.pathname}
            onChange={(event, newValue) => { }}
            sx={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <Tab value="/schedule" label={<Icon>calendar_month</Icon>} onClick={() => navigate('/schedule')} sx={{ minWidth: 45 }} />
            <Tab value="/list" label={<Icon>people</Icon>} onClick={() => navigate('/list')} sx={{ minWidth: 45 }} />
            {tabHistory.filter(x => x.startsWith('/patient')).map((pathname, index) => (
              <Tab onClick={() => navigate(pathname)} key={pathname} value={pathname} label={
                <span>
                  {pathnameToTab(pathname)}
                  <IconButton size="small" sx={{ p: 0, ml: 1 }} onClick={() => removePathnameFromHistory(pathname)}>close</IconButton>
                </span>
              } />
            ))}
          </Tabs>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={(event) => setOpen(event.currentTarget)}><Icon avatar size={24}>person</Icon></IconButton>
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
          </Stack>
        </Toolbar>
      </AppBar>
      {/* Spacer to prevent content from being hidden behind the AppBar */}
      <Toolbar variant="dense" />

      <CreateEncounterDialog
        open={createEncounterOpen}
        onClose={() => setCreateEncounterOpen(false)}
        onSubmit={handleCreateEncounter}
        departments={departments}
        providers={providers}
      />

      <ManageDepartmentsWindow
        open={manageDeptsOpen}
        onClose={() => setManageDeptsOpen(false)}
      />
    </>
  )
}
