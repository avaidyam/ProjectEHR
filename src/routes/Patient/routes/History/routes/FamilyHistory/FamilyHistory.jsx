// FamilyHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Label,
} from 'components/ui/Core.jsx';
import {
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { usePatient } from '../../../../../../components/contexts/PatientContext.jsx';
import icd10 from '../../../../../../util/data/icd10cm.json';


const icd10Options = Object.entries(icd10).map(([code, description]) => ({
  code,
  description,
  label: `${code} - ${description}`,
}));

const familyRelationships = ['Mother', 'Father', 'Sister', 'Brother', 'Maternal Grandmother', 'Maternal Grandfather', 'Paternal Grandmother', 'Paternal Grandfather', 'Other'];

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: 'transparent',
  borderRight: 'none',
  borderBottom: 'none',
  position: 'relative',
  height: '100px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  padding: '8px 4px',
}));

const RotatedText = styled(Box)(({ theme }) => ({
  transform: 'rotate(-60deg)',
  transformOrigin: 'bottom left',
  position: 'absolute',
  bottom: 0,
  left: '100%',
  paddingBottom: '25px',
  width: '150px',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '4px',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #e0e0e0',
}));

const StyledActionCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const StyledProblemCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
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

const getUniqueProblems = (familyHistory) => {
  const allProblems = familyHistory.flatMap(member => member.problems.map(p => p.description));
  const problemsSet = new Set([...defaultProblems, ...allProblems]);
  problemsSet.delete('No Pertinent History');
  return [...problemsSet].sort();
};

export default function FamilyHistory() {
  const { useEncounter } = usePatient();
  const [familyHx, setFamilyHx] = useEncounter().history.family([]);
  const [familyData, setFamilyData] = useState(
    familyHx && familyHx.length > 0 ? familyHx : defaultFamilyMembers
  );
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  const uniqueProblems = getUniqueProblems(familyData);

  const handleOpenAddProblem = (member) => {
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
      const updatedFamily = familyData.map(member => {
        if (member.relationship === selectedMember.relationship) {
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

  const handleOpenComments = (member) => {
    setSelectedMember(member);
    setCommentText(member.comment || '');
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
    setSelectedMember(null);
    setCommentText('');
  };

  const handleSaveComments = () => {
    const updatedFamily = familyData.map(member => {
      if (member.relationship === selectedMember.relationship) {
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

  const toggleProblem = (member, problemDescription) => {
    const updatedFamily = familyData.map(m => {
      if (m.relationship === member.relationship) {
        const hasProblem = m.problems.some(p => p.description === problemDescription);
        if (hasProblem) {
          return {
            ...m,
            problems: m.problems.filter(p => p.description !== problemDescription)
          };
        } else {
          // Remove "No Pertinent History" if a specific problem is added
          const problems = problemDescription !== 'No Pertinent History'
            ? m.problems.filter(p => p.description !== 'No Pertinent History')
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

  const hasProblem = (member, problem) => member.problems.some(p => p.description === problem);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Label variant="h6" sx={{ fontWeight: 'bold' }}>Family History</Label>
      </Box>

      <Box sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Relationship</StyledTableHeadCell>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Status</StyledTableHeadCell>
              <StyledTableHeadCell>
                <RotatedText>No Pertinent Hx</RotatedText>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <RotatedText>Add Problem</RotatedText>
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                <RotatedText>Comments</RotatedText>
              </StyledTableHeadCell>
              {uniqueProblems.map((problem) => (
                <StyledTableHeadCell key={problem}>
                  <RotatedText>{problem}</RotatedText>
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(familyData ?? []).map((member) => (
              <TableRow key={member.relationship}>
                <StyledTableCell sx={{ fontWeight: 'bold' }}>{member.relationship}</StyledTableCell>
                <StyledTableCell>
                  <TextField
                    variant="standard"
                    value={member.name}
                    onChange={(e) => {
                      const updatedData = familyData.map(m =>
                        m.relationship === member.relationship ? { ...m, name: e.target.value } : m
                      );
                      setFamilyData(updatedData);
                      setFamilyHx(updatedData);
                    }}
                    InputProps={{ disableUnderline: true }}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <TextField
                    variant="standard"
                    value={member.status}
                    onChange={(e) => {
                      const updatedData = familyData.map(m =>
                        m.relationship === member.relationship ? { ...m, status: e.target.value } : m
                      );
                      setFamilyData(updatedData);
                      setFamilyHx(updatedData);
                    }}
                    InputProps={{ disableUnderline: true }}
                  />
                </StyledTableCell>
                <StyledActionCell onClick={() => toggleProblem(member, 'No Pertinent History')}>
                  {hasProblem(member, 'No Pertinent History') ? (
                    <CheckCircleOutlineIcon sx={{ color: '#00c853' }} />
                  ) : (
                    ''
                  )}
                </StyledActionCell>
                <StyledActionCell onClick={() => handleOpenAddProblem(member)}>
                  <AddCircleOutlineIcon sx={{ color: '#00c853' }} />
                </StyledActionCell>
                <StyledActionCell onClick={() => handleOpenComments(member)}>
                  <InsertDriveFileIcon sx={{ color: '#546E7A' }} />
                </StyledActionCell>
                {uniqueProblems.map((problem) => (
                  <StyledProblemCell key={problem} onClick={() => toggleProblem(member, problem)}>
                    {hasProblem(member, problem) ? (
                      <CheckCircleOutlineIcon sx={{ color: '#d50000' }} />
                    ) : (
                      ''
                    )}
                  </StyledProblemCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddFamilyMember}
        >
          Add Family Member
        </Button>
        <Autocomplete
          disablePortal
          options={familyRelationships}
          sx={{ width: 300, ml: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Relationship"
              variant="outlined"
              size="small"
            />
          )}
          value={newRelationship}
          onChange={(event, newValue) => setNewRelationship(newValue)}
        />
      </Box>

      {/* Add Problem Dialog */}
      <Dialog open={isAddProblemOpen} onClose={handleCloseAddProblem}>
        <DialogTitle>Add Problem for {selectedMember?.relationship}</DialogTitle>
        <DialogContent>
          <Autocomplete
            disablePortal
            options={icd10Options}
            getOptionLabel={(option) => option.label}
            sx={{ width: 400, mt: 2 }}
            onChange={(event, newValue) => setSelectedProblem(newValue)}
            value={selectedProblem}
            renderInput={(params) => (
              <TextField {...params} label="Select a Problem" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddProblem}>Cancel</Button>
          <Button onClick={handleAddProblem} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onClose={handleCloseComments}>
        <DialogTitle>Comments for {selectedMember?.relationship}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComments}>Cancel</Button>
          <Button onClick={handleSaveComments} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}