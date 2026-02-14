import * as React from 'react';
import { TitledCard, Grid, Box, Icon, Label, Stack, Button, TabView, TabList, Tab, Autocomplete, DatePicker } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';

/*
 * FIELDS NOT IN CURRENT DATA STRUCTURE (commented out for future use):
 * - genderIdentity, sexAssignedAtBirth, sexualOrientation, pronouns
 * - phone, email, interpreterNeeded, preferredFormOfAddress, permanentComments
 * - employerAddress, employerPhone, employerFax
 * - contacts (emergency and other contacts)
 * 
 * These fields are included in the form but not saved to the data structure yet.
 * Uncomment the relevant lines in handleSave() when the data structure is updated.
 */

export const Demographics = () => {
  const { useChart, useEncounter } = usePatient();
  const [{
    id,
    firstName,
    lastName,
    birthdate,
    address,
    preferredLanguage,
    gender
  }, setChart] = useChart()();
  const [socioeconomicData, setSocioeconomicData] = useEncounter().history.Socioeconomic()
  const [demographics, setDemographics] = useEncounter().history.Socioeconomic.demographics()
  const [editingCard, setEditingCard] = React.useState<string | null>(null)

  // State for editable form data
  const [formData, setFormData] = React.useState({
    // Basics section
    firstName: firstName || '',
    lastName: lastName || '',
    birthdate: birthdate || '',
    gender: gender || '',
    genderIdentity: gender || '',
    sexAssignedAtBirth: gender || '',
    sexualOrientation: '',
    pronouns: '',
    address: address || '',
    phone: '',
    email: '',
    language: preferredLanguage || '',
    interpreterNeeded: 'No',
    maritalStatus: demographics?.maritalStatus || '',
    religion: demographics?.religion || '',
    ethnicGroup: demographics?.ethnicGroup || '',
    race: demographics?.race || '',
    preferredFormOfAddress: '',
    permanentComments: '',

    // Employer & Identification section
    employmentStatus: socioeconomicData?.occupation ? 'Employed' : 'Unknown',
    employerAddress: '',
    employer: socioeconomicData?.employer || '',
    employerPhone: '',
    employerFax: '',
    patientStatus: 'Alive',
    mrn: id || '',
    patientType: 'TPL',

    // Contacts section (managed separately in contacts state)
  })

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

  // New comprehensive option lists
  const legalSexOptions = [
    'Male',
    'Female',
    'Other',
    'Unknown',
    'Prefer not to answer'
  ]

  const genderIdentityOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Genderqueer',
    'Transgender',
    'Agender',
    'Genderfluid',
    'Other',
    'Prefer not to answer'
  ]

  const sexAssignedAtBirthOptions = [
    'Male',
    'Female',
    'Intersex',
    'Unknown',
    'Prefer not to answer'
  ]

  const sexualOrientationOptions = [
    'Heterosexual',
    'Homosexual',
    'Bisexual',
    'Pansexual',
    'Asexual',
    'Demisexual',
    'Queer',
    'Questioning',
    'Other',
    'Prefer not to answer'
  ]

  const pronounsOptions = [
    'He/Him',
    'She/Her',
    'They/Them',
    'He/They',
    'She/They',
    'Other',
    'Prefer not to answer'
  ]

  const ethnicGroupOptions = [
    'Hispanic or Latino',
    'Not Hispanic or Latino',
    'Unknown',
    'Prefer not to answer'
  ]

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Chinese (Mandarin)',
    'Chinese (Cantonese)',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Russian',
    'Polish',
    'Vietnamese',
    'Tagalog',
    'Other'
  ]

  const sections = [
    { id: 'basics', label: 'Basics' },
    { id: 'employer-identification', label: 'Employer & Identification' },
    { id: 'patient-contacts', label: 'Contacts' },
    { id: 'pharm-labs', label: 'Pharmacies & Labs' },
    { id: 'patient-lists', label: 'Patient Lists' },
    { id: 'advance-directives', label: 'Advance Directives' },
    { id: 'code-status', label: 'Code Status' },
    { id: 'po-npo', label: 'PO/NPO' }
  ]

  const [activeTab, setActiveTab] = React.useState(sections[0].id)
  const tabsRef = React.useRef<HTMLDivElement>(null)

  // Helper functions for edit functionality
  const handleEditClick = (cardId: string) => {
    setEditingCard(cardId)
  }

  const handleCancel = () => {
    setEditingCard(null)
    // Reset form data to original values
    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      birthdate: birthdate || '',
      gender: gender || '',
      genderIdentity: gender || '',
      sexAssignedAtBirth: gender || '',
      sexualOrientation: '',
      pronouns: '',
      address: address || '',
      phone: '',
      email: '',
      language: preferredLanguage || '',
      interpreterNeeded: 'No',
      maritalStatus: demographics?.maritalStatus || '',
      religion: demographics?.religion || '',
      ethnicGroup: demographics?.ethnicGroup || '',
      race: demographics?.race || '',
      preferredFormOfAddress: '',
      permanentComments: '',
      employmentStatus: socioeconomicData?.occupation ? 'Employed' : 'Unknown',
      employerAddress: '',
      employer: socioeconomicData?.employer || '',
      employerPhone: '',
      employerFax: '',
      patientStatus: 'Alive',
      mrn: id || '',
      patientType: 'TPL',
    })
  }

  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    try {
      // Basic validation for required fields
      if (!formData.firstName.trim()) {
        alert('First name is required')
        return
      }
      if (!formData.lastName.trim()) {
        alert('Last name is required')
        return
      }
      if (!formData.birthdate) {
        alert('Date of birth is required')
        return
      }

      // Update useChart data (firstName, lastName, birthdate, address, preferredLanguage, gender)
      setChart((prev: any) => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthdate: formData.birthdate,
        address: formData.address,
        preferredLanguage: formData.language,
        gender: formData.gender
      }))

      // Update socioeconomic data
      setSocioeconomicData((prev: any) => ({
        ...prev,
        occupation: formData.employmentStatus === 'Employed' ? formData.employer : '',
        employer: formData.employer,
        // Add other employer fields that aren't in the data structure yet
        // employerAddress: formData.employerAddress,
        // employerPhone: formData.employerPhone,
        // employerFax: formData.employerFax,
      }))

      // Update demographics data
      setDemographics((prev: any) => ({
        ...prev,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        ethnicGroup: formData.ethnicGroup,
        race: formData.race,
        // Add other fields that aren't in the data structure yet
        // genderIdentity: formData.genderIdentity,
        // sexAssignedAtBirth: formData.sexAssignedAtBirth,
        // sexualOrientation: formData.sexualOrientation,
        // pronouns: formData.pronouns,
        // phone: formData.phone,
        // email: formData.email,
        // interpreterNeeded: formData.interpreterNeeded,
        // preferredFormOfAddress: formData.preferredFormOfAddress,
        // permanentComments: formData.permanentComments,
      }))

      // For contacts, we could save to a contacts field in the data structure
      // For now, contacts are managed in local state
      // In the future, you could add:
      // setSocioeconomicData(prev => ({
      //   ...prev,
      //   contacts: contacts
      // }))

      setEditingCard(null)
    } catch (error) {
      console.error('Error saving demographics data:', error)
      alert('Error saving data. Please try again.')
    }
  }

  // Contact management functions
  const handleAddContact = () => {
    // Validate required fields
    if (!newContact.name.trim()) {
      alert('Contact name is required')
      return
    }
    if (!newContact.relationship.trim()) {
      alert('Contact relationship is required')
      return
    }
    if (!newContact.primaryPhone.trim()) {
      alert('Primary phone number is required')
      return
    }

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

  const handleDeleteContact = (contactId: any, isEmergency: boolean) => {
    if (isEmergency) {
      setContacts((prev: any) => ({
        ...prev,
        emergency: prev.emergency.filter((contact: any) => contact.id !== contactId)
      }))
    } else {
      setContacts((prev: any) => ({
        ...prev,
        other: prev.other.filter((contact: any) => contact.id !== contactId)
      }))
    }
  }

  const handleCancelAddContact = () => {
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

  const handleTabChange = (_event: any, newValue: any) => {
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
      (entries: IntersectionObserverEntry[]) => {
        const visible = entries
          .filter((e: IntersectionObserverEntry) => e.isIntersecting)
          .sort((a: IntersectionObserverEntry, b: IntersectionObserverEntry) => a.boundingClientRect.top - b.boundingClientRect.top)
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

  const TitledCardItem = ({ label, value }: { label: string; value?: any }) => (
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
            {sections.map((s: any) => (
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
                <Grid size={4}><TitledCardItem label="Name" value={`${firstName} ${lastName}`} /></Grid>
                <Grid size={4}><TitledCardItem label="Date of Birth" value={birthdate} /></Grid>
                <Grid size={4}><TitledCardItem label="Legal Sex" value={gender} /></Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={4}><TitledCardItem label="Gender Identity" value={gender} /></Grid>
                <Grid size={4}><TitledCardItem label="Sex Assigned at Birth" value={gender} /></Grid>
                <Grid size={4}><TitledCardItem label="Sexual Orientation" value='' /></Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={4}><TitledCardItem label="Pronouns" value='' /></Grid>
              </Grid>

              {/* Communication */}
              <Stack direction="row" justifyContent="space-between" alignItems="center"
                sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}
              >
                <Label variant="h6" sx={{ fontWeight: 'bold' }}>Communication</Label>
              </Stack>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={4}><TitledCardItem label="Address" value={address} /></Grid>
                <Grid size={4}><TitledCardItem label="Phone" value='' /></Grid>
                <Grid size={4}><TitledCardItem label="Email" value='' /></Grid>
              </Grid>

              {/* Additional */}
              <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
                Additional
              </Label>
              <Grid container spacing={2}>
                <Grid size={3}><TitledCardItem label="Language" value={preferredLanguage} /></Grid>
                <Grid size={3}><TitledCardItem label="Interpreter Needed" value={'No'} /></Grid>
                <Grid size={3}><TitledCardItem label="Marital Status" value={demographics?.maritalStatus} /></Grid>
                <Grid size={3}><TitledCardItem label="Religion" value={demographics?.religion} /></Grid>
                <Grid size={3}><TitledCardItem label="Ethnic Group" value={demographics?.ethnicGroup} /></Grid>
                <Grid size={3}><TitledCardItem label="Race" value={demographics?.race} /></Grid>
                <Grid size={3}><TitledCardItem label="Preferred Form of Address" value={'—'} /></Grid>
                <Grid size={12}><TitledCardItem label="Permanent Comments" value={'—'} /></Grid>
              </Grid>
            </>
          ) : (
            // ----- EDIT VIEW -----
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onInputChange={(_e, newValue) => handleFormDataChange('firstName', newValue)}
                    options={[]}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onInputChange={(_e, newValue) => handleFormDataChange('lastName', newValue)}
                    options={[]}
                  />
                </Grid>
                <Grid size={6}>
                  <DatePicker
                    convertString
                    label="Date of Birth"
                    value={formData.birthdate}
                    onChange={(date: Temporal.PlainDate) => handleFormDataChange('birthdate', date)}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    label="Legal Sex"
                    fullWidth
                    options={legalSexOptions}
                    value={formData.gender}
                    onChange={(event, newValue) => handleFormDataChange('gender', newValue)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    label="Gender Identity"
                    fullWidth
                    options={genderIdentityOptions}
                    value={formData.genderIdentity}
                    onInputChange={(event, newInputValue) => handleFormDataChange('genderIdentity', newInputValue)}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    label="Sex Assigned at Birth"
                    fullWidth
                    options={sexAssignedAtBirthOptions}
                    value={formData.sexAssignedAtBirth}
                    onChange={(event, newValue) => handleFormDataChange('sexAssignedAtBirth', newValue)}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    label="Sexual Orientation"
                    fullWidth
                    options={sexualOrientationOptions}
                    value={formData.sexualOrientation}
                    onChange={(event, newValue) => handleFormDataChange('sexualOrientation', newValue)}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    label="Pronouns"
                    fullWidth
                    options={pronounsOptions}
                    value={formData.pronouns}
                    onInputChange={(event, newInputValue) => handleFormDataChange('pronouns', newInputValue)}
                  />
                </Grid>
              </Grid>

              {/* Communication (editable) */}
              <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
                Communication
              </Label>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={4}>
                  <Autocomplete
                    freeSolo
                    label="Address"
                    fullWidth
                    value={formData.address}
                    onInputChange={(_e, newValue) => handleFormDataChange('address', newValue)}
                    options={[]}
                  />
                </Grid>
                <Grid size={4}>
                  <Autocomplete
                    freeSolo
                    label="Phone"
                    fullWidth
                    value={formData.phone}
                    onInputChange={(_e, newValue) => handleFormDataChange('phone', newValue)}
                    options={[]}
                  />
                </Grid>
                <Grid size={4}>
                  <Autocomplete
                    freeSolo
                    label="Email"
                    fullWidth
                    value={formData.email}
                    onInputChange={(_e, newValue) => handleFormDataChange('email', newValue)}
                    options={[]}
                  />
                </Grid>
              </Grid>

              {/* Additional (editable) */}
              <Label variant="h6" sx={{ fontWeight: 'bold', borderTop: '1px solid #e0e0e0', pt: 2, mt: 2, mb: 1 }}>
                Additional
              </Label>
              <Grid container spacing={2}>
                <Grid size={3}>
                  <Autocomplete
                    freeSolo
                    label="Language"
                    fullWidth
                    options={languageOptions}
                    value={formData.language}
                    onInputChange={(event, newInputValue) => handleFormDataChange('language', newInputValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    label="Interpreter Needed"
                    fullWidth
                    options={['Yes', 'No']}
                    value={formData.interpreterNeeded}
                    onChange={(event, newValue) => handleFormDataChange('interpreterNeeded', newValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    label="Marital Status"
                    fullWidth
                    options={maritalStatusOptions}
                    value={formData.maritalStatus}
                    onChange={(event, newValue) => handleFormDataChange('maritalStatus', newValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    freeSolo
                    label="Religion"
                    fullWidth
                    options={religionOptions}
                    value={formData.religion}
                    onInputChange={(event, newInputValue) => handleFormDataChange('religion', newInputValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    label="Ethnic Group"
                    fullWidth
                    options={ethnicGroupOptions}
                    value={formData.ethnicGroup}
                    onChange={(event, newValue) => handleFormDataChange('ethnicGroup', newValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    label="Race"
                    fullWidth
                    options={raceOptions}
                    value={formData.race}
                    onChange={(event, newValue) => handleFormDataChange('race', newValue)}
                  />
                </Grid>
                <Grid size={3}>
                  <Autocomplete
                    freeSolo
                    label="Preferred Form of Address"
                    fullWidth
                    options={['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.']}
                    value={formData.preferredFormOfAddress}
                    onInputChange={(event, newInputValue) => handleFormDataChange('preferredFormOfAddress', newInputValue)}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    freeSolo
                    label="Permanent Comments"
                    fullWidth
                    value={formData.permanentComments}
                    onInputChange={(_e, newValue) => handleFormDataChange('permanentComments', newValue)}
                    options={[]}
                    TextFieldProps={{ multiline: true, rows: 3 }}
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
              <Grid size={6}>
                <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Employer Information</Label>
                <Grid container spacing={2}>
                  <Grid size={6}><TitledCardItem label="Employment Status" value={socioeconomicData?.occupation ? 'Employed' : 'Unknown'} /></Grid>
                  <Grid size={6}><TitledCardItem label="Address" value={'—'} /></Grid>
                  <Grid size={6}><TitledCardItem label="Employer" value='' /></Grid>
                  <Grid size={6}><TitledCardItem label="Phone" value={'—'} /></Grid>
                  <Grid size={6}><TitledCardItem label="Fax" value={'—'} /></Grid>
                </Grid>
              </Grid>
              <Grid size={6}>
                <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Patient Identification</Label>
                <Grid container spacing={2}>
                  <Grid size={6}><TitledCardItem label="Patient Status" value={'Alive'} /></Grid>
                  <Grid size={6}><TitledCardItem label="MRN" value={id} /></Grid>
                  <Grid size={6}><TitledCardItem label="Patient Type" value={'TPL'} /></Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            // ----- EDIT VIEW -----
            <>
              <Grid container spacing={4}>
                <Grid size={6}>
                  <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Employer Information</Label>
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Autocomplete
                        label="Employment Status"
                        fullWidth
                        options={employmentStatusOptions}
                        value={formData.employmentStatus}
                        onChange={(event, newValue) => handleFormDataChange('employmentStatus', newValue)}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        freeSolo
                        label="Address"
                        fullWidth
                        value={formData.employerAddress}
                        onInputChange={(_e, newValue) => handleFormDataChange('employerAddress', newValue)}
                        options={[]}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        freeSolo
                        label="Employer"
                        fullWidth
                        options={['Self-Employed', 'Unemployed', 'Retired', 'Student', 'Government', 'Healthcare']}
                        value={formData.employer}
                        onInputChange={(event, newInputValue) => handleFormDataChange('employer', newInputValue)}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        freeSolo
                        label="Phone"
                        fullWidth
                        value={formData.employerPhone}
                        onInputChange={(_e, newValue) => handleFormDataChange('employerPhone', newValue)}
                        options={[]}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        freeSolo
                        label="Fax"
                        fullWidth
                        value={formData.employerFax}
                        onInputChange={(_e, newValue) => handleFormDataChange('employerFax', newValue)}
                        options={[]}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={6}>
                  <Label variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Patient Identification</Label>
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Autocomplete
                        disabled
                        label="Patient Status"
                        fullWidth
                        value={formData.patientStatus}
                        options={[formData.patientStatus]}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        disabled
                        label="MRN"
                        fullWidth
                        value={formData.mrn}
                        options={[formData.mrn]}
                      />
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        disabled
                        label="Patient Type"
                        fullWidth
                        value={formData.patientType}
                        options={[formData.patientType]}
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
                      <Grid size={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid size={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid size={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid size={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid size={2}><TitledCardItem label="Work Phone" value={contact.workPhone} /></Grid>
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
                      <Grid size={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid size={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid size={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid size={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid size={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
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
                      <Grid size={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid size={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid size={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid size={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid size={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
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
                      <Grid size={2}><TitledCardItem label="Name" value={contact.name} /></Grid>
                      <Grid size={2}><TitledCardItem label="Relationship" value={contact.relationship} /></Grid>
                      <Grid size={2}><TitledCardItem label="Legal Guardian?" value={contact.isLegalGuardian ? 'Yes' : 'No'} /></Grid>
                      <Grid size={2}><TitledCardItem label="Primary Phone" value={contact.primaryPhone} /></Grid>
                      <Grid size={2}><TitledCardItem label="Work Phone" value={contact.workPhone || "—"} /></Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Label variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No other contacts</Label>
              )}

              <Stack direction="row" justifyContent="flex-start" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={handleCancel}>
                  <Icon sx={{ mr: 1 }}>close</Icon>Close
                </Button>
              </Stack>
            </>
          )}
        </TitledCard>

        {/* Preferred Pharmacies and Labs */}
        <TitledCard id="pharm-labs" emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>medication</Icon> Preferred Pharmacies and Labs</>} color="#009688">
          <Grid container spacing={2}>
            <Grid size={6}><TitledCardItem label="Pharmacies" value={"None"} /></Grid>
            <Grid size={6}><TitledCardItem label="Labs" value={"None"} /></Grid>
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
            <Grid size={2.5}><TitledCardItem label="Date Active" /></Grid>
            <Grid size={2.5}><TitledCardItem label="Code Status" /></Grid>
            <Grid size={2}><TitledCardItem label="Order ID" /></Grid>
            <Grid size={1.5}><TitledCardItem label="Comments" /></Grid>
            <Grid size={1.5}><TitledCardItem label="User" /></Grid>
            <Grid size={2}><TitledCardItem label="Context" /></Grid>
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
            <Grid size={3}><TitledCardItem label="Latest PO/NPO Status" /></Grid>
            <Grid size={3}><TitledCardItem label="Start Time" /></Grid>
            <Grid size={3}><TitledCardItem label="End Time" /></Grid>
            <Grid size={3}><TitledCardItem label="Provider" /></Grid>
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
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Name"
                  fullWidth
                  value={newContact.name}
                  onInputChange={(_e, newValue) => setNewContact({ ...newContact, name: newValue })}
                  options={[]}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Relationship"
                  fullWidth
                  value={newContact.relationship}
                  onInputChange={(_e, newValue) => setNewContact({ ...newContact, relationship: newValue })}
                  options={['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Guarantor', 'Other']}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Primary Phone"
                  fullWidth
                  value={newContact.primaryPhone}
                  onInputChange={(_e, newValue) => setNewContact({ ...newContact, primaryPhone: newValue })}
                  options={[]}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  label="Work Phone"
                  fullWidth
                  value={newContact.workPhone}
                  onInputChange={(_e, newValue) => setNewContact({ ...newContact, workPhone: newValue })}
                  options={[]}
                />
              </Grid>
              <Grid size={6}>
                <Label variant="body2" sx={{ mb: 1, color: '#000' }}>Emergency Contact</Label>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={newContact.isEmergency ? "contained" : "outlined"}
                    color="success"
                    size="small"
                    onClick={() => setNewContact({ ...newContact, isEmergency: true })}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!newContact.isEmergency ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => setNewContact({ ...newContact, isEmergency: false })}
                  >
                    No
                  </Button>
                </Stack>
              </Grid>
              <Grid size={6}>
                <Label variant="body2" sx={{ mb: 1, color: '#000' }}>Legal Guardian?</Label>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={newContact.isLegalGuardian ? "contained" : "outlined"}
                    color="success"
                    size="small"
                    onClick={() => setNewContact({ ...newContact, isLegalGuardian: true })}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!newContact.isLegalGuardian ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => setNewContact({ ...newContact, isLegalGuardian: false })}
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
