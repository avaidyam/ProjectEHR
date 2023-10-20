import { Box, TextField, Button, Dialog } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { getRxTerms } from '../../util/getRxTerms.js';

export default function Orders() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('acetaminophen')
  const [data, setData] = useState({ data: null })

  useEffect(() => {
    getRxTerms(value).then(setData);
  }, [open]);
  // [value] can provide instant updates, but this is not necessary for us
  // instead, use [open] to only update when dialog is hidden or shown
  // can even further be optimized to check if open == true, ONLY then update

  return (
    <Box>
      <TextField
        label="Search"
        variant="outlined"
        value={value}
        onChange={(x) => setValue(x.target.value)}
      />
      <Button variant="outlined" onClick={() => { setOpen(!open) }}>
        View
      </Button>
      <Dialog onClose={() => { setOpen(false) }} open={open}>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </Dialog>
    </Box>
  );
}
