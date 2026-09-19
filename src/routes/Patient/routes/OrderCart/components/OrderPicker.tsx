import * as React from 'react';
import { Button, Autocomplete, Label, Stack, Window, useLazyEffect, Tab, TabList, TabView, Box, TreeView, TreeItem, TitledCard, Icon, DataGrid } from 'components/ui/Core';
import { Database, useDatabase } from 'components/contexts/PatientContext'

const BROWSE_CATEGORIES = {
  "Hematology": ["CBC", "ESR", "PTTP", "APTSC", "PTINRPOC", "FIBTP"],
  "Drug Levels": ["ACMA", "ALC", "CARTA", "DIG", "PBR", "PNYA", "SALCA", "THEO", "VALPA"],
  "Microbiology": ["ANAES", "BLOODCUL7", "CSFME"],
  "Urine (Lab)": ["URINEPRE", "ADULT", "URINECUL", "DSS"],
  "Cardiac": ["ECG12LEA", "CARDIACM", "ISCHEMIC"],
  "Chemistry": ["NH3V", "AMS", "BHCG", "BHYD", "BMAMA", "CA", "CAI", "CMAMA", "CK", "CRP", "CRBF", "GLURA", "LIVPR", "LACS1", "LPS", "UOSMS", "MG_S", "PHOS", "KS", "PBNP1", "HSTNI"],
  "Pelvic Exam": ["MCTGC", "CHLAMYDI1", "CVRNA"],
  "Point of Care": ["URINEPRE", "BEDSIDEU1", "BLOODGLU", "ISTAT8PL", "LACTICAC", "OCCULTBL1", "FOBT"],
  "Blood Bank": ["ABORH", "731383", "TYPEANDS"],
  "Radiology: XR": ["XRCH1V", "XRCH4+V", "XRKUB"],
  "Radiology: CT": ["CTAPU", "CTAPE", "CTCAPU3D", "CTCHE", "CTCHCA", "CTHDU", "CTCSU", "CTTSU", "CTLSU", "CTBRAINW"],
  "Consults": ["CONSULTA1", "CONSULTC8", "CONSULTC4", "CONSULTG2", "CONSULTT1", "CONSULTN6", "CONSULTN5", "CONSULTO11", "CONSULTP19", "CONSULTG6", "CONSULTG", "CONSULTU1", "CONSULTV", "CONSULTP10"],
  "Misc Orders": ["ADMIT"],
  "Medications": ["198466", "1723740", "2629337", "2474269", "897756", "897757", "727619", "998212", "998213", "104894", "312085", "1314133", "992460"]
}

const COLUMN_DEFS = {
  ORDER_SET: [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', width: 150, valueGetter: () => "Order Set" }
  ],
  MEDICATION: [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'dose', headerName: 'Dose', width: 100 },
    { field: 'route', headerName: 'Route', width: 100 },
    { field: 'frequency', headerName: 'Frequency', width: 100 },
    { field: 'pref_list', headerName: 'Pref List', width: 100, valueGetter: () => "DEFAULT" }
  ],
  PROCEDURE: [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'pref_list', headerName: 'Pref List', width: 100, valueGetter: () => "DEFAULT" }
  ]
}

