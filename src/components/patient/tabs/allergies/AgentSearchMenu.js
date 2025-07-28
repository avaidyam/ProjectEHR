// // AgentSearchMenu.jsx
// import React, { useState } from 'react';
// import { Autocomplete, TextField, Box, Grid, Typography } from '@mui/material';

// const dummyAgents = [
//   { agent: 'Penicillin', type: 'Drug' },
//   { agent: 'Peanuts', type: 'Food' },
//   { agent: 'Latex', type: 'Environmental' },
//   { agent: 'Crab', type: 'Food' },
//   { agent: 'Metoprolol', type: 'Drug Ingredient' },
//   { agent: 'Codeine', type: 'Drug Ingredient' },
//   { agent: 'Demerol [Meperidine]', type: 'Drug Ingredient' },
//   { agent: 'Xanax [Alprazolam]', type: 'Drug Ingredient' },
//   { agent: 'Aspirin', type: 'Drug' },
//   { agent: 'Dust Mites', type: 'Environmental' },
//   { agent: 'Bee Venom', type: 'Insect' },
//   { agent: 'Amoxicillin-potassium clavulanate', type: 'Drug' }, // Added from screenshot
// ];

// const AgentSearchMenu = ({ onAgentSelect }) => {
//   const [inputValue, setInputValue] = useState('');

//   return (
//     <Box sx={{ width: 300, my: 2 }}>
//       <Autocomplete
//         options={dummyAgents}
//         getOptionLabel={(option) => option.agent} // Only show agent in the text field
//         onInputChange={(event, newInputValue) => {
//           setInputValue(newInputValue);
//         }}
//         onChange={(event, newValue) => {
//           if (newValue) {
//             onAgentSelect(newValue);
//             setInputValue(''); // Clear input after selection
//           }
//         }}
//         inputValue={inputValue}
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             label="Add a new agent"
//             variant="outlined"
//             size="small"
//           />
//         )}
//         renderOption={(props, option) => (
//           <li {...props}>
//             <Grid container alignItems="center">
//               <Grid item xs={6}>
//                 <Typography variant="body2" fontWeight="medium">
//                   {option.agent}
//                 </Typography>
//               </Grid>
//               <Grid item xs={6}>
//                 <Typography variant="body2" color="text.secondary">
//                   {option.type}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </li>
//         )}
//         blurOnSelect
//       />
//     </Box>
//   );
// };

// export default AgentSearchMenu;
// AgentSearchMenu.jsx
import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Grid,
  Typography
} from '@mui/material';

const dummyAgents = [
  { agent: 'Penicillin', type: 'Drug' },
  { agent: 'Peanuts', type: 'Food' },
  { agent: 'Latex', type: 'Environmental' },
  { agent: 'Crab', type: 'Food' },
  { agent: 'Metoprolol', type: 'Drug Ingredient' },
  { agent: 'Codeine', type: 'Drug Ingredient' },
  { agent: 'Demerol [Meperidine]', type: 'Drug Ingredient' },
  { agent: 'Xanax [Alprazolam]', type: 'Drug Ingredient' },
  { agent: 'Aspirin', type: 'Drug' },
  { agent: 'Dust Mites', type: 'Environmental' },
  { agent: 'Bee Venom', type: 'Insect' },
  { agent: 'Amoxicillin-potassium clavulanate', type: 'Drug' },
];

const AgentSearchMenu = ({ onAgentSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box sx={{ my: 2, width: 300 }}>
      <Autocomplete
        options={dummyAgents}
        getOptionLabel={(option) => option.agent}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            onAgentSelect(newValue);  // just report selected agent, no editor open here
          }
          setInputValue(''); // clear input regardless
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select an agent"
            variant="outlined"
            size="small"
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">
                  {option.agent}
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



