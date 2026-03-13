// SocialDocumentation.jsx
import * as React from 'react';
import {
  TitledCard,
  Icon,
  RichTextEditor
} from 'components/ui/Core';
import { MarkReviewed } from 'components/ui/MarkReviewed';
import { usePatient, Database } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export function SocialHistoryDocumentation() {
  const { useEncounter } = usePatient();
  const [socialHistory, setSocialHistory] = useEncounter().history.social([]);
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const visibleSocialHistory = React.useMemo(() => {
    return filterDocuments(socialHistory || [], conditionals, orders);
  }, [socialHistory, conditionals, orders]);

  const socialDocData = visibleSocialHistory[0]?.comments || '';
  const setSocialDocData = (update: any) => {
    setSocialHistory((prev: any[]) => {
      const next = [...prev];
      if (next.length === 0) {
        next.push({ id: Database.SocialHistoryItem.ID.create() });
      }
      const currentDoc = next[0].comments || '';
      const newDoc = typeof update === 'function' ? update(currentDoc) : update;
      next[0] = { ...next[0], comments: newDoc };
      return next;
    });
  };

  const handleSave = (content: any) => {
    setSocialDocData(content);
  };

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Social Documentation</>} color="#9F3494">
      <RichTextEditor
        initialContent={socialDocData || ''}
        onUpdate={handleSave}
        disableStickyMenuBar={true}
      />
      <MarkReviewed />
    </TitledCard>
  );
}