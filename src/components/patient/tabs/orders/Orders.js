import React, { useEffect } from 'react';
import { Box, Button, Card, Dialog, DialogActions, FormControl, Icon, InputLabel, List, ListItem, ListItemText, ListItemButton, 
  MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography, Select } from '@mui/material';

// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

// import json orders master list
import { getRxTerms } from '../../../../util/getRxTerms.js';
import {useOrder} from './OrdersContext.js';

// display + add # days on date picker
function dateLocal(addDay) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dayjs(
          `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`
        ).add(addDay, 'day')}
      />
    </LocalizationProvider>
  );
}

export default function Orders() {
  
  const {
    tempMed, setTempMed, openSearchList, setOpenSearchList, openOrder, setOpenOrder, 
    data, setData, value, setValue, name, setName, route, setRoute, dose, setDose, freq, setFreq, refill, setRefill, 
    type, setType, status, setStatus, priority, setPriority, classCollect, setClass,
    expectDate, setExpectDate, expireDate, setExpireDate, interval, setInterval, count, setCount, orderList, setOrderList,
    submitOrder, closeOrder
  } = useOrder();

  useEffect(() => {
    getRxTerms(value).then(setData);
  }, [openSearchList]);
  // [value] can provide instant updates, but this is not necessary for us
  // instead, use [openSearchList] to only update when dialog is hidden or shown
  // can even further be optimized to check if openSearchList == true, ONLY then update


  // called to get the color scheme for text and box styling
  const getBackgroundColor = (backC) => {
    switch (backC) {
      case 'New':
        return '#19852F'
      case 'Modify':
        return '#E27602'
      case 'Hold':
        return '#7e57c2'
      case 'Discontinue':
        return '#FF2C2C'
      case 'Orders to be Signed':
        return '#B19CD9'
      default:
        return 'lightgray'
    }
  }

  // Used to get the highlight color based on drug type
  const getHighlightColor = (highC) => {
    switch (highC) {
      case 'New':
        return '#87E8B6'
      case 'Modify':
        return '#E8BE9D'
      case 'Hold':
        return '#b39ddb'
      case 'Discontinue':
        return '#E88E96'
      case 'Orders to be Signed':
        return '#B19CD9'
      default:
        return 'lightgray'
    }
  }
  // called to generate the titles for each category, New, Modified, etc... with styling and icons
  const getTitle = (title) => {
    switch (title) {
      case 'New':
        return <Typography variant="overline" sx={{color:'#19852F', fontWeight:600, fontSize:'16px', backgroundColor:'#BCF2C1'}}>&nbsp;<Icon sx={{fontSize:'20px', position:'relative', top:'3.5px'}}>assignment_add</Icon> New Order&nbsp;&nbsp;</Typography>
      case 'Modify':
        return <Typography variant="overline" sx={{color:'#E0A830', fontWeight:600, fontSize:'16px', backgroundColor:'#F2DFC8'}}>&nbsp;<Icon sx={{fontSize:'20px', position:'relative', top:'3.5px'}}>edit_document</Icon> Orders to Modify&nbsp;&nbsp;</Typography>
      case 'Hold':
        return <Typography variant="overline" sx={{color:'#7e57c2', fontWeight:600, fontSize:'16px', backgroundColor:'#d1c4e9'}}>&nbsp;<Icon sx={{fontSize:'20px', position:'relative', top:'3.5px'}}>edit_document</Icon> Orders to Hold&nbsp;&nbsp;</Typography>
      case 'Discontinue':
        return <Typography variant="overline" sx={{color:'#CF3935', fontWeight:600, fontSize:'16px', backgroundColor:'#F2CCCD'}}>&nbsp;<Icon sx={{fontSize:'20px', position:'relative', top:'3.5px'}}>content_paste_off</Icon> Orders to Discontinue&nbsp;&nbsp;</Typography>
      case 'Orders to be Signed':
        return <Typography variant="overline" sx={{color:'#7471D4', fontWeight:600, fontSize:'16px'}}> <Icon sx={{fontSize:'20px', position:'relative', top:'3.5px'}}>content_paste</Icon> Signed This Visit</Typography>
      default:
        return ''
    }
  }

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
              <ToggleButton><u>M</u>anage Orders</ToggleButton>
              <ToggleButton>Or<u>d</u>er Sets</ToggleButton>
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
                <Icon color="success">add</Icon> Ne<u>w</u>
              </Button>
            </Box>
            <Box>
              <FormControl sx={{ minWidth: 300 }} size="small">
                <Select>
                  <MenuItem value='test'>Test</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" disabled>
                <Icon color="error" disabled>error</Icon> <u>N</u>ext
              </Button>
            </Box>
          </Box>
        </Card>

        <div>
          <Dialog fullWidth maxWidth="md" onClose={() => { setOpenSearchList(false) }} open={openSearchList}>
            <List>
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

              {(!data || data.length === 0) ? (
                <p>No Results. Try again.</p>
              ) : (
                data.map((m) => (
                  <ListItem disablePadding key={m.name}>
                    <ListItemButton onClick={() => {
                      setTempMed(m); 
                      setName(m.name ? m.name : name); 
                      setRoute(m.fields.route ? m.fields.route[0] : route); 
                      setDose(m.fields.dose ? m.fields.dose[0][0] : dose); 
                      setFreq(m.fields.dose ? 'Daily' : '');
                      setRefill(m.fields.refills ? m.fields.refills[0] : refill); 
                      setType(m.fields.type ? m.fields.type[0] : type);
                      setStatus(m.fields.status ? m.fields.status[2] : status);
                      setPriority(m.fields.priority ? m.fields.priority[0] : priority);
                      setClass(m.fields.class ? m.fields.class[0] : classCollect);
                      setOpenOrder(!openOrder); 
                      setOpenSearchList(false);
                    }}>
                      <ListItemText primary={m.name}/>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Dialog>

          <Dialog fullWidth maxWidth="md" onClose={() => { setOpenOrder(false) }} open={openOrder}>
            <Box sx={{ backgroundColor: "info.dark", color: "primary.contrastText", height: "40px" }}>
              {tempMed ? tempMed.name : ''}
              <DialogActions style={{ float: "right" }}>
                <Button sx={{ color: "primary.contrastText" }} onClick={() => { closeOrder(true) }}><Icon color="success.light">check</Icon>Accept</Button>
                <Button sx={{ color: "primary.contrastText" }} onClick={() => { closeOrder(false) }}><Icon color="error">clear</Icon>Cancel</Button>
              </DialogActions>
            </Box>

            {tempMed && tempMed.fields.route && (
              <>
                <p>Route: </p> 
                <ToggleButtonGroup
                  value={route}
                  exclusive
                  onChange={(event, val) => setRoute(val)}
                >
                  {tempMed.fields.route.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
                </ToggleButtonGroup>
              </>
            )}

            {tempMed && tempMed.fields.dose && (
              <>
                <p>Dose: </p> 
                <ToggleButtonGroup
                  value={dose}
                  exclusive
                  onChange={(event, val) => setDose(val)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {tempMed.fields.dose.map((d) => (
                    d.map((sub) => (
                      <ToggleButton value={sub} key={sub}>{sub}</ToggleButton>
                    ))
                  ))}
                </ToggleButtonGroup>

                <p>Frequency: </p> 
                <TextField id="outlined-basic" variant="outlined" value={freq} onChange={(event) => setFreq(event.target.value)}>Daily</TextField>
              </>
            )}

            {tempMed && tempMed.fields.refills && (
              <>
                <p>Refills: </p> 
                <ToggleButtonGroup
                  value={refill}
                  exclusive
                  onChange={(event, val) => setRefill(val)}
                >
                  {tempMed.fields.refills.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
                </ToggleButtonGroup>
              </>
            )}

            {tempMed && tempMed.fields.type && (
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

            {tempMed && tempMed.fields.status && (
              <>
                <p>Status: </p> 
                <ToggleButtonGroup
                  value={status}
                  exclusive
                  onChange={(event, val) => setStatus(val)}
                >
                  {tempMed.fields.status.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
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

            {tempMed && tempMed.fields.priority && (
              <>
                <p>Priority: </p>
                <ToggleButtonGroup
                  value={priority}
                  exclusive
                  onChange={(event, val) => setPriority(val)}
                >
                  {tempMed.fields.priority.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
                </ToggleButtonGroup>
              </>
            )}

            {tempMed && tempMed.fields.class && (
              <>
                <p>Class: </p>
                <ToggleButtonGroup
                  value={classCollect}
                  exclusive
                  onChange={(event, val) => setClass(val)}
                >
                  {tempMed.fields.class.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
                </ToggleButtonGroup>
              </>
            )}

            <Box sx={{backgroundColor: "info.dark", color: "primary.contrastText", height: "40px"}}>
              <div style={{float: "right"}}>
                <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(true) }}><Icon color="success.light">check</Icon>Accept</Button>
                <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(false) }}><Icon color="error">clear</Icon>Cancel</Button>
              </div>
            </Box>
          </Dialog>


            {categories.map((name) => {
              const ordersOfType = orderList.filter((x) => x.type === name);

              if (ordersOfType.length === 0) {
                return null;
              }

              return (
                <Card 
                  key={name} 
                  sx={{ 
                    marginBottom: 2, 
                    borderLeft: '4px solid', 
                    borderLeftColor: getBackgroundColor(name),
                    '&:hover': {
                    backgroundColor: getHighlightColor(name),
                  } 
                  }}>
                  {getTitle(name)}
                  {ordersOfType.map((order) => (
                    <Box key={order.name} sx={{ marginLeft:3, marginBottom:2 }}>
                      <Typography variant="body1">{order.name}</Typography>
                      <Typography fontSize="9pt" sx={{ color: getBackgroundColor(name) }}>
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
                </Card>
              );
            })}

          <Box sx={{p: 1}}>
            <Button variant="outlined" color="error" onClick={submitOrder}>
              <Icon>clear</Icon> Remove All
            </Button>
            <Button variant="outlined" color="success" onClick={submitOrder}>
              <Icon>check</Icon> Sign
            </Button>
          </Box>
        </div>
      </Box>
</Box>
  );
}
