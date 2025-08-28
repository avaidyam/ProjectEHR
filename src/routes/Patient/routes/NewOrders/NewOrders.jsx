import React, { useEffect, useState } from 'react';
import { Box, Button, Card, FormControl, Icon, InputLabel, List, ListItem, ListItemText, ListItemButton, 
  MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography, Select } from '@mui/material';
import { alpha, TitledCard, Window } from 'components/ui/Core.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import labs_all from 'util/data/labs_all.json'
import rxnorm_all from 'util/data/rxnorm_all.json'

const getTextColor = (backC) => {
  switch (backC) {
    case 'New':
      return '#19852F'
    case 'Modify':
      return '#E0A830'
    case 'Hold':
      return '#7e57c2'
    case 'Discontinue':
      return '#CF3935'
    case 'Orders to be Signed':
      return '#7471D4'
    default:
      return 'lightgray'
  }
}

const getIcon = (title) => {
  switch (title) {
    case 'New':
      return "assignment_add"
    case 'Modify':
      return "edit_document"
    case 'Hold':
      return "edit_document"
    case 'Discontinue':
      return "content_paste_off"
    case 'Orders to be Signed':
      return "content_paste"
    default:
      return ''
  }
}

const getText = (title) => {
  switch (title) {
    case 'New':
      return "New Order"
    case 'Modify':
      return "Orders to Modify"
    case 'Hold':
      return "Orders to Hold"
    case 'Discontinue':
      return "Orders to Discontinue"
    case 'Orders to be Signed':
      return "Signed This Visit"
    default:
      return ''
  }
}

// display + add # days on date picker
function dateLocal(addDay) {
  return (
      <DatePicker
        value={dayjs(
          `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`
        ).add(addDay, 'day')}
      />
  );
}

const OrdersList = ({ searchTerm, onSelect, ...props }) => {
  const [value, setValue] = useState(searchTerm)
  const [data, setData] = useState([])

  useEffect(() => { 
    (async () => {
      const medications = rxnorm_all.filter(x => x.name.toLocaleLowerCase().startsWith(value))
      const procedures = Object.values(labs_all.procedures).filter(x => x.toLocaleLowerCase().startsWith(value)).map(x => ({ name: x }))
      setData([...procedures, ...medications])
    })()
  }, [value])

  return (
    <List {...props}>
      <TextField
        label="Add orders or order sets"
        size="small"
        sx={{ minWidth: 300 }}
        variant="outlined"
        value={value}
        onChange={(x) => setValue(x.target.value)}
      />
      {data.map((m) => (
        <ListItem disablePadding key={m.name}>
          <ListItemButton onClick={m.route !== undefined ? () => onSelect(m) : undefined}>
            <ListItemText primary={m.name}/>
          </ListItemButton>
        </ListItem>
      ))}
      {data?.length === 0 ? <p>No Results. Try again.</p> : <></>}
    </List>
  )
}

