import React from 'react'
import { Box, Grid, Stack, Label, Divider, Button, ButtonGroup, Tab, TabList, TabPanel, TabView, TitledCard } from 'components/ui/Core.jsx'
import { usePatient } from 'components/contexts/PatientContext.jsx'

export default function OrdersMgmt() {
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderCart, setOrderCart] = useEncounter().orderCart["_currentUser"]([])
  const [orderList, setOrderList] = useEncounter().orders([])
  const [tab, setTab] = React.useState("Active")

  const addOrder = (med, changeType) => {
    const item = { ...med, type: changeType }
    setOrderCart(prev => prev.upsert(item, "id"))
  }

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
              {orderList.filter(x => x.status !== 'discontinued').map((med, idx) => (
                <Grid container>
                  <Grid item xs={12} sm={3} align="left">
                    <Label variant="body2">{med.name} {med.dosage}</Label>
                  </Grid>
                  <Grid item xs={12} sm={5} align="center">
                    <Label variant="body2">{med.dosage}, {med.route}, {med.frequency}, started on {med.startDate}</Label>
                  </Grid>
                  <Grid item xs={12} sm={4} align="right">
                    <ButtonGroup>
                      <Button outlined size="small" onClick={() => addOrder(med, 'Modify')}>Modify</Button>
                      <Button outlined size="small" onClick={() => addOrder(med, 'Hold')}>Hold</Button>
                      <Button outlined size="small" onClick={() => addOrder(med, 'Discontinue')}>Discontinue</Button>
                    </ButtonGroup>
                  </Grid>
                  {idx < orderList.length - 1 && <Grid item xs={12}><Divider flexItem sx={{ my: 1 }} /></Grid>}
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
        </TabPanel>
      </Box>
    </TabView>
  )
}