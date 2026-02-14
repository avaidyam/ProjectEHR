import * as React from 'react';
import {
  Button,
  Label,
  Stack,
  Window,
  useLazyEffect,
  Tab,
  TabList,
  TabView,
  Box,
  TreeView,
  TreeItem,
  TitledCard,
  Icon,
  DataGrid,
  Autocomplete
} from 'components/ui/Core';
import { getAllCategories, getCodesForChapter, searchICD10Codes } from 'util/helpers';

const COLUMN_DEFS = {
  DIAGNOSIS: [
    { field: 'conceptId', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'source', headerName: 'Source', width: 100 }
  ]
}

const DiagnosisQueue = ({ diagnoses, onRemove }: { diagnoses: any[]; onRemove: (id: any) => void }) => {
  return (
    <Box paper sx={{ width: 250, flexShrink: 0, overflowY: 'auto', height: '100%', p: 1, border: '1px solid #e0e0e0' }}>
      {diagnoses.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontStyle: 'italic' }}>No diagnoses</div>
      ) : (
        <TreeView expandedItems={["new_diagnoses"]}>
          <TreeItem itemId="new_diagnoses" label="Diagnoses">
            {diagnoses.map(x => (
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
        </TreeView>
      )}
    </Box>
  )
}

const DiagnosisSearchResults = ({ data, selection, setSelection, onSelect, queuedDiagnoses, setQueuedDiagnoses, tab, setTab, ...props }: { data: any[]; selection: any; setSelection: any; onSelect: any; queuedDiagnoses: any[]; setQueuedDiagnoses: any; tab: string; setTab: any;[key: string]: any }) => {
  return (
    <Stack direction="column" sx={{ flex: 1, minWidth: 0 }} {...props}>
      <TitledCard
        emphasized
        color="#74c9cc"
        title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Diagnoses</>}
        sx={{ minHeight: 48 }}
        boxProps={{ sx: { height: "100%", maxHeight: "60vh", overflowY: "auto" } }}
      >
        <DataGrid
          rows={data}
          columns={COLUMN_DEFS.DIAGNOSIS}
          getRowId={(row) => row.conceptId}
          hideFooter
          disableColumnMenu
          density="compact"
          rowSelectionModel={{ type: 'include', ids: selection ? new Set([selection]) : new Set() }}
          onRowSelectionModelChange={(newModel: any) => {
            const ids = Array.from(newModel.ids as Set<any>);
            if (ids.length > 0) setSelection(ids[0])
            else if (data.some((x: any) => x.conceptId === selection)) setSelection(null)
          }}
          onRowDoubleClick={(params: any) => {
            if (queuedDiagnoses.length > 0) {
              if (!queuedDiagnoses.some((x: any) => x.id === params.row.conceptId)) {
                setQueuedDiagnoses((prev: any[]) => [...prev, { ...params.row, id: params.row.conceptId }])
              }
            } else {
              onSelect({ ...params.row, id: params.row.conceptId })
            }
          }}
          disableMultipleRowSelection
          autoHeight={data.length > 0}
          sx={{ border: 'none', pb: "28px" }}
        />
      </TitledCard>
      {tab === "preference" && (
        <Button variant="outlined" onClick={() => setTab("facility")}>Broaden my search</Button>
      )}
    </Stack>
  )
}

