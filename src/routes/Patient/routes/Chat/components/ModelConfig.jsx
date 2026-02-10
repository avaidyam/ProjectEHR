import React, { useState, useEffect } from 'react';
import { Box, MenuItem, IconButton, Label, Autocomplete, Stack, TextField } from 'components/ui/Core.jsx';

const VOICE_OPTIONS = {
  "Zephyr": "Bright, Higher pitch",
  "Puck": "Upbeat, Middle pitch",
  "Charon": "Informative, Lower pitch",
  "Kore": "Firm, Middle pitch",
  "Fenrir": "Excitable, Lower middle pitch",
  "Leda": "Youthful, Higher pitch",
  "Orus": "Firm, Lower middle pitch",
  "Aoede": "Breezy, Middle pitch",
  "Callirrhoe": "Easy-going, Middle pitch",
  "Autonoe": "Bright, Middle pitch",
  "Enceladus": "Breathy, Lower pitch",
  "Iapetus": "Clear, Lower middle pitch",
  "Umbriel": "Easy-going, Lower middle pitch",
  "Algieba": "Smooth, Lower pitch",
  "Despina": "Smooth, Middle pitch",
  "Erinome": "Clear, Middle pitch",
  "Algenib": "Gravelly, Lower pitch",
  "Rasalgethi": "Informative, Middle pitch",
  "Laomedeia": "Upbeat, Higher pitch",
  "Achernar": "Soft, Higher pitch",
  "Alnilam": "Firm, Lower middle pitch",
  "Schedar": "Even, Lower middle pitch",
  "Gacrux": "Mature, Middle pitch",
  "Pulcherrima": "Forward, Middle pitch",
  "Achird": "Friendly, Lower middle pitch",
  "Zubenelgenubi": "Casual, Lower middle pitch",
  "Vindemiatrix": "Gentle, Middle pitch",
  "Sadachbia": "Lively, Lower pitch",
  "Sadaltager": "Knowledgeable, Middle pitch",
  "Sulafat": "Warm, Middle pitch"
};

const ModelConfig = ({ voiceName, setVoiceName, systemPrompt, onChangePrompt, fullPrompt }) => {
  const [playingVoice, setPlayingVoice] = useState(null);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const audioRef = React.useRef(null);

  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);

  const handlePromptChange = (e) => {
    setLocalPrompt(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onChangePrompt) onChangePrompt(localPrompt);
    }
  };

  const playSample = (voiceId) => {
    if (playingVoice === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoice(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(`https://www.gstatic.com/aistudio/voices/samples/${voiceId}.wav`);
    audioRef.current = audio;
    setPlayingVoice(voiceId);
    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      setPlayingVoice(null);
    });
    audio.onended = () => {
      setPlayingVoice(null);
      audioRef.current = null;
    };
  };

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <Stack sx={{ height: '100%', overflow: 'hidden', pt: 1 }}>
      <Autocomplete
        label="Speech Voice"
        options={Object.keys(VOICE_OPTIONS)}
        value={voiceName}
        onChange={(event, newValue) => {
          if (newValue) setVoiceName(newValue);
        }}
        renderOption={(props, name) => {
          const description = VOICE_OPTIONS[name];
          return (
            <MenuItem
              {...props}
              key={name}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}
            >
              <IconButton
                size="small"
                color={playingVoice === name ? "primary" : "inherit"}
                onClick={(e) => {
                  e.stopPropagation();
                  playSample(name);
                }}
                sx={{ mr: 1 }}
              >
                {playingVoice === name ? 'volume_up' : 'play_arrow'}
              </IconButton>
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Label sx={{ lineHeight: 1.2 }}>{name}</Label>
                <Label variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>{description}</Label>
              </Box>
            </MenuItem>
          );
        }}
        onClose={() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setPlayingVoice(null);
          }
        }}
      />
      <TextField
        label="System Prompt"
        multiline
        minRows={6}
        maxRows={12}
        value={localPrompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyDown}
        helperText="Press Enter to update settings"
        fullWidth
        sx={{ mt: 2 }}
      />
      <Label sx={{ mt: 2, mb: 1 }}>Full System Instruction (Read Only)</Label>
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
        {`${systemPrompt}\n\n${fullPrompt}`}
      </Box>
    </Stack>
  );
};

export default ModelConfig;