const normalizeAlphaNumeric = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const search_orders = (
  orderables: Database.Root['orderables'],
  value = "",
  limit: number | null = null,
  category: string | null = null
) => {
  const rawQuery = value?.toLowerCase()?.trim() ?? "";
  const cleanQuery = normalizeAlphaNumeric(rawQuery);
  if (!rawQuery && !category) return [];

  const queryTokens = rawQuery.split(/\s+/).filter(Boolean);
  const cleanQueryTokens = queryTokens.map(normalizeAlphaNumeric);

  const matchesQuery = (name: string, code: string = '', extra: string = '') => {
    if (!rawQuery) return true;
    const lowerName = (name || '').toLowerCase();
    const lowerCode = (code || '').toLowerCase();
    const lowerExtra = (extra || '').toLowerCase();
    const fullText = `${lowerName} ${lowerCode} ${lowerExtra}`;
    const cleanText = normalizeAlphaNumeric(fullText);

    if (cleanQuery && cleanText.includes(cleanQuery)) return true;

    return queryTokens.every((token, idx) => {
      if (fullText.includes(token)) return true;
      const cleanToken = cleanQueryTokens[idx];
      return cleanToken ? cleanText.includes(cleanToken) : false;
    });
  };

  const getRelevanceScore = (name: string, code: string) => {
    const lowerName = (name || '').toLowerCase();
    const lowerCode = (code || '').toLowerCase();
    const cleanName = normalizeAlphaNumeric(lowerName);

    // Exact matches on code or name
    if (lowerCode === rawQuery || (cleanQuery && lowerCode === cleanQuery)) return 0;
    if (lowerName === rawQuery || (cleanQuery && cleanName === cleanQuery)) return 1;

    // Phrase prefix match in name (e.g. "XR Chest 1 View" starts with "xr chest")
    if (lowerName.startsWith(rawQuery)) return 2;

    // Code starts with query
    if (lowerCode.startsWith(rawQuery) || (cleanQuery && lowerCode.startsWith(cleanQuery))) return 3;

    // Clean name starts with clean query
    if (cleanQuery && cleanName.startsWith(cleanQuery)) return 4;

    // Word boundary / token prefix matches in name
    if (queryTokens.some(t => lowerName.startsWith(t))) return 5;

    // Name contains all query tokens
    if (queryTokens.every(t => lowerName.includes(t))) return 6;

    return 7;
  };

  // Helper getters
  const getMeds = () => {
    if (!orderables?.rxnorm) return [];
    return orderables.rxnorm
      .map((x: any, i: number) => ({ ...x, _idx: i, type: 'medication' }))
      .filter((x: any) => {
        const aliases = Array.isArray(x.alias) ? x.alias.join(' ') : '';
        let routeForms = '';
        let routeCodes = '';
        if (x.route) {
          for (const [r, f] of Object.entries(x.route) as [string, any][]) {
            routeCodes += ' ' + Object.keys(f).join(' ');
            routeForms += ' ' + r + ' ' + Object.values(f).join(' ');
          }
        }
        return matchesQuery(x.name, routeCodes, `${aliases} ${routeForms}`);
      });
  };

  const getProcs = () => {
    if (!orderables?.procedures) return [];
    return Object.entries(orderables.procedures)
      .filter(([k, v]: [string, any]) => matchesQuery(v, k))
      .map(([k, v]: [string, any]) => {
        const isImaging = ["CT", "MRI", "XR"].some((t: string) => (v as string).toUpperCase().includes(t));
        return { id: `proc_${k}`, code: k, name: v, type: isImaging ? 'Imaging' : 'Lab' };
      });
  };

  let source: any[] = [];
  if (category === "medications") {
    source = getMeds();
  } else if (category === "procedures") {
    source = getProcs();
  } else {
    source = [...getMeds(), ...getProcs()];
  }

  // Sort by relevance
  source.sort((a, b) => {
    const sA = getRelevanceScore(a.name, a.code);
    const sB = getRelevanceScore(b.name, b.code);
    if (sA !== sB) return sA - sB;
    if (a.name.length !== b.name.length) return a.name.length - b.name.length;
    return a.name.localeCompare(b.name);
  });

  // Apply limit to parent items
  const sliced = limit ? source.slice(0, limit) : source;

  // Expand medications
  const expanded = sliced.flatMap((item: any) => {
    if (item.type === 'medication') {
      if (!item.route) return [];
      return Object.entries(item.route).flatMap(([routeType, forms]: [string, any]) => {
        return Object.entries(forms).map(([code, desc]: [string, any]) => ({
          id: `med_${code}`,
          type: 'medication',
          code: code,
          name: `${item.name} ${desc}`,
          originalName: item.name,
          dose: desc,
          route: routeType,
          routesMap: item.route, // Pass the full map for the composer
          frequency: "ONE TIME"
        }));
      });
    }
    return item;
  });
  return expanded;
};

