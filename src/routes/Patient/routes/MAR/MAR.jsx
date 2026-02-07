import React, { useState } from 'react';
import { Tab, Tabs, IconButton, Toolbar, Paper, Chip, Collapse } from '@mui/material';
import { Box, Button, Stack, Divider, Icon, Label, Spacer, DatePicker, dayjs } from 'components/ui/Core.jsx';

const MOCK_MEDICATIONS = [
  {
    id: '1',
    name: 'cetirizine (ZyrTEC) tablet 10 mg',
    priority: 'Routine',
    pharmClass: 'Antihistamines',
    dose: '10 mg',
    route: 'Oral',
    frequency: 'Daily',
    status: 'Active',
    orderedAdminDose: '10 mg',
    orderedAmount: '1 tablet (1 x 10 mg tablet)',
    adminWindow: '60 minutes',
    adminInstructions: 'Take with full glass of water.',
    productInstructions: 'Keep at room temperature.',
    lastAdmin: 'Today 09/13/19 at 1130 (Given)',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    indications: 'Seasonal Allergies',
    warnings: 'May cause drowsiness',
    instructions: 'Take once daily with or without food',
    orderStart: '09/13/19 08:00',
    orderEnd: '09/15/19 08:00',
    components: [
      { name: 'cetirizine (ZyrTEC) 10 mg tablet', dose: '10 mg', amount: '1 tablet' }
    ],
    administrations: [
      { hour: '1200', time: '1230', status: 'Given', amount: '10 mg' },
      { hour: '1200', time: '1240', status: 'Given', amount: '10 mg' },
      { hour: '1200', time: '1250', status: 'Given', amount: '10 mg' }
    ]
  },
  {
    id: '2',
    name: 'insulin glargine (Lantus) 100 UNIT/ML injection 15 Units',
    priority: 'STAT',
    pharmClass: 'Insulins',
    dose: '15 Units',
    route: 'Subcutaneous',
    frequency: '4 times daily before meals and nightly',
    status: 'Active',
    orderedAdminDose: '15 Units',
    orderedAmount: '15 Units',
    adminWindow: '30 minutes',
    adminInstructions: 'Double check dose with another RN.',
    productInstructions: 'Keep refrigerated until use.',
    lastAdmin: 'Today 09/13/19 at 1130 (Given)',
    dispenseLocation: 'ED Omnicell Pod 3-4',
    indications: 'Diabetes Mellitus',
    warnings: 'Hypoglycemia risk',
    instructions: 'Inject subcutaneously as directed. Rotate sites.',
    orderStart: '09/13/19 11:30',
    orderEnd: 'Ongoing',
    components: [
      { name: 'insulin glargine (Lantus) 100 UNIT/ML injection', dose: '15 Units', amount: '0.15 mL' }
    ],
    administrations: [
      { hour: '1100', time: '1130', status: 'Given', amount: '15 Units' }
    ]
  },
  {
    id: '3',
    name: 'insulin regular (HumuLIN R, NovoLIN R) 100 UNIT/ML injection 2-10 Units',
    priority: 'Routine',
    pharmClass: 'Insulins',
    dose: '2-10 Units',
    route: 'Subcutaneous',
    frequency: '4 times daily with meals and nightly',
    status: 'Active',
    orderedAdminDose: '2-10 Units',
    orderedAmount: '2-10 Units',
    adminWindow: '15 minutes',
    adminInstructions: 'Administer with tray.',
    productInstructions: 'In-use vial stable for 28 days at room temp.',
    lastAdmin: 'Yesterday 09/12/19 at 2100 (Given)',
    dispenseLocation: 'EMH Central Pharmacy',
    indications: 'Diabetes Mellitus (Prandial)',
    warnings: 'Check blood glucose before admin',
    instructions: 'Administer 30 minutes before meals.',
    orderStart: '09/12/19 12:00',
    orderEnd: 'Ongoing',
    components: [
      { name: 'insulin regular 100 UNIT/ML injection', dose: '2-10 Units', amount: 'Variable' }
    ],
    administrations: [
      { hour: '0800', time: '0800', status: 'Refused', amount: '' },
      { hour: '1200', time: '1200', status: 'Due', amount: '' }
    ]
  },
  {
    id: '4',
    name: 'cefOXitin (Mefoxin) 900 mg in dextrose 5 % IV syringe',
    priority: 'Routine',
    pharmClass: 'Cephalosporins',
    dose: '900 mg',
    route: 'Intravenous',
    frequency: 'Every 6 hours',
    status: 'Active',
    orderedAdminDose: '80 mg/kg/day',
    orderedAmount: '900 mg = 22.5 mL',
    adminWindow: '60 minutes',
    adminInstructions: 'Give as slow IV push over 5 minutes.',
    productInstructions: 'Protect from light.',
    lastAdmin: 'Today 09/13/19 at 0415 (New Bag)',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    indications: 'Prophylaxis/Infection',
    warnings: 'Monitor for allergic reaction',
    instructions: 'Infuse over 30 minutes.',
    orderStart: '09/13/19 04:00',
    orderEnd: '09/14/19 04:00',
    components: [
      { name: 'cefOXitin (Mefoxin) 900 mg', dose: '900 mg', amount: 'N/A' },
      { name: 'dextrose 5 % IV syringe', dose: 'N/A', amount: '22.5 mL' }
    ],
    administrations: [
      { hour: '1000', time: '1015', status: 'Overdue', amount: '' }
    ]
  },
  {
    id: '5',
    name: 'methylprednisolone (SOLU-Medrol) in 0.9% NaCl 125 mg/50 mL',
    priority: 'STAT',
    pharmClass: 'Glucocorticoids',
    dose: '125 mg',
    route: 'Intravenous',
    frequency: 'Once',
    status: 'Held',
    orderedAdminDose: '125 mg',
    orderedAmount: '125 mg',
    adminWindow: '0 minutes (ASAP)',
    adminInstructions: 'IV push over 1-3 minutes.',
    productInstructions: 'Use immediately after reconstitution.',
    lastAdmin: 'Never',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    indications: 'Acute Inflammation',
    orderStart: 'Today 16:40',
    orderEnd: 'Ongoing',
    components: [
      { name: 'methylprednisolone (SOLU-Medrol) injection', dose: '125 mg', amount: 'N/A' },
      { name: 'sodium chloride 0.9 % IV bag', dose: 'N/A', amount: '50 mL' }
    ],
    administrations: []
  },
  {
    id: '6',
    name: 'Dextrose 50% syringe 25 g',
    priority: 'STAT',
    pharmClass: 'Glucose',
    dose: '25 g',
    route: 'Intravenous',
    frequency: 'Once PRN',
    status: 'Completed',
    orderedAdminDose: '25 g',
    orderedAmount: '50 mL',
    adminWindow: '0 minutes (ASAP)',
    adminInstructions: 'Administer through large vein.',
    productInstructions: 'Hypertonic solution.',
    lastAdmin: 'Today 1245 (Given)',
    dispenseLocation: 'ED Omnicell Pod 3-4',
    orderStart: 'Today 12:45',
    orderEnd: 'Ongoing',
    components: [
      { name: 'Dextrose 50 % syringe', dose: '25 g', amount: '50 mL' }
    ],
    administrations: []
  }
];

