// FamilyHistory.jsx
import * as React from 'react';
import {
  Box,
  Button,
  TitledCard,
  Icon,
  Autocomplete,
  MarkReviewed,
  DataGrid,
  Tooltip,
} from 'components/ui/Core';
import { GridColDef } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
} from '@mui/material';
import { usePatient, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

const RotatedText: React.FC<React.PropsWithChildren> = ({ children, ...props }) => (
  <Tooltip title={children} placement="bottom">
    <Box
      sx={{
        transform: 'rotate(-60deg)',
        transformOrigin: 'bottom left',
        position: 'absolute',
        bottom: 0,
        left: '100%',
        paddingBottom: '25px',
        width: '150px',
        zIndex: 10
      }}
      {...props}
    >
      {children}
    </Box>
  </Tooltip>
)

const getUniqueProblems = (familyHistory: Database.FamilyHistoryItem[]) => {
  const allProblems = familyHistory.map((p) => p.description);
  const problemsSet = new Set(allProblems);
  problemsSet.delete('No Pertinent History');
  return [...problemsSet].sort();
};

const NameCell = ({ value, onSave }: { value: string, onSave: (newValue: string) => void }) => {
  const [inputValue, setInputValue] = React.useState(value || '');

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      variant="standard"
      inputValue={inputValue}
      options={[]}
      onInputChange={(_e, newValue) => setInputValue(newValue)}
      onBlur={() => {
        if (inputValue !== value) {
          onSave(inputValue);
        }
      }}
      TextFieldProps={{
        InputProps: { disableUnderline: true },
        onKeyDown: (e) => {
          e.stopPropagation(); // Stop DataGrid from intercepting Space/Enter/etc
        }
      }}
    />
  );
};

const AgeCell = ({ value, onSave }: { value: number | null | undefined, onSave: (newValue: number | null) => void }) => {
  const [inputValue, setInputValue] = React.useState(value?.toString() || '');

  React.useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      variant="standard"
      disableClearable
      inputValue={inputValue}
      options={[]}
      onInputChange={(_e, newValue) => setInputValue(newValue)}
      onBlur={() => {
        const num = parseInt(inputValue, 10);
        const next = isNaN(num) ? null : num;
        if (next !== (value ?? null)) {
          onSave(next);
        }
      }}
      TextFieldProps={{
        type: 'number',
        InputProps: { disableUnderline: true },
        onKeyDown: (e) => {
          e.stopPropagation(); // Stop DataGrid from intercepting Space/Enter/etc
        }
      }}
    />
  );
};

const StatusCell = ({ value, onSave }: { value: Database.FamilyStatusItem.Status, onSave: (newValue: Database.FamilyStatusItem.Status) => void }) => {
  const [val, setVal] = React.useState<Database.FamilyStatusItem.Status>(value);

  React.useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <Autocomplete
      variant="standard"
      value={val || ''}
      options={Object.values(Database.FamilyStatusItem.Status)}
      onChange={(_e, newValue) => {
        const next = newValue as Database.FamilyStatusItem.Status;
        setVal(next);
        if (next !== value) {
          onSave(next);
        }
      }}
      TextFieldProps={{ InputProps: { disableUnderline: true } }}
    />
  );
};

