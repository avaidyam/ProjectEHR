import React from 'react';
import { TitledCard, Grid, Box, Icon, Label, Stack, Button, TabView, TabList, Tab, TextField, Autocomplete } from 'components/ui/Core.jsx';
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
  const [editingCard, setEditingCard] = React.useState(null)
  
  // State for contacts management
  const [contacts, setContacts] = React.useState({
    emergency: [
      {
        id: 1,
        name: 'John Smith',
        relationship: 'Father',
        primaryPhone: '(555) 123-4567',
        workPhone: '(555) 123-4569',
        isEmergency: true,
        isLegalGuardian: true
      },
      {
        id: 2,
        name: 'Jane Smith',
        relationship: 'Mother',
        primaryPhone: '(555) 123-4568',
        workPhone: '(555) 123-4570',
        isEmergency: true,
        isLegalGuardian: true
      }
    ],
    other: [
      {
        id: 3,
        name: 'Bob Johnson',
        relationship: 'Uncle',
        primaryPhone: '(555) 987-6543',
        workPhone: '(555) 987-6544',
        isEmergency: false,
        isLegalGuardian: false
      }
    ]
  })
  const [showAddContactPopup, setShowAddContactPopup] = React.useState(false)
  const [newContact, setNewContact] = React.useState({
    name: '',
    relationship: '',
    primaryPhone: '',
    workPhone: '',
    isEmergency: false,
    isLegalGuardian: false
  })

  const employmentStatusOptions = [
    'Unknown',
    'Employed', 
    'Unemployed',
    'Retired',
    'Student',
    'Disabled',
    'Self-Employed'
  ]

  const maritalStatusOptions = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Separated',
    'Domestic Partnership'
  ]

  const religionOptions = [
    'Christianity',
    'Islam',
    'Judaism',
    'Hinduism',
    'Buddhism',
    'Atheist',
    'Agnostic',
    'Other',
    'None'
  ]

  const raceOptions = [
    'White',
    'Black or African American',
    'Asian',
    'Native American',
    'Pacific Islander',
    'Other',
    'Prefer not to answer'
  ]

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

  // Helper functions for edit functionality
  const handleEditClick = (cardId) => {
    setEditingCard(cardId)
  }

  const handleCancel = () => {
    setEditingCard(null)
  }

  const handleSave = () => {
    // For now, just close the edit mode without saving
    // In the future, this would save the data to the backend
    setEditingCard(null)
  }

  // Contact management functions
  const handleAddContact = () => {
    if (newContact.name && newContact.relationship && newContact.primaryPhone) {
      const contact = {
        id: Date.now(), // Simple ID generation
        ...newContact
      }
      
      if (newContact.isEmergency) {
        setContacts(prev => ({
          ...prev,
          emergency: [...prev.emergency, contact]
        }))
      } else {
        setContacts(prev => ({
          ...prev,
          other: [...prev.other, contact]
        }))
      }
      
      // Reset form
      setNewContact({
        name: '',
        relationship: '',
        primaryPhone: '',
        workPhone: '',
        isEmergency: false,
        isLegalGuardian: false
      })
      setShowAddContactPopup(false)
    }
  }

  const handleDeleteContact = (contactId, isEmergency) => {
    if (isEmergency) {
      setContacts(prev => ({
        ...prev,
        emergency: prev.emergency.filter(contact => contact.id !== contactId)
      }))
    } else {
      setContacts(prev => ({
        ...prev,
        other: prev.other.filter(contact => contact.id !== contactId)
      }))
    }
  }

  const handleCancelAddContact = () => {
    setNewContact({
      name: '',
      relationship: '',
      primaryPhone: '',
      isEmergency: false,
      isLegalGuardian: false
    })
    setShowAddContactPopup(false)
  }

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
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>person</Icon> Basics
              </Box>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setEditingCard(editingCard === 'basics' ? null : 'basics')} 
                sx={{ minWidth: 'unset', p: 0 }}
              >
                <Icon>{editingCard === 'basics' ? "close" : "edit"}</Icon>
              </Button>
            </Box>
          } 
          color="#5EA1F8"
        >
          {editingCard !== 'basics' ? (
            // ----- READ-ONLY VIEW -----
            <>
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

              {/* Communication */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" 
            sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}
          >
            <Label variant="h6" sx={{ fontWeight: 'bold' }}>Communication</Label>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}><TitledCardItem label="Address" value={address} /></Grid>
            <Grid item xs={4}><TitledCardItem label="Phone" value='' /></Grid>
            <Grid item xs={4}><TitledCardItem label="Email" value='' /></Grid>
          </Grid>

              {/* Additional */}
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
            </>
          ) : (
            // ----- EDIT VIEW -----
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="First Name" 
                    defaultValue={firstName}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Last Name" 
                    defaultValue={lastName}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Date of Birth" 
                    defaultValue={birthdate}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Legal Sex" 
                    defaultValue={gender}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Gender Identity" 
                    defaultValue={gender}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Sex Assigned at Birth" 
                    defaultValue={gender}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Sexual Orientation" 
                    defaultValue=""
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Pronouns" 
                    defaultValue=""
                  />
                </Grid>
              </Grid>

              {/* Communication (editable) */}
              <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
                Communication
              </Label>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <TextField 
                    fullWidth 
                    label="Address" 
                    defaultValue={address}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField 
                    fullWidth 
                    label="Phone" 
                    defaultValue=""
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    defaultValue=""
                  />
                </Grid>
              </Grid>

              {/* Additional (editable) */}
              <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
                Additional
              </Label>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField 
                    fullWidth 
                    label="Language" 
                    defaultValue={preferredLanguage}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    options={['Yes', 'No']}
                    defaultValue="No"
                    renderInput={(params) => <TextField {...params} label="Interpreter Needed" />}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    options={maritalStatusOptions}
                    defaultValue={demographics?.maritalStatus || ''}
                    renderInput={(params) => <TextField {...params} label="Marital Status" />}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    options={religionOptions}
                    defaultValue={demographics?.religion || ''}
                    renderInput={(params) => <TextField {...params} label="Religion" />}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField 
                    fullWidth 
                    label="Ethnic Group" 
                    defaultValue={demographics?.ethnicGroup || ''}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    options={raceOptions}
                    defaultValue={demographics?.race || ''}
                    renderInput={(params) => <TextField {...params} label="Race" />}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField 
                    fullWidth 
                    label="Preferred Form of Address" 
                    defaultValue=""
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Permanent Comments" 
                    defaultValue=""
                    multiline 
                    rows={3} 
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-start" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" color="error" onClick={handleCancel}>
                  <Icon sx={{ mr: 1 }}>close</Icon>Cancel
                </Button>
                <Button variant="contained" color="success" onClick={handleSave}>
                  <Icon sx={{ mr: 1 }}>check</Icon>Save
                </Button>
              </Stack>
            </>
          )}
        </TitledCard>

        {/* EMPLOYER & IDENTIFICATION */}
        <TitledCard 
          id="employer-identification"
          emphasized 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>badge</Icon> Employer and Identification
              </Box>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setEditingCard(editingCard === 'employer-identification' ? null : 'employer-identification')} 
                sx={{ minWidth: 'unset', p: 0 }}
              >
                <Icon>{editingCard === 'employer-identification' ? "close" : "edit"}</Icon>
              </Button>
            </Box>
          } 
          color="#5EA1F8"
        >
          {editingCard !== 'employer-identification' ? (
            // ----- READ-ONLY VIEW -----
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
                  <Grid item xs={6}><TitledCardItem label="Patient Type" value={'TPL'} /></Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            // ----- EDIT VIEW -----
            <>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Employer Information</Label>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Autocomplete
                        options={employmentStatusOptions}
                        defaultValue={socioeconomicData?.occupation ? 'Employed' : 'Unknown'}
                        renderInput={(params) => <TextField {...params} label="Employment Status" />}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Address" 
                        defaultValue=""
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Employer" 
                        defaultValue=""
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Phone" 
                        defaultValue=""
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Fax" 
                        defaultValue=""
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Patient Identification</Label>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Patient Status" 
                        defaultValue="Alive"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="MRN" 
                        value={id}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Patient Type" 
                        defaultValue="TPL"
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-start" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" color="error" onClick={handleCancel}>
                  <Icon sx={{ mr: 1 }}>close</Icon>Cancel
                </Button>
                <Button variant="contained" color="success" onClick={handleSave}>
                  <Icon sx={{ mr: 1 }}>check</Icon>Save
                </Button>
              </Stack>
            </>
          )}
        </TitledCard>
        {/* Patient Contacts */}
        <TitledCard 
          id="patient-contacts" 
          emphasized 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>people</Icon> Patient Contacts
              </Box>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setEditingCard(editingCard === 'patient-contacts' ? null : 'patient-contacts')} 
                sx={{ minWidth: 'unset', p: 0 }}
              >
                <Icon>{editingCard === 'patient-contacts' ? "close" : "edit"}</Icon>
              </Button>
            </Box>
          } 
          color="#009688"
        >
          {editingCard !== 'patient-contacts' ? (
            // ----- READ-ONLY VIEW -----
            <>
              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Emergency Contacts</Label>
              {contacts.emergency.length > 0 ? (
                contacts.emergency.map((contact, index) => (
                  <Box key={contact.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Work Phone" value={contact.workPhone} /></Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Label variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No emergency contacts</Label>
              )}

              <Label variant="h6" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>Other Contacts</Label>
              {contacts.other.length > 0 ? (
                contacts.other.map((contact, index) => (
                  <Box key={contact.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Label variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No other contacts</Label>
              )}
            </>
          ) : (
            // ----- EDIT VIEW -----
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Label variant="h6" sx={{ fontWeight: 'bold' }}>Emergency Contacts</Label>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small"
                  onClick={() => setShowAddContactPopup(true)}
                  sx={{ textTransform: 'none' }}
                >
                  <Icon sx={{ mr: 1 }}>add</Icon>Add Contact
                </Button>
              </Box>
              
              {contacts.emergency.length > 0 ? (
                contacts.emergency.map((contact, index) => (
                  <Box key={contact.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, position: 'relative' }}>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteContact(contact.id, true)}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        minWidth: 'unset', 
                        p: 0.5,
                        borderRadius: '50%'
                      }}
                    >
                      <Icon>cancel</Icon>
                    </Button>
                    <Grid container spacing={2}>
                      <Grid item xs={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Label variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No emergency contacts</Label>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 3 }}>
                <Label variant="h6" sx={{ fontWeight: 'bold' }}>Other Contacts</Label>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small"
                  onClick={() => setShowAddContactPopup(true)}
                  sx={{ textTransform: 'none' }}
                >
                  <Icon sx={{ mr: 1 }}>add</Icon>Add Contact
                </Button>
              </Box>
              
              {contacts.other.length > 0 ? (
                contacts.other.map((contact, index) => (
                  <Box key={contact.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, position: 'relative' }}>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteContact(contact.id, false)}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        minWidth: 'unset', 
                        p: 0.5,
                        borderRadius: '50%'
                      }}
                    >
                      <Icon>cancel</Icon>
                    </Button>
                    <Grid container spacing={2}>
                      <Grid item xs={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid item xs={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Label variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No other contacts</Label>
              )}

              <Stack direction="row" justifyContent="flex-start" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" color="error" onClick={handleCancel}>
                  <Icon sx={{ mr: 1 }}>close</Icon>Cancel
                </Button>
                <Button variant="contained" color="success" onClick={handleSave}>
                  <Icon sx={{ mr: 1 }}>check</Icon>Save
                </Button>
              </Stack>
            </>
          )}
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

      {/* Add Contact Popup */}
      {showAddContactPopup && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              minWidth: 400,
              maxWidth: 500,
              boxShadow: 3
            }}
          >
            <Label variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#000' }}>Add New Contact</Label>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#000' },
                    '& .MuiInputLabel-root': { color: '#666' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#000' },
                    '& .MuiInputLabel-root': { color: '#666' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Primary Phone"
                  value={newContact.primaryPhone}
                  onChange={(e) => setNewContact({...newContact, primaryPhone: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#000' },
                    '& .MuiInputLabel-root': { color: '#666' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Work Phone"
                  value={newContact.workPhone}
                  onChange={(e) => setNewContact({...newContact, workPhone: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-input': { color: '#000' },
                    '& .MuiInputLabel-root': { color: '#666' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Label variant="body2" sx={{ mb: 1, color: '#000' }}>Emergency Contact</Label>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={newContact.isEmergency ? "contained" : "outlined"}
                    color="success"
                    size="small"
                    onClick={() => setNewContact({...newContact, isEmergency: true})}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!newContact.isEmergency ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => setNewContact({...newContact, isEmergency: false})}
                  >
                    No
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Label variant="body2" sx={{ mb: 1, color: '#000' }}>Legal Guardian?</Label>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={newContact.isLegalGuardian ? "contained" : "outlined"}
                    color="success"
                    size="small"
                    onClick={() => setNewContact({...newContact, isLegalGuardian: true})}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!newContact.isLegalGuardian ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => setNewContact({...newContact, isLegalGuardian: false})}
                  >
                    No
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" color="error" onClick={handleCancelAddContact}>
                <Icon sx={{ mr: 1 }}>close</Icon>Cancel
              </Button>
              <Button variant="contained" color="success" onClick={handleAddContact}>
                <Icon sx={{ mr: 1 }}>add</Icon>Add
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Demographics;
