import React, { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { getRxTerms } from "../../util/getRxTerms.js"

export default function Orders() {
    const [value, setValue] = useState({ value: null })
    useEffect(async () => {
        let res = await getRxTerms("acetaminophen")
        setValue(res)
    })
  return (
    <Box>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        <pre>{JSON.stringify(value)}</pre>
    </Box>
  )
}
