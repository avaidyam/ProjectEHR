import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, DialogActions, FormControl, Icon, InputLabel, List, ListItem, ListItemText, ListItemButton, 
  MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography, Select} from '@mui/material';

// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

 // import json orders master list
import { getRxTerms } from '../../../../util/getRxTerms.js';

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

  // temp med = info of chosen med i.e. route, etc. 
  const [tempMed, setTempMed] = useState(null)

  // many variables down the line- will consider adding this into a map laer
  const [openSearchList, setOpenSearchList] = useState(false) 
  const [openOrder, setOpenOrder] = useState(false) 
  const [data, setData] = useState([])
  const [value, setValue] = useState('')
  const [name, setName] = useState('')
  const [route, setRoute] = useState('') 
  const [dose, setDose] = useState('') 
  const [freq, setFreq] = useState('') 
  const [refill, setRefill] = useState(0) 

  // for ordering labs i.e. CBC
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [classCollect, setClass] = useState('');

  // for future labs only: expected date & expired date of lab order
  const [expectDate, setExpectDate] = useState(0);
  const [expireDate, setExpireDate] = useState(90);

  // for standing labs only: interval (how often) & count (# of times)
  const [interval, setInterval] = useState(30);
  const [count, setCount] = useState(1);

  // list of orders that are pending/waiting to be signed
  const [orderList, setOrderList] = useState([]);

  // action for signing orders
  const submitOrder = () => {
    // some code on submitting order (will fill this in the future), then empty the templist
    setOrderList([]);
  }

  // close med order dialog & reset variables. if "accept" clicked, add med to order list
  const closeOrder = (save) => {
    setOpenOrder(false);
    if (save){
      orderList.push(`${name} ${dose} ${route} ${freq}`);
    }
    setName('');
    setRoute('');
    setDose('');
    setType('');
    setStatus('');
    setPriority('');
    setClass('');
  };

  useEffect(() => {
    getRxTerms(value).then(setData);
  }, [openSearchList]);
  // [value] can provide instant updates, but this is not necessary for us
  // instead, use [openSearchList] to only update when dialog is hidden or shown
  // can even further be optimized to check if openSearchList == true, ONLY then update

  // previously used to display json med list: <pre>{JSON.stringify(data, null, 4)}</pre>

  return (
  <Box sx={{ m: 1 }}>
    <Card sx={{m:1, p:1}}>
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
                setOpenSearchList(!openSearchList)
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
            {(!data || data.length === 0) ? (
              <p>No Results. Try again.</p>
            ) : (
            data.map((m) => (
              <ListItem disablePadding>
                <ListItemButton onClick={() => {
                  setTempMed(m); 
                  setName(m.name ? m.name : name); 
                  setRoute(m.fields.route ? m.fields.route[0] : route); 
                  setDose(m.fields.dose ? m.fields.dose[0][0] : dose); 
                  setFreq(m.fields.dose ? 'daily' : '');
                  setRefill(m.fields.refills ? m.fields.refills : refill); 
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
                
        <Box sx={{backgroundColor: "info.dark", color: "primary.contrastText", height: "40px"}}>
            {tempMed ? tempMed.name : ''}
            <DialogActions style={{float: "right"}}>
              <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(true) }}><Icon color="success.light">check</Icon>Accept</Button>
              <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(false) }}><Icon color="error">clear</Icon>Cancel</Button>
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
            {tempMed.fields.route.map((m) => (<ToggleButton value={m}>{m}</ToggleButton>))}
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
                    <ToggleButton value={sub}>{sub}</ToggleButton>
                  ))
                ))}
              </ToggleButtonGroup>

              <p>Frequency: </p> 
                <TextField id="outlined-basic" variant="outlined" value={freq} onChange={(event) => setFreq(event.target.value)}>daily</TextField>

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
                  <ToggleButton value={tempMed ? tempMed.fields.refills : refill}>{tempMed ? tempMed.fields.refills : refill}</ToggleButton>
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
              {tempMed.fields.status.map((m) => (<ToggleButton value={m}>{m}</ToggleButton>))}
              </ToggleButtonGroup>
              </>)}

              {status==='Standing' && (<><p>Interval: </p>
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
              </>)}

              {status==='Standing' && (<><p>Count: </p>
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
              </>)}

              {status==='Future' && (<><p>Expected date: </p>
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
              </ToggleButtonGroup></>
              )}

              {status==='Future' && (<><p>Expires: </p>


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
              </>)}

              {tempMed && tempMed.fields.priority && (
                <>
                  <p>Priority: </p>
                  <ToggleButtonGroup
                    value={priority}
                    exclusive
                    onChange={(event, val) => setPriority(val)}
                  >
                    {tempMed.fields.priority.map((m) => (<ToggleButton value={m}>{m}</ToggleButton>))}
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
                {tempMed.fields.class.map((m) => (<ToggleButton value={m}>{m}</ToggleButton>))}
              </ToggleButtonGroup>
            </>
          )}

          <Box sx={{backgroundColor: "info.dark", color: "primary.contrastText", height: "40px"}}>
            <div style={{float: "right"}}>
              <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(true) }}><Icon color="success.light">check</Icon>Accept</Button>
              <Button sx={{color: "primary.contrastText"}} onClick={() => { closeOrder(false) }}><Icon color="error">clear</Icon>Cancel</Button></div>
          </Box>

        </Dialog>
        
        {orderList.map((o) => (
            <Card sx={{m:1, p:1}}>
              <Typography variant="overline" sx={{ color: "success.dark", fontWeight: 600 }}><Icon>post_add</Icon> New Order</Typography>
              <br />
              {o}
            </Card>
          ))}

        <Box sx={{p: 1}}>
          <Button variant="outlined" onClick={submitOrder}>
            <Icon color="error">clear</Icon>Remove All

          </Button>
          <Button variant="outlined" onClick={submitOrder}>
            <Icon color="success">check</Icon> Sign
          </Button>
        </Box>
      </div>

    </Box>
  );
}
