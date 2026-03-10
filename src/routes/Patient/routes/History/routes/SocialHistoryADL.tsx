// SocialHistoryADL.jsx
import * as React from 'react';
import {
  Box,
  Button,
  Label,
  TitledCard,
  Icon,
  MarkReviewed,
} from 'components/ui/Core';
import {
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient, Database } from '../../../../../components/contexts/PatientContext';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

export function SocialHistoryADL() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const socialHistoryData = socialHistory[0]?.SocialHistoryADL || {};
  const setSocialHistoryData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentADL = next[0].SocialHistoryADL || {};
      const newADL = typeof update === 'function' ? update(currentADL) : update;
      next[0] = { ...next[0], SocialHistoryADL: newADL };
      return next;
    });
  };

  const leftColumnItems = [
    { key: 'backCare', label: 'Back Care' },
    { key: 'bloodTransfusions', label: 'Blood Transfusions' },
    { key: 'exercise', label: 'Exercise' },
    { key: 'homebound', label: 'Homebound' },
    { key: 'militaryService', label: 'Military Service' },
    { key: 'seatBelt', label: 'Seat Belt' },
    { key: 'sleepConcern', label: 'Sleep Concern' },
    { key: 'stressConcern', label: 'Stress Concern' }
  ];

  const rightColumnItems = [
    { key: 'bikeHelmet', label: 'Bike Helmet' },
    { key: 'caffeineConcern', label: 'Caffeine Concern' },
    { key: 'hobbyHazards', label: 'Hobby Hazards' },
    { key: 'homeless', label: 'Homeless' },
    { key: 'occupationalExposure', label: 'Occupational Exposure' },
    { key: 'selfExams', label: 'Self-Exams' },
    { key: 'specialDiet', label: 'Special Diet' },
    { key: 'weightConcern', label: 'Weight Concern' }
  ];

  const handleBooleanChange = (field: string, value: boolean) => {
    setSocialHistoryData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };


  const renderItem = (item: { key: string; label: string }) => (
    <Grid key={item.key} size={12}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Label variant="body2" sx={{ flex: 1, textAlign: 'right', mr: 2 }}>
          {item.label}
        </Label>
        <Box sx={{ display: 'flex', gap: 1, minWidth: '120px' }}>
          <Button
            variant={socialHistoryData?.[item.key] === true ? 'contained' : 'outlined'}
            onClick={() => handleBooleanChange(item.key, true)}
            size="small"
            sx={{
              backgroundColor: socialHistoryData?.[item.key] === true ? '#1976d2' : 'transparent',
              color: socialHistoryData?.[item.key] === true ? 'white' : '#1976d2',
              borderColor: '#1976d2',
              minWidth: '50px',
              '&:hover': {
                backgroundColor: socialHistoryData?.[item.key] === true ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Yes
          </Button>
          <Button
            variant={socialHistoryData?.[item.key] === false ? 'contained' : 'outlined'}
            onClick={() => handleBooleanChange(item.key, false)}
            size="small"
            sx={{
              backgroundColor: socialHistoryData?.[item.key] === false ? '#1976d2' : 'transparent',
              color: socialHistoryData?.[item.key] === false ? 'white' : '#1976d2',
              borderColor: '#1976d2',
              minWidth: '50px',
              '&:hover': {
                backgroundColor: socialHistoryData?.[item.key] === false ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            No
          </Button>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Social History - ADL</>} color="#9F3494">
      <SectionPaper>
        <Grid container spacing={2}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={1}>
              {leftColumnItems.map(renderItem)}
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={1}>
              {rightColumnItems.map(renderItem)}
            </Grid>
          </Grid>
        </Grid>
      </SectionPaper>
      <MarkReviewed />
    </TitledCard>
  );
}