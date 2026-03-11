// SocialDocumentation.jsx
import * as React from 'react';
import {
  TitledCard,
  Icon,
  MarkReviewed,
  RichTextEditor
} from 'components/ui/Core';
import { usePatient, Database } from 'components/contexts/PatientContext';

export function SocialHistoryDocumentation() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);

  const socialDocData: any = socialHistory[0]?.SocialDocumentation || {};
  const setSocialDocData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentDoc = next[0].SocialDocumentation || {};
      const newDoc = typeof update === 'function' ? update(currentDoc) : update;
      next[0] = { ...next[0], SocialDocumentation: newDoc };
      return next;
    });
  };

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