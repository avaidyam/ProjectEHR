import { Box, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { getRxTerms } from '../../util/getRxTerms.js';

export default function Orders() {
  const [value, setValue] = useState('acetaminophen');
  const [data, setData] = useState({ data: null });
  useEffect(() => {
    getRxTerms(value).then(setData);
  }, [value]);

  return (
    <Box>
      <TextField
        label="Search"
        variant="outlined"
        value={value}
        onChange={(x) => setValue(x.target.value)}
      />
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </Box>
  );
}
