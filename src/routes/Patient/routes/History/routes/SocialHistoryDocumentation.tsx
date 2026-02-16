// SocialDocumentation.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
  MarkReviewed,
} from 'components/ui/Core';
import {
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePatient } from '../../../../../components/contexts/PatientContext';
import { Editor } from 'components/ui/Editor';

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

export function SocialHistoryDocumentation() {
  const { useEncounter } = usePatient();
  const [socialDocData, setSocialDocData] = useEncounter().history.SocialDocumentation();

  const handleSave = (content: any) => {
    setSocialDocData((prev: any) => ({
      ...prev,
      textbox: content
    }));
  };


  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Social Documentation</>} color="#9F3494">

      <SectionPaper>
        <Editor
          initialContent={socialDocData?.textbox || ''}
          onSave={handleSave}
          disableStickyMenuBar={true}
        />
      </SectionPaper>

      <MarkReviewed />
    </TitledCard>
  );
}