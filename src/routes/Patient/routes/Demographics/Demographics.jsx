import React from 'react';
import { TitledCard, Grid, Box, Icon, Label, Stack, Button } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const Demographics = () => {

    const { useChart, useEncounter } = usePatient();
    const [{
        firstName,
        lastName,
        birthdate,
        address,
        preferredLanguage,
        gender
      }, setChart] = useChart()();
      const [socioeconomicData, setSocioeconomicData] = useEncounter().history.Socioeconomic();
      const demographics = socioeconomicData?.demographics;

  return (
    <TitledCard title="Basics" color="#0000ff">
  {/* Profile and Info Grid */}
  <Grid container spacing={2} sx={{ marginBottom: '24px' }}>
    <Grid item xs={3}>
      <Box sx={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Icon sx={{ fontSize: '60px', color: '#ccc' }}>person</Icon>
      </Box>
    </Grid>
    <Grid item xs={9}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Name</Label>
          <Label variant="body1">{`${firstName} ${lastName}`}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Date of Birth</Label>
          <Label variant="body1">{birthdate}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Legal Sex</Label>
          <Label variant="body1">{gender}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Gender Identity</Label>
          <Label variant="body1">{gender}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Sex Assigned at Birth</Label>
          <Label variant="body1">{gender}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Sexual Orientation</Label>
          <Label variant="body1">{''}</Label>
        </Grid>
        <Grid item xs={4}>
          <Label variant="body2" sx={{ color: '#666' }}>Pronouns</Label>
          <Label variant="body1">{''}</Label>
        </Grid>
      </Grid>
    </Grid>
  </Grid>

  {/* Communication Section */}
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Label variant="h6" sx={{ fontWeight: 'bold' }}>Communication</Label>
    <Button variant="text" sx={{ padding: 0, textTransform: 'none' }}>
      <Icon sx={{ marginRight: '4px' }}>settings</Icon>
      <Label variant="body2">Comm. Preferences</Label>
    </Button>
  </Stack>
  <Grid container spacing={2} sx={{ marginTop: '8px', marginBottom: '24px' }}>
    <Grid item xs={4}>
      <Label variant="body2" sx={{ color: '#666' }}>Address</Label>
      <Label variant="body1">{address}</Label>
    </Grid>
    <Grid item xs={4}>
      <Label variant="body2" sx={{ color: '#666' }}>Phone</Label>
      <Label variant="body1">{''}</Label>
    </Grid>
    <Grid item xs={4}>
      <Label variant="body2" sx={{ color: '#666' }}>Email</Label>
      <Label variant="body1">{''}</Label>
    </Grid>
  </Grid>
  
  {/* Additional Section */}
  <Label variant="h6" sx={{ fontWeight: 'bold' }}>Additional</Label>
  <Grid container spacing={2} sx={{ marginTop: '8px' }}>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Language</Label>
      <Label variant="body1">{demographics?.preferredLanguage}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Interpreter Needed</Label>
      <Label variant="body1">{'No'}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Marital Status</Label>
      <Label variant="body1">{demographics?.maritalStatus}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Religion</Label>
      <Label variant="body1">{demographics?.religion}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Ethnic Group</Label>
      <Label variant="body1">{demographics?.ethnicGroup}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Race</Label>
      <Label variant="body1">{demographics?.race}</Label>
    </Grid>
    <Grid item xs={3}>
      <Label variant="body2" sx={{ color: '#666' }}>Preferred Form of Address</Label>
      <Label variant="body1">—</Label>
    </Grid>
    <Grid item xs={12}>
      <Label variant="body2" sx={{ color: '#666' }}>Permanent Comments</Label>
      <Label variant="body1">—</Label>
    </Grid>
  </Grid>
</TitledCard>
  );
};

export default Demographics;