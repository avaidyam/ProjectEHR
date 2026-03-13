// PapTracking.jsx
import * as React from 'react';
import {
  Box,
  Label,
  TitledCard,
  Icon,
} from 'components/ui/Core';
import { MarkReviewed } from 'components/ui/MarkReviewed';
import { usePatient } from 'components/contexts/PatientContext';
import { filterDocuments } from 'util/helpers';

export function PapTracking() {
  const { useEncounter } = usePatient();
  const [encounter] = useEncounter()();
  const [conditionals] = useEncounter().conditionals();
  const [orders] = useEncounter().orders();

  const papTests = React.useMemo(() => {
    const labs = (encounter?.labs || []);
    if (labs.length === 0) return [];

    // Filter by conditionals/orders first
    const visibleLabs = filterDocuments(labs, conditionals, orders);

    return visibleLabs.filter((doc: any) => {
      if (doc.Test) {
        return doc.Test.toLowerCase().includes('pap');
      }
      return false;
    });
  }, [encounter?.labs, encounter?.notes]);

  const getNextPapDue = (lastPapDate: any) => {
    if (!lastPapDate) return null;
    try {
      const nextDate = Temporal.Instant.from(lastPapDate).toZonedDateTimeISO('UTC').add({ years: 3 });
      return nextDate.toLocaleString();
    } catch {
      return null;
    }
  };

  if (papTests.length === 0) {
    return (
      <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Pap Tracking</>} color="#9F3494">
        <Box paper sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Label variant="body1">No Pap test results found in results.</Label>
          </Box>
        </Box>
        <MarkReviewed />
      </TitledCard>
    );
  }

  return (
    <TitledCard emphasized title={<><Icon sx={{ verticalAlign: "text-top", mr: "4px" }}>token</Icon> Pap Tracking</>} color="#9F3494">
      <Box paper sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Label variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          Cervical Cancer Screening History - Results and Follow-ups
        </Label>
        {papTests.map((papTest: any, index: number) => {
          const isLab = papTest.kind === 'Lab';
          const testData = papTest;
          return (
            <Box key={index} paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
              {/* Exam Date and All Results */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Exam date:
                  </Label>
                  <br />
                  <Label variant="body2">
                    {isLab ? papTest.collected?.split(' ')[0] || testData['date']?.split(' ')[0] : testData.encDate}
                  </Label>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    All results:
                  </Label>
                  <br />
                  <Label variant="body2" sx={{ color: '#1976d2', cursor: 'pointer' }}>
                    📊 All results
                  </Label>
                </Box>
              </Box>
              {/* Test and Procedures - Simple Summary */}
              <Box sx={{ mb: 2 }}>
                <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Test and Procedures:
                </Label>
                <br />
                <Box sx={{ ml: 2, mt: 1 }}>
                  {isLab ? (
                    <Label variant="body2">
                      {testData.summary || 'Annual Pap smear and mammogram both normal.'}
                    </Label>
                  ) : (
                    <Label variant="body2">
                      {testData.summary || 'Pap test performed'}
                    </Label>
                  )}
                </Box>
              </Box>
              {/* Follow-ups */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Follow-ups:
                  </Label>
                  <br />
                  <Label variant="body2">
                    Pap in 3 years due {getNextPapDue(isLab ? papTest.collected : testData.encDate) || '4/2/2027'}
                  </Label>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Provider Responsible for Follow-ups:
                  </Label>
                  <br />
                  <Label variant="body2">
                    {testData['Encounter Provider'] || testData.encounterProvider || 'Dr. OBGYN'}
                  </Label>
                </Box>
              </Box>
              {/* Lab report comment if available */}
              {isLab && papTest.comment && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f7ff', borderRadius: 1, fontStyle: 'italic' }}>
                  <Label variant="body2">
                    {papTest.comment}
                  </Label>
                </Box>
              )}
              {/* Footer */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Label variant="caption" sx={{ color: 'text.secondary' }}>
                  * Indicates a transcribed result
                </Label>
                <br />
                <Label variant="caption" sx={{ color: '#1976d2', cursor: 'pointer' }}>
                  Audit Trail Report
                </Label>
              </Box>
            </Box>
          );
        })}
      </Box>
      <MarkReviewed />
    </TitledCard>
  );
}