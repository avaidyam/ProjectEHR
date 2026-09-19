import * as React from 'react'
import { Card, Stack } from '@mui/material'
import { alpha, Box, Button, ButtonGroup, TitledCard, Autocomplete, Icon, Label, Menu, MenuItem, Window } from 'components/ui/Core'
import { usePatient } from 'components/contexts/PatientContext'
import { useSplitView } from 'components/contexts/SplitViewContext'
import { OrderSearch } from './components/OrderSearch'

const categories = {
  "New": {
    icon: "assignment_add",
    title: "New Order",
    color: '#19852F',
    status: 'signed'
  },
  "Modify": {
    icon: "edit_document",
    title: "Orders to Modify",
    color: '#E0A830',
    status: 'signed'
  },
  "Hold": {
    icon: "edit_document",
    title: "Orders to Hold",
    color: '#7e57c2',
    status: 'held'
  },
  "Discontinue": {
    icon: "content_paste_off",
    title: "Orders to Discontinue",
    color: '#CF3935',
    status: 'discontinued'
  },
  "Pend": { // previously "Orders To Be Signed"
    icon: "content_paste",
    title: "Signed This Visit",
    color: '#7471D4',
    status: 'pended'
  }
}

const getCategoryForOrder = (order: any) => {
  if (!!order.signedDate)
    return "Modify"
  if (!!order.holdDate)
    return "Hold"
  if (!!order.discontinueDate)
    return "Discontinue"
  if (!!order.pendDate)
    return "Pend"
  return "New"
}

