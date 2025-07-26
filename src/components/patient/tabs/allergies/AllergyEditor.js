// import React, { useState, useEffect } from 'react';
// import { Grid, Typography, TextField, Button, InputAdornment } from '@mui/material';

// import IconButton from '@mui/material/IconButton';
// import SearchIcon from '@mui/icons-material/Search';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';

// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';

// // Date Picker Imports
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';

// /**
//  * A helper component for rendering a labeled text field in a 2-column layout:
//  *  - A label in one Grid cell
//  *  - A TextField in the adjacent Grid cell
//  */
// const EditorGridItem = ({ label, typographyCols, textFieldCols, value, onChange, select, menuItems, multiline }) => {
//   return (
//     <>
//       <Grid item xs={typographyCols}>
//         <Typography>{label}</Typography>
//       </Grid>
//       <Grid item xs={textFieldCols}>
//         {select ? (
//           <FormControl fullWidth>
//             <TextField
//               select
//               label={label}
//               value={value}
//               onChange={onChange}
//             >
//               {menuItems?.map((item) => (
//                 <MenuItem key={item} value={item}>
//                   {item}
//                 </MenuItem>
//               ))}
//             </TextField>
//           </FormControl>
//         ) : (
//           <TextField
//             label={label}
//             fullWidth
//             value={value}
//             onChange={onChange}
//             multiline={multiline}
//             rows={multiline ? 3 : 1}
//           />
//         )}
//       </Grid>
//     </>
//   );
// };

// /**
//  * A helper component for rendering a labeled date picker in a 2-column layout.
//  */

// const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }) => {
//     return (
//       <>
//         <Grid item xs={typographyCols}>
//           <Typography>{label}</Typography>
//         </Grid>
//         <Grid item xs={textFieldCols}>
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker 
//               label={label}
//               value={value ? dayjs(value) : null}
//               onChange={(date) => onChange({ target: { value: date } })}
//               renderInput={(params) => <TextField {...params} fullWidth />}
//             />
//           </LocalizationProvider>
//         </Grid>
//       </>
//     );
//   };
  

// /**
//  * AllergyEditor component for editing a single allergy record.
//  *
//  * @param {Object} props
//  * @param {Object} props.data - The allergy data to edit.
//  * @param {number} props.index - Index of the allergy in the list.
//  * @param {function} props.onDelete - Called when user clicks Delete button.
//  * @param {function} props.onToggle - Called when user toggles the editor dropdown (or modal).
//  */
// const AllergyEditor = ({ data, index, onDelete, onToggle }) => {
//   // Local state to hold edits before accepting
//   const [tempData, setTempData] = useState({ ...data });

//   // Sync local state whenever `data` changes
//   useEffect(() => {
//     setTempData({ ...data });
//   }, [data]);

//   const handleEditorTempChange = (key, value) => {
//     setTempData({
//       ...tempData,
//       [key]: value,
//     });
//   };

//   // Called when user clicks Accept
//   const handleEditorAccept = () => {
//     // Commit tempData back to the original object
//     // (In real usage, you might call a parent callback to finalize changes in state or on server)
//     Object.keys(tempData).forEach((key) => {
//       data[key] = tempData[key];
//     });
//     // Close the editor dropdown or modal
//     onToggle(index);
//   };

//   // Called when user clicks Cancel
//   const handleEditorCancel = () => {
//     setTempData({ ...data });
//     onToggle(index);
//   };

//   return (
//     <Grid container spacing={2} alignItems="center">
//       {/* Allergen */}
//       <EditorGridItem
//         label="Allergen"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.allergen}
//         onChange={(e) => handleEditorTempChange('allergen', e.target.value)}
//       />

//       {/* Reaction */}
//       <EditorGridItem
//         label="Reaction"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.reaction}
//         onChange={(e) => handleEditorTempChange('reaction', e.target.value)}
//       />

//       {/* Type (Dropdown) */}
//       <EditorGridItem
//         label="Type"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.type}
//         onChange={(e) => handleEditorTempChange('type', e.target.value)}
//         select
//         menuItems={['allergy', 'intolerance', 'side-effect']}
//       />

//       {/* Severity (Dropdown) */}
//       <EditorGridItem
//         label="Severity"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.severity}
//         onChange={(e) => handleEditorTempChange('severity', e.target.value)}
//         select
//         menuItems={['low', 'high', 'unknown']}
//       />

//       {/* Verified (boolean toggle) */}
//       <Grid item xs={2}>
//         <Button
//           variant={tempData.verified ? 'contained' : 'outlined'}
//           onClick={() => handleEditorTempChange('verified', !tempData.verified)}
//         >
//           Verified
//         </Button>
//       </Grid>

//       {/* Resolved (boolean toggle) */}
//       <Grid item xs={2}>
//         <Button
//           variant={tempData.resolved ? 'contained' : 'outlined'}
//           onClick={() => handleEditorTempChange('resolved', !tempData.resolved)}
//         >
//           Resolved
//         </Button>
//       </Grid>

