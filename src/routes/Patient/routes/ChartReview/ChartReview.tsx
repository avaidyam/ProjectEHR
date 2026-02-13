import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Tooltip } from '@mui/material'; // FIXME: REMOVE!
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid-premium';
import { Box, Button, Label, DataGrid, Icon, IconButton } from 'components/ui/Core'
import { useSplitView } from 'components/contexts/SplitViewContext';
import { usePatient, useDatabase } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers'

const tabLabels = [
  "Encounters",
  "Notes",
  "Imaging",
  "Lab",
  "Cardiac",
  "Specialty Tests",
  "Other",
  "Meds",
  "Letters",
  "Referrals",
  "Scan Doc",
  "Med Photos",
  "Episodes",
  "LDAs",
  "Consents"
];

const CARDIAC_ORDERS = [
  "EKG",
  "ECG",
  "Echocardiogram",
  "CT CORONARY ANGIOGRAM",
  "CT CORONARY ANGIOGRAM (POST-PCI)"
];

const COLUMN_DEFS: Record<string, any[]> = {
  "Encounters": [
    { field: 'date', headerName: 'When', width: 140 },
    { field: 'type', headerName: 'Type', width: 140 },
    { field: 'encClosed', headerName: 'Enc Closed', width: 100 },
    { field: 'with', headerName: 'With', width: 200 },
    { field: 'visitType', headerName: 'Visit Type', width: 140 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'endDate', headerName: 'Disch Date', width: 140 }
  ],
  "Notes": [
    {
      field: 'summary',
      headerName: 'Summary',
      width: 50,
      renderCell: ({ value }: any) => (
        <Tooltip title={value} placement="right">
          <IconButton size="small">
            <Icon fontSize="small">content_paste</Icon>
          </IconButton>
        </Tooltip>
      )
    },
    { field: 'serviceDate', headerName: 'Service Date', width: 100 },
    { field: 'encDate', headerName: 'Enc Date', width: 100 },
    { field: 'encDept', headerName: 'Enc Dept', width: 150 },
    { field: 'authorSpecialty', headerName: 'Auth Specialty', width: 150 },
    { field: 'authorName', headerName: 'Author', width: 250 },
    { field: 'encType', headerName: 'Enc Type', width: 140 },
    { field: 'type', headerName: 'Category', width: 140 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'encounterProvider', headerName: 'Enc Provider', width: 150 }
  ],
  "Imaging": [
    { field: 'date', headerName: 'Ordered', width: 140 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'statusDate', headerName: 'Status Date', width: 140 },
    { field: 'test', headerName: 'Exam', flex: 1 },
    { field: 'abnormal', headerName: 'Abnormal?', width: 90 },
    { field: 'acuity', headerName: 'Acuity', width: 90 },
    { field: 'encType', headerName: 'Encounter', width: 140 },
    { field: 'provider', headerName: 'Provider', width: 150 }
  ],
  "Lab": [
    { field: 'date', headerName: 'Order Date/Time', width: 150 },
    { field: 'test', headerName: 'Test', width: 250 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'abnormal', headerName: 'Abnormal?', width: 90 },
    { field: 'resulted', headerName: 'Result Date/Time', width: 150 },
    { field: 'expectedDate', headerName: 'Expected Date', width: 140 },
    { field: 'expirationDate', headerName: 'Expiration', width: 120 },
    { field: 'encType', headerName: 'Encounter Type', width: 140 },
    { field: 'provider', headerName: 'Provider', width: 150 }
  ],
  "Cardiac": [
    { field: 'date', headerName: 'Ordered', width: 140 },
    { field: 'statusDate', headerName: 'Performed', width: 140 },
    { field: 'test', headerName: 'Exam', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'encType', headerName: 'Encounter', width: 140 },
    { field: 'provider', headerName: 'Auth Provider', width: 150 },
    { field: 'performedBy', headerName: 'Perf Provider', width: 150 }
  ],
  "Specialty Tests": [
    { field: 'date', headerName: 'Ordered', width: 140 },
    { field: 'statusDate', headerName: 'Performed', width: 140 },
    { field: 'test', headerName: 'Test', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'encType', headerName: 'Encounter Type', width: 140 },
    { field: 'provider', headerName: 'Auth Provider', width: 150 },
    { field: 'performedBy', headerName: 'Perf Provider', width: 150 }
  ],
  "Other": [
    { field: 'date', headerName: 'Date', width: 140 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'encDept', headerName: 'Enc Dept', width: 150 },
    { field: 'provider', headerName: 'Provider', width: 150 }
  ],
  "Meds": [
    { field: 'date', headerName: 'Date', width: 140 },
    { field: 'ambIp', headerName: 'AMB/IP', width: 90 },
    { field: 'name', headerName: 'Medication', flex: 1 },
    { field: 'orderDetail', headerName: 'Order Detail', width: 200 },
    { field: 'longTerm', headerName: 'Long-term?', width: 100 },
    { field: 'endDate', headerName: 'End Date', width: 140 },
    { field: 'discontinue', headerName: 'Discontinue', width: 120 },
    { field: 'discontinueReason', headerName: 'Discontinue Reason', width: 160 },
    { field: 'provider', headerName: 'Provider', width: 150 },
    { field: 'notCoveredReason', headerName: 'Not Covered Reason', width: 160 },
    { field: 'class', headerName: 'Class', width: 120 }
  ],
  "Letters": [
    { field: 'date', headerName: 'Letter Date', width: 140 },
    { field: 'from', headerName: 'Letter From', width: 150 },
    { field: 'reason', headerName: 'Reason', flex: 1 },
    { field: 'comments', headerName: 'Comments', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'viewedDate', headerName: 'Viewed Date', width: 140 },
    { field: 'encDate', headerName: 'Enc Date', width: 120 }
  ],
  "Referrals": [
    { field: 'date', headerName: 'Date', width: 140 },
    { field: 'specialty', headerName: 'To Specialty', width: 150 },
    { field: 'toProvider', headerName: 'To Provider', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1 },
    { field: 'order', headerName: 'Order', width: 150 },
    { field: 'procedure', headerName: 'Procedure', width: 150 },
    { field: 'fromProvider', headerName: 'From Provider', width: 150 }
  ],
  "Scan Doc": [
    { field: 'type', headerName: 'Document Type', width: 150 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'encDate', headerName: 'Enc Date', width: 120 },
    { field: 'scanDate', headerName: 'Scan Date', width: 140 },
    { field: 'expirationDate', headerName: 'Expiration Date', width: 140 },
    { field: 'attachedTo', headerName: 'File Attached To', width: 160 }
  ],
  "Med Photos": [
    { field: 'type', headerName: 'Document Type', width: 150 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'encDate', headerName: 'Enc Date', width: 120 },
    { field: 'scanDate', headerName: 'Scan Date', width: 140 },
    { field: 'expirationDate', headerName: 'Expiration Date', width: 140 },
    { field: 'attachedTo', headerName: 'File Attached To', width: 160 }
  ],
  "Episodes": [
    { field: 'dateNoted', headerName: 'Date Noted', width: 140 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'dateResolved', headerName: 'Date Resolved', width: 140 },
    { field: 'type', headerName: 'Type', width: 140 },
    { field: 'episode', headerName: 'Episode', flex: 1 },
    { field: 'comments', headerName: 'Comments', width: 200 }
  ],
  "LDAs": [
    { field: 'name', headerName: 'LDA Name', width: 160 },
    { field: 'placementDate', headerName: 'Placement Date', width: 140 },
    { field: 'site', headerName: 'Site', width: 140 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'removalDate', headerName: 'Removal Date', width: 140 },
    { field: 'daysActive', headerName: 'Days Active', width: 100 },
    { field: 'description', headerName: 'Description', flex: 1 }
  ],
  "Consents": [
    { field: 'createdDate', headerName: 'Created Date', width: 140 },
    { field: 'type', headerName: 'Consent Type', width: 150 },
    { field: 'consentFor', headerName: 'Consent For', flex: 1 },
    { field: 'lastSigned', headerName: 'Last Signed', width: 140 },
    { field: 'signatureStatus', headerName: 'Signature Status', width: 140 },
    { field: 'linkedTo', headerName: 'Linked To', width: 160 },
    { field: 'provider', headerName: 'Provider', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 }
  ]
};

