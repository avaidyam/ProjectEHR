import { Box, TextField, Button, Dialog, DialogActions, List, ListItem, ListItemText, ListItemButton, Tooltip} from '@mui/material';
import React, { useEffect, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// for calendar/dates
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import HomeIcon from '@mui/icons-material/Home';
import HotelIcon from '@mui/icons-material/Hotel';

import { getRxTerms } from '../../util/getRxTerms.js';

function dateLocal(addDay) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        defaultValue={dayjs(
          `${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`
        ).add(addDay, 'day')}
      />
    </LocalizationProvider>
  );
}

function createToggleButton(value, text){
    return (<ToggleButton sx={{ whiteSpace: 'nowrap' }} value={value}>{text}</ToggleButton>);
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
  const [freq, setFreq] = useState('') 
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

  // add medication to list of orders
  const orderListMed = () => {
    orderList.push(`${value} ${dose} ${route} ${freq}`);
  }

  // add lab to list of orders
  const orderListLab = () => {
    orderList.push('CBC w/ DIFF');
  }

  // empty the temp list of orders 
  const emptyOrderList = () => {
    setOrderList([]);
  }

  // action for signing orders
  const submitOrder = () => {
    // some code on submitting order (will fill this in the future), then empty the templist
    emptyOrderList();
  }

  // close lab order dialog. if "accept" clicked, add lab to order list
  const closeLab = (save) => {
    setOpenLab(false);
    if (save){
      orderListLab();
    }
  };

  // close med order dialog. if "accept" clicked, add med to order list
  const closeDose = (save) => {
    setOpenDose(false);
    if (save){
      orderListMed();
    }
  };

  const typeChange = (event, newType) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const tempMedChange = (newTempMed) => {
    setTempMed(newTempMed);
  };

  const routeChange = (event, newRoute) => {
    if (newRoute!== null) {
      setRoute(newRoute);
    }
  };

  const doseChange = (event, newDose) => {
    if (newDose !== null) {
      setDose(newDose);
    }
  };

  const freqChange = (event, newFreq) => {
    if (newFreq !== null) {
      setFreq(newFreq);
    }
  };

  const refillChange = (event, newRefill) => {
    if (newRefill !== null) {
      setRefill(newRefill);
    }
  };

  const statusChange = (event, newStatus) => {
    if (newStatus !== null) {
      setStatus(newStatus);
    }
  };

  const expectDateChange = (event, newExpectDate) => {
    if (newExpectDate !== null) {
      setExpectDate(newExpectDate);
    }
  };

  const expireDateChange = (event, newExpireDate) => {
    if (newExpireDate !== null) {
      setExpireDate(newExpireDate);
    }
  };

  const intervalChange = (event, newInterval) => {
    if (newInterval !== null) {
      setInterval(newInterval);
    }
  };

  const countChange = (event, newCount) => {
    if (newCount !== null) {
      setCount(newCount);
    }
  };

  const priorityChange = (event, newPriority) => {
    if (newPriority !== null) {
      setPriority(newPriority);
    }
  };

  const classChange = (event, newClass) => {
    if (newClass !== null) {
      setClass(newClass);
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
                  {tempMedChange(m); 
                  setRoute(m.fields.route ? m.fields.route[0] : route); 
                  setDose(m.fields.dose ? m.fields.dose[0][0] : dose); 
                  setFreq(m.fields.frequency ? m.fields.frequency : freq); 
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
              <Button onClick={() => { closeDose(true) }}><CheckIcon color="success"/>Accept</Button>
              <Button onClick={() => { closeDose(false) }}><ClearIcon color="error"/>Cancel</Button>
            </DialogActions>
        </div>
                <p>Route: </p> 
                <ToggleButtonGroup
                  value={route}
                  exclusive
                  onChange={routeChange}
                >
                {
                tempMed ? tempMed.fields.route.map((m) => (
                  createToggleButton(m, m)
                )) : ''
                }
              </ToggleButtonGroup>

              <p>Dose: </p> 
                <ToggleButtonGroup
                  value={dose}
                  exclusive
                  onChange={doseChange}
                >
                {tempMed ? tempMed.fields.dose.map((d) => (
                  d.map((sub) => (
                    createToggleButton(sub, sub)
                  ))
                )) : ''}
              </ToggleButtonGroup>

              <p>Frequency: </p> 
                <ToggleButtonGroup
                  value={freq}
                  exclusive
                  onChange={freqChange}
                >
                {createToggleButton(tempMed ? tempMed.fields.frequency : '', tempMed ? tempMed.fields.frequency : '')}
              </ToggleButtonGroup>

              <p>Refills: </p> 
                <ToggleButtonGroup
                  value={refill}
                  exclusive
                  onChange={refillChange}
                >
                {createToggleButton(tempMed ? tempMed.fields.refills : 0, tempMed ? (tempMed.fields.refills) : refill)}
              </ToggleButtonGroup>

          <div style={{backgroundColor: "blue", height: '40px'}}>
            <div style={{float: "right"}}>
              <Button onClick={() => { closeDose(true) }}><CheckIcon color="success"/>Accept</Button>
              <Button onClick={() => { closeDose(false) }}><ClearIcon color="error"/>Cancel</Button></div>
          </div>

        </Dialog>
        <Dialog fullWidth maxWidth="md" onClose={() => { setOpenLab(false) }} open={openLab}>

          <div style={{backgroundColor: "blue", height: "40px"}}>
            CBC w/ DIFF
            <DialogActions style={{float: "right"}}>
              <Button onClick={() => { closeLab(true) }}><CheckIcon color="success"/>Accept</Button>
              <Button onClick={() => { closeLab(false) }}><ClearIcon color="error"/>Cancel</Button>
            </DialogActions>
          </div>

          <div>
              Order type: 
                <ToggleButtonGroup
                  value={type}
                  exclusive
                  onChange={typeChange}
                >
                  {createToggleButton('outpatient', (<HomeIcon/>))}
                  {createToggleButton('inpatient', (<HotelIcon/>))}
                </ToggleButtonGroup>

              <p>Status: </p> 
              <ToggleButtonGroup
                value={status}
                exclusive
                onChange={statusChange}
              >
                {createToggleButton('normal', 'Normal')}
                {createToggleButton('standing', 'Standing')}
                {createToggleButton('future', 'Future')}
              </ToggleButtonGroup>

              {status==='standing' && (<><p>Interval: </p>
              <ToggleButtonGroup
                value={interval}
                exclusive
                onChange={intervalChange}
              >
                {createToggleButton(30, '1 Month')}
                {createToggleButton(60, '2 Months')}
                {createToggleButton(90, '3 Months')}
                {createToggleButton(120, '4 Months')}
                {createToggleButton(180, '6 Months')}
                {createToggleButton(365, '1 Year')}
              </ToggleButtonGroup>
              </>)}

              {status==='standing' && (<><p>Count: </p>
              <ToggleButtonGroup
                value={count}
                exclusive
                onChange={countChange}
              >
                {createToggleButton(1, '1')}
                {createToggleButton(2, '2')}
                {createToggleButton(3, '3')}
                {createToggleButton(4, '4')}
                {createToggleButton(6, '6')}
                {createToggleButton(12, '12')}
              </ToggleButtonGroup>
              </>)}



              {status==='future' && (<><p>Expected date: </p>
              <ToggleButtonGroup
                value={expectDate}
                exclusive
                onChange={expectDateChange}
              >
                <div>{dateLocal(expectDate)}</div>
                {createToggleButton(0, 'Today')}
                {createToggleButton(1, 'Tomorrow')}
                {createToggleButton(7, '1 Week')}
                {createToggleButton(14, '2 Weeks')}
                {createToggleButton(30, '1 Month')}
                {createToggleButton(60, '2 Months')}
                {createToggleButton(90, '3 Months')}
                {createToggleButton(180, '6 Months')}
              </ToggleButtonGroup></>
              )}

              {status==='future' && (<><p>Expires: </p>
              <ToggleButtonGroup
                value={expireDate}
                exclusive
                onChange={expireDateChange}
              >
                <div>{dateLocal(expireDate)}</div>
                {createToggleButton(30, '1 Month')}
                {createToggleButton(60, '2 Months')}
                {createToggleButton(90, '3 Months')}
                {createToggleButton(120, '4 Months')}
                {createToggleButton(180, '6 Months')}
                {createToggleButton(365, '1 Year')}
                {createToggleButton(547, '18 Months')}
              </ToggleButtonGroup>
              </>)}

              <p>Priority: </p>
              <ToggleButtonGroup
                value={priority}
                exclusive
                onChange={priorityChange}
              >
                {createToggleButton('routine', 'Routine')}
                {createToggleButton('stat', 'STAT')}
                {createToggleButton('timed', 'Timed')}
                {createToggleButton('urgent', 'Urgent')}
              </ToggleButtonGroup>
            
              <p>Class: </p>
              <ToggleButtonGroup
                value={classCollect}
                exclusive
                onChange={classChange}
              >
                {createToggleButton('lab', 'Lab Collect')}
                {createToggleButton('clinic', 'Clinic Collect')}
                {createToggleButton('external', 'External Collect')}
              </ToggleButtonGroup>

          </div>
          <div style={{backgroundColor: "blue", height: '40px'}}>
            <div style={{float: "right"}}>
              <Button onClick={() => { closeLab(true) }}><CheckIcon color="success"/>Accept</Button>
              <Button onClick={() => { closeLab(false) }}><ClearIcon color="error"/>Cancel</Button></div>
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