const DiagnosisBrowse = ({ onSelect, queuedDiagnoses, setQueuedDiagnoses, ...props }: { onSelect: any; queuedDiagnoses: any[]; setQueuedDiagnoses: any;[key: string]: any }) => {
  const [category, setCategory] = React.useState<any>(null)
  const categoryRefs = React.useRef<Record<string, any>>({})

  const scrollToCategory = (cat: any) => {
    if (categoryRefs.current[cat]) {
      categoryRefs.current[cat].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const categories = React.useMemo(() => getAllCategories(), []);

  return (
    <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      {/* Sidebar */}
      <Box paper sx={{ width: 250, flexShrink: 0, overflowY: 'auto', height: '100%', p: 1, border: '1px solid #e0e0e0' }}>
        <Label bold sx={{ mb: 1, display: 'block' }}>Categories</Label>
        <TreeView onSelectedItemsChange={(e: any, ids: any) => {
          setCategory(ids)
          scrollToCategory(ids)
        }}>
          {categories.map(cat => (
            <TreeItem key={cat.conceptId} itemId={cat.conceptId} label={cat.categoryName} />
          ))}
        </TreeView>
      </Box>

      {/* Content */}
      <Stack direction="column" spacing={2} sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: 1 }} {...props}>
        {categories.map((cat) => {
          const children = getCodesForChapter(cat.conceptId);
          if (!children || children.length === 0) return null;

          return (
            <Box
              key={cat.conceptId}
              ref={el => categoryRefs.current[cat.conceptId] = el}
              sx={{ flexShrink: 0 }}
            >
              <TitledCard
                emphasized
                title={cat.categoryName}
                color="#5EA1F8"
                sx={{ mb: 0 }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {children.map((item: any) => (
                    <Button
                      key={item.conceptId}
                      variant="outlined"
                      size="small"
                      color="inherit"
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', py: 1 }}
                      onClick={() => {
                        const queueItem = {
                          ...item,
                          id: item.conceptId
                        }
                        if (!queuedDiagnoses.some((x: any) => x.id === item.conceptId)) {
                          setQueuedDiagnoses((prev: any[]) => [...prev, queueItem])
                        }
                      }}
                    >
                      <Icon sx={{ mr: 1, color: 'text.secondary' }}>add</Icon>
                      {item.name}
                    </Button>
                  ))}
                </Box>
              </TitledCard>
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}

export const DiagnosisPicker = ({ searchTerm, open, onSelect, ...props }: { searchTerm: string; open: boolean; onSelect: (selection: any) => void;[key: string]: any }) => {
  const [value, setValue] = React.useState(searchTerm)
  const [inputValue, setInputValue] = React.useState(searchTerm)
  const [tab, setTab] = React.useState(searchTerm ? "preference" : "browse")
  const [data, setData] = React.useState<any[]>([])
  const [selection, setSelection] = React.useState<any>(null)
  const [queuedDiagnoses, setQueuedDiagnoses] = React.useState<any[]>([])

  const selectedItem = React.useMemo(() => data.find((x: any) => x.conceptId === selection), [data, selection])

  useLazyEffect(() => {
    setData(searchICD10Codes(value, 100))
  }, [value])

  return (
    <Window
      fullWidth
      maxWidth="lg"
      open={!!open}
      title="Diagnosis Search"
      onClose={() => onSelect(null)}
      header={
        <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center', mt: 1, mb: -2 }}>
          <Autocomplete
            freeSolo
            label="Search"
            size="small"
            sx={{ flex: 1 }}
            value={inputValue}
            onInputChange={(_e, newValue) => setInputValue(newValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setValue(inputValue)
                if (tab === 'browse') setTab('preference')
              }
            }}
            options={[]}
            TextFieldProps={{
              InputProps: {
                endAdornment: <Icon sx={{ cursor: "pointer", fontSize: 20 }} onClick={() => {
                  setValue(inputValue)
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
            if (selectedItem && !queuedDiagnoses.some((x: any) => x.id === selectedItem.conceptId)) {
              // Ensure the selected item has an 'id' property consistent with queue items
              setQueuedDiagnoses((prev: any[]) => [...prev, { ...selectedItem, id: selectedItem.conceptId }])
            }
          }}>Select and Stay</Button>
          <Button variant="outlined" onClick={() => onSelect(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => onSelect(queuedDiagnoses.length > 0 ? queuedDiagnoses : selectedItem ? { ...selectedItem, id: selectedItem.conceptId } : null)}>Accept</Button>
        </>
      }
    >
      <Stack direction="row" spacing={2} sx={{ height: "50vh" }}>
        {tab === "browse" ? (
          <DiagnosisBrowse
            onSelect={onSelect}
            queuedDiagnoses={queuedDiagnoses}
            setQueuedDiagnoses={setQueuedDiagnoses}
          />
        ) : (
          <DiagnosisSearchResults
            data={data}
            selection={selection}
            setSelection={setSelection}
            onSelect={onSelect}
            queuedDiagnoses={queuedDiagnoses}
            setQueuedDiagnoses={setQueuedDiagnoses}
            tab={tab}
            setTab={setTab}
            {...props}
          />
        )}
        {(queuedDiagnoses.length > 0 || tab === 'browse') &&
          <DiagnosisQueue
            diagnoses={queuedDiagnoses}
            onRemove={(id) => setQueuedDiagnoses(prev => prev.filter(q => q.id !== id))}
          />
        }
      </Stack>
    </Window>
  )
}