export const OrderCart = () => {
  const { useChart, useEncounter } = usePatient()
  const [orderList, setOrderList] = useEncounter().orders([])
  const [] = useEncounter().smartData({} as any) // FIXME: force-init smartData object if null
  const [orderCart, setOrderCart] = useEncounter().smartData.orderCart["_currentUser"]([])
  const [conditionals] = useEncounter().conditionals({})
  const { setMainTabs, setSideTabs, setWindowTabs, setSelectedSideTab } = useSplitView() || {}

  const inputRef = React.useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [openOrderSearch, setOpenOrderSearch] = React.useState<any>(null)
  const [manageOrdersAnchor, setManageOrdersAnchor] = React.useState<null | HTMLElement>(null)
  const [openResetModal, setOpenResetModal] = React.useState(false)

  const activeOrders = React.useMemo(() => {
    return (orderList || []).filter((x: any) => !x.discontinueDate && x.name !== "__ADVANCE_PATIENT_BICEP_SLIDE__")
  }, [orderList])

  const handleResetCase = () => {
    // Remove all current orders from encounter orders and orderCart
    setOrderList([])
    setOrderCart([])
    setOpenResetModal(false)

    // Close all Report and Imaging Viewer tabs and reset side tabs to initial state
    const isResultTab = (tab: any) => "Report" in tab || "Imaging Viewer" in tab
    setMainTabs?.((prev: any[]) => prev.filter(t => !isResultTab(t)))
    setSideTabs?.((prev: any[]) => {
      const next = prev.filter(t => !isResultTab(t))
      const ordersIdx = next.findIndex(t => "Orders" in t)
      if (ordersIdx !== -1) setSelectedSideTab?.(ordersIdx)
      return next
    })
    setWindowTabs?.((prev: any[]) => prev.filter(t => !isResultTab(t)))
  }

  const startSearch = (term?: string) => {
    const termValue = term !== undefined ? term : (searchTerm || inputRef.current?.value || '')
    setSearchTerm(termValue)
    setOpenOrderSearch(true)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flexGrow: 1, paddingRight: '20px' }}>
        <Card sx={{ m: 1, p: 1 }}>
          <Stack direction="row">
            <ButtonGroup sx={{ whiteSpace: 'nowrap' }} size="small">
              <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => setManageOrdersAnchor(e.currentTarget)}>
                Manage Orders <Icon sx={{ ml: 0.5, fontSize: '14pt' }}>arrow_drop_down</Icon>
              </Button>
              <Button>Order Sets</Button>
            </ButtonGroup>
            <Menu
              anchorEl={manageOrdersAnchor}
              open={Boolean(manageOrdersAnchor)}
              onClose={() => setManageOrdersAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setManageOrdersAnchor(null)
                  setOpenResetModal(true)
                }}
                sx={{ color: 'error.main' }}
              >
                <Icon sx={{ mr: 1, color: 'error.main' }}>restart_alt</Icon>
                Reset Case (Remove Current Orders)
              </MenuItem>
            </Menu>
            <Autocomplete
              label="Options"
              options={['Test']}
              size="small"
              sx={{ flexGrow: 1 }}
            />
          </Stack>
          <Stack direction="row" sx={{ pt: 4 }}>
            <Button><Icon>person_outline</Icon>Providers</Button>
            <Button><Icon>edit</Icon>Edit Multiple</Button>
          </Stack>
          <Stack direction="column">
            <Stack direction="row">
              <Autocomplete
                freeSolo
                label="Add orders or order sets"
                size="small"
                options={[]}
                value={searchTerm}
                onChange={(_e, newValue: any) => {
                  const val = newValue || ''
                  setSearchTerm(val)
                  if (val) startSearch(val)
                }}
                onInputChange={(_e, newInputValue) => setSearchTerm(newInputValue)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    startSearch(searchTerm || inputRef.current?.value || '')
                  }
                }}
                TextFieldProps={{
                  inputRef: inputRef
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" onClick={() => startSearch(searchTerm || inputRef.current?.value || '')}>
                <Icon color="success">add</Icon> New
              </Button>
            </Stack>
            <Stack direction="row">
              <Autocomplete
                size="small"
                options={['test']}
                value=""
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" disabled>
                <Icon color="error">error</Icon> Next
              </Button>
            </Stack>
          </Stack>
        </Card>
        {(Object.keys(categories) as (keyof typeof categories)[])
          .filter(category => orderCart.filter((x: any) => getCategoryForOrder(x) === category).length > 0)
          .map(category => (
            <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>{categories[category].icon}</Icon> {categories[category].title}</>} color={categories[category].color}>
              {orderCart.filter((x: any) => getCategoryForOrder(x) === category).map((order: any) => (
                <Box key={order.name} sx={{ marginLeft: 3, marginBottom: 2, '&:hover': { backgroundColor: alpha(categories[category].color, 0.25) } }}>
                  <Label variant="body1">{order.name}</Label>
                  <Label fontSize="9pt" sx={{ color: categories[category].color }}>
                    {order.dose}
                  </Label>
                  <Label fontSize="8pt" color="grey">
                    {order.route}, {order.frequency}, {order['Refills']} refills
                  </Label>
                  <Button
                    sx={{
                      display: 'flex',
                      justifyContent: 'right',
                      padding: 0,
                      minWidth: 'auto',
                      border: '1px solid',
                      borderColor: 'black'
                    }}
                    onClick={() => setOrderCart((prev: any[]) => prev.filter((x: any) => x !== order))}
                  >
                    <Icon
                      sx={{
                        fontSize: '10pt',
                        color: 'black'
                      }}
                    >
                      close
                    </Icon>
                  </Button>
                </Box>
              ))}
            </TitledCard>
          ))
        }
        <Box sx={{ p: 1 }}>
          <Button variant="outlined" color="error" onClick={() => {
            setOrderCart([])
          }}>
            <Icon>clear</Icon> Remove All
          </Button>
          <Button variant="outlined" color="success" onClick={() => {
            const discontinued = orderCart.filter((item: any) => !!item.discontinueDate)
            if (discontinued.length > 0) {
              const discontinuedKeys = new Set<string>()
              for (const o of discontinued) {
                if (o.code) discontinuedKeys.add(String(o.code).toLowerCase())
                if (o.name) discontinuedKeys.add(String(o.name).toLowerCase())
                if (o.originalName) discontinuedKeys.add(String(o.originalName).toLowerCase())
                if (o.id) discontinuedKeys.add(String(o.id).toLowerCase())
              }

              const isDocAffected = (docId: string | undefined) => {
                if (!docId || !conditionals || !conditionals[docId]) return false
                const reqs = conditionals[docId]
                if (!Array.isArray(reqs)) return false
                return reqs.some((r: any) => discontinuedKeys.has(String(r).toLowerCase()))
              }

              const isAssociatedTab = (tab: any) => {
                if ("Report" in tab) {
                  const doc = tab["Report"]?.data
                  return isDocAffected(doc?.id || doc?.mrn || doc?.diagnosis)
                }
                if ("Imaging Viewer" in tab) {
                  const doc = tab["Imaging Viewer"]?.data
                  return isDocAffected(doc?.id || doc?.mrn || doc?.diagnosis)
                }
                return false
              }

              setMainTabs?.((prev: any[]) => prev.filter(t => !isAssociatedTab(t)))
              setSideTabs?.((prev: any[]) => prev.filter(t => !isAssociatedTab(t)))
              setWindowTabs?.((prev: any[]) => prev.filter(t => !isAssociatedTab(t)))
            }

            setOrderList((prev: any) => prev.upsert(orderCart, "id"))
            setOrderCart([])
          }}>
            <Icon>check</Icon> Sign
          </Button>
          {Object.values(conditionals ?? {}).flat().includes('__BICEP__') && (
            <Button variant="contained" color="success" onClick={() => {
              setOrderList((prev: any) => prev.upsert([
                { id: crypto.randomUUID(), name: "__ADVANCE_PATIENT_BICEP_SLIDE__", code: "__BICEP__" }
              ], "id"))
            }}>
              <Icon>queue_play_next</Icon> Advance Case
            </Button>
          )}
        </Box>
      </Box>
      {!!openOrderSearch &&
        <OrderSearch open={openOrderSearch} searchTerm={searchTerm} onSelect={(item: any) => {
          setOpenOrderSearch(null)
          setSearchTerm('')
          if (inputRef.current) inputRef.current.value = ''
          if (item !== null) {
            if (Array.isArray(item)) {
              const newItems = item.map((x: any) => ({ ...x, id: crypto.randomUUID(), date: Temporal.Now.instant().toString(), code: x.code, name: x.name, dose: x.dose, route: x.route, frequency: x.frequency }))
              setOrderCart((prev: any) => prev.upsert(newItems, "id"))
            } else {
              if (!item.id) {
                item.id = crypto.randomUUID()
              }
              setOrderCart((prev: any) => prev.upsert(item, "id"))
            }
          }
        }} />
      }
      <Window
        open={openResetModal}
        onClose={() => setOpenResetModal(false)}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon color="error">warning</Icon>
            <Label bold variant="h6">Reset Case - Remove Current Orders</Label>
          </Stack>
        }
        maxWidth="xs"
        fullWidth
        footer={
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
            <Button onClick={() => setOpenResetModal(false)} variant="outlined">Cancel</Button>
            <Button
              onClick={handleResetCase}
              variant="contained"
              color="error"
            >
              Reset Case
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2} sx={{ py: 1 }}>
          <Box sx={{ bgcolor: 'error.main', color: 'error.contrastText', p: 1.5, borderRadius: 1, opacity: 0.9 }}>
            <Label variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
              Caution: This action will reset orders for this case.
            </Label>
          </Box>
          <Label variant="body2">
            Are you sure you want to remove all <strong>{activeOrders.length}</strong> current order{activeOrders.length === 1 ? '' : 's'} for this case?
          </Label>
          <Label variant="body2" color="textSecondary">
            Removing these orders will also hide any conditional labs, imaging, or diagnostic results that depend on them.
          </Label>
        </Stack>
      </Window>
    </Box>
  )
}
