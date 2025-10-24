import React, { useMemo } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx';

const VOICE_OPTIONS = [
  ["Zephyr — Bright", "Zephyr"],
  ["Puck — Upbeat", "Puck"],
  ["Charon — Informative", "Charon"],
  ["Kore — Firm", "Kore"],
  ["Fenrir — Excitable", "Fenrir"],
  ["Leda — Youthful", "Leda"],
  ["Orus — Firm", "Orus"],
  ["Aoede — Breezy", "Aoede"],
  ["Callirrhoe — Easy-going", "Callirrhoe"],
  ["Autonoe — Bright", "Autonoe"],
  ["Enceladus — Breathy", "Enceladus"],
  ["Iapetus — John Hanson", "Iapetus"],
  ["Umbriel — Easy-going", "Umbriel"],
  ["Algieba — Smooth", "Algieba"],
  ["Despina — Smooth", "Despina"],
  ["Erinome — Clear", "Erinome"],
  ["Algenib — Gravelly", "Algenib"],
  ["Rasalgethi — Informative", "Rasalgethi"],
  ["Laomedeia — Upbeat", "Laomedeia"],
  ["Achernar — Soft", "Achernar"],
  ["Alnilam — Firm", "Alnilam"],
  ["Schedar — Even", "Schedar"],
  ["Gacrux — Mature", "Gacrux"],
  ["Pulcherrima — Forward", "Pulcherrima"],
  ["Achird — Friendly", "Achird"],
  ["Zubenelgenubi — Casual", "Zubenelgenubi"],
  ["Vindemiatrix — Gentle", "Vindemiatrix"],
  ["Sadachbia — Lively", "Sadachbia"],
  ["Sadaltager — Knowledgeable", "Sadaltager"],
  ["Sulafat — Warm", "Sulafat"],
];

const ModelConfig = ({ voiceName, setVoiceName }) => {
  const { useChart, useEncounter } = usePatient();

  // ✅ Chart-level demographics (like in your SnapshotTabContent)
  const [chart] = useChart()(); // chart has firstName, lastName, birthdate, address, maybe gender
  const firstName = chart?.firstName ?? '';
  const lastName = chart?.lastName ?? '';
  const birthdate = chart?.birthdate ?? '';
  const gender = chart?.gender ?? chart?.sex ?? ''; // try both if your model uses 'sex'

  // ✅ Encounter object for concerns (like in your SnapshotTabContent)
  const [encounter] = useEncounter()();
  const concernsArr = Array.isArray(encounter?.concerns) ? encounter.concerns : [];

  // Other encounter-sourced data
  const [documents] = useEncounter().documents();
  const [history] = useEncounter().history();
  const [medications] = useEncounter().medications();
  const [allergies] = useEncounter().allergies();

  // Notes
  const hpiNote = (documents || []).find(
    (doc) => doc?.kind === 'Note' && doc?.data?.summary === 'History of Present Illness'
  );
  const rosNote = (documents || []).find(
    (doc) => doc?.kind === 'Note' && doc?.data?.summary === 'Review of Systems'
  );

  // Histories
  const medicalHistory = history?.medical || [];
  const surgicalHistory = history?.surgical || [];
  const familyHistory = history?.family || [];
  const socialDocumentation = history?.SocialDocumentation || null;

  // 🧠 Compose the full prompt
  const fullPrompt = useMemo(() => {
    let text = "'''\n";

    // Patient header
    text += "### Patient Information\n";
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
    text += `Full Name: ${fullName}\n`;
    text += `Date of Birth: ${birthdate || 'Unknown'}\n`;
    text += `Gender: ${gender || 'Unknown'}\n`;
    text += `Concerns: ${concernsArr.length ? concernsArr.join(', ') : 'None reported'}\n\n`;

    // HPI
    text += "### History of Present Illness\n";
    text += hpiNote?.data?.content?.replace(/<[^>]+>/g, '')?.trim() || "No HPI note found.";
    text += "\n\n";

    // ROS (</p> & <br> → newline, strip rest)
    text += "### Review of Systems\n";
    text += rosNote?.data?.content
      ?.replace(/(<\/p\s*>|<br\s*\/?>)/gi, '\n')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/\n{2,}/g, '\n')
      ?.trim() || "No ROS note found.";
    text += "\n\n";

    // Medical History
    text += "### Medical History (Diagnosis & Age)\n";
    text += medicalHistory.length
      ? medicalHistory.map(m => `- ${m.diagnosis} (Age: ${m.age})`).join('\n')
      : "No medical history found.";
    text += "\n\n";

    // Surgical History
    text += "### Surgical History (Procedure & Age)\n";
    text += surgicalHistory.length
      ? surgicalHistory.map(s => `- ${s.procedure} (Age: ${s.age})`).join('\n')
      : "No surgical history found.";
    text += "\n\n";

    // Family History
    text += "### Family History\n";
    if (familyHistory.length) {
      familyHistory.forEach(member => {
        text += `- ${member.relationship} (${member.status || 'Unknown'}, Age: ${member.age || 'N/A'})`;
        if (member.problems?.length) {
          text += `: ${member.problems.map(p => `${p.description} (Onset: ${p.ageOfOnset})`).join(', ')}`;
        }
        text += "\n";
      });
    } else {
      text += "No family history found.\n";
    }
    text += "\n";

    // Social Documentation
    text += "### Social Documentation\n";
    text += socialDocumentation?.textbox
      || (socialDocumentation ? JSON.stringify(socialDocumentation, null, 2) : "No social documentation found.");
    text += "\n\n";

    // Medications
    text += "### Medications\n";
    if (Array.isArray(medications) && medications.length) {
      medications.forEach(m => {
        text += `- ${m.name} ${m.dose}${m.unit ? " " + m.unit : ""}, ${m.frequency}`;
        if (m.route) text += ` via ${m.route}`;
        if (m.possiblePrnReasons?.length) text += ` — reasons: ${m.possiblePrnReasons.join(", ")}`;
        text += "\n";
      });
    } else {
      text += "No medications found.\n";
    }
    text += "\n";

    // Allergies
    text += "### Allergies\n";
    if (Array.isArray(allergies) && allergies.length) {
      allergies.forEach(a => {
        text += `- ${a.allergen}: reaction ${a.reaction}\n`;
      });
    } else {
      text += "No allergies found.\n";
    }

    text += "\n'''";
    return text.trimEnd();
  }, [
    firstName, lastName, birthdate, gender, concernsArr,
    hpiNote, rosNote, medicalHistory, surgicalHistory, familyHistory,
    socialDocumentation, medications, allergies
  ]);

  return (
    <Box sx={{ p: 2, bgcolor: 'black', color: 'white', minHeight: '100%' }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        Model Config
      </Typography>

      {/* Voice selector */}
      <FormControl size="small" sx={{ minWidth: 280, mb: 3 }}>
        <InputLabel id="voice-label" sx={{ color: 'white' }}>Speech Voice</InputLabel>
        <Select
          labelId="voice-label"
          value={voiceName}
          label="Speech Voice"
          onChange={(e) => setVoiceName(e.target.value)}
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
            '& .MuiSvgIcon-root': { color: 'white' },
          }}
        >
          {VOICE_OPTIONS.map(([label, value]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Combined Prompt */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Full Encounter
      </Typography>
      <Box
        component="pre"
        sx={{
          background: '#0d0d0d',
          color: 'limegreen',
          p: 2,
          borderRadius: 2,
          fontSize: '0.85rem',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {fullPrompt}
      </Box>
    </Box>
  );
};

export default ModelConfig;