const OrderQueue = ({ orders, onRemove }: { orders: any[]; onRemove: (id: any) => void }) => {
  return (
    <Box paper sx={{ width: 250, flexShrink: 0, overflowY: 'auto', height: '100%', p: 1, border: '1px solid #e0e0e0' }}>
      {orders.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontStyle: 'italic' }}>No orders</div>
      ) : (
        <TreeView expandedItems={["new_meds", "new_procs"]}>
          {orders.some((x: any) => x.type === 'medication') && (
            <TreeItem itemId="new_meds" label="Medications">
              {orders.filter((x: any) => x.type === 'medication').map((x: any) => (
                <TreeItem key={x.id} itemId={x.id} label={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    {x.name}
                    <Icon
                      sx={{ fontSize: 16, cursor: 'pointer', ml: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(x.id)
                      }}
                    >close</Icon>
                  </Stack>
                } />
              ))}
            </TreeItem>
          )}
          {orders.some((x: any) => ['procedure', 'Imaging', 'Lab'].includes(x.type)) && (
            <TreeItem itemId="new_procs" label="Procedures">
              {orders.filter((x: any) => ['procedure', 'Imaging', 'Lab'].includes(x.type)).map((x: any) => (
                <TreeItem key={x.id} itemId={x.id} label={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    {x.name}
                    <Icon
                      sx={{ fontSize: 16, cursor: 'pointer', ml: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(x.id)
                      }}
                    >close</Icon>
                  </Stack>
                } />
              ))}
            </TreeItem>
          )}
        </TreeView>
      )}
    </Box>
  )
}

const OrderSearchResults = ({ data, selection, setSelection, onSelect, queuedOrders, setQueuedOrders, tab, setTab, categories, ...props }: { data: any[]; selection: any; setSelection: any; onSelect: any; queuedOrders: any[]; setQueuedOrders: any; tab: string; setTab: any; categories?: string[];[key: string]: any }) => {
  const showOrderSets = !categories || categories.includes('orderset');
  const showMedications = !categories || categories.includes('medication');
  const showProcedures = !categories || categories.includes('procedure');

  return (
    <Stack direction="column" sx={{ flex: 1, minWidth: 0 }} {...props}>
      {showOrderSets && (
        <TitledCard
          emphasized
          color="#74c9cc"
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Order Sets</>}
          sx={{ minHeight: 48 }}
          boxProps={{ sx: { height: "100%", maxHeight: "30vh", overflowY: "auto" } }}
        >
        </TitledCard>
      )}
      {showMedications && (
        <TitledCard
          emphasized
          color="#9F3494"
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Medications</>}
          sx={{ minHeight: 48 }}
          boxProps={{ sx: { height: "100%", maxHeight: "30vh", overflowY: "auto" } }}
        >
          <DataGrid
            rows={data.filter((x: any) => x.type === 'medication')}
            columns={COLUMN_DEFS.MEDICATION}
            hideFooter
            disableColumnMenu
            density="compact"
            rowSelectionModel={{ type: 'include', ids: selection ? new Set([selection]) : new Set() }}
            onRowSelectionModelChange={(newModel: any) => {
              const ids = Array.from(newModel.ids as Set<any>);
              if (ids.length > 0) setSelection(ids[0])
              else if (data.filter((x: any) => x.type === 'medication').some((x: any) => x.id === selection)) setSelection(null)
            }}
            onRowDoubleClick={(params: any) => {
              if (queuedOrders.length > 0) {
                setQueuedOrders((prev: any[]) => [...prev, { ...params.row, id: crypto.randomUUID() }])
                setSelection(null)
              } else {
                onSelect(params.row)
              }
            }}
            disableMultipleRowSelection
            autoHeight={data.filter((x: any) => x.type === 'medication').length > 0}
            sx={{ border: 'none', pb: "28px" }}
          />
        </TitledCard>
      )}
      {showProcedures && (
        <TitledCard
          emphasized
          color="#5EA1F8"
          title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Procedures</>}
          sx={{ minHeight: 48 }}
          boxProps={{ sx: { height: "100%", maxHeight: "30vh", overflowY: "auto" } }}
        >
          <DataGrid
            rows={data.filter((x: any) => ['procedure', 'Imaging', 'Lab'].includes(x.type))}
            columns={COLUMN_DEFS.PROCEDURE}
            hideFooter
            disableColumnMenu
            density="compact"
            rowSelectionModel={{ type: 'include', ids: selection ? new Set([selection]) : new Set() }}
            onRowSelectionModelChange={(newModel: any) => {
              const ids = Array.from(newModel.ids as Set<any>);
              if (ids.length > 0) setSelection(ids[0])
              else if (data.filter((x: any) => ['procedure', 'Imaging', 'Lab'].includes(x.type)).some((x: any) => x.id === selection)) setSelection(null)
            }}
            onRowDoubleClick={(params: any) => {
              if (queuedOrders.length > 0) {
                setQueuedOrders((prev: any[]) => [...prev, { ...params.row, id: crypto.randomUUID() }])
                setSelection(null)
              } else {
                onSelect(params.row)
              }
            }}
            disableMultipleRowSelection
            autoHeight={data.filter((x: any) => ['procedure', 'Imaging', 'Lab'].includes(x.type)).length > 0}
            sx={{ border: 'none', pb: "28px" }}
          />
        </TitledCard>
      )}
      {tab === "preference" && (
        <Button variant="outlined" onClick={() => setTab("facility")}>Broaden my search</Button>
      )}
    </Stack>
  )
}

