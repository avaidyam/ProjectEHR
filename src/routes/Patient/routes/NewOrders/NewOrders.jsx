import React, { useState } from 'react'
import { Card, FormControl, Icon, InputLabel,
  MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography, Select } from '@mui/material'
import { alpha, Box, Button, TitledCard } from 'components/ui/Core.jsx'
import { usePatient } from 'components/contexts/PatientContext.jsx'
import { OrderComposer } from './components/OrderComposer.jsx'
import { OrderPicker } from './components/OrderPicker.jsx'

const categories = {
  "New": {
    icon: "assignment_add",
    title: "New Order",
    color: '#19852F'
  }, 
  "Modify": {
    icon: "edit_document",
    title: "Orders to Modify",
    color: '#E0A830'
  }, 
  "Hold": {
    icon: "edit_document",
    title: "Orders to Hold",
    color: '#7e57c2'
  }, 
  "Discontinue": {
    icon: "content_paste_off",
    title: "Orders to Discontinue",
    color: '#CF3935'
  }, 
  "Orders to be Signed": {
    icon: "content_paste",
    title: "Signed This Visit",
    color: '#7471D4'
  }
}

export default function Orders() {
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderCart, setOrderCart] = useEncounter().orderCart["_currentUser"]([])
  const [orderList, setOrderList] = useEncounter().orders([])
  
  const [value, setValue] = useState('')
  const [openSearchList, setOpenSearchList] = useState(null)
  const [openOrder, setOpenOrder] = useState(null)
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flexGrow: 1, paddingRight: '20px' }}>
        <Card sx={{ m: 1, p: 1 }}>
          <Box>
            <ToggleButtonGroup sx={{ whiteSpace: 'nowrap'}} size="small">
              <ToggleButton>Manage Orders</ToggleButton>
              <ToggleButton>Order Sets</ToggleButton>
            </ToggleButtonGroup>
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
                value={value}
                onChange={(x) => setValue(x.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter')
                    setOpenSearchList(true)
                }}
              />
              <Button variant="outlined" onClick={() => { setOpenSearchList(true) }}>
                <Icon color="success">add</Icon> New
              </Button>
            </Box>
            <Box>
              <FormControl sx={{ minWidth: 300 }} size="small">
                <Select>
                  <MenuItem value='test'>Test</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" disabled>
                <Icon color="error" disabled>error</Icon> Next
              </Button>
            </Box>
          </Box>
        </Card>
        {Object.keys(categories).filter(category => orderCart.filter((x) => x.type === category).length > 0).map(category => (
          <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>{categories[category].icon}</Icon> {categories[category].title}</>} color={categories[category].color}>
            {orderCart.filter((x) => x.type === category).map((order) => (
              <Box key={order.name} sx={{ marginLeft:3, marginBottom:2, '&:hover': { backgroundColor: alpha(categories[category].color, 0.25) } }}>
                <Typography variant="body1">{order.name}</Typography>
                <Typography fontSize="9pt" sx={{ color: categories[category].color }}>
                  {order.dose}
                </Typography>
                <Typography fontSize="8pt" color="grey">
                  {order.route}, {order.freq}, {order.refill} Refills
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
                  onClick={() => setOrderCart(prev => prev.filter(x => x !== order))}
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
        <Box sx={{p: 1}}>
          <Button variant="outlined" color="error" onClick={() => {
            setOrderCart([])
          }}>
            <Icon>clear</Icon> Remove All
          </Button>
          <Button variant="outlined" color="success" onClick={() => {
            setOrderList(prev => [...prev, ...orderCart])
            setOrderCart([])
          }}>
            <Icon>check</Icon> Sign
          </Button>
        </Box>
      </Box>
      {!!openSearchList &&
        <OrderPicker open={openSearchList} searchTerm={value} onSelect={(item) => {
          setOpenSearchList(null)
          setValue(null)
          if (item !== null)
            setOpenOrder(item)
        }} />
      }
      {!!openOrder &&
        <OrderComposer open={openOrder} medication={openOrder} onSelect={(item) => {
          setOpenSearchList(null)
          setOpenOrder(null)
          if (item !== null)
            setOrderCart(prev => [...prev, item])
        }} />
      }
    </Box>
  )
}
