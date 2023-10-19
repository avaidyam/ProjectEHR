import { Avatar } from '@mui/material';
import { blue } from '@mui/material/colors';
import _ from 'lodash';
import React from 'react';

const PatientSidebarCareOverview = ({ primaryProvider, insurance }) => {
  const { providerFirstName, providerLastName, providerTitle, providerAvatarUrl, providerRole } =
    primaryProvider;

  const { carrierName } = insurance;

  return (
    <div className="flex flex-col overview-card">
      <div className="flex" style={{ marginBottom: '0.5em' }}>
        <Avatar
          source={providerAvatarUrl}
          sx={{ bgcolor: blue[500], height: 50, width: 50, margin: 'auto 1em auto 0' }}
        >
          {`${_.first(providerFirstName)}${_.first(providerLastName)}`}
        </Avatar>
        <div className="flex flex-col" style={{ margin: 'auto 0 auto 0' }}>
          <span>
            {providerFirstName} {providerLastName}, {providerTitle}
          </span>
          <strong>{providerRole}</strong>
        </div>
      </div>
      <span>
        Coverage: <span style={{ textTransform: 'uppercase' }}>{carrierName}</span>
      </span>
    </div>
  );
};

export default PatientSidebarCareOverview;
