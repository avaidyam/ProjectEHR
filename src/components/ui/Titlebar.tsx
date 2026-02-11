import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Tooltip, Tab, Tabs, Menu, MenuItem, Avatar } from '@mui/material'
import { Button, Stack, Label, IconButton, Divider, Icon } from './Core'
import { useDatabase } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'
import { CreateEncounterDialog } from './CreateEncounterDialog'
import { ManageDepartmentsWindow } from './ManageDepartmentsWindow'
import { ManageFlowsheetsWindow } from './ManageFlowsheetsWindow'
import { OpenPatientChartDialog } from './OpenPatientChartDialog'
import { DatabaseManagementWindow } from './DatabaseManagementWindow'
import { PDMPManagerWindow } from './PDMPManagerWindow'

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

interface TitlebarProps {
  onLogout: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState<HTMLElement | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  // teaful hooks return [value, setValue]
  const [patientsDB, setPatientsDB] = useDatabase().patients() as [Record<string, Database.Patient>, (val: any) => void];
  const [departments] = useDatabase().departments() as [Database.Department[], any];
  const [providers] = useDatabase().providers() as [Database.Provider[], any];

  const [createEncounterOpen, setCreateEncounterOpen] = useState(false)
  const [manageDeptsOpen, setManageDeptsOpen] = useState(false)
  const [manageFlowsheetsOpen, setManageFlowsheetsOpen] = useState(false)
  const [dbManagementOpen, setDbManagementOpen] = useState(false)
  const [openPatientChartOpen, setOpenPatientChartOpen] = useState(false)
  const [pdmpManagerOpen, setPdmpManagerOpen] = useState(false)

  // Extract MRN and EncounterID from URL if present
  const match = location.pathname.match(/^\/patient\/(\d+)\/encounter\/(\d+)/);
  const currentMrn = match ? match[1] : null;
  const currentEncID = match ? match[2] : null;

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

  const handleCreateEncounter = (data: any) => {
    const match = location.pathname.match(/^\/patient\/(\d+)/);
    if (!match) return;
    const mrn = match[1];

    const newEncID = Math.floor((Math.random() * 9 + 1) * (10 ** 7)).toString();

    setPatientsDB((prev: Record<string, Database.Patient>) => {
      const patient = prev[mrn];
      if (!patient) return prev; // Should not happen given check above

      const newEncounter: Database.Encounter = {
        id: newEncID as any, // Cast to any to satisfy Branded type if needed, or strict casting
        startDate: data.startDate.replace('T', ' '),
        endDate: data.endDate.replace('T', ' '),
        type: data.type,
        status: data.status,
        department: data.department,
        specialty: data.specialty, // This might not be in Encounter interface, need to check
        provider: data.provider,
        concerns: [],
        diagnoses: [],
        problems: [],
        flowsheets: [],
        notes: [],
        history: {}, // Added missing required property
      } as any; // forceful casting to avoid loose typing issues for now

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

  const [tabHistory, setTabHistory] = useState<string[]>([])
  useEffect(() => {
    if (tabHistory.find(tab => tab === location.pathname) === undefined)
      setTabHistory((prev) => [...new Set([...prev, location.pathname])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  const removePathnameFromHistory = (pathname: string) => {
    const newHistory = tabHistory.filter(t => t !== pathname)
    setTabHistory([...new Set(newHistory)])

    if (pathname === location.pathname) {
      const remainingPatientTabs = newHistory.filter(t => t.startsWith('/patient'))
      if (remainingPatientTabs.length > 0) {
        navigate(remainingPatientTabs[remainingPatientTabs.length - 1])
      } else {
        navigate('/')
      }
    }
  }
  const pathnameToTab = (path: string) => {
    const mrn = path.split('/')?.[2] ?? null
    if (!mrn || !patientsDB[mrn as any]) return 'Unknown Patient';
    const info = patientsDB[mrn as any]
    return `${info.firstName} ${info.lastName}`
  }

  return (
    <>
      <AppBar elevation={0} enableColorOnDark position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button color="inherit" sx={{ textTransform: 'none' }} onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}>
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
                const encID = Math.floor((Math.random() * 9 + 1) * (10 ** 7)).toString()
                const pt: Database.Patient = {
                  id: Math.floor((Math.random() * 9 + 1) * (10 ** 7)).toString() as any,
                  firstName: "Doe",
                  lastName: placeholders[Math.floor(Math.random() * placeholders.length)],
                  birthdate: "1890-01-01",
                  encounters: { [encID]: { id: encID } as any }
                }
                setPatientsDB((prev: any) => ({ ...prev, [pt.id as string]: pt }))
                setAnchorEl(null)
                navigate(`/patient/${pt.id}/encounter/${encID}`)
              }}>
                Create Patient
              </MenuItem>
              <MenuItem onClick={handleOpenCreateEncounter}>
                Create Encounter
              </MenuItem>
              <MenuItem onClick={() => {
                setOpenPatientChartOpen(true);
                setAnchorEl(null);
              }}>
                Open Patient Chart
              </MenuItem>
              <MenuItem
                disabled={!currentMrn || !currentEncID}
                onClick={() => {
                  setPdmpManagerOpen(true);
                  setAnchorEl(null);
                }}>
                PDMP Manager
              </MenuItem>
              <MenuItem onClick={() => {
                setManageDeptsOpen(true);
                setAnchorEl(null);
              }}>
                Manage Departments
              </MenuItem>
              <MenuItem onClick={() => {
                setManageFlowsheetsOpen(true);
                setAnchorEl(null);
              }}>
                Flowsheet Definitions
              </MenuItem>
              <MenuItem onClick={() => {
                setDbManagementOpen(true);
                setAnchorEl(null);
              }}>
                Database Management
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
            <Tab value="/snapboard" label={<Icon>dashboard</Icon>} onClick={() => navigate('/snapboard')} sx={{ minWidth: 45 }} />
            <Tab value="/list" label={<Icon>people</Icon>} onClick={() => navigate('/list')} sx={{ minWidth: 45 }} />
            {tabHistory.filter(x => x.startsWith('/patient')).map((pathname, index) => (
              <Tab onClick={() => navigate(pathname)} key={pathname} value={pathname} label={
                <span>
                  {pathnameToTab(pathname)}
                  <IconButton component="span" size="small" sx={{ p: 0, ml: 1 }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); removePathnameFromHistory(pathname) }}>close</IconButton>
                </span>
              } />
            ))}
          </Tabs>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={(event: React.MouseEvent<HTMLElement>) => setOpen(event.currentTarget)}><Icon avatar size={24}>person</Icon></IconButton>
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

      <ManageFlowsheetsWindow
        open={manageFlowsheetsOpen}
        onClose={() => setManageFlowsheetsOpen(false)}
      />

      <OpenPatientChartDialog
        open={openPatientChartOpen}
        onClose={() => setOpenPatientChartOpen(false)}
      />

      <DatabaseManagementWindow
        open={dbManagementOpen}
        onClose={() => setDbManagementOpen(false)}
      />

      <PDMPManagerWindow
        open={pdmpManagerOpen}
        onClose={() => setPdmpManagerOpen(false)}
        mrn={currentMrn}
        encounterId={currentEncID}
      />
    </>
  )
}
