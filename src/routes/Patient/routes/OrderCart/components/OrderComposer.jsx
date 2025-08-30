import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Autocomplete, TextField, Icon, Label, Grid, Window, DatePicker, dayjs } from 'components/ui/Core.jsx';

const rxParams = [
  {
    name: "Route",
    required: true,
    type: "string", // number, string, select, date, richtext, readonly
    options: [],
  },
  {
    name: "Dose",
    required: true,
    type: "string",
    options: [],
  },
  {
    name: "Frequency",
    required: true,
    type: "string",
    options: null,
  },
  {
    name: "Refills",
    required: true,
    type: "select",
    options: [0, 1, 2, 3],
  },
  {
    name: "Order type",
    required: true,
    type: "select",
    options: [
      "Outpatient",
      "Inpatient"
    ],
  },
  {
    name: "Status",
    required: true,
    type: "select",
    options: [
      "Standing",
      "Future"
    ],
  },
  {
    name: "Interval",
    required: true,
    type: "select",
    options: [
      "1 Month",
      "2 Months",
      "3 Months",
      "4 Months",
      "6 Months",
      "1 Year"
    ],
    condition: { "Status": "Standing" },
  },
  {
    name: "Count",
    required: true,
    type: "select",
    options: [1, 2, 3, 4, 6, 12],
    condition: { "Status": "Standing" },
  },
  {
    name: "Expected date",
    required: true,
    type: "date",
    options: [
      "Today",
      "Tomorrow",
      "1 Week",
      "2 Weeks",
      "1 Month",
      "2 Months",
      "3 Months",
      "6 Months"
    ],
    condition: { "Status": "Future" },
  },
  {
    name: "Expires",
    required: true,
    type: "date",
    options: [
      "1 Month",
      "2 Months",
      "3 Months",
      "4 Months",
      "6 Months",
      "1 Year",
      "18 Months"
    ],
    condition: { "Status": "Future" },
  },
  {
    name: "Priority",
    required: true,
    type: "select",
    options: [
      "STAT",
      "Routine",
      "Timed",
    ]
  },
  {
    name: "Class",
    required: true,
    type: "select",
    options: [
      "Lab",
      "Unit"
    ]
  },
]

const consultParams = [

]

export const OrderComposer = ({ medication: tempMed, open, onSelect, ...props }) => {
  const [params, setParams] = useState({})

  // set the default route and dose when the route changes
  useEffect(() => {
    setParams(prev => ({ ...prev, ['Route']: Object.keys(tempMed?.route ?? {})?.[0] ?? '' }))
  }, [tempMed])
  useEffect(() => {
    setParams(prev => ({ ...prev, ['Dose']: Object.values(tempMed?.route?.[params["Route"]] ?? {})?.[0] ?? '' }))
  }, [params["Route"]])

  // if this is an Rx then substitute the Route and Dose options
  let displayParams = !!tempMed?.route ? rxParams : consultParams
  if (!!tempMed?.route) {
    displayParams[0].options = Object.keys(tempMed?.route ?? {}) 
    displayParams[1].options = Object.values(tempMed?.route?.[params["Route"]] ?? {})
  }

  return (
    <Window 
      fullWidth 
      maxWidth="md" 
      title={tempMed?.name ?? ''}
      open={!!open}
      onClose={() => onSelect(null)} 
      ContentProps={{ sx: { p: 0 } }}
      footer={<>
        <Button color="success.light" onClick={() => onSelect({ type: 'New', name: tempMed?.name ?? '', dose: params["Dose"], freq: params["Frequency"], route: params["Route"], refill: params["Refills"], startDate: undefined })}><Icon>check</Icon>Accept</Button>
        <Button color="error" onClick={() => onSelect(null)}><Icon>clear</Icon>Cancel</Button>
      </>}
    >
      <Grid container spacing={3} sx={{ m: 0, p: 1 }}>
        {!!tempMed?.route && displayParams.filter(x => 
          Object.entries(x.condition ?? {}).findIndex(([key, value]) => params[key] !== value) < 0
        ).map(x => (
          <>
            <Grid xs={3}><Label>{x.name}</Label></Grid>
            <Grid xs={9}>
              {x.type === "string" && x.options?.length > 0 && 
                <Autocomplete 
                  fullWidth={false}
                  options={x.options ?? []}
                  // if undefined on first render, the component will switch to uncontrolled mode, so set `null` instead
                  value={params[x.name] ?? null}
                  onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                  sx={{ width: 300 }}
                />
              }
              {x.type === "string" && (x.options?.length ?? 0) === 0 && 
                <TextField 
                  fullWidth={false}
                  value={params[x.name]}
                  onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                  sx={{ width: 300 }}
                />
              }
              {x.type === "date" && 
                <DatePicker
                  value={dayjs(`${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getFullYear()}`).add(0, 'day')} // FIXME
                  onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                />
              }
              {x.options?.length > 0 && 
                <ButtonGroup
                  exclusive
                  value={params[x.name]}
                  onChange={(event, value) => setParams(prev => ({ ...prev, [x.name]: value }))}
                >
                  {x.options?.slice(0, 3).map((m) => (<Button key={m} value={m}>{m}</Button>))}
                </ButtonGroup>
              }
            </Grid>
          </>
        ))}
      </Grid>
    </Window>
  )
}
