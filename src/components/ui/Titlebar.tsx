import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Tooltip, Tab, Tabs, Menu, MenuItem, Avatar } from '@mui/material'
import { Button, Stack, Label, IconButton, Divider, Icon } from './Core'
import { useDatabase } from '../contexts/PatientContext'
import * as Database from '../contexts/Database'
import { CreateEncounterDialog, EncounterFormData } from './CreateEncounterDialog'
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
]

export const Titlebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState<HTMLElement | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  // teaful hooks return [value, setValue]
  const [patientsDB, setPatientsDB] = useDatabase().patients()
  const [departments] = useDatabase().departments()
  const [providers] = useDatabase().providers()

  const [createEncounterOpen, setCreateEncounterOpen] = React.useState(false)
  const [manageDeptsOpen, setManageDeptsOpen] = React.useState(false)
  const [manageFlowsheetsOpen, setManageFlowsheetsOpen] = React.useState(false)
  const [dbManagementOpen, setDbManagementOpen] = React.useState(false)
  const [openPatientChartOpen, setOpenPatientChartOpen] = React.useState(false)
  const [pdmpManagerOpen, setPdmpManagerOpen] = React.useState(false)

  // Extract MRN and EncounterID from URL if present
  const match = location.pathname.match(/^\/patient\/(\d+)\/encounter\/(\d+)/) as string[]
  const currentMrn = match?.[1]
  const currentEncID = match?.[2]

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

  const handleCreateEncounter = (data: EncounterFormData) => {
    const match = location.pathname.match(/^\/patient\/(\d+)/);
    if (!match) return;
    const mrn = match[1];

    const newID = Database.Encounter.ID.create()
    setPatientsDB((prev: Record<string, Database.Patient>) => {
      const patient = prev[mrn];
      if (!patient) return prev; // Should not happen given check above

      const newEncounter: Database.Encounter = {
        id: newID,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        status: data.status,
        department: data.department,
        specialty: data.specialty,
        provider: data.provider,
        concerns: [],
        diagnoses: [],
        problems: [],
        flowsheets: [],
        notes: [],
        history: {
          medical: [],
          surgical: [],
          family: []
        },
        immunizations: [],
        orders: []
      }

      return {
        ...prev,
        [mrn]: {
          ...patient,
          encounters: {
            ...patient.encounters,
            [newEncounter.id]: newEncounter
          }
        }
      };
    });
    setCreateEncounterOpen(false);
    // Navigate to the new encounter? Optional but nice.
    navigate(`/patient/${mrn}/encounter/${newID}`);
  };

  const [tabHistory, setTabHistory] = React.useState<string[]>([])
  React.useEffect(() => {
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
    const mrn = path.split('/')?.[2] as Database.Patient.ID ?? null
    if (!mrn || !patientsDB[mrn]) return 'Unknown Patient';
    const info = patientsDB[mrn]
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
                const mrnID = Database.Patient.ID.create()
                const encID = Database.Encounter.ID.create()
                setPatientsDB((prev) => ({
                  ...prev,
                  [mrnID]: {
                    id: mrnID,
                    firstName: "Doe",
                    lastName: placeholders[Math.floor(Math.random() * placeholders.length)],
                    birthdate: "1890-01-01",
                    gender: "Unknown",
                    encounters: { [encID]: { id: encID } }
                  }
                }))
                setAnchorEl(null)
                navigate(`/patient/${mrnID}/encounter/${encID}`)
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
        mrn={currentMrn as Database.Patient.ID}
        encounterId={currentEncID as Database.Patient.ID}
      />
    </>
  )
}
