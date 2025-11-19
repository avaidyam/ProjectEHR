import React from 'react';
import { Button, TextField, Label, Stack, Window, useLazyEffect } from 'components/ui/Core.jsx';
import { useDatabase } from 'components/contexts/PatientContext'

const search_orders = (orderables, value = "", limit = null) => {
  const all_orders = [...orderables.rxnorm, ...Object.values(orderables.procedures).map(x => ({ name: x })), ...orderables.misc]
  const out = all_orders.filter(x => x.name.toLocaleLowerCase().includes(value?.toLocaleLowerCase() ?? ""))
  return out.slice(0, limit).toSorted()
}

export const OrderPicker = ({ searchTerm, open, onSelect, ...props }) => {
  const [orderables] = useDatabase().orderables()
  const [value, setValue] = React.useState(searchTerm)
  const [data, setData] = React.useState([])

  useLazyEffect(() => { 
    setData(search_orders(orderables, value, 100))
  }, [value])

  return (
    <Window 
      fullWidth 
      maxWidth="md" 
      open={!!open}
      onClose={() => onSelect(null)} 
      header={
        <TextField
          label="Add orders or order sets"
          size="small"
          sx={{ minWidth: 300 }}
          variant="outlined"
          value={value}
          onChange={(x) => setValue(x.target.value)}
        />
      }
    >
      <Stack direction="column" {...props}>
        {data.map((m) => (
          <Button fullWidth key={m.name} onClick={() => onSelect(m)} sx={{ justifyContent: "space-between", alignItems: "center" }}>{m.name}</Button>
        ))}
        {data?.length === 0 ? <Label>No Results. Try again.</Label> : <></>}
      </Stack>
    </Window>
  )
}