export function FamilyHistory() {
  const { useEncounter } = usePatient();
  const [familyHx, setFamilyHx] = useEncounter().history.family([]);
  const [familyStatus, setFamilyStatus] = useEncounter().history.familyStatus([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const [isAddProblemOpen, setIsAddProblemOpen] = React.useState(false);
  const [commentAnchorEl, setCommentAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [selectedStatusItem, setSelectedStatusItem] = React.useState<Database.FamilyStatusItem | null>(null);
  const [selectedProblem, setSelectedProblem] = React.useState<any>(null);
  const [commentText, setCommentText] = React.useState('');
  const [newRelationship, setNewRelationship] = React.useState<Database.FamilyStatusItem.Relationship | null>(null);

  const visibleFamilyStatus = React.useMemo(() => {
    return filterDocuments(familyStatus || [], conditionals, orders);
  }, [familyStatus, conditionals, orders]);

  const uniqueProblems = React.useMemo(() => getUniqueProblems(familyHx), [familyHx]);

  const toggleProblem = React.useCallback((memberId: Database.FamilyStatusItem.ID, problemDescription: string) => {
    const existing = familyHx.find(fh => fh.person === memberId && fh.description === problemDescription);
    if (existing) {
      setFamilyHx(familyHx.filter(fh => fh.id !== existing.id));
    } else {
      let nextHx = familyHx;
      if (problemDescription !== 'No Pertinent History') {
        nextHx = nextHx.filter(fh => !(fh.person === memberId && fh.description === 'No Pertinent History'));
      } else {
        nextHx = nextHx.filter(fh => fh.person !== memberId);
      }

      const newItem: Database.FamilyHistoryItem = {
        id: Database.FamilyHistoryItem.ID.create(),
        person: memberId,
        description: problemDescription,
        age: ''
      };
      setFamilyHx([...nextHx, newItem]);
    }
  }, [familyHx, setFamilyHx]);

  const hasProblem = React.useCallback((memberId: Database.FamilyStatusItem.ID, problem: string) =>
    familyHx.some((p) => p.person === memberId && p.description === problem), [familyHx]);

  const columns: GridColDef[] = React.useMemo(() => [
    {
      field: 'relationship',
      headerName: 'Relationship',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <NameCell
          value={params.value}
          onSave={(newValue) => {
            setFamilyStatus(prev => prev.map(m =>
              m.id === params.row.id ? { ...m, name: newValue } : m
            ));
          }}
        />
      )
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      renderCell: (params) => (
        <AgeCell
          value={params.value as number}
          onSave={(newValue) => {
            setFamilyStatus(prev => prev.map(m =>
              m.id === params.row.id ? { ...m, age: newValue } : m
            ));
          }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <StatusCell
          value={params.value as Database.FamilyStatusItem.Status}
          onSave={(newValue) => {
            setFamilyStatus(prev => prev.map(m =>
              m.id === params.row.id ? { ...m, status: newValue } : m
            ));
          }}
        />
      )
    },
    {
      field: 'noPertinentHistory',
      headerName: 'No Pertinent Hx',
      width: 60,
      renderHeader: () => <RotatedText>No Pertinent Hx</RotatedText>,
      renderCell: (params) => (
        <Tooltip title="No Pertinent History" arrow placement="bottom">
          <Box
            onClick={(e) => {
              e.stopPropagation();
              toggleProblem(params.row.id, 'No Pertinent History');
            }}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              '&:hover .hover-icon': { opacity: 1 }
            }}
          >
            {hasProblem(params.row.id, 'No Pertinent History') ? (
              <Icon sx={{ color: '#00c853' }}>check_circle</Icon>
            ) : (
              <Icon className="hover-icon" sx={{ color: 'action.disabled', opacity: 0, transition: 'opacity 0.2s' }}>radio_button_unchecked</Icon>
            )}
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'addProblem',
      headerName: 'Add Problem',
      width: 60,
      renderHeader: () => <RotatedText>Add Problem</RotatedText>,
      renderCell: (params) => (
        <Box
          onClick={() => {
            setSelectedStatusItem(params.row);
            setIsAddProblemOpen(true);
          }}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          <Icon sx={{ color: '#00c853' }}>add_circle</Icon>
        </Box>
      )
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 60,
      renderHeader: () => <RotatedText>Comments</RotatedText>,
      renderCell: (params) => (
        <Box
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            setCommentAnchorEl(event.currentTarget);
            setSelectedStatusItem(params.row);
            setCommentText(params.row.comment || '');
          }}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          <Icon sx={{ color: params.row.comment ? 'primary.main' : 'action.disabled', opacity: params.row.comment ? 1 : 0.5 }}>
            description
          </Icon>
        </Box>
      )
    },
    ...uniqueProblems.map((problem) => ({
      field: `problem_${problem}`,
      headerName: problem,
      width: 50,
      renderHeader: () => <RotatedText>{problem}</RotatedText>,
      renderCell: (params: any) => {
        if (!params?.id) return null;
        return (
          <Tooltip title={problem} arrow placement="bottom">
            <Box
              onClick={(e) => {
                e.stopPropagation();
                toggleProblem(params.id as Database.FamilyStatusItem.ID, problem);
              }}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                '&:hover .hover-icon': { opacity: 1 }
              }}
            >
              {hasProblem(params.id as Database.FamilyStatusItem.ID, problem) ? (
                <Icon sx={{ color: '#d50000' }}>check_circle</Icon>
              ) : (
                <Icon className="hover-icon" sx={{ color: 'action.disabled', opacity: 0, transition: 'opacity 0.2s' }}>radio_button_unchecked</Icon>
              )}
            </Box>
          </Tooltip>
        );
      }
    }))
  ], [familyStatus, familyHx, uniqueProblems, toggleProblem, hasProblem]);

  const handleAddProblem = () => {
    if (selectedStatusItem && selectedProblem) {
      toggleProblem(selectedStatusItem.id, selectedProblem);
      setIsAddProblemOpen(false);
      setSelectedStatusItem(null);
      setSelectedProblem(null);
    }
  };

  const handleSaveComments = () => {
    if (selectedStatusItem) {
      setFamilyStatus(prev => prev.map(m =>
        m.id === selectedStatusItem.id ? { ...m, comment: commentText } : m
      ));
      setCommentAnchorEl(null);
      setSelectedStatusItem(null);
      setCommentText('');
    }
  };

  const handleAddFamilyMember = () => {
    if (newRelationship) {
      const newMember: Database.FamilyStatusItem = {
        id: Database.FamilyStatusItem.ID.create(),
        relationship: newRelationship,
        name: '',
        age: null,
        status: Database.FamilyStatusItem.Status.Unknown,
        comment: '',
      };
      setFamilyStatus([...familyStatus, newMember]);
      setNewRelationship(null);
    }
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Family History</>} color="#9F3494">

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={visibleFamilyStatus}
          columns={columns}
          columnHeaderHeight={100}
          hideFooter
          disableRowSelectionOnClick
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Icon>add_circle</Icon>}
          onClick={handleAddFamilyMember}
          disabled={!newRelationship}
        >
          Add Family Member
        </Button>
        <Autocomplete
          options={Object.values(Database.FamilyStatusItem.Relationship)}
          sx={{ width: 300, ml: 2 }}
          label="Select Relationship"
          size="small"
          value={newRelationship}
          onChange={(event: any, newValue: any) => setNewRelationship(newValue)}
        />
      </Box>

      <MarkReviewed sx={{ mt: 2 }} />

      <Dialog open={isAddProblemOpen} onClose={() => setIsAddProblemOpen(false)}>
        <DialogTitle>Add Problem for {selectedStatusItem?.relationship}</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={uniqueProblems}
            sx={{ width: 400, mt: 2 }}
            onInputChange={(event: any, newValue: any) => setSelectedProblem(newValue)}
            value={selectedProblem || ''}
            label="Enter a problem name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddProblemOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProblem} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Comments Popover */}
      <Popover
        open={Boolean(commentAnchorEl)}
        anchorEl={commentAnchorEl}
        onClose={() => { setCommentAnchorEl(null); handleSaveComments() }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{ sx: { p: 2, width: 320 } }}
      >
        <Autocomplete
          freeSolo
          autoFocus
          options={[]}
          TextFieldProps={{ multiline: true, rows: 4, placeholder: 'Enter comments...' }}
          fullWidth
          value={commentText}
          onInputChange={(_e, newValue) => setCommentText(newValue)}
        />
      </Popover>
    </TitledCard>
  );
}