
import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Grid,
  Typography
} from '@mui/material';

const dummyAgents = [
  { allergen: 'Penicillin', type: 'Drug' },
  { allergen: 'Peanuts', type: 'Food' },
  { allergen: 'Latex', type: 'Environmental' },
  { allergen: 'Crab', type: 'Food' },
  { allergen: 'Metoprolol', type: 'Drug Ingredient' },
  { allergen: 'Codeine', type: 'Drug Ingredient' },
  { allergen: 'Demerol [Meperidine]', type: 'Drug Ingredient' },
  { allergen: 'Xanax [Alprazolam]', type: 'Drug Ingredient' },
  { allergen: 'Aspirin', type: 'Drug' },
  { allergen: 'Dust Mites', type: 'Environmental' },
  { agallergenent: 'Bee Venom', type: 'Insect' },
  { allergen: 'Amoxicillin-potassium clavulanate', type: 'Drug' },
  { allergen: 'Other', type: 'Other' },
];

const AgentSearchMenu = ({ onAgentSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box sx={{ my: 2, width: 300 }}>
      <Autocomplete
        options={dummyAgents}
        getOptionLabel={(option) => option.allergen}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            onAgentSelect(newValue);  // just report selected agent, no editor open here
          }
          // setInputValue(''); // clear input regardless
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select an agent"
            variant="outlined"
            size="small"
            sx={{bgcolor: 'white',borderRadius: 1}}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">
                  {option.allergen}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {option.type}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )}
        blurOnSelect
      />
    </Box>
  );
};

export default AgentSearchMenu;



