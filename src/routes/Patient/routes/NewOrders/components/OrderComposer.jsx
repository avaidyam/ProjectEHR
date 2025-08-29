import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Icon, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Button, Label, Grid, Window, DatePicker } from 'components/ui/Core.jsx';

export const OrderComposer = ({ medication: tempMed, open, onSelect, ...props }) => {
  const [name, setName] = useState(tempMed?.name ?? '')
  const [route, setRoute] = useState(Object.keys(tempMed?.route ?? {})?.[0] ?? '')
  const [dose, setDose] = useState('')
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

  useEffect(() => {
    // set the default dose for the route
    setDose(Object.values(tempMed?.route?.[route] ?? {})?.[0] ?? '')
  }, [route])

  return (
    <Window 
      fullWidth 
      maxWidth="md" 
      title={tempMed?.name ?? ''}
      open={!!open}
      onClose={() => onSelect(null)} 
      ContentProps={{ sx: { p: 0 } }}
      footer={<>
        <Button color="success.light" onClick={() => onSelect({ type: 'New', name, dose, freq, route, refill, startDate: undefined })}><Icon>check</Icon>Accept</Button>
        <Button color="error" onClick={() => onSelect(null)}><Icon>clear</Icon>Cancel</Button>
      </>}
    >
      <Grid container spacing={3} sx={{ m: 0, p: 1 }}>
      {!!tempMed?.route && (
        <>
          <Grid xs={3}><Label>Route:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={route}
              exclusive
              onChange={(event, val) => setRoute(val)}
            >
              {Object.keys(tempMed?.route ?? {})?.map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <Grid xs={3}><Label>Dose:</Label></Grid>
          <Grid xs={9}>
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
          </Grid>

          <Grid xs={3}><Label>Frequency:</Label></Grid>
          <Grid xs={9}>
            <TextField id="outlined-basic" variant="outlined" value={freq} onChange={(event) => setFreq(event.target.value)}>Daily</TextField>
          </Grid>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <Grid xs={3}><Label>Refills:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={refill}
              exclusive
              onChange={(event, val) => setRefill(val)}
            >
              {[0, 1, 2, 3].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {!!tempMed && (
        <>
          <Grid xs={3}><Label>Order type:</Label></Grid> 
          <Grid xs={9}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(event, val) => setType(val)}
            >
              <ToggleButton value='Outpatient'><Icon>home</Icon></ToggleButton>
              <ToggleButton value='Inpatient'><Icon>hotel</Icon></ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {!!tempMed && (
        <>
          <Grid xs={3}><Label>Status:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={status}
              exclusive
              onChange={(event, val) => setStatus(val)}
            >
              {['Standing', 'Future'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {status==='Standing' && (
        <>
          <Grid xs={3}><Label>Interval:</Label></Grid>
          <Grid xs={9}>
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
          </Grid>
        </>
      )}

      {status==='Standing' && (
        <>
          <Grid xs={3}><Label>Count:</Label></Grid>
          <Grid xs={9}>
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
          </Grid>
        </>
      )}

      {status==='Future' && (
        <>
          <Grid xs={3}><Label>Expected date:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={expectDate}
              exclusive
              onChange={(event, val) => setExpectDate(val)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              <DatePicker
                value={dayjs(`${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`)
                  .add(expectDate, 'day')
                } />
              <ToggleButton value={0}>Today</ToggleButton>
              <ToggleButton value={1}>Tomorrow</ToggleButton>
              <ToggleButton value={7}>1 Week</ToggleButton>
              <ToggleButton value={14}>2 Weeks</ToggleButton>
              <ToggleButton value={30}>1 Month</ToggleButton>
              <ToggleButton value={60}>2 Months</ToggleButton>
              <ToggleButton value={90}>3 Months</ToggleButton>
              <ToggleButton value={180}>6 Months</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {status==='Future' && (
        <>
          <Grid xs={3}><Label>Expires:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={expireDate}
              exclusive
              onChange={(event, val) => setExpireDate(val)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              <DatePicker
                value={dayjs(`${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`)
                  .add(expireDate, 'day')
                } />
              <ToggleButton value={30}>1 Month</ToggleButton>
              <ToggleButton value={60}>2 Months</ToggleButton>
              <ToggleButton value={90}>3 Months</ToggleButton>
              <ToggleButton value={120}>4 Months</ToggleButton>
              <ToggleButton value={180}>6 Months</ToggleButton>
              <ToggleButton value={365}>1 Year</ToggleButton>
              <ToggleButton value={547}>18 Months</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {!!tempMed && (
        <>
          <Grid xs={3}><Label>Priority:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={priority}
              exclusive
              onChange={(event, val) => setPriority(val)}
            >
              {['STAT', 'Timed', 'Routine'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
            </ToggleButtonGroup>
          </Grid>
        </>
      )}

      {!!tempMed?.route && (
        <>
          <Grid xs={3}><Label>Class:</Label></Grid>
          <Grid xs={9}>
            <ToggleButtonGroup
              value={classCollect}
              exclusive
              onChange={(event, val) => setClass(val)}
            >
              {['Lab', 'Unit'].map((m) => (<ToggleButton value={m} key={m}>{m}</ToggleButton>))}
            </ToggleButtonGroup>
          </Grid>
        </>
      )}
      </Grid>
    </Window>
  )
}
