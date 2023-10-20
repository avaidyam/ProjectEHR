import { Avatar, TextField } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import React from 'react';

import DateHelpers from '../../../util/DateHelpers.js';

const PatientSidebarHeader = ({
  avatarUrl,
  firstName,
  lastName,
  dateOfBirth,
  gender,
  patientAgeInYears,
  patientMRN,
  preferredLanguage,
}) => (
  <div style={{ display: 'flex', flexDirection: "column" }} className="demographic-overview-container">
    <Avatar
      source={avatarUrl}
      sx={{ bgcolor: deepOrange[500], height: 80, width: 80, margin: '0 auto 0.5em auto' }}
    >
      AB
    </Avatar>
    <div style={{ display: 'flex', flexDirection: "column", textAlign: 'center', marginBottom: '1em' }}>
      <strong>
        {firstName} {lastName}
      </strong>
      <span>
        {gender}, {patientAgeInYears} years old, {DateHelpers.standardFormat(dateOfBirth)}
      </span>
      <span>MRN: {patientMRN}</span>
      <strong>Preferred language: {preferredLanguage}</strong>
    </div>
    <TextField id="outlined-basic" label="Search ..." variant="outlined" size="small" />
  </div>
);

export default PatientSidebarHeader;
