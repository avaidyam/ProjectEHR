import React from 'react';
import { TitledCard, Grid, Box, Icon, Label, Stack, Button, TabView, TabList, Tab } from 'components/ui/Core.jsx';
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
  const [socioeconomicData, setSocioeconomicData] = useEncounter().history.Socioeconomic()
  const [demographics, setDemographics] = useEncounter().history.Socioeconomic.demographics()

  const sections = [
    { id: 'basics', label: 'Basics' },
    { id: 'employer-identification', label: 'Employer & Identification' },
    { id: 'patient-contacts', label: 'Contacts' },
    { id: 'pharm-labs', label: 'Pharmacies & Labs' },
    { id: 'epiccare-info', label: 'EpicCare Info' },
    { id: 'patient-lists', label: 'Patient Lists' },
    { id: 'advance-directives', label: 'Advance Directives' },
    { id: 'code-status', label: 'Code Status' },
    { id: 'po-npo', label: 'PO/NPO' }
  ]

  const [activeTab, setActiveTab] = React.useState(sections[0].id)
  const tabsRef = React.useRef(null)

  const handleTabChange = (_event, newValue) => {
    if (!newValue) return
    const el = document.getElementById(newValue)
    if (el) {
      const offset = (tabsRef.current?.clientHeight ?? 0) + 8
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setActiveTab(newValue)
  }

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveTab(visible[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: `-${(tabsRef.current?.clientHeight ?? 0) + 12}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )
    for (const { id } of sections) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const TitledCardItem = ({ label, value }) => (
    <Stack spacing={0.5}>
      <Label variant="body2" sx={{ color: '#666' }}>{label}</Label>
      <Label variant="body2" sx={{ color: value ? 'inherit' : '#666', fontStyle: value ? 'normal' : 'italic' }}>
        {value || '—'}
      </Label>
    </Stack>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Sticky Tabs */}
      <Box ref={tabsRef} sx={{ position: 'sticky', top: 0, zIndex: 5, bgcolor: 'background.paper', pb: 1, pt: 1 }}>
        <TabView value={activeTab}>
          <TabList onChange={handleTabChange} aria-label="Demographics sections">
            {sections.map(s => (
              <Tab key={s.id} value={s.id} label={s.label} />
            ))}
          </TabList>
        </TabView>
      </Box>

      <Grid masonry sequential columns={{ md: 1 }} spacing={2}>
        
        {/* BASICS */}
        <TitledCard 
          id="basics"
          emphasized 
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>person</Icon> Basics</>} 
          color="#5EA1F8"
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}><TitledCardItem label="Name" value={`${firstName} ${lastName}`} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Date of Birth" value={birthdate} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Legal Sex" value={gender} /></Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}><TitledCardItem label="Gender Identity" value={gender} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Sex Assigned at Birth" value={gender} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Sexual Orientation" value='' /></Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}><TitledCardItem label="Pronouns" value='' /></Grid>
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
            <Grid item xs={4}><TitledCardItem label="Address" value={address} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Phone" value='' /></Grid>
            <Grid item xs={4}><TitledCardItem label="Email" value='' /></Grid>
          </Grid>

          <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
            Additional
          </Label>
          <Grid container spacing={2}>
            <Grid item xs={3}><TitledCardItem label="Language" value={preferredLanguage} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Interpreter Needed" value={'No'} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Marital Status" value={demographics?.maritalStatus} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Religion" value={demographics?.religion} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Ethnic Group" value={demographics?.ethnicGroup} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Race" value={demographics?.race} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Preferred Form of Address" value={'—'} /></Grid>
            <Grid item xs={12}><TitledCardItem label="Permanent Comments" value={'—'} /></Grid>
          </Grid>
        </TitledCard>

        {/* EMPLOYER & IDENTIFICATION */}
        <TitledCard 
          id="employer-identification"
          emphasized 
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>badge</Icon> Employer and Identification</>} 
          color="#5EA1F8"
        >
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Employer Information</Label>
              <Grid container spacing={2}>
                <Grid item xs={6}><TitledCardItem label="Employment Status" value={socioeconomicData?.occupation ? 'Employed' : 'Unknown'} /></Grid>
                <Grid item xs={6}><TitledCardItem label="Address" value={'—'} /></Grid>
                <Grid item xs={6}><TitledCardItem label="Employer" value='' /></Grid>
                <Grid item xs={6}><TitledCardItem label="Phone" value={'—'} /></Grid>
                <Grid item xs={6}><TitledCardItem label="Fax" value={'—'} /></Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Patient Identification</Label>
              <Grid container spacing={2}>
                <Grid item xs={6}><TitledCardItem label="Patient Status" value={'Alive'} /></Grid>
                <Grid item xs={6}><TitledCardItem label="MRN" value={id} /></Grid>
                <Grid item xs={6}><TitledCardItem label="Patient Type" value='' /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </TitledCard>
        {/* Patient Contacts */}
        <TitledCard id="patient-contacts" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>people</Icon> Patient Contacts</>} color="#009688">
            <TitledCardItem label="Emergency Contact" value='' />
        </TitledCard>

        {/* Preferred Pharmacies and Labs */}
        <TitledCard id="pharm-labs" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>medication</Icon> Preferred Pharmacies and Labs</>} color="#009688">
            <Grid container spacing={2}>
            <Grid item xs={6}><TitledCardItem label="Pharmacies" value={"None"} /></Grid>
            <Grid item xs={6}><TitledCardItem label="Labs" value={"None"} /></Grid>
            </Grid>
        </TitledCard>

        {/* EpicCare Information */}
        <TitledCard id="epiccare-info" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>info</Icon> EpicCare Information</>} color="#009688">
            <Grid container spacing={2}>
            <Grid item xs={3}><TitledCardItem label="Primary Location" value={"-"} /></Grid>
            <Grid item xs={3}><TitledCardItem label="EpicCare Patient" value={"Yes"} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Restricted Access" value={"No"} /></Grid>
            <Grid item xs={3}><TitledCardItem label="Chart Abstracted" value={"No"} /></Grid>
            </Grid>
        </TitledCard>

        {/* Patient Lists */}
        <TitledCard id="patient-lists" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>list</Icon> Patient Lists</>} color="#5EA1F8">
            <Label variant="body2"></Label>
            <Button variant="text" sx={{ mt: 1, textTransform: 'none', color: '#1565c0' }}>
            <Icon sx={{ fontSize: '16px', mr: 1 }}>edit</Icon> Edit patient list memberships
            </Button>
        </TitledCard>

        {/* Advance Directives */}
        <TitledCard id="advance-directives" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>description</Icon> Advance Directives</>} color="#009688">
            <Label variant="body2">No documents to show</Label>
            <Button variant="outlined" size="small" sx={{ mt: 2 }}>Mark as Reviewed</Button>
        </TitledCard>

        {/* Code Status */}
        <TitledCard id="code-status" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>health_and_safety</Icon> Code Status</>} color="#009688">
          <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Current Code Status</Label>
            <Grid container spacing={1} sx={{ pl: 1 }}>
            <Grid item xs={2.5}><TitledCardItem label="Date Active" /></Grid>
            <Grid item xs={2.5}><TitledCardItem label="Code Status" /></Grid>
            <Grid item xs={2}><TitledCardItem label="Order ID" /></Grid>
            <Grid item xs={1.5}><TitledCardItem label="Comments" /></Grid>
            <Grid item xs={1.5}><TitledCardItem label="User" /></Grid>
            <Grid item xs={2}><TitledCardItem label="Context" /></Grid>
          </Grid>
          
          <Box sx={{ mt: 2, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Code Status History</Label>
            <Label variant="body2" sx={{ color: '#666' }}></Label>
            <Button variant="text" sx={{ mt: 1, textTransform: 'none', color: '#1565c0' }}>Advance Care Planning Activity</Button>
          </Box>
        </TitledCard>

        {/* PO/NPO Status */}
        <TitledCard id="po-npo" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>no_meals</Icon> PO/NPO Status</>} color="#009688">
          <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>PO/NPO Status</Label>
          <Grid container spacing={1} sx={{ pl: 1 }}>
            <Grid item xs={3}><TitledCardItem label="Latest PO/NPO Status" /></Grid>
            <Grid item xs={3}><TitledCardItem label="Start Time" /></Grid>
            <Grid item xs={3}><TitledCardItem label="End Time" /></Grid>
            <Grid item xs={3}><TitledCardItem label="Provider" /></Grid>
          </Grid>
        </TitledCard>
      </Grid>
    </Box>
  );
};

export default Demographics;
