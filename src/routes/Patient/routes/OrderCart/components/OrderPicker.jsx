import React from 'react';
import { Button, TextField, Label, Stack, Window, useLazyEffect } from 'components/ui/Core.jsx';
import orderables from 'util/data/orderables.json'

const all_orders = [...orderables.rxnorm, ...Object.values(orderables.procedures).map(x => ({ name: x })), ...orderables.misc]
const search_orders = (value = "", limit = null) => {
  const out = all_orders.filter(x => x.name.toLocaleLowerCase().includes(value?.toLocaleLowerCase() ?? ""))
  return out.slice(0, limit).toSorted()
}

export const OrderPicker = ({ searchTerm, open, onSelect, ...props }) => {
  const [value, setValue] = React.useState(searchTerm)
  const [data, setData] = React.useState([])

  useLazyEffect(() => { 
    setData(search_orders(value, 100))
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
