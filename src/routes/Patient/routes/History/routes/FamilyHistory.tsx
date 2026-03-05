// FamilyHistory.jsx
import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  IconButton,
  Label,
  TitledCard,
  Icon,
  Autocomplete,
  MarkReviewed,
  DataGrid,
} from 'components/ui/Core';
import { GridColDef } from '@mui/x-data-grid';
import {
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient, Database } from 'components/contexts/PatientContext';
import icd10 from 'util/data/icd10cm.json';


const icd10Options = Object.entries(icd10).map(([code, description]) => ({
  code,
  description,
  label: `${code} - ${description}`,
}));

const familyRelationships = ['Mother', 'Father', 'Sister', 'Brother', 'Maternal Grandmother', 'Maternal Grandfather', 'Paternal Grandmother', 'Paternal Grandfather', 'Other'];

const RotatedText = styled(Box)(({ theme }) => ({
  transform: 'rotate(-60deg)',
  transformOrigin: 'bottom left',
  position: 'absolute',
  bottom: 0,
  left: '100%',
  paddingBottom: '25px',
  width: '150px',
  zIndex: 10
}));

const defaultFamilyMembers = [
  { id: 'status-father' as Database.FamilyStatusItem.ID, relationship: 'Father', name: '', status: '', comment: '' },
  { id: 'status-mother' as Database.FamilyStatusItem.ID, relationship: 'Mother', name: '', status: '', comment: '' },
  { id: 'status-brother' as Database.FamilyStatusItem.ID, relationship: 'Brother', name: '', status: '', comment: '' },
];

const defaultProblems = [
  'Breast cancer',
  'Coronary artery bypass graft surgery',
  'Coronary artery disease with MI',
  'Heart disease',
];

const getUniqueProblems = (familyHistory: Database.FamilyHistoryItem[]) => {
  const allProblems = familyHistory.map((p) => p.description);
  const problemsSet = new Set([...defaultProblems, ...allProblems]);
  problemsSet.delete('No Pertinent History');
  return [...problemsSet].sort();
};

export function FamilyHistory() {
  const { useEncounter } = usePatient();
  const [familyHx, setFamilyHx] = useEncounter().history.family([]);
  const [familyStatus, setFamilyStatus] = useEncounter().history.familyStatus([]);

  const [isAddProblemOpen, setIsAddProblemOpen] = React.useState(false);
  const [commentAnchorEl, setCommentAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [selectedStatusItem, setSelectedStatusItem] = React.useState<Database.FamilyStatusItem | null>(null);
  const [selectedProblem, setSelectedProblem] = React.useState<any>(null);
  const [commentText, setCommentText] = React.useState('');
  const [newRelationship, setNewRelationship] = React.useState<string | null>('');

  const uniqueProblems = getUniqueProblems(familyHx);

  // Initialize defaults if empty
  React.useEffect(() => {
    if (familyStatus.length === 0) {
      setFamilyStatus(defaultFamilyMembers);
    }
  }, [familyStatus, setFamilyStatus]);

  const toggleProblem = (memberId: Database.FamilyStatusItem.ID, problemDescription: string) => {
    const existing = familyHx.find(fh => fh.person === memberId && fh.description === problemDescription);
    if (existing) {
      setFamilyHx(familyHx.filter(fh => fh.id !== existing.id));
    } else {
      let nextHx = familyHx;
      // Remove "No Pertinent History" if a specific problem is added
      if (problemDescription !== 'No Pertinent History') {
        nextHx = nextHx.filter(fh => !(fh.person === memberId && fh.description === 'No Pertinent History'));
      } else {
        // If adding "No Pertinent History", remove all other problems for this person
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
  };

  const hasProblem = (memberId: Database.FamilyStatusItem.ID, problem: string) =>
    familyHx.some((p) => p.person === memberId && p.description === problem);

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
        <Autocomplete
          freeSolo
          variant="standard"
          value={params.value || ''}
          options={[]}
          onInputChange={(_e, newValue) => {
            setFamilyStatus(prev => prev.map(m =>
              m.id === params.row.id ? { ...m, name: newValue } : m
            ));
          }}
          TextFieldProps={{ InputProps: { disableUnderline: true } }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Autocomplete
          freeSolo
          variant="standard"
          value={params.value || ''}
          options={[]}
          onInputChange={(_e, newValue) => {
            setFamilyStatus(prev => prev.map(m =>
              m.id === params.row.id ? { ...m, status: newValue } : m
            ));
          }}
          TextFieldProps={{ InputProps: { disableUnderline: true } }}
        />
      )
    },
    {
      field: 'noPertinentHistory',
      headerName: 'No Pertinent Hx',
      width: 60,
      renderHeader: () => <RotatedText>No Pertinent Hx</RotatedText>,
      renderCell: (params) => (
        <Box
          onClick={() => toggleProblem(params.row.id, 'No Pertinent History')}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          {hasProblem(params.row.id, 'No Pertinent History') ? (
            <Icon sx={{ color: '#00c853' }}>check_circle</Icon>
          ) : (
            ''
          )}
        </Box>
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
          <Icon sx={{ color: params.row.comment ? '#2196f3' : '#546E7A' }}>
            {params.row.comment ? 'comment' : 'description'}
          </Icon>
        </Box>
      )
    },
    ...uniqueProblems.map((problem) => ({
      field: `problem_${problem}`,
      headerName: problem,
      width: 50,
      renderHeader: () => <RotatedText>{problem}</RotatedText>,
      renderCell: (params: any) => (
        <Box
          onClick={() => toggleProblem(params.row.id, problem)}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          {hasProblem(params.row.id, problem) ? (
            <Icon sx={{ color: '#d50000' }}>check_circle</Icon>
          ) : (
            ''
          )}
        </Box>
      )
    }))
  ], [familyStatus, familyHx, uniqueProblems]);

  const handleAddProblem = () => {
    if (selectedStatusItem && selectedProblem) {
      toggleProblem(selectedStatusItem.id, selectedProblem.description);
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
        status: '',
        comment: '',
      };
      setFamilyStatus([...familyStatus, newMember]);
      setNewRelationship('');
    }
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Family History</>} color="#9F3494">

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={familyStatus}
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
        >
          Add Family Member
        </Button>
        <Autocomplete
          disablePortal
          options={familyRelationships}
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
            disablePortal
            options={icd10Options}
            getOptionLabel={(option) => option.label}
            sx={{ width: 400, mt: 2 }}
            onChange={(event: any, newValue: any) => setSelectedProblem(newValue)}
            value={selectedProblem}
            label="Select a Problem"
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
        onClose={() => setCommentAnchorEl(null)}
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
        <Stack spacing={2}>
          <Label variant="subtitle2">Comments for {selectedStatusItem?.relationship}</Label>
          <Autocomplete
            freeSolo
            autoFocus
            options={[]}
            TextFieldProps={{ multiline: true, rows: 4, placeholder: 'Enter comments...' }}
            fullWidth
            value={commentText}
            onInputChange={(_e, newValue) => setCommentText(newValue)}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={() => setCommentAnchorEl(null)} size="small">Cancel</Button>
            <Button onClick={handleSaveComments} variant="contained" color="primary" size="small">Save</Button>
          </Stack>
        </Stack>
      </Popover>
    </TitledCard>
  );
}