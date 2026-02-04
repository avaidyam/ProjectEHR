// PapTracking.jsx
import React, { useState, useMemo } from 'react';
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

const SectionPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const ResultItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#fafafa',
}));

export default function PapTracking() {
  const { useEncounter } = usePatient();
  const [encounter] = useEncounter()();
  const [reviewed, setReviewed] = useState(false);

  // Search for Pap tests in the encounter labs
  const papTests = useMemo(() => {
    // Collect potential labs from relevant categories
    const labs = (encounter?.labs || []);

    if (labs.length === 0) return [];

    return labs.filter(doc => {
      // Check if it's a Lab result with Pap test
      if (doc.Test) {
        return doc.Test.toLowerCase().includes('pap');
      }
      return false;
    });
  }, [encounter?.labs, encounter?.notes, encounter?.scanDocs, encounter?.others]);

  // Calculate next Pap due date (typically 3 years from last normal Pap)
  const getNextPapDue = (lastPapDate) => {
    if (!lastPapDate) return null;

    try {
      const lastDate = new Date(lastPapDate);
      const nextDate = new Date(lastDate);
      nextDate.setFullYear(lastDate.getFullYear() + 3);
      return nextDate.toLocaleDateString();
    } catch {
      return null;
    }
  };

  const handleReviewedChange = (e) => {
    setReviewed(e.target.checked);
  };

  // If no Pap tests found, show blank panel
  if (papTests.length === 0) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'white' }}>
        <Label variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Pap Tracking
        </Label>

        <SectionPaper>
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Label variant="body1">No Pap test results found in results.</Label>
          </Box>
        </SectionPaper>

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <FormControlLabel
            control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
            label="Mark as Reviewed"
          />
          {reviewed && (
            <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
              Pap tracking has been reviewed.
            </Label>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'white' }}>
      <Label variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Pap Tracking
      </Label>

      <SectionPaper>
        <Label variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          Cervical Cancer Screening History - Results and Follow-ups
        </Label>

        {papTests.map((papTest, index) => {
          const isLab = papTest.kind === 'Lab';
          const testData = papTest;

          return (
            <ResultItem key={index}>
              {/* Exam Date and All Results */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Label variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Exam date:
                  </Label>
                  <br />
                  <Label variant="body2">
                    {isLab ? papTest.collected?.split(' ')[0] || testData['Date/Time']?.split(' ')[0] : testData.encDate}
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
                    // For Lab results, show simple summary
                    <Label variant="body2">
                      {testData.summary || 'Annual Pap smear and mammogram both normal.'}
                    </Label>
                  ) : (
                    // For other results, extract summary from content
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
              {isLab && papTest.labReportComment && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f7ff', borderRadius: 1, fontStyle: 'italic' }}>
                  <Label variant="body2">
                    {papTest.labReportComment}
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
            </ResultItem>
          );
        })}
      </SectionPaper>

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <FormControlLabel
          control={<Checkbox checked={reviewed} onChange={handleReviewedChange} />}
          label="Mark as Reviewed"
        />
        {reviewed && (
          <Label variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
            Pap tracking has been reviewed.
          </Label>
        )}
      </Box>
    </Box>
  );
}