//       <Grid item xs={8} />

//       {/* Recorded (Date) */}
//       <EditorDateGridItem
//         label="Recorded"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.recorded}
//         onChange={(e) => handleEditorTempChange('recorded', e.target.value)}
//       />

//       {/* Recorder (Text) */}
//       <EditorGridItem
//         label="Recorder"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.recorder}
//         onChange={(e) => handleEditorTempChange('recorder', e.target.value)}
//       />

//       {/* Comment (multiline) */}
//       <EditorGridItem
//         label="Comment"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.comment || ''}
//         onChange={(e) => handleEditorTempChange('comment', e.target.value)}
//         multiline
//       />

//       {/* Action Buttons: Delete, Accept, Cancel */}
//       <Grid item xs={2}>
//         <Button
//           variant="contained"
//           color="error"
//           onClick={() => onDelete(index)}
//         >
//           Delete
//         </Button>
//       </Grid>
//       <Grid item xs={6} />
//       <Grid item xs={2}>
//         <Button
//           variant="outlined"
//           color="success"
//           onClick={handleEditorAccept}
//           startIcon={<CheckIcon />}
//         >
//           Accept
//         </Button>
//       </Grid>
//       <Grid item xs={2}>
//         <Button
//           variant="outlined"
//           color="error"
//           onClick={handleEditorCancel}
//           startIcon={<CloseIcon />}
//         >
//           Cancel
//         </Button>
//       </Grid>
//     </Grid>
//   );
// };

// export default AllergyEditor;
// AllergyEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Paper
} from '@mui/material';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const EditorDateGridItem = ({ label, typographyCols, textFieldCols, value, onChange }) => {
  return (
    <Grid item xs={textFieldCols}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker 
          label={label}
          value={value ?? null}
          onChange={(date) => onChange(date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </LocalizationProvider>
    </Grid>
  );
};



const reactionOptions = [
  'Rash',
  'Anaphylaxis',
  'Hives',
  'Itching',
  'Swelling',
  'Nausea',
  'Vomiting',
  'Dyspnea',
  'Hypotension',
  'Other, see comment',
  'Atopic Dermatitis', // Added from screenshot
  'Blood Pressure Drop',
  'Contact Dermatitis',
  'Cough',
  'Diarrhea',
  'Dizzy',
  'Excessive drowsiness',
  'GI Cramps',
  'GI upset',
  'Hallucinations',
  'Headache',
  'Loss of Consciousness',
  'Muscle Myalgia',
  'Ocular Itching and/or Swelling',
  'Palpitations',
  'Rhinitis',
  'GI upset', // From new screenshot
  'Nausea & Vomiting', // From new screenshot
  'GI upset', // From new screenshot
  'Nausea & Vomiting', // From new screenshot
];
const severityOptions = ['Low', 'Moderate', 'High', 'Not Specified'];
const reactionTypeOptions = ['Immediate', 'Delayed', 'Unknown', 'Systemic', 'Topical', 'Intolerance', 'Not Verified'];

const AllergyEditor = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    agent: '',
    type: '',
    reaction: '',
    severity: '',
    reactionType: '',
    onsetDate: null,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        onsetDate: initialData.onsetDate ? dayjs(initialData.onsetDate) : null
      });
    } else {
      setFormData({
        agent: '',
        type: '',
        reaction: '',
        severity: '',
        reactionType: '',
        onsetDate: null,
        notes: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      onsetDate: date
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
     onsetDate: formData.onsetDate ? formData.onsetDate.format('YYYY-MM-DD') : null
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, borderTop: '4px solid #1976d2' }}> {/* Added a top border for visual separation */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Agent: {initialData?.agent}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Allergen Types: {initialData?.type}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="reaction-label">Reactions</InputLabel>
            <Select
              labelId="reaction-label"
              id="reaction"
              name="reaction"
              value={formData.reaction}
              label="Reactions"
              onChange={handleChange}
            >
              {reactionOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="severity-label">Severity</InputLabel>
            <Select
              labelId="severity-label"
              id="severity"
              name="severity"
              value={formData.severity}
              label="Severity"
              onChange={handleChange}
            >
              {severityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <EditorDateGridItem
              label="Noted"
              typographyCols={2}
              textFieldCols={10}
              value={formData.onsetDate}
              onChange= {handleDateChange}


              //<EditorDateGridItem
//         label="Recorded"
//         typographyCols={2}
//         textFieldCols={10}
//         value={tempData.recorded}
//         onChange={(e) => handleEditorTempChange('recorded', e.target.value)}
//       />
           />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="reaction-type-label">Reaction Type</InputLabel>
            <Select
              labelId="reaction-type-label"
              id="reactionType"
              name="reactionType"
              value={formData.reactionType}
              label="Reaction Type"
              onChange={handleChange}
            >
              {reactionTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Comments"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
            size="small"
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button onClick={onCancel} color="primary" sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Accept
        </Button>
      </Box>
    </Paper>
  );
};

export default AllergyEditor;