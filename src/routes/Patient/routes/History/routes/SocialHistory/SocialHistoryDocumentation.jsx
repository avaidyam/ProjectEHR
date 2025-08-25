// SocialDocumentation.jsx
import React, { useState } from 'react';
import {
  Box,
  Label,
} from 'components/ui/Core.jsx';
import {
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../../components/contexts/PatientContext.jsx';
import { Editor } from 'components/ui/Editor.jsx';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

export default function SocialHistoryDocumentation() {
  const { useEncounter } = usePatient();
  const [socialDocData, setSocialDocData] = useEncounter().history.SocialDocumentation();
  const [reviewed, setReviewed] = useState(false);

  const handleSave = (content) => {
    setSocialDocData(prev => ({
      ...prev,
      textbox: content
    }));
  };

  const handleReviewedChange = (e) => {
    setReviewed(e.target.checked);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Label variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Social Documentation
      </Label>

      <SectionPaper>
        <Editor 
          initialContent={socialDocData?.textbox || ''}
          onSave={handleSave}
          disableStickyMenuBar={true}
        />
      </SectionPaper>

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            Social documentation has been reviewed.
          </Label>
        )}
      </Box>
    </Box>
  );
}