import React from 'react'
import { Box, Chip, Grid, Stack, Label, Divider, Button, ButtonGroup, Tab, TabList, TabPanel, TabView, TitledCard } from 'components/ui/Core.jsx'
import { usePatient } from 'components/contexts/PatientContext.jsx'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric'
})

export default function OrdersMgmt() {
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderCart, setOrderCart] = useEncounter().orderCart["_currentUser"]([])
  const [orderList, setOrderList] = useEncounter().orders([])
  const [tab, setTab] = React.useState("Active")

  const addOrder = (med, changeType) => {
    const item = { ...med }
    if (changeType === "Modify")
      item.signedDate = Date.now()
    if (changeType === "Hold")
      item.holdDate = Date.now()
    if (changeType === "Unhold") {
      item.holdDate = undefined
      item.signedDate = Date.now()
    }
    if (changeType === "Discontinue")
      item.discontinueDate = Date.now()
    setOrderCart(prev => prev.upsert(item, "id"))
  }

  // only display active (i.e. non-discontinued) orders
  // ALSO filter out any secret hidden BICEP orders...
  const visibleList = orderList.filter(x => !x.discontinueDate).filter(x => x.name !== "__ADVANCE_PATIENT_BICEP_SLIDE__")

  return (
    <TabView value={tab}>
      <Box>
        <TabList onChange={(event, newValue) => setTab(newValue)}>
          <Tab value="Active" label="Active" />
          <Tab value="Signed & Hold" label="Signed & Hold" />
          <Tab value="Home Meds" label="Home Meds" />
          <Tab value="Cosign" label="Cosign" />
          <Tab value="Future Outpatient" label="Future Outpatient" />
          <Tab value="Order History" label="Order History" />
        </TabList>
        <TabPanel value="Active">
          <TitledCard emphasized title="Orders" color="#5EA1F8">
            <Stack direction="column">
              {visibleList.map((order, idx) => (
                <Grid container>
                  <Grid item xs={12} sm={3} align="left">
                    <Label variant="body2">
                      {!!order.holdDate && <Chip size="small" color="primary" sx={{ mr: 1 }}>HELD</Chip>}
                      {order.name} {order.dose}
                    </Label>
                  </Grid>
                  <Grid item xs={12} sm={5} align="left">
                    <Label variant="body2">{order.dose}, {order.route}, {order.frequency}, started on {!!order.date ? formatter.format(new Date(order.date)) : ""}</Label>
                  </Grid>
                  <Grid item xs={12} sm={4} align="right">
                    <ButtonGroup size="small" variant="outlined" onChange={(_, mode) => addOrder(order, mode)}>
                      <Button value="Modify">Modify</Button>
                      {!order.holdDate && <Button value="Hold">Hold</Button>}
                      {!!order.holdDate && <Button value="Unhold">Unhold</Button>}
                      <Button value="Discontinue">Discontinue</Button>
                    </ButtonGroup>
                  </Grid>
                  {idx < visibleList.length - 1 && <Grid item xs={12}><Divider flexItem sx={{ my: 1 }} /></Grid>}
                </Grid>
              ))}
            </Stack>
          </TitledCard>
        </TabPanel>
        <TabPanel value="Signed & Hold">
          Signed & Held
        </TabPanel>
        <TabPanel value="Home Meds">
          Home Meds
        </TabPanel>
        <TabPanel value="Cosign">
          Orders Needing Cosign
        </TabPanel>
        <TabPanel value="Future Outpatient">
          Discharge Orders
        </TabPanel>
        <TabPanel value="Order History">
          Order History
          <p>ADVANCED TO: {orderList.filter(x => x.name === "__ADVANCE_PATIENT_BICEP_SLIDE__").length}</p>
        </TabPanel>
      </Box>
    </TabView>
  )
}