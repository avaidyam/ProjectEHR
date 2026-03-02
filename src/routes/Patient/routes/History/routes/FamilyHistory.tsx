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
import { usePatient } from '../../../../../components/contexts/PatientContext';
import icd10 from '../../../../../util/data/icd10cm.json';


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
  { relationship: 'Father', name: '', status: '', problems: [], comment: '' },
  { relationship: 'Mother', name: '', status: '', problems: [], comment: '' },
  { relationship: 'Brother', name: '', status: '', problems: [], comment: '' },
];

const defaultProblems = [
  'Breast cancer',
  'Coronary artery bypass graft surgery',
  'Coronary artery disease with MI',
  'Heart disease',
];

const getUniqueProblems = (familyHistory: any[]) => {
  const allProblems = familyHistory.flatMap((member: any) => member.problems.map((p: any) => p.description));
  const problemsSet = new Set([...defaultProblems, ...allProblems]);
  problemsSet.delete('No Pertinent History');
  return [...problemsSet].sort();
};

export function FamilyHistory() {
  const { useEncounter } = usePatient();
  const [familyHx, setFamilyHx] = useEncounter().history.family([]);
  const [familyData, setFamilyData] = React.useState<any[]>(() => {
    const initial = familyHx && familyHx.length > 0 ? familyHx : defaultFamilyMembers;
    return initial.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `fh-${idx}-${item.relationship}`
    }));
  });
  const [isAddProblemOpen, setIsAddProblemOpen] = React.useState(false);
  const [commentAnchorEl, setCommentAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [selectedProblem, setSelectedProblem] = React.useState<any>(null);
  const [commentText, setCommentText] = React.useState('');
  const [newRelationship, setNewRelationship] = React.useState<string | null>('');

  const uniqueProblems = getUniqueProblems(familyData);

  // Sync familyData with familyHx and ensure IDs
  React.useEffect(() => {
    if (familyHx) {
      const normalized = familyHx.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `fh-${idx}-${item.relationship}`
      }));
      if (JSON.stringify(normalized) !== JSON.stringify(familyData)) {
        setFamilyData(normalized);
      }
    }
  }, [familyHx]);

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
          value={params.value}
          options={[]}
          onInputChange={(_e, newValue) => {
            const updatedData = familyData.map((m: any) =>
              m.id === params.row.id ? { ...m, name: newValue } : m
            );
            setFamilyData(updatedData);
            setFamilyHx(updatedData);
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
          value={params.value}
          options={[]}
          onInputChange={(_e, newValue) => {
            const updatedData = familyData.map((m: any) =>
              m.id === params.row.id ? { ...m, status: newValue } : m
            );
            setFamilyData(updatedData);
            setFamilyHx(updatedData);
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
          onClick={() => toggleProblem(params.row, 'No Pertinent History')}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          {hasProblem(params.row, 'No Pertinent History') ? (
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
          onClick={() => handleOpenAddProblem(params.row)}
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
          onClick={(event: React.MouseEvent<HTMLDivElement>) => handleOpenComments(event, params.row)}
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
          onClick={() => toggleProblem(params.row, problem)}
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}
        >
          {hasProblem(params.row, problem) ? (
            <Icon sx={{ color: '#d50000' }}>check_circle</Icon>
          ) : (
            ''
          )}
        </Box>
      )
    }))
  ], [familyData, uniqueProblems]);

  const handleOpenAddProblem = (member: any) => {
    setSelectedMember(member);
    setIsAddProblemOpen(true);
  };

  const handleCloseAddProblem = () => {
    setIsAddProblemOpen(false);
    setSelectedMember(null);
    setSelectedProblem(null);
  };

  const handleAddProblem = () => {
    if (selectedMember && selectedProblem) {
      const updatedFamily = familyData.map((member: any) => {
        if (member.id === selectedMember.id) {
          const newProblems = [...member.problems, { description: selectedProblem.description, ageOfOnset: '' }];
          return { ...member, problems: newProblems };
        }
        return member;
      });
      setFamilyData(updatedFamily);
      setFamilyHx(updatedFamily); // Update the main context
      handleCloseAddProblem();
    }
  };

  const handleOpenComments = (event: React.MouseEvent<HTMLDivElement>, member: any) => {
    setCommentAnchorEl(event.currentTarget);
    setSelectedMember(member);
    setCommentText(member.comment || '');
  };

  const handleCloseComments = () => {
    setCommentAnchorEl(null);
    setSelectedMember(null);
    setCommentText('');
  };

  const handleSaveComments = () => {
    const updatedFamily = familyData.map((member: any) => {
      if (member.id === selectedMember.id) {
        return { ...member, comment: commentText };
      }
      return member;
    });
    setFamilyData(updatedFamily);
    setFamilyHx(updatedFamily); // Update the main context
    handleCloseComments();
  };

  const handleAddFamilyMember = () => {
    if (newRelationship) {
      const newMember = {
        id: `fh-${Date.now()}`,
        relationship: newRelationship,
        name: '',
        status: '',
        problems: [],
        comment: '',
      };
      const updatedFamily = [...familyData, newMember];
      setFamilyData(updatedFamily);
      setFamilyHx(updatedFamily); // Update the main context
      setNewRelationship('');
    }
  };

  const toggleProblem = (member: any, problemDescription: string) => {
    const updatedFamily = familyData.map((m: any) => {
      if (m.id === member.id) {
        const hasProblem = m.problems.some((p: any) => p.description === problemDescription);
        if (hasProblem) {
          return {
            ...m,
            problems: m.problems.filter((p: any) => p.description !== problemDescription)
          };
        } else {
          // Remove "No Pertinent History" if a specific problem is added
          const problems = problemDescription !== 'No Pertinent History'
            ? m.problems.filter((p: any) => p.description !== 'No Pertinent History')
            : m.problems;

          return {
            ...m,
            problems: [...problems, { description: problemDescription, ageOfOnset: '' }]
          };
        }
      }
      return m;
    });
    setFamilyData(updatedFamily);
    setFamilyHx(updatedFamily); // Update the main context
  };

  const hasProblem = (member: any, problem: string) => member.problems.some((p: any) => p.description === problem);

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Family History</>} color="#9F3494">

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={familyData ?? []}
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

      <Dialog open={isAddProblemOpen} onClose={handleCloseAddProblem}>
        <DialogTitle>Add Problem for {selectedMember?.relationship}</DialogTitle>
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
          <Button onClick={handleCloseAddProblem}>Cancel</Button>
          <Button onClick={handleAddProblem} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Comments Popover */}
      <Popover
        open={Boolean(commentAnchorEl)}
        anchorEl={commentAnchorEl}
        onClose={handleCloseComments}
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
          <Label variant="subtitle2">Comments for {selectedMember?.relationship}</Label>
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
            <Button onClick={handleCloseComments} size="small">Cancel</Button>
            <Button onClick={handleSaveComments} variant="contained" color="primary" size="small">Save</Button>
          </Stack>
        </Stack>
      </Popover>
    </TitledCard>
  );
}