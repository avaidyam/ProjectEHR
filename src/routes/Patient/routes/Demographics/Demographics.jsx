import React from 'react';
import { TitledCard, Grid, Box, Icon, Label, Stack, Button } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const Demographics = () => {
  const { useChart, useEncounter } = usePatient();
  const [{
    id,
    firstName,
    lastName,
    birthdate,
    address,
    preferredLanguage,
    gender
  }] = useChart()();
  const [socioeconomicData] = useEncounter().history.Socioeconomic();
  const demographics = socioeconomicData?.demographics;

  const renderField = (label, value) => (
    <Stack spacing={0.5}>
      <Label variant="body2" sx={{ color: '#666' }}>{label}</Label>
      <Label variant="body2" sx={{ color: value ? 'inherit' : '#666', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </Label>
    </Stack>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Grid masonry sequential columns={{ md: 1 }} spacing={2}>
        
        {/* BASICS */}
        <TitledCard 
          emphasized 
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>person</Icon> Basics</>} 
          color="#5EA1F8"
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>{renderField("Name", `${firstName} ${lastName}`)}</Grid>
            <Grid item xs={4}>{renderField("Date of Birth", birthdate)}</Grid>
            <Grid item xs={4}>{renderField("Legal Sex", gender)}</Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>{renderField("Gender Identity", gender)}</Grid>
            <Grid item xs={4}>{renderField("Sex Assigned at Birth", gender)}</Grid>
            <Grid item xs={4}>{renderField("Sexual Orientation", '')}</Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>{renderField("Pronouns", '')}</Grid>
          </Grid>

          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}
          >
            <Label variant="h6" sx={{ fontWeight: 'bold' }}>Communication</Label>
            <Button variant="text" sx={{ p: 0, textTransform: 'none' }}>
              <Icon sx={{ mr: '4px' }}>settings</Icon>
              <Label variant="body2">Comm. Preferences</Label>
            </Button>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>{renderField("Address", address)}</Grid>
            <Grid item xs={4}>{renderField("Phone", '')}</Grid>
            <Grid item xs={4}>{renderField("Email", '')}</Grid>
          </Grid>

          <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
            Additional
          </Label>
          <Grid container spacing={2}>
            <Grid item xs={3}>{renderField("Language", preferredLanguage)}</Grid>
            <Grid item xs={3}>{renderField("Interpreter Needed", 'No')}</Grid>
            <Grid item xs={3}>{renderField("Marital Status", demographics?.maritalStatus)}</Grid>
            <Grid item xs={3}>{renderField("Religion", demographics?.religion)}</Grid>
            <Grid item xs={3}>{renderField("Ethnic Group", demographics?.ethnicGroup)}</Grid>
            <Grid item xs={3}>{renderField("Race", demographics?.race)}</Grid>
            <Grid item xs={3}>{renderField("Preferred Form of Address", '—')}</Grid>
            <Grid item xs={12}>{renderField("Permanent Comments", '—')}</Grid>
          </Grid>
        </TitledCard>

        {/* EMPLOYER & IDENTIFICATION */}
        <TitledCard 
          emphasized 
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>badge</Icon> Employer and Identification</>} 
          color="#5EA1F8"
        >
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Employer Information</Label>
              <Grid container spacing={2}>
                <Grid item xs={6}>{renderField("Employment Status", socioeconomicData?.occupation ? 'Employed' : 'Unknown')}</Grid>
                <Grid item xs={6}>{renderField("Address", '—')}</Grid>
                <Grid item xs={6}>{renderField("Employer", '')}</Grid>
                <Grid item xs={6}>{renderField("Phone", '—')}</Grid>
                <Grid item xs={6}>{renderField("Fax", '—')}</Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Patient Identification</Label>
              <Grid container spacing={2}>
                <Grid item xs={6}>{renderField("Patient Status", 'Alive')}</Grid>
                <Grid item xs={6}>{renderField("MRN", id)}</Grid>
                <Grid item xs={6}>{renderField("Patient Type", '')}</Grid>
              </Grid>
            </Grid>
          </Grid>
        </TitledCard>
        {/* Patient Contacts */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>people</Icon> Patient Contacts</>} color="#009688">
            {renderField("Emergency Contact", '')}
        </TitledCard>

        {/* Preferred Pharmacies and Labs */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>medication</Icon> Preferred Pharmacies and Labs</>} color="#009688">
            <Grid container spacing={2}>
            <Grid item xs={6}>{renderField("Pharmacies", "None")}</Grid>
            <Grid item xs={6}>{renderField("Labs", "None")}</Grid>
            </Grid>
        </TitledCard>

        {/* EpicCare Information */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>info</Icon> EpicCare Information</>} color="#009688">
            <Grid container spacing={2}>
            <Grid item xs={3}>{renderField("Primary Location", "-")}</Grid>
            <Grid item xs={3}>{renderField("EpicCare Patient", "Yes")}</Grid>
            <Grid item xs={3}>{renderField("Restricted Access", "No")}</Grid>
            <Grid item xs={3}>{renderField("Chart Abstracted", "No")}</Grid>
            </Grid>
        </TitledCard>

        {/* Patient Lists */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>list</Icon> Patient Lists</>} color="#5EA1F8">
            <Label variant="body2"></Label>
            <Button variant="text" sx={{ mt: 1, textTransform: 'none', color: '#1565c0' }}>
            <Icon sx={{ fontSize: '16px', mr: 1 }}>edit</Icon> Edit patient list memberships
            </Button>
        </TitledCard>

        {/* Advance Directives */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>description</Icon> Advance Directives</>} color="#009688">
            <Label variant="body2">No documents to show</Label>
            <Button variant="outlined" size="small" sx={{ mt: 2 }}>Mark as Reviewed</Button>
        </TitledCard>

        {/* Code Status */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>health_and_safety</Icon> Code Status</>} color="#009688">
          <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Current Code Status</Label>
          <Grid container spacing={1} sx={{ pl: 1 }}>
            <Grid item xs={2.5}>{renderField("Date Active")}</Grid>
            <Grid item xs={2.5}>{renderField("Code Status")}</Grid>
            <Grid item xs={2}>{renderField("Order ID")}</Grid>
            <Grid item xs={1.5}>{renderField("Comments")}</Grid>
            <Grid item xs={1.5}>{renderField("User")}</Grid>
            <Grid item xs={2}>{renderField("Context")}</Grid>
          </Grid>
          
          <Box sx={{ mt: 2, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Code Status History</Label>
            <Label variant="body2" sx={{ color: '#666' }}></Label>
            <Button variant="text" sx={{ mt: 1, textTransform: 'none', color: '#1565c0' }}>Advance Care Planning Activity</Button>
          </Box>
        </TitledCard>

        {/* PO/NPO Status */}
        <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>no_meals</Icon> PO/NPO Status</>} color="#009688">
          <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>PO/NPO Status</Label>
          <Grid container spacing={1} sx={{ pl: 1 }}>
            <Grid item xs={3}>{renderField("Latest PO/NPO Status")}</Grid>
            <Grid item xs={3}>{renderField("Start Time")}</Grid>
            <Grid item xs={3}>{renderField("End Time")}</Grid>
            <Grid item xs={3}>{renderField("Provider")}</Grid>
          </Grid>
        </TitledCard>
      </Grid>
    </Box>
  );
};

export default Demographics;
