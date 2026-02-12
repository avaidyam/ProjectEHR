import * as React from 'react'
import { Card, FormControl, Icon, InputLabel, MenuItem, TextField, Typography, Select } from '@mui/material'
import { alpha, Box, Button, ButtonGroup, TitledCard } from 'components/ui/Core'
import { usePatient } from 'components/contexts/PatientContext'
import { OrderComposer } from './components/OrderComposer'
import { OrderPicker } from './components/OrderPicker'

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

  const inputRef = React.useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [openSearchList, setOpenSearchList] = React.useState<any>(null)
  const [openOrder, setOpenOrder] = React.useState<any>(null)

  const startSearch = () => {
    setSearchTerm(inputRef.current?.value ?? '')
    if (inputRef.current) inputRef.current.value = ''
    setOpenSearchList(true)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flexGrow: 1, paddingRight: '20px' }}>
        <Card sx={{ m: 1, p: 1 }}>
          <Box>
            <ButtonGroup sx={{ whiteSpace: 'nowrap' }} size="small">
              <Button>Manage Orders</Button>
              <Button>Order Sets</Button>
            </ButtonGroup>
            <FormControl sx={{ minWidth: 100 }} size="small">
              <InputLabel>Options</InputLabel>
              <Select>
                <MenuItem>Test</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ pt: 4 }}>
            <Button><Icon>person_outline</Icon>Providers</Button>
            <Button><Icon>edit</Icon>Edit Multiple</Button>
          </Box>
          <Box>
            <Box>
              <TextField
                label="Add orders or order sets"
                size="small"
                sx={{ minWidth: 300 }}
                variant="outlined"
                inputRef={inputRef}
                onKeyDown={(event) => {
                  if (event.key === 'Enter')
                    startSearch()
                }}
              />
              <Button variant="outlined" onClick={startSearch}>
                <Icon color="success">add</Icon> New
              </Button>
            </Box>
            <Box>
              <FormControl sx={{ minWidth: 300 }} size="small">
                <Select value="">
                  <MenuItem value='test'>Test</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" disabled>
                <Icon color="error">error</Icon> Next
              </Button>
            </Box>
          </Box>
        </Card>
        {Object.keys(categories).filter((category: string) => (orderCart as any[]).filter((x: any) => getCategoryForOrder(x) === category).length > 0).map((category: string) => (
          <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>{(categories as any)[category].icon}</Icon> {(categories as any)[category].title}</>} color={(categories as any)[category].color}>
            {(orderCart as any[]).filter((x: any) => getCategoryForOrder(x) === category).map((order: any) => (
              <Box key={order.name} sx={{ marginLeft: 3, marginBottom: 2, '&:hover': { backgroundColor: alpha((categories as any)[category].color, 0.25) } }}>
                <Typography variant="body1">{order.name}</Typography>
                <Typography fontSize="9pt" sx={{ color: (categories as any)[category].color }}>
                  {order.dose}
                </Typography>
                <Typography fontSize="8pt" color="grey">
                  {order.route}, {order.frequency}, {order['Refills']} refills
                </Typography>
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
        ))}
        <Box sx={{ p: 1 }}>
          <Button variant="outlined" color="error" onClick={() => {
            setOrderCart([])
          }}>
            <Icon>clear</Icon> Remove All
          </Button>
          <Button variant="outlined" color="success" onClick={() => {
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
      {!!openSearchList &&
        <OrderPicker open={openSearchList} searchTerm={searchTerm} onSelect={(item: any) => {
          setOpenSearchList(null)
          if (item !== null) {
            if (Array.isArray(item)) {
              const newItems = item.map((x: any) => ({ ...x, id: crypto.randomUUID(), date: new Date(), code: x.code, name: x.name, dose: x.dose, route: x.route, frequency: x.frequency }))
              setOrderCart((prev: any) => prev.upsert(newItems, "id"))
            } else {
              setOpenOrder(item)
            }
          }
        }} />
      }
      {!!openOrder &&
        <OrderComposer open={openOrder} medication={openOrder} onSelect={(item: any) => {
          setOpenSearchList(null)
          setOpenOrder(null)
          if (item !== null) {
            if (!item.id) {
              item.id = crypto.randomUUID() // every order needs a UUID! 
            }
            setOrderCart((prev: any) => prev.upsert(item, "id"))
          }
        }} />
      }
    </Box>
  )
}