const DrugBox = ({ medication, hours }) => {
  const [expanded, setExpanded] = useState(false);
  const isStat = medication.priority === 'STAT';

  return (
    <Paper variant="outlined" sx={{ mb: 1.5, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        <Label variant="subtitle2" color="primary" fontWeight="bold">
          {medication.name}
        </Label>
        <Label variant="caption" color="text.secondary">
          {[medication.dose, medication.rate, medication.route, medication.frequency].filter(Boolean).join(" • ")}
        </Label>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Label variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', bgcolor: 'action.selected', px: 1, py: 0.25, borderRadius: 1 }}>
          {medication.pharmClass}
        </Label>
        <Spacer />
        <Chip
          label={medication.priority}
          size="small"
          color={isStat ? 'error' : 'default'}
          sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }}
        />
        <IconButton size="small" disabled><Icon>medication_liquid</Icon></IconButton>
      </Stack>

      {/* Grid */}
      <Box sx={{ display: 'flex' }}>
        {hours.map((hour) => {
          const admins = medication.administrations.filter(a => a.hour === hour.label);
          return (
            <Box
              key={hour.label}
              sx={{
                flex: 1,
                minWidth: 120,
                minHeight: 96,
                maxHeight: 96,
                overflowY: "auto",
                borderRight: 1,
                borderColor: 'divider',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                transition: 'background-color 0.2s',
                bgcolor: hour.isPast ? 'action.hover' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {admins.map((admin, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  variant="filled"
                  sx={{ fontWeight: 500, flexShrink: 0 }}
                  label={`${admin.time} ${admin.status}`}
                  color={admin.status === 'Given' ? 'success' : admin.status === 'Due' ? 'primary' : 'error'}
                />
              ))}
            </Box>
          );
        })}
      </Box>

      {/* Expanded Pane */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>

            {/* Instructions */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={0.5}>
                <Label variant="caption" color="text.secondary" fontWeight="bold">Admin Instructions</Label>
                <Label variant="body2">{medication.adminInstructions || 'None listed'}</Label>
              </Stack>
              <Stack spacing={0.5}>
                <Label variant="caption" color="text.secondary" fontWeight="bold">Product Instructions</Label>
                <Label variant="body2">{medication.productInstructions || 'None listed'}</Label>
              </Stack>
            </Stack>

            {/* Timeline & History */}
            <Stack spacing={2} sx={{ flex: 1, flexShrink: 0 }}>
              <Stack spacing={0.5}>
                <Label variant="caption" color="text.secondary">Order Start</Label>
                <Label variant="body2" fontWeight="medium">{medication.orderStart}</Label>
                <Label variant="caption" color="text.secondary">Order End</Label>
                <Label variant="body2" fontWeight="medium">{medication.orderEnd}</Label>
                <Label variant="caption" color="text.secondary">Last Admin</Label>
                <Label variant="body2" fontWeight="medium">{medication.lastAdmin}</Label>
              </Stack>
            </Stack>

            {/* Mixture Components */}
            <Stack spacing={1} sx={{ flex: 1.5, minWidth: 0 }}>
              <Label variant="caption" color="text.secondary" fontWeight="bold">Mixture Components</Label>
              {medication.components && medication.components.length > 0 ? (
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Stack direction="row" sx={{ bgcolor: 'action.disabledBackground', px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Label variant="caption" fontWeight="bold" sx={{ flex: 1 }}>Product</Label>
                    <Label variant="caption" fontWeight="bold" sx={{ width: 80 }}>Dose</Label>
                    <Label variant="caption" fontWeight="bold" sx={{ width: 80 }}>Amount</Label>
                  </Stack>
                  {medication.components.map((comp, idx) => (
                    <Stack key={idx} direction="row" sx={{ px: 1.5, py: 0.75, borderBottom: idx < medication.components.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <Label variant="body2" sx={{ flex: 1 }} noWrap>{comp.name}</Label>
                      <Label variant="body2" sx={{ width: 80 }}>{comp.dose}</Label>
                      <Label variant="body2" sx={{ width: 80 }}>{comp.amount}</Label>
                    </Stack>
                  ))}
                </Paper>
              ) : (
                <Label variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No components listed</Label>
              )}
            </Stack>
          </Stack>
        </Box>
      </Collapse>
      <Divider />

      {/* Footer */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 0.75 }}>
        <Label variant="caption" sx={{ flex: 1 }}>Dose: <strong>{medication.orderedAdminDose}</strong></Label>
        <Label variant="caption" sx={{ flex: 1 }}>Window: <strong>{medication.adminWindow}</strong></Label>
        <Label variant="caption" sx={{ flex: 1 }}>Location: <strong>{medication.dispenseLocation}</strong></Label>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <Icon size={16}>expand_more</Icon>
        </IconButton>
      </Stack>
    </Paper>
  );
};

const MAR = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [startTime, setStartTime] = useState(dayjs().hour(8).minute(0).second(0));

  // Generate 9 hours starting from startTime
  const now = dayjs().startOf('hour');
  const HOURS = Array.from({ length: 9 }).map((_, i) => {
    const hourTime = startTime.add(i, 'hour');
    return {
      label: hourTime.format('HH00'),
      isPast: hourTime.isBefore(now)
    };
  });

  // Group columns by day
  const daySegments = [];
  let currentDay = startTime;
  let currentCount = 0;
  for (let i = 0; i < 9; i++) {
    const hourTime = startTime.add(i, 'hour');
    // If it's 00:00 (and not the very first column), start a new segment
    if (i > 0 && hourTime.hour() === 0) {
      daySegments.push({ date: currentDay, count: currentCount });
      currentDay = hourTime;
      currentCount = 1;
    } else {
      currentCount++;
    }
  }
  daySegments.push({ date: currentDay, count: currentCount });

  const filteredMedications = MOCK_MEDICATIONS.filter(med => {
    const frequency = med.frequency.toLowerCase();
    if (activeTab === 'All') return true;
    if (activeTab === 'Due') return med.administrations.some(a => a.status === 'Due');
    if (activeTab === 'Scheduled') return !frequency.includes('prn');
    if (activeTab === 'PRN') return frequency.includes('prn');
    if (activeTab === 'IV') return med.route === 'Intravenous';
    if (activeTab === 'Held') return med.status === 'Held';
    if (activeTab === 'Completed') return med.status === 'Completed';
    if (activeTab === 'Overdue') return med.administrations.some(a => a.status === 'Overdue');
    if (activeTab === 'Current') return med.status === 'Active';
    return true;
  });

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden' }}>
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider', px: 1, gap: 1 }}>
        <Label variant="h6">MAR</Label>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, ml: 2 }} />
        <Button size="small" disabled startIcon={<Icon>description</Icon>}>Report</Button>
        <Button size="small" disabled startIcon={<Icon>assignment</Icon>}>MAR Note</Button>
        <Button size="small" disabled startIcon={<Icon>message</Icon>}>Messages</Button>
        <Button size="small" disabled startIcon={<Icon>medication_liquid</Icon>}>Infusion Verify</Button>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Button size="small" disabled startIcon={<Icon>visibility</Icon>}>Show Actions</Button>
        <Spacer />
        <IconButton size="small"><Icon size={20}>legend_toggle</Icon></IconButton>
        <IconButton size="small"><Icon>settings</Icon></IconButton>
      </Toolbar>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="All" label="All" />
          <Tab value="Due" label="Due" />
          <Tab value="Current" label="Current" />
          <Tab value="Scheduled" label="Scheduled" />
          <Tab value="PRN" label="PRN" />
          <Tab value="IV" label="IV" />
          <Tab value="Held" label="Held" />
          <Tab value="Completed" label="Completed" />
          <Tab value="Overdue" label="Overdue" />
        </Tabs>
      </Box>
      <Toolbar variant="dense" sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton size="small" onClick={() => setStartTime(prev => prev.subtract(1, 'hour'))}>
          <Icon>chevron_left</Icon>
        </IconButton>
        <DatePicker
          value={startTime}
          onChange={(newValue) => setStartTime(newValue)}
          slotProps={{
            textField: {
              size: 'small',
              variant: 'outlined'
            }
          }}
        />
        <Button variant="outlined" size="small" onClick={() => setStartTime(dayjs().hour(8).minute(0).second(0))}>Go to Now</Button>
        <Spacer />
        <Button disabled size="small">Hide Details</Button>
        <Button disabled size="small">Hide Admins</Button>
        <IconButton size="small" onClick={() => setStartTime(prev => prev.add(1, 'hour'))}>
          <Icon>chevron_right</Icon>
        </IconButton>
      </Toolbar>
      {/* Grid Header (Days & Hours) */}
      <Stack sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        {/* Day Marker Row - Anchored above 0000 or first visible column */}
        <Stack direction="row" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          {daySegments.map((seg, idx) => (
            <Box
              key={idx}
              sx={{
                flex: seg.count,
                minWidth: 120 * seg.count,
                px: 1.5,
                py: 0.5,
                borderRight: idx < daySegments.length - 1 ? 1 : 0,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Label variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {seg.date.format('dddd, MMM D')}
              </Label>
            </Box>
          ))}
        </Stack>

        {/* Hour Header Row */}
        <Stack direction="row">
          {HOURS.map((hour) => (
            <Stack
              key={hour.label}
              direction="row"
              sx={{
                flex: 1,
                minWidth: 120,
                py: 0.75,
                px: 1,
                borderRight: 1,
                borderColor: 'divider',
                alignItems: 'center',
                gap: 0.5,
                opacity: hour.isPast ? 0.6 : 1
              }}
            >
              <Box sx={{ width: 4, height: 4, bgcolor: hour.isPast ? 'text.disabled' : 'primary.main', borderRadius: '50%' }} />
              <Label variant="body2" sx={{ fontWeight: 500, color: hour.isPast ? 'text.secondary' : 'text.primary' }}>
                {hour.label}
              </Label>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Box sx={{ p: 1, overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
        {filteredMedications.map((med) => (
          <DrugBox key={med.id} medication={med} hours={HOURS} />
        ))}
        {filteredMedications.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Icon size={48} color="disabled" sx={{ mb: 2 }}>filter_list_off</Icon>
            <Label variant="h6" color="text.secondary">No Medications Found</Label>
            <Label variant="body2" color="text.secondary">Try selecting a different filter or tab.</Label>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default MAR;
