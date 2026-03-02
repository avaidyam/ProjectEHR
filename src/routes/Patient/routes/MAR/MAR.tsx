import * as React from 'react';
import { Tab, Tabs, IconButton, Toolbar, Paper, Chip, Collapse, InputAdornment, Tooltip } from '@mui/material';
import { Box, Button, Stack, Divider, Icon, Label, Spacer, DatePicker, DateTimePicker, Autocomplete } from 'components/ui/Core';
import { usePatient, useDatabase, Database } from 'components/contexts/PatientContext';

interface MAROrder {
  id: string;
  medicationId: string;
  priority: string;
  dose: string;
  rate?: string;
  route: string;
  frequency: string;
  status: string;
  orderedAdminDose: string;
  orderedAmount: string;
  dispenseLocation: string;
  orderStart: string;
  orderEnd: string | null;
  adminWindow?: string;
  name?: string;
  medication?: any;
  components?: any[];
}

interface MAREntry {
  id: string;
  orderId: string;
  timestamp: string;
  status: string;
  amount: string;
  site?: string;
  comment?: string;
  givenBy?: string;
}

interface Hour {
  time: Temporal.ZonedDateTime;
  label: string;
  isPast: boolean;
}

interface DaySegment {
  date: Temporal.ZonedDateTime;
  count: number;
}

const MOCK_ORDERS: MAROrder[] = [
  {
    id: '1',
    medicationId: '1014678',
    priority: 'Routine',
    dose: '10 mg',
    route: 'Oral',
    frequency: 'Daily',
    status: 'Active',
    orderedAdminDose: '10 mg',
    orderedAmount: '1 tablet (1 x 10 mg tablet)',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    orderStart: '2026-02-07T08:00:00Z',
    orderEnd: '2026-02-09T08:00:00Z'
  },
  {
    id: '2',
    medicationId: '847230',
    priority: 'STAT',
    dose: '15 Units',
    route: 'Subcutaneous',
    frequency: '4 times daily before meals and nightly',
    status: 'Active',
    orderedAdminDose: '15 Units',
    orderedAmount: '15 Units',
    adminWindow: '30 minutes',
    dispenseLocation: 'ED Omnicell Pod 3-4',
    orderStart: '2026-02-07T11:30:00Z',
    orderEnd: null
  },
  {
    id: '3',
    medicationId: '2206090',
    priority: 'Routine',
    dose: '2-10 Units',
    route: 'Subcutaneous',
    frequency: '4 times daily with meals and nightly',
    status: 'Active',
    orderedAdminDose: '2-10 Units',
    orderedAmount: '2-10 Units',
    dispenseLocation: 'EMH Central Pharmacy',
    orderStart: '2026-02-06T12:00:00Z',
    orderEnd: null
  },
  {
    id: '4',
    medicationId: '1739890',
    priority: 'Routine',
    dose: '900 mg',
    route: 'Intravenous',
    frequency: 'Every 6 hours',
    status: 'Active',
    orderedAdminDose: '80 mg/kg/day',
    orderedAmount: '900 mg = 22.5 mL',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    orderStart: '2026-02-07T04:00:00Z',
    orderEnd: '2026-02-08T04:00:00Z'
  },
  {
    id: '5',
    medicationId: '1743704',
    priority: 'STAT',
    dose: '125 mg',
    route: 'Intravenous',
    frequency: 'Once',
    status: 'Held',
    orderedAdminDose: '125 mg',
    orderedAmount: '125 mg',
    dispenseLocation: 'ED Omnicell Pod 1-2',
    orderStart: '2026-02-07T16:40:00Z',
    orderEnd: null
  },
  {
    id: '6',
    medicationId: '1116927',
    priority: 'STAT',
    dose: '25 g',
    route: 'Intravenous',
    frequency: 'Once PRN',
    status: 'Completed',
    orderedAdminDose: '25 g',
    orderedAmount: '50 mL',
    dispenseLocation: 'ED Omnicell Pod 3-4',
    orderStart: '2026-02-07T12:45:00Z',
    orderEnd: null
  }
];

const MOCK_MAR_ENTRIES: MAREntry[] = [
  { id: '101', orderId: '1', timestamp: Temporal.Now.instant().subtract(Temporal.Duration.from({ hours: 2 })).toString(), status: 'Given', amount: '10 mg' },
  { id: '102', orderId: '1', timestamp: Temporal.Now.instant().subtract(Temporal.Duration.from({ hours: 2 })).toString(), status: 'Given', amount: '10 mg' },
  { id: '201', orderId: '2', timestamp: Temporal.Now.instant().subtract(Temporal.Duration.from({ hours: 3 })).toString(), status: 'Given', amount: '15 Units' },
  { id: '301', orderId: '3', timestamp: Temporal.Now.instant().subtract(Temporal.Duration.from({ hours: 4 })).toString(), status: 'Refused', amount: '' },
  { id: '302', orderId: '3', timestamp: Temporal.Now.instant().add(Temporal.Duration.from({ hours: 1 })).toString(), status: 'Due', amount: '' },
  { id: '401', orderId: '4', timestamp: Temporal.Now.instant().subtract(Temporal.Duration.from({ hours: 1 })).toString(), status: 'Overdue', amount: '' }
];

interface AdminFormPanelProps {
  order: MAROrder;
  hour: Hour;
  admin: MAREntry | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AdminFormPanel: React.FC<AdminFormPanelProps> = ({ order, hour, admin, onSave, onCancel }) => {
  const [status, setStatus] = React.useState<string>(admin?.status || 'Given');
  const [dateTime, setDateTime] = React.useState<Temporal.PlainDateTime>(() => {
    if (admin?.timestamp) {
      return Temporal.Instant.from(admin.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDateTime();
    }
    return hour.time.toPlainDateTime().with({ minute: 0, second: 0 });
  });
  const [dose, setDose] = React.useState<string>(admin ? admin.amount.split(' ')[0] : (order.dose || '').split(' ')[0] || '');
  const [unit] = React.useState<string>(admin ? admin.amount.split(' ')[1] : (order.dose || '').split(' ')[1] || 'mg');
  const [site, setSite] = React.useState<string>(admin?.site || '');
  const [comment, setComment] = React.useState<string>(admin?.comment || '');

  const handleSave = () => {
    onSave({
      status,
      dateTime,
      dose: `${dose} ${unit} `,
      site,
      comment
    });
  };

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2} sx={{ gap: 2 }}>
        <Autocomplete
          label="Action"
          options={['Given', 'Not Given', 'Refused', 'Held', 'Missed']}
          value={status}
          onChange={(e: any, val: string | null) => setStatus(val || 'Given')}
          sx={{ minWidth: 200 }}
          fullWidth={false}
          TextFieldProps={{ size: 'small' }}
        />
        <DateTimePicker // FIXME
          label="Date/Time"
          value={dateTime}
          onChange={(newValue: Temporal.PlainDateTime | null) => newValue && setDateTime(newValue)}
          ampm={false}
          format="MM/DD/YYYY HH:mm"
          sx={{ minWidth: 220 }}
          slotProps={{
            textField: {
              size: 'small'
            }
          }}
        />
        <Autocomplete
          label="Route"
          freeSolo
          options={['Oral', 'IV', 'Subcutaneous', 'Intramuscular', 'Transdermal']}
          value={order.route || 'No route specified'}
          disabled
          sx={{ minWidth: 160 }}
          fullWidth={false}
          TextFieldProps={{ size: 'small' }}
        />
        <Autocomplete
          label="Site"
          freeSolo
          options={['Left Arm', 'Right Arm', 'Abdomen', 'Left Thigh', 'Right Thigh']}
          value={site}
          onInputChange={(e: any, val: string) => setSite(val)}
          sx={{ minWidth: 200 }}
          fullWidth={false}
          TextFieldProps={{ size: 'small' }}
        />
        <Autocomplete
          label="Dose"
          freeSolo
          options={[]}
          value={dose}
          onInputChange={(e: any, val: string) => setDose(val)}
          sx={{ width: 130 }}
          fullWidth={false}
          TextFieldProps={{
            size: 'small',
            InputProps: {
              endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
            }
          }}
        />
        <Autocomplete
          label="Comment"
          freeSolo
          options={[]}
          value={comment}
          onInputChange={(e: any, val: string) => setComment(val)}
          sx={{ flex: 1, minWidth: 300 }}
          fullWidth={false}
          TextFieldProps={{
            size: 'small',
          }}
        />
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="text" size="small" onClick={onCancel} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button variant="contained" size="small" onClick={handleSave} sx={{ bgcolor: 'primary.main', px: 3 }}>Save</Button>
      </Stack>
    </Box>
  );
};

interface DrugBoxProps {
  order: MAROrder;
  hours: Hour[];
  administrations: MAREntry[];
  onAddAdmin: (orderId: string, data: any) => void;
  onUpdateAdmin: (entryId: string, data: any) => void;
}

const DrugBox: React.FC<DrugBoxProps> = ({ order, hours, administrations, onAddAdmin, onUpdateAdmin }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [activeFormContext, setActiveFormContext] = React.useState<{ hour: Hour; admin: MAREntry | null } | null>(null);
  const isStat = order.priority === 'STAT';

  // Compute lastAdmin dynamically
  const lastAdminRecord = administrations
    .filter(a => a.orderId === order.id && ['Given', 'Not Given', 'Refused', 'Held', 'Missed'].includes(a.status))
    .sort((a, b) => Temporal.Instant.from(b.timestamp).epochMilliseconds - Temporal.Instant.from(a.timestamp).epochMilliseconds)[0];

  const lastAdminValue = lastAdminRecord
    ? `${Temporal.Instant.from(lastAdminRecord.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric' })} at ${(() => { const z = Temporal.Instant.from(lastAdminRecord.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId()); return `${String(z.hour).padStart(2, '0')}${String(z.minute).padStart(2, '0')}`; })()} (${lastAdminRecord.status})`
    : 'Never';

  return (
    <Tooltip title={lastAdminRecord
      ? `${Temporal.Instant.from(lastAdminRecord.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric' })} at ${(() => { const z = Temporal.Instant.from(lastAdminRecord.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId()); return `${String(z.hour).padStart(2, '0')}${String(z.minute).padStart(2, '0')}`; })()} (${lastAdminRecord.status})`
      : "No administrations"}>
      <Paper variant="outlined" sx={{ mb: 1.5, p: 0, overflow: 'hidden' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
          <Label variant="subtitle2" color="primary" fontWeight="bold">
            {order.name}
          </Label>
          <Label variant="caption" color="text.secondary">
            {[order.dose, order.rate, order.route, order.frequency].filter(Boolean).join(" • ")}
          </Label>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Label variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', bgcolor: 'action.selected', px: 1, py: 0.25, borderRadius: 1 }}>
            {order.medication?.pharmClass ?? "No class"}
          </Label>
          <Spacer />
          <Chip
            label={order.priority}
            size="small"
            color={isStat ? 'error' : 'default'}
            sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }}
          />
          <IconButton size="small" disabled><Icon>medication_liquid</Icon></IconButton>
        </Stack>

        {/* Grid or Admin Form */}
        {activeFormContext ? (
          <AdminFormPanel
            order={order}
            hour={activeFormContext.hour}
            admin={activeFormContext.admin}
            onSave={(data) => {
              if (activeFormContext.admin) {
                onUpdateAdmin(activeFormContext.admin.id, data);
              } else {
                onAddAdmin(order.id, data);
              }
              setActiveFormContext(null);
            }}
            onCancel={() => setActiveFormContext(null)}
          />
        ) : (
          <Box sx={{ display: 'flex' }}>
            {hours.map((hour) => {
              const admins = administrations.filter(a => {
                const aZdt = Temporal.Instant.from(a.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId());
                return aZdt.year === hour.time.year && aZdt.month === hour.time.month && aZdt.day === hour.time.day && aZdt.hour === hour.time.hour;
              });
              return (
                <Box
                  key={hour.label}
                  onClick={() => setActiveFormContext({ hour, admin: null })}
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
                    cursor: 'pointer',
                    bgcolor: hour.isPast ? 'action.hover' : 'transparent',
                    background: hour.isPast
                      ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.03) 10px, rgba(0, 0, 0, 0.03) 20px)'
                      : 'none',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {admins.map((admin, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 500, flexShrink: 0 }}
                      label={`${(() => { const z = Temporal.Instant.from(admin.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId()); return `${String(z.hour).padStart(2, '0')}${String(z.minute).padStart(2, '0')}`; })()} ${admin.status} `}
                      color={admin.status === 'Given' ? 'success' : admin.status === 'Due' ? 'primary' : 'error'}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setActiveFormContext({ hour, admin: admin });
                      }}
                    />
                  ))}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Expanded Pane */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>

              {/* Instructions */}
              <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                <Stack spacing={0.5}>
                  <Label variant="caption" color="text.secondary" fontWeight="bold">Admin Instructions</Label>
                  <Label variant="body2">{order.medication?.adminInstructions ?? 'None listed'}</Label>
                </Stack>
                <Stack spacing={0.5}>
                  <Label variant="caption" color="text.secondary" fontWeight="bold">Product Instructions</Label>
                  <Label variant="body2">{order.medication?.productInstructions ?? 'None listed'}</Label>
                </Stack>
              </Stack>

              {/* Timeline & History */}
              <Stack spacing={2} sx={{ flex: 1, flexShrink: 0 }}>
                <Stack spacing={0.5}>
                  <Label variant="caption" color="text.secondary">Order Start</Label>
                  <Label variant="body2" fontWeight="medium">{order.orderStart}</Label>
                  <Label variant="caption" color="text.secondary">Order End</Label>
                  <Label variant="body2" fontWeight="medium">{order.orderEnd || 'Ongoing'}</Label>
                  <Label variant="caption" color="text.secondary">Last Admin</Label>
                  <Label variant="body2" fontWeight="medium">{lastAdminValue}</Label>
                </Stack>
              </Stack>

              {/* Mixture Components */}
              <Stack spacing={1} sx={{ flex: 1.5, minWidth: 0 }}>
                <Label variant="caption" color="text.secondary" fontWeight="bold">Mixture Components</Label>
                {order.components && order.components.length > 0 ? (
                  <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                    <Stack direction="row" sx={{ bgcolor: 'action.disabledBackground', px: 1.5, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Label variant="caption" fontWeight="bold" sx={{ flex: 1 }}>Product</Label>
                      <Label variant="caption" fontWeight="bold" sx={{ width: 80 }}>Dose</Label>
                      <Label variant="caption" fontWeight="bold" sx={{ width: 80 }}>Amount</Label>
                    </Stack>
                    {order.components.map((comp, idx) => (
                      <Stack key={idx} direction="row" sx={{ px: 1.5, py: 0.75, borderBottom: order.components && idx < order.components.length - 1 ? 1 : 0, borderColor: 'divider' }}>
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
          <Label variant="caption" sx={{ flex: 1 }}>Dose: <strong>{order.orderedAdminDose}</strong></Label>
          <Label variant="caption" sx={{ flex: 1 }}>Window: <strong>{order.adminWindow ?? "N/A"}</strong></Label>
          <Label variant="caption" sx={{ flex: 1 }}>Location: <strong>{order.dispenseLocation}</strong></Label>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            <Icon size={16}>expand_more</Icon>
          </IconButton>
        </Stack>
      </Paper>
    </Tooltip>
  );
};

export const MAR: React.FC = () => {
  const [rxnorm] = useDatabase().orderables.rxnorm();

  const resolveMedication = (code: string, db: any[]) => {
    if (!code || !db) return null;
    const med = db.find(x => x.code === code || (x.route && Object.values(x.route).some((r: any) => Object.keys(r).includes(code))));
    if (!med) return null;

    let fullName = med.name;
    let formDescription = '';

    if (med.route) {
      for (const [routeType, forms] of Object.entries(med.route) as [string, any][]) {
        if (forms[code]) {
          formDescription = forms[code];
          fullName = `${med.name} ${formDescription} `;
          break;
        }
      }
    }

    return { ...med, fullName, formDescription };
  };

  const [activeTab, setActiveTab] = React.useState<string>('All');
  const [startTime, setStartTime] = React.useState<Temporal.ZonedDateTime>(() => {
    const now = Temporal.Now.zonedDateTimeISO();
    return now.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }).subtract({ hours: 4 });
  });
  const [orders] = React.useState<MAROrder[]>(MOCK_ORDERS);
  const [entries, setEntries] = React.useState<MAREntry[]>(MOCK_MAR_ENTRIES);

  const medicationOrders = orders.map(order => {
    const medInfo = resolveMedication(order.medicationId, rxnorm) || {};
    const components = (order.components || []).map(comp => {
      const compInfo = resolveMedication(comp.code, rxnorm);
      return compInfo ? { ...comp, name: compInfo.fullName } : comp;
    });

    return {
      ...order,
      name: medInfo.fullName || order.name,
      medication: medInfo,
      // If no components explicitly defined in the order, show the primary medication as the sole component
      components: components.length > 0 ? components : [
        { name: medInfo.fullName || order.name, dose: order.orderedAdminDose, amount: order.orderedAmount }
      ]
    };
  });

  const handleAddAdministration = (orderId: string, adminData: any) => {
    const newEntry: MAREntry = {
      id: Math.random().toString(36).substr(2, 9),
      orderId,
      timestamp: adminData.dateTime.toISOString(),
      status: adminData.status,
      amount: adminData.dose,
      site: adminData.site,
      comment: adminData.comment,
      givenBy: 'Current User'
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateAdministration = (entryId: string, adminData: any) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          timestamp: adminData.dateTime.toISOString(),
          status: adminData.status,
          amount: adminData.dose,
          site: adminData.site,
          comment: adminData.comment
        };
      }
      return entry;
    }));
  };

  // Generate 9 hours starting from startTime
  const now = Temporal.Now.zonedDateTimeISO().with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
  const HOURS: Hour[] = Array.from({ length: 9 }).map((_, i) => {
    const hourTime = startTime.add({ hours: i });
    return {
      time: hourTime,
      label: `${String(hourTime.hour).padStart(2, '0')}00`,
      isPast: Temporal.ZonedDateTime.compare(hourTime, now) < 0
    };
  });

  // Group columns by day
  const daySegments: DaySegment[] = [];
  let currentDay = startTime;
  let currentCount = 0;
  for (let i = 0; i < 9; i++) {
    const hourTime = startTime.add({ hours: i });
    // If it's 00:00 (and not the very first column), start a new segment
    if (i > 0 && hourTime.hour === 0) {
      daySegments.push({ date: currentDay, count: currentCount });
      currentDay = hourTime;
      currentCount = 1;
    } else {
      currentCount++;
    }
  }
  daySegments.push({ date: currentDay, count: currentCount });

  const filteredMedications = medicationOrders.filter(med => {
    const frequency = (med.frequency || '').toLowerCase();
    const medEntries = entries.filter(e => e.orderId === med.id);
    if (activeTab === 'All') return true;
    if (activeTab === 'Due') return medEntries.some(a => a.status === 'Due');
    if (activeTab === 'Scheduled') return !frequency.includes('prn');
    if (activeTab === 'PRN') return frequency.includes('prn');
    if (activeTab === 'IV') return med.route === 'Intravenous';
    if (activeTab === 'Held') return med.status === 'Held';
    if (activeTab === 'Completed') return med.status === 'Completed';
    if (activeTab === 'Overdue') return medEntries.some(a => a.status === 'Overdue');
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
          onChange={(event: any, newValue: string) => setActiveTab(newValue)}
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
        <IconButton size="small" onClick={() => setStartTime(prev => prev.subtract({ hours: 1 }))}>
          <Icon>chevron_left</Icon>
        </IconButton>
        <Stack direction="row" sx={{ alignItems: 'stretch' }}>
          <DatePicker // FIXME
            value={startTime}
            onChange={(newValue: Temporal.PlainDateTime | null) => newValue && setStartTime(newValue.toZonedDateTime(Temporal.Now.timeZoneId()))}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                }
              }
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setStartTime(Temporal.Now.zonedDateTimeISO().with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }).subtract({ hours: 4 }))}
            sx={{
              borderLeft: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              minWidth: 'auto',
              px: 1.5,
              whiteSpace: 'nowrap',
              '&:hover': { borderLeft: 0 }
            }}
          >
            Go to Now
          </Button>
        </Stack>
        <Spacer />
        <IconButton size="small" onClick={() => setStartTime(prev => prev.add({ hours: 1 }))}>
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
                {seg.date.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Label>
            </Box>
          ))}
        </Stack>

        {/* Hour Header Row */}
        <Stack direction="row">
          {HOURS.map((hour) => {
            const hasEntry = entries.some(admin => {
              const aZdt = Temporal.Instant.from(admin.timestamp).toZonedDateTimeISO(Temporal.Now.timeZoneId());
              return aZdt.year === hour.time.year && aZdt.month === hour.time.month && aZdt.day === hour.time.day && aZdt.hour === hour.time.hour;
            });
            return (
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
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    bgcolor: !hasEntry ? 'transparent' : (hour.isPast ? 'text.disabled' : 'primary.main'),
                    borderRadius: '50%'
                  }}
                />
                <Label variant="body2" sx={{ fontWeight: 500, color: hour.isPast ? 'text.secondary' : 'text.primary' }}>
                  {hour.label}
                </Label>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
      <Box sx={{ p: 1, overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
        {filteredMedications.map((med) => (
          <DrugBox
            key={med.id}
            order={med}
            hours={HOURS}
            administrations={entries.filter(e => e.orderId === med.id)}
            onAddAdmin={handleAddAdministration}
            onUpdateAdmin={handleUpdateAdministration}
          />
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