const STAR_COLUMN = {
  field: 'starred',
  headerName: '',
  renderHeader: () => <Icon>bookmark_border</Icon>,
  width: 50,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: () => (
    <IconButton
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'text.secondary',
        opacity: 0.0,
        '&:hover': {
          opacity: 1.0
        }
      }}
    >
      <Icon>bookmark_border</Icon>
    </IconButton>
  )
};

const SORT_KEYS: Record<string, string> = {
  "Encounters": "date",
  "Notes": "serviceDate",
  "Imaging": "orderedDate",
  "Lab": "orderedDate",
  "Cardiac": "orderedDate",
  "Specialty Tests": "orderedDate",
  "Other": "date",
  "Meds": "date",
  "Letters": "date",
  "Referrals": "date",
  "Scan Doc": "scanDate",
  "Med Photos": "scanDate",
  "Episodes": "dateNoted",
  "LDAs": "placementDate",
  "Consents": "createdDate"
};

export const ChartReview = ({ ...props }: any) => {
  const navigate = useNavigate();
  const { useChart, useEncounter } = usePatient()
  const [schedules] = useDatabase().schedules()
  const [chart, setChart] = useChart()()
  const [encounter, setEncounter] = useEncounter()()
  const [conditionals] = useEncounter().conditionals()
  const [orders] = useEncounter().orders([])
  const [departments] = useDatabase().departments()
  const [providers] = useDatabase().providers()
  const { openTab } = useSplitView()
  const [selectedTabLabel, setSelectedTabLabel] = React.useState('Encounters');
  const [rowSelectionModel, setRowSelectionModel] = React.useState<any>({ type: 'include' as const, ids: new Set() });

  const enrichDocs = (docs: any, kind: string, enc: any) => (docs || []).map((d: any) => {
    const authorProv = d.author ? providers.find((p: any) => p.id === d.author) : null;
    return {
      ...d,
      kind,
      authorName: authorProv ? [authorProv.name, authorProv.role, authorProv.specialty].filter(Boolean).join(" - ") : d.author,
      authorSpecialty: authorProv?.specialty,
      provider: d.provider ? providers.find((p: any) => p.id === d.provider)?.name || d.provider : d.provider,
      performedBy: d.performedBy ? providers.find((p: any) => p.id === d.performedBy)?.name || d.performedBy : d.performedBy,
      encDate: enc?.startDate?.split(" ")[0], // Assuming StartDate is "YYYY-MM-DD HH:MM"
      encDept: departments.find((dep: any) => dep.id === enc?.department)?.name,
      encType: enc?.type,
      encounterProvider: providers.find((p: any) => p.id === enc?.provider)?.name
    }
  })

  // display all chart documents from the current encounter AND ALL PRIOR ENCOUNTERS
  const currentEncDate = encounter.startDate
  const documents2 = Object.values(chart.encounters)
    .toSorted((a: any, b: any) => (new Date(a.startDate)).getTime() - (new Date(b.startDate)).getTime())
    .filter((x: any) => x.id === encounter.id || (new Date(x.startDate)).getTime() <= (new Date(currentEncDate)).getTime())
    .flatMap((x: any) => [
      ...enrichDocs(x.notes, 'Notes', x),
      ...enrichDocs(x.labs, 'Lab', x),
      ...enrichDocs(x.imaging, 'Imaging', x),
    ])

  const documents = filterDocuments(documents2, conditionals, orders)

  const encountersData = Object.values(chart.encounters).map((x: any) => {
    const dept = departments.find((d: any) => d.id === x.department)
    const prov = providers.find((p: any) => p.id === x.provider)
    const appt = schedules.flatMap((s: any) => s.appointments).find((a: any) => a.patient?.enc == x.id && a.patient?.mrn == chart.id);
    return {
      kind: 'Encounters',
      id: x.id,
      date: x.startDate,
      type: x.type,
      encClosed: x.status === "Signed" ? "Yes" : "No",
      with: `${dept ? dept.name : x.department} - ${prov ? prov.name : x.provider}`,
      visitType: appt ? appt.type : (x.type || ""),
      description: (x.diagnoses || []).join(", "),
      endDate: x.endDate,
      department: dept ? dept.name : x.department,
      specialty: prov ? prov.specialty : '',
      provider: prov ? prov.name : x.provider
    }
  })

  const filteredData = selectedTabLabel ? [...encountersData, ...documents].filter((item: any) => {
    const isCardiac = CARDIAC_ORDERS.some((t: string) => (item.test ?? "").includes(t))
    if (selectedTabLabel === 'Cardiac') return isCardiac;
    if (item.kind !== selectedTabLabel) return false;
    return !isCardiac;
  }) : [];

  const columns = [STAR_COLUMN, ...(COLUMN_DEFS[selectedTabLabel] || [])];

  const handleRowClick = (row: any) => {
    if (["Lab", "Cardiac", "Imaging", "Specialty Tests"].includes(selectedTabLabel)) {
      openTab("Report", { data: row }, "main", false)
    } else if (["Notes"].includes(selectedTabLabel)) {
      openTab("Note", { data: row }, "side", false)
    }
  }

  return (
    <div>
      <Label variant="h6" sx={{ p: 1, pb: 0 }}>Chart Review</Label>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
        <Tabs
          variant="scrollable"
          textColor="inherit"
          scrollButtons="auto"
          allowScrollButtonsMobile
          value={selectedTabLabel}
          onChange={(event, newValue) => setSelectedTabLabel(newValue)}>
          {tabLabels.map((label) => (
            <Tab
              key={label}
              value={label}
              label={label}
            />
          ))}
        </Tabs>
      </Box>
      <Box position="relative">
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          <div style={{ flex: '1', maxWidth: "100%", transition: 'max-width 0.5s', overflow: 'auto' }}>
            <DataGrid
              key={selectedTabLabel}
              initialState={{
                sorting: {
                  sortModel: [{ field: SORT_KEYS[selectedTabLabel] || 'date', sort: 'desc' }],
                },
              }}
              showToolbar
              slots={{
                toolbar: () => (
                  <GridToolbarContainer sx={{ justifyContent: 'flex-start' }}>
                    <GridToolbarFilterButton />
                    <GridToolbarColumnsButton />
                    <Box sx={{ flex: '1' }} />
                    {selectedTabLabel === 'Encounters' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Icon>medical_services</Icon>}
                        disabled={rowSelectionModel.ids.size === 0}
                        onClick={() => {
                          const selectedRow = filteredData.find((x: any) => JSON.stringify(x) === Array.from(rowSelectionModel.ids)[0]);
                          if (selectedRow) {
                            console.dir(selectedRow)
                            navigate(`/patient/${chart.id}/encounter/${selectedRow.id}`);
                          }
                        }}
                      >
                        Open Encounter
                      </Button>
                    )}
                  </GridToolbarContainer>
                )
              }}
              columns={columns}
              rows={filteredData.map((x: any) => {
                return { ...x, id: JSON.stringify(x), _obj: x }
              })}
              onCellDoubleClick={(params: any) => handleRowClick(params.row._obj)}
              onRowSelectionModelChange={(newRowSelectionModel: any) => {
                setRowSelectionModel(newRowSelectionModel);
              }}
              rowSelectionModel={rowSelectionModel}
              pageSizeOptions={[25, 50, 100]}
              hideFooter
            />
          </div>
          {/* TODO: The old preview code has been deleted. Please rewrite it! */}
        </div>
      </Box>
    </div>
  );
};
