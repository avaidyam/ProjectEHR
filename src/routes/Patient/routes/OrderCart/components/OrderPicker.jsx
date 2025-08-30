import React from 'react';
import { List, ListItem, ListItemText, ListItemButton, TextField } from '@mui/material';
import { Window, useLazyEffect } from 'components/ui/Core.jsx';

import labs_all from 'util/data/labs_all.json'
import rxnorm_all from 'util/data/rxnorm_all.json'
import misc_all from 'util/data/misc_orders.json'

const all_orders = [...rxnorm_all, ...Object.values(labs_all.procedures).map(x => ({ name: x })), ...misc_all]
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
      <List {...props}>
        {data.map((m) => (
          <ListItem disablePadding key={m.name}>
            <ListItemButton onClick={() => onSelect(m)}>
              <ListItemText primary={m.name}/>
            </ListItemButton>
          </ListItem>
        ))}
        {data?.length === 0 ? <p>No Results. Try again.</p> : <></>}
      </List>
    </Window>
  )
}
