import React from 'react'
import { Box, Chip, Grid, Stack, Label, Divider, Button, ButtonGroup, Tab, TabList, TabPanel, TabView, TitledCard } from 'components/ui/Core'
import { usePatient } from 'components/contexts/PatientContext'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric'
})

export function OrdersMgmt() {
  const { useChart, useEncounter } = usePatient()
  // eslint-disable-next-line dot-notation
  const [orderCart, setOrderCart] = (useEncounter() as any).orderCart["_currentUser"]([])
  const [orderList, setOrderList] = (useEncounter() as any).orders([])
  const [tab, setTab] = React.useState("Active")

  const addOrder = (med: any, changeType: string) => {
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
    setOrderCart((prev: any) => prev.upsert(item, "id"))
  }

  // only display active (i.e. non-discontinued) orders
  // ALSO filter out any secret hidden BICEP orders...
  const visibleList = (orderList as any[]).filter((x: any) => !x.discontinueDate).filter((x: any) => x.name !== "__ADVANCE_PATIENT_BICEP_SLIDE__")

  return (
    <TabView value={tab}>
      <Box>
        <TabList onChange={(event: any, newValue: any) => setTab(newValue)}>
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
              {visibleList.map((order: any, idx: number) => (
                <Grid container>
                  <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: 'left' }}>
                    <Label variant="body2">
                      {!!order.holdDate && <Chip size="small" color="primary" label="HELD" sx={{ mr: 1 }} />}
                      {order.name} {order.dose}
                    </Label>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: 'left' }}>
                    <Label variant="body2">{order.dose}, {order.route}, {order.frequency}, started on {!!order.date ? formatter.format(new Date(order.date)) : ""}</Label>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
                    <ButtonGroup size="small" variant="outlined" onChange={((_: any, mode: any) => addOrder(order, mode)) as any}>
                      <Button value="Modify">Modify</Button>
                      {!order.holdDate && <Button value="Hold">Hold</Button>}
                      {!!order.holdDate && <Button value="Unhold">Unhold</Button>}
                      <Button value="Discontinue">Discontinue</Button>
                    </ButtonGroup>
                  </Grid>
                  {idx < visibleList.length - 1 && <Grid size={12}><Divider flexItem sx={{ my: 1 }} /></Grid>}
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
          <p>ADVANCED TO: {(orderList as any[]).filter((x: any) => x.name === "__ADVANCE_PATIENT_BICEP_SLIDE__").length}</p>
        </TabPanel>
      </Box>
    </TabView>
  )
}