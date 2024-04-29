import React, { useEffect, useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Icon, Box, TextField, Button, Dialog, DialogActions, List, ListItem, ListItemText, ListItemButton, Tooltip} from '@mui/material';
// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
 
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

  // for ordering meds (?combine "ADD ORDERS" button w/ meds + labs as 1 button for the future)
  const [openMed, setOpenMed] = useState(false) 
  const [openDose, setOpenDose] = useState(false) 
  const [data, setData] = useState([])
  const [value, setValue] = useState('acetaminophen')
  const [route, setRoute] = useState('') 
  const [dose, setDose] = useState('') 
  const [freq, setFreq] = useState('daily') 
  const [refill, setRefill] = useState(0) 

  // for ordering labs i.e. CBC
  const [openLab, setOpenLab] = useState(false) 
  const [type, setType] = useState('outpatient');
  const [status, setStatus] = useState('future');
  const [priority, setPriority] = useState('routine');
  const [classCollect, setClass] = useState('lab');

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

  // close lab order dialog. if "accept" clicked, add lab to order list
  const closeLab = (save) => {
    setOpenLab(false);
    if (save){
      orderList.push('CBC w/ DIFF');
    }
  };

  // close med order dialog. if "accept" clicked, add med to order list
  const closeDose = (save) => {
    setOpenDose(false);
    if (save){
      orderList.push(`${value} ${dose} ${route} ${freq}`);
    }
  };

  useEffect(() => {
    getRxTerms(value).then(setData);
  }, [openMed]);
  // [value] can provide instant updates, but this is not necessary for us
  // instead, use [openMed] to only update when dialog is hidden or shown
  // can even further be optimized to check if openMed == true, ONLY then update

  // previously used to display json med list: <pre>{JSON.stringify(data, null, 4)}</pre>

  return (
    <Box>
      <div>
        <TextField
          label="Search Medications"
          variant="outlined"
          value={value}
          onChange={(x) => setValue(x.target.value)}
        />
        <Button variant="outlined" onClick={() => { setOpenMed(!openMed) }}>
          Add Medication
        </Button>
        <Button variant="outlined" onClick={() => { setOpenLab(!openLab) }}>
          Add Lab
        </Button>

        <Dialog fullWidth maxWidth="md" onClose={() => { setOpenMed(false) }} open={openMed}>

          <nav>
            <List>
              {data.map((m) => (
                <ListItem disablePadding>
                <ListItemButton onClick={() => 
                  {setTempMed(m); 
                  setRoute(m.fields.route ? m.fields.route[0] : route); 
                  setDose(m.fields.dose ? m.fields.dose[0][0] : dose); 
                  setFreq('daily');
                  setRefill(m.fields.refills ? m.fields.refills : refill); 
                  setOpenDose(!openDose); 
                  setOpenMed(false);}}>
                  <ListItemText primary={m.name}/>
                </ListItemButton>
              </ListItem>
              ))}
            </List>
          </nav>
        </Dialog>


        <Dialog fullWidth maxWidth="md" onClose={() => { setOpenDose(false) }} open={openDose}>
                
        <div style={{backgroundColor: "blue", height: "40px"}}>
            {tempMed ? tempMed.name : ''}
            <DialogActions style={{float: "right"}}>
              <Button onClick={() => { closeDose(true) }}><Icon color="success">check</Icon>Accept</Button>
              <Button onClick={() => { closeDose(false) }}><Icon color="error">clear</Icon>Cancel</Button>
            </DialogActions>
        </div>
                <p>Route: </p> 
                <ToggleButtonGroup
                  value={route}
                  exclusive
                  onChange={(event, val) => setRoute(val)}
                >
                {
                tempMed ? tempMed.fields.route.map((m) => (
                  <ToggleButton value={m}>{m}</ToggleButton>
                )) : ''
                }
              </ToggleButtonGroup>

              <p>Dose: </p> 
                <ToggleButtonGroup
                  value={dose}
                  exclusive
                  onChange={(event, val) => setDose(val)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                {tempMed ? tempMed.fields.dose.map((d) => (
                  d.map((sub) => (
                    <ToggleButton value={sub}>{sub}</ToggleButton>
                  ))
                )) : ''}
              </ToggleButtonGroup>

              <p>Frequency: </p> 
                <TextField id="outlined-basic" variant="outlined" value={freq} onChange={(event) => setFreq(event.target.value)}/>

              <p>Refills: </p> 
                <ToggleButtonGroup
                  value={refill}
                  exclusive
                  onChange={(event, val) => setRefill(val)}
                >
                  <ToggleButton value={tempMed ? tempMed.fields.refills : refill}>{tempMed ? tempMed.fields.refills : refill}</ToggleButton>
              </ToggleButtonGroup>

          <div style={{backgroundColor: "blue", height: '40px'}}>
            <div style={{float: "right"}}>
              <Button onClick={() => { closeDose(true) }}><Icon color="success">check</Icon>Accept</Button>
              <Button onClick={() => { closeDose(false) }}><Icon color="error">clear</Icon>Cancel</Button></div>
          </div>

        </Dialog>
        <Dialog fullWidth maxWidth="md" onClose={() => { setOpenLab(false) }} open={openLab}>

          <div style={{backgroundColor: "blue", height: "40px"}}>
            CBC w/ DIFF
            <DialogActions style={{float: "right"}}>
              <Button onClick={() => { closeLab(true) }}><Icon color="success">check</Icon>Accept</Button>
              <Button onClick={() => { closeLab(false) }}><Icon color="error">clear</Icon>Cancel</Button>
            </DialogActions>
          </div>

          <div>
              Order type: 
                <ToggleButtonGroup
                  value={type}
                  exclusive
                  onChange={(event, val) => setType(val)}
                >
                  <ToggleButton value='outpatient'><Icon>home</Icon></ToggleButton>
                  <ToggleButton value='inpatient'><Icon>hotel</Icon></ToggleButton>
                </ToggleButtonGroup>

              <p>Status: </p> 
              <ToggleButtonGroup
                value={status}
                exclusive
                onChange={(event, val) => setStatus(val)}
              >
                <ToggleButton value='normal'>Normal</ToggleButton>
                <ToggleButton value='standing'>Standing</ToggleButton>
                <ToggleButton value='future'>Future</ToggleButton>
              </ToggleButtonGroup>

              {status==='standing' && (<><p>Interval: </p>
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

              {status==='standing' && (<><p>Count: </p>
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

              {status==='future' && (<><p>Expected date: </p>
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

              {status==='future' && (<><p>Expires: </p>


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

              <p>Priority: </p>
              <ToggleButtonGroup
                value={priority}
                exclusive
                onChange={(event, val) => setPriority(val)}
              >
                <ToggleButton value='routine'>Routine</ToggleButton>
                <ToggleButton value='stat'>STAT</ToggleButton>
                <ToggleButton value='timed'>Timed</ToggleButton>
                <ToggleButton value='urgent'>Urgent</ToggleButton>
              </ToggleButtonGroup>
            
              <p>Class: </p>
              <ToggleButtonGroup
                value={classCollect}
                exclusive
                onChange={(event, val) => setClass(val)}
              >
                <ToggleButton value='lab'>Lab Collect</ToggleButton>
                <ToggleButton value='clinic'>Clinic Collect</ToggleButton>
                <ToggleButton value='external'>External Collect</ToggleButton>
              </ToggleButtonGroup>

          </div>
          <div style={{backgroundColor: "blue", height: '40px'}}>
            <div style={{float: "right"}}>
              <Button onClick={() => { closeLab(true) }}><Icon color="success">check</Icon>Accept</Button>
              <Button onClick={() => { closeLab(false) }}><Icon color="error">clear</Icon>Cancel</Button></div>
          </div>
        </Dialog>
          <Tooltip title= {
              orderList.map((o) => (
                  <p>{o}</p>
              ))
            }
          >
          <Button variant="contained" onClick={submitOrder}>
            Sign Orders
          </Button>
        </Tooltip>
      </div>

    </Box>
  );
}