const OrdersEditor = ({ medication, onSelect, ...props }) => {
  const [tempMed, setTempMed] = useState(medication)
  const [name, setName] = useState(tempMed?.name ?? '')
  const [route, setRoute] = useState(Object.keys(tempMed?.route ?? {})?.[0] ?? '')
  const [dose, setDose] = useState(Object.values(tempMed?.route?.[route] ?? {})?.[0] ?? '')
  const [freq, setFreq] = useState('')
  const [refill, setRefill] = useState(0)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [classCollect, setClass] = useState('')
  const [expectDate, setExpectDate] = useState(0)
  const [expireDate, setExpireDate] = useState(90)
  const [interval, setInterval] = useState(30)
  const [count, setCount] = useState(1)

  return (
    <>
      <Box sx={{ backgroundColor: "info.dark", color: "primary.contrastText", height: "40px" }}>
        {tempMed?.name ?? ''}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button sx={{ color: "primary.contrastText" }} onClick={() => onSelect({ type: 'New', name, dose, freq, route, refill, startDate: undefined })}><Icon color="success.light">check</Icon>Accept</Button>
          <Button sx={{ color: "primary.contrastText" }} onClick={() => onSelect(null)}><Icon color="error">clear</Icon>Cancel</Button>
        </Box>
      </Box>

      {!!tempMed?.route && (
        <>
          <p>Route: </p> 
          <ToggleButtonGroup
            value={route}
            exclusive
            onChange={(event, val) => setRoute(val)}
          >
            {Object.keys(tempMed?.route ?? {})?.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
          </ToggleButtonGroup>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <p>Dose: </p> 
          <ToggleButtonGroup
            value={dose}
            exclusive
            onChange={(event, val) => setDose(val)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {Object.values(tempMed?.route?.[route] ?? {})?.map((d) => (
              <ToggleButton value={d} key={d}>{d}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <p>Frequency: </p> 
          <TextField id="outlined-basic" variant="outlined" value={freq} onChange={(event) => setFreq(event.target.value)}>Daily</TextField>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <p>Refills: </p> 
          <ToggleButtonGroup
            value={refill}
            exclusive
            onChange={(event, val) => setRefill(val)}
          >
            {[0, 1, 2, 3].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
          </ToggleButtonGroup>
        </>
      )}

      {!!tempMed && (
        <>
          Order type: 
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(event, val) => setType(val)}
          >
            <ToggleButton value='Outpatient'><Icon>home</Icon></ToggleButton>
            <ToggleButton value='Inpatient'><Icon>hotel</Icon></ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {!!tempMed && (
        <>
          <p>Status: </p> 
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(event, val) => setStatus(val)}
          >
            {['Standing', 'Future'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
          </ToggleButtonGroup>
        </>
      )}

      {status==='Standing' && (
        <>
          <p>Interval: </p>
          <ToggleButtonGroup
            value={interval}
            exclusive
            onChange={(event, val) => setInterval(val)}
          >
            <ToggleButton value={30}>1 Month</ToggleButton>
            <ToggleButton value={60}>2 Months</ToggleButton>
            <ToggleButton value={90}>3 Months</ToggleButton>
            <ToggleButton value={120}>4 Months</ToggleButton>
            <ToggleButton value={180}>6 Months</ToggleButton>
            <ToggleButton value={365}>1 Year</ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {status==='Standing' && (
        <>
          <p>Count: </p>
          <ToggleButtonGroup
            value={count}
            exclusive
            onChange={(event, val) => setCount(val)}
          >
            <ToggleButton value={1}>1</ToggleButton>
            <ToggleButton value={2}>2</ToggleButton>
            <ToggleButton value={3}>3</ToggleButton>
            <ToggleButton value={4}>4</ToggleButton>
            <ToggleButton value={6}>6</ToggleButton>
            <ToggleButton value={12}>12</ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {status==='Future' && (
        <>
          <p>Expected date: </p>
          <ToggleButtonGroup
            value={expectDate}
            exclusive
            onChange={(event, val) => setExpectDate(val)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <div>{dateLocal(expectDate)}</div>
            <ToggleButton value={0}>Today</ToggleButton>
            <ToggleButton value={1}>Tomorrow</ToggleButton>
            <ToggleButton value={7}>1 Week</ToggleButton>
            <ToggleButton value={14}>2 Weeks</ToggleButton>
            <ToggleButton value={30}>1 Month</ToggleButton>
            <ToggleButton value={60}>2 Months</ToggleButton>
            <ToggleButton value={90}>3 Months</ToggleButton>
            <ToggleButton value={180}>6 Months</ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {status==='Future' && (
        <>
          <p>Expires: </p>
          <ToggleButtonGroup
            value={expireDate}
            exclusive
            onChange={(event, val) => setExpireDate(val)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            <div>{dateLocal(expireDate)}</div>
            <ToggleButton value={30}>1 Month</ToggleButton>
            <ToggleButton value={60}>2 Months</ToggleButton>
            <ToggleButton value={90}>3 Months</ToggleButton>
            <ToggleButton value={120}>4 Months</ToggleButton>
            <ToggleButton value={180}>6 Months</ToggleButton>
            <ToggleButton value={365}>1 Year</ToggleButton>
            <ToggleButton value={547}>18 Months</ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      {!!tempMed && (
        <>
          <p>Priority: </p>
          <ToggleButtonGroup
            value={priority}
            exclusive
            onChange={(event, val) => setPriority(val)}
          >
            {['STAT', 'Timed', 'Routine'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
          </ToggleButtonGroup>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <p>Class: </p>
          <ToggleButtonGroup
            value={classCollect}
            exclusive
            onChange={(event, val) => setClass(val)}
          >
            {['Lab', 'Unit'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
          </ToggleButtonGroup>
        </>
      )}

      <Box sx={{backgroundColor: "info.dark", color: "primary.contrastText", height: "40px"}}>
        <div style={{float: "right"}}>
          <Button sx={{color: "primary.contrastText"}} onClick={() => onSelect({ type: 'New', name, dose, freq, route, refill, startDate: undefined })}><Icon color="success.light">check</Icon>Accept</Button>
          <Button sx={{color: "primary.contrastText"}} onClick={() => onSelect(null)}><Icon color="error">clear</Icon>Cancel</Button>
        </div>
      </Box>
    </>
  )
}

export default function Orders() {
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderList, setOrderList] = useEncounter().orderCart["_currentUser"]([])
  
  const [value, setValue] = useState('')
  const [openSearchList, setOpenSearchList] = useState(null)
  const [openOrder, setOpenOrder] = useState(null)

  // Used to maintain a number of how many orders in each section, used to hide sections with 0 orders
  // const countOrdersOfType = (orders, type) => {
  //  return orders.filter(order => order.type === type).length;
  // };
  
  // Handles removing orders on "x" click
  const removeOrder = (orderToRemove) => {
    setOrderList(orderList.filter(order => order !== orderToRemove));
  };
  

  const categories = ["New", "Modify", "Hold", "Discontinue", "Orders to be Signed"]
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
                    setOpenSearchList(!openSearchList);
                }}
              />
              <Button variant="outlined" onClick={() => { setOpenSearchList(!openSearchList) }}>
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
        {categories.filter(category => orderList.filter((x) => x.type === category).length > 0).map(category => (
          <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>{getIcon(category)}</Icon> {getText(category)}</>} color={getTextColor(category)}>
            {orderList.filter((x) => x.type === category).map((order) => (
              <Box key={order.name} sx={{ marginLeft:3, marginBottom:2, '&:hover': { backgroundColor: alpha(getTextColor(category), 0.25) } }}>
                <Typography variant="body1">{order.name}</Typography>
                <Typography fontSize="9pt" sx={{ color: getTextColor(category) }}>
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
                  onClick={() => removeOrder(order)}
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
          <Button variant="outlined" color="error" onClick={() => setOrderList([])}>
            <Icon>clear</Icon> Remove All
          </Button>
          <Button variant="outlined" color="success" onClick={() => setOrderList([])}>
            <Icon>check</Icon> Sign
          </Button>
        </Box>
      </Box>
      <Window fullWidth maxWidth="md" onClose={() => setOpenSearchList(null)} open={!!openSearchList}>
        <OrdersList searchTerm={value} onSelect={(item) => {
          setOpenSearchList(null)
          setOpenOrder(item)
        }} />
      </Window>
      <Window fullWidth maxWidth="md" onClose={() => setOpenOrder(null)} open={!!openOrder}>
        <OrdersEditor medication={openOrder} onSelect={(item) => {
          setOpenSearchList(null)
          setOpenOrder(null)
          if (item !== null)
            setOrderList(prev => [...prev, item])
        }} />
      </Window>
    </Box>
  );
}