export const OrderBrowse = ({ orderables, onSelect, queuedOrders, setQueuedOrders, categories, ...props }: { orderables: any; onSelect: any; queuedOrders: any[]; setQueuedOrders: any; categories?: string[];[key: string]: any }) => {
  const filteredCategories = React.useMemo(() => {
    if (!categories) return BROWSE_CATEGORIES;
    const result: any = {};
    if (categories.includes('medication')) result['Medications'] = BROWSE_CATEGORIES['Medications'];
    if (categories.includes('procedure')) {
      Object.keys(BROWSE_CATEGORIES).forEach(k => {
        if (k !== 'Medications') result[k] = (BROWSE_CATEGORIES as any)[k];
      });
    }
    return result;
  }, [categories]);
  const [category, setCategory] = React.useState<any>(null)
  const categoryRefs = React.useRef<Record<string, any>>({})

  const scrollToCategory = (cat: any) => {
    if (categoryRefs.current[cat]) {
      categoryRefs.current[cat].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const resolveItem = (code: string) => {
    const med = orderables.rxnorm?.find((x: any) => x.code === code || (x.route && Object.values(x.route).some((r: any) => Object.keys(r).includes(code))))
    if (med) {
      let name = med.name
      if (med.route) {
        for (const [route, forms] of Object.entries(med.route) as [string, any][]) {
          if (forms[code]) {
            name = `${med.name} ${forms[code]}`
            break
          }
        }
      }
      return { ...med, type: 'medication', name, originalName: med.name, doseDescription: med.route ? (Object.values(med.route)[0] as any)[code] : '' }
    }
    if (orderables.procedures && orderables.procedures[code]) {
      return { name: orderables.procedures[code], type: 'procedure', code, originalName: orderables.procedures[code] }
    }
    return null
  }

  return (
    <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      {/* Sidebar */}
      <Box paper sx={{ width: 250, flexShrink: 0, overflowY: 'auto', height: '100%', p: 1, border: '1px solid #e0e0e0' }}>
        <Label bold sx={{ mb: 1, display: 'block' }}>Preference Lists</Label>
        <TreeView onSelectedItemsChange={(e: any, ids: any) => {
          setCategory(ids)
          scrollToCategory(ids)
        }}>
          {Object.keys(filteredCategories).map((cat: string) => (
            <TreeItem key={cat} itemId={cat} label={cat} />
          ))}
        </TreeView>
      </Box>

      {/* Content */}
      <Stack direction="column" spacing={2} sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: 1 }} {...props}>
        {Object.entries(filteredCategories).map(([cat, codes]: [string, any]) => (
          <Box
            key={cat}
            ref={(el: any) => categoryRefs.current[cat] = el}
            sx={{ flexShrink: 0 }}
          >
            <TitledCard
              emphasized
              title={cat}
              color="#5EA1F8"
              sx={{ mb: 0 }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {codes.map((code: string) => {
                  const item = resolveItem(code)
                  if (!item) return null
                  return (
                    <Button
                      key={code}
                      variant="outlined"
                      size="small"
                      color="inherit"
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', py: 1 }}
                      onClick={() => {
                        const queueItem = {
                          id: crypto.randomUUID(),
                          code: code,
                          name: item.name,
                          type: item.type,
                          originalName: item.originalName,
                          dose: item.doseDescription,
                          ...(item.type === 'medication' ? { frequency: 'ONE TIME', route: 'Oral' } : {})
                        }
                        setQueuedOrders((prev: any[]) => [...prev, queueItem])
                      }}
                    >
                      <Icon sx={{ mr: 1, color: 'text.secondary' }}>add</Icon>
                      {item.name}
                    </Button>
                  )
                })}
              </Box>
            </TitledCard>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}

export const OrderPicker = ({ searchTerm, open, onSelect, categories, ...props }: { searchTerm: string; open: any; onSelect: (selection: any) => void; categories?: string[];[key: string]: any }) => {
  const [orderables] = useDatabase().orderables()
  const [value, setValue] = React.useState(searchTerm || '')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [tab, setTab] = React.useState(searchTerm ? "preference" : "browse")
  const [category, setCategory] = React.useState<any>(null)
  const [data, setData] = React.useState<any[]>([])
  const [selection, setSelection] = React.useState<any>(null)
  const [queuedOrders, setQueuedOrders] = React.useState<any[]>([])

  const selectedItem = React.useMemo(() => data.find((x: any) => x.id === selection), [data, selection])

  // Synchronize incoming search term and automatically focus input when opened
  React.useEffect(() => {
    if (open) {
      const term = searchTerm || ''
      setValue(term)
      if (term.trim()) {
        setTab("preference")
      }
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          const len = inputRef.current.value?.length || 0
          inputRef.current.setSelectionRange(len, len)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open, searchTerm])

  useLazyEffect(() => {
    let searchCategory = null;
    if (categories?.length === 1) {
      if (categories.includes('medication')) searchCategory = 'medications';
      if (categories.includes('procedure')) searchCategory = 'procedures';
    }
    setData(search_orders(orderables, value, 100, searchCategory))
  }, [value, category, categories])

  return (
    <Window
      fullWidth
      maxWidth="lg"
      open={!!open}
      title="Orders Search"
      onClose={() => onSelect(null)}
      header={
        <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center', mt: 1, mb: -2 }}>
          <Autocomplete
            freeSolo
            label="Search"
            size="small"
            sx={{ flex: 1 }}
            value={value}
            options={[]}
            onInputChange={(e, newVal) => {
              setValue(newVal)
              if (tab === 'browse') setTab('preference')
            }}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                setValue(inputRef.current?.value ?? '')
                if (tab === 'browse') setTab('preference')
              }
            }}
            TextFieldProps={{
              inputRef: inputRef,
              autoFocus: true,
              InputProps: {
                endAdornment: <Icon sx={{ cursor: "pointer", fontSize: 20 }} onClick={() => {
                  setValue(inputRef.current?.value ?? '')
                  if (tab === 'browse') setTab('preference')
                }}>search</Icon>
              }
            }}
          />
          <TabView value={tab}>
            <TabList onChange={(e: any, v: any) => setTab(v)} variant="standard">
              <Tab label="Browse" value="browse" />
              <Tab label="Preference List" value="preference" />
              <Tab label="Facility List" value="facility" />
            </TabList>
          </TabView>
        </Stack>
      }
      footer={
        <>
          <Button variant="outlined" onClick={() => {
            if (selectedItem) {
              setQueuedOrders((prev: any[]) => [...prev, { ...selectedItem, id: crypto.randomUUID() }])
              setSelection(null)
            }
          }}>Select and Stay</Button>
          <Button variant="outlined" onClick={() => onSelect(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (selectedItem) {
              const newSelected = { ...selectedItem, id: crypto.randomUUID() }
              if (queuedOrders.length > 0) {
                onSelect([...queuedOrders, newSelected])
              } else {
                onSelect(selectedItem)
              }
            } else {
              onSelect(queuedOrders.length > 0 ? queuedOrders : null)
            }
          }}>Accept</Button>
        </>
      }
    >
      <Stack direction="row" spacing={2} sx={{ height: "50vh" }}>
        {tab === "browse" ? (
          <OrderBrowse
            orderables={orderables}
            onSelect={onSelect}
            queuedOrders={queuedOrders}
            setQueuedOrders={setQueuedOrders}
            categories={categories}
          />
        ) : (
          <OrderSearchResults
            data={data}
            selection={selection}
            setSelection={setSelection}
            onSelect={onSelect}
            queuedOrders={queuedOrders}
            setQueuedOrders={setQueuedOrders}
            tab={tab}
            setTab={setTab}
            categories={categories}
            {...props}
          />
        )}
        {(queuedOrders.length > 0 || tab === 'browse') &&
          <OrderQueue
            orders={queuedOrders}
            onRemove={(id: any) => setQueuedOrders((prev: any[]) => prev.filter((q: any) => q.id !== id))}
          />
        }
      </Stack>
    </Window>
  )
}
