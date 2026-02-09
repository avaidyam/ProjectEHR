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

const ModelConfig = ({ voiceName, setVoiceName, fullPrompt }) => {
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <FormControl size="small" sx={{ minWidth: 280, mb: 3 }}>
          <InputLabel id="voice-label">Speech Voice</InputLabel>
          <Select
            labelId="voice-label"
            value={voiceName}
            label="Speech Voice"
            onChange={(e) => setVoiceName(e.target.value)}
            sx={{
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
              '& .MuiSvgIcon-root': { color: 'white' },
            }}
          >
            {VOICE_OPTIONS.map(([label, value]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        component="pre"
        sx={{
          background: '#0d0d0d',
          color: 'limegreen',
          p: 2,
          borderRadius: 2,
          fontSize: '0.85rem',
          overflowY: 'auto',
          flexGrow: 1,
          minHeight: 0,
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
