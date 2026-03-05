// SocialDocumentation.jsx
import * as React from 'react';
import {
  TitledCard,
  Icon,
  MarkReviewed,
} from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';
import { RichTextEditor } from 'components/ui/Core';

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
      <RichTextEditor
        initialContent={socialDocData?.textbox || ''}
        onUpdate={handleSave}
        disableStickyMenuBar={true}
      />
      <MarkReviewed />
    </TitledCard>
  );
}