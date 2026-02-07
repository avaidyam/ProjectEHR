import React, { memo, useEffect, useState } from 'react';
import { Avatar, MenuItem, Menu, ButtonGroup, Grow } from '@mui/material';
import { Icon, Box, Label, Button, Divider } from 'components/ui/Core';
import { usePatient } from "components/contexts/PatientContext.jsx";
import { AudioRecorder } from '../utils/AudioRecorder';
import { useGeminiAPIContext } from '../utils/GeminiAPI';

function VoicePanel({ onSettings }: { onSettings: () => void }) {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);

  const { client, connected, connect, disconnect, volume, setSpeakerDevice } = useGeminiAPIContext();

  const { useChart } = usePatient();
  const chart = useChart()(); // Access the data object
  const firstName = chart?.[0]?.firstName;
  const lastName = chart?.[0]?.lastName;
  const avatarUrl = chart?.[0]?.avatarUrl;
  const mrn = chart?.[0]?.id;

  const fullName =
    [firstName, lastName].filter(Boolean).join(' ') || 'Patient';

  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim() ||
    fullName.charAt(0) ||
    'P';

  // Audio Device Management
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('');

  useEffect(() => {
    audioRecorder.getDevices('audioinput').then((devices) => {
      setAudioDevices(devices);
      if (devices.length > 0 && !selectedDeviceId) {
        const defaultDevice = devices.find(d => d.deviceId === 'default');
        setSelectedDeviceId(defaultDevice ? defaultDevice.deviceId : devices[0].deviceId);
      }
    });

    audioRecorder.getDevices('audiooutput').then((devices) => {
      setSpeakerDevices(devices);
      if (devices.length > 0 && !selectedSpeakerId) {
        const defaultDevice = devices.find(d => d.deviceId === 'default');
        setSelectedSpeakerId(defaultDevice ? defaultDevice.deviceId : devices[0].deviceId);
      }
    });

    const handleDeviceChange = async () => {
      const inputs = await audioRecorder.getDevices('audioinput');
      setAudioDevices(inputs);
      const outputs = await audioRecorder.getDevices('audiooutput');
      setSpeakerDevices(outputs);
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    }
  }, [audioRecorder, selectedDeviceId, selectedSpeakerId]);

  // Profile animation state
  const [renderProfile, setRenderProfile] = useState(false);

  useEffect(() => {
    if (connected) {
      setRenderProfile(true);
    } else {
      const timeout = window.setTimeout(() => {
        setRenderProfile(false);
      }, 500); // Wait for exit animation
      return () => window.clearTimeout(timeout);
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([{ mimeType: 'audio/pcm;rate=16000', data: base64 }]);
    };

    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData).on('volume', setInVolume).start(selectedDeviceId);
    } else {
      audioRecorder.stop();
    }

    return () => {
      audioRecorder.off('data', onData).off('volume', setInVolume);
    };
  }, [connected, client, muted, audioRecorder, selectedDeviceId]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3 }}>
        <Grow in={connected} timeout={connected ? 300 : 500} unmountOnExit>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxWidth: 1200,
              borderRadius: 4, // 16px
              bgcolor: 'primary.dark',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              visibility: renderProfile ? 'visible' : 'hidden'
            }}
          >
            <Avatar
              src={avatarUrl || undefined}
              alt={fullName}
              sx={{
                width: 120,
                height: 120,
                fontSize: 40,
                outlineOffset: '4px',
                transition: 'outline 0.1s ease-out, box-shadow 0.1s ease-out',
                outline: volume > 0.01 ? `10px solid rgba(255, 255, 255, ${0.4 + volume})` : '0px solid transparent',
                boxShadow: volume > 0.01 ? `0 0 ${15 + volume * 80}px rgba(255, 255, 255, ${0.2 + volume * 30})` : 'none',
              }}
            >
              {initials}
            </Avatar>
            <Label variant="overline" sx={{ position: 'absolute', bottom: 16, left: 16, px: 1, borderRadius: 1 }}>{fullName}</Label>
            <Icon avatar avatarProps={{ sx: { position: 'absolute', top: 16, right: 16, bgcolor: '#ffffff15' } }}>mic</Icon>
          </Box>
        </Grow>
        {!renderProfile && (
          <Label variant="overline">Press the call button to start a call</Label>
        )}
      </Box>
      <Box component="section" sx={{ height: 80, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonGroup>
            <Button
              variant="contained"
              size="large"
              disabled={!connected}
              color={!muted ? 'success' : 'error'}
              onClick={() => setMuted((prev) => !prev)}
              sx={{ borderRadius: '999px 0 0 999px' }}
            >
              <Icon>{!muted ? 'mic' : 'mic_off'}</Icon>
            </Button>
            <Button
              variant="outlined"
              size="large"
              disabled={!connected}
              color={!muted ? 'success' : 'error'}
              onClick={(e: any) => setAnchorEl(e.currentTarget)}
              sx={{ borderRadius: '0 999px 999px 0' }}
            >
              <Icon>{inVolume > 0.01 ? 'graphic_eq' : 'keyboard_arrow_up'}</Icon>
            </Button>
          </ButtonGroup>
          <Button
            variant="outlined"
            size="large"
            disabled
            sx={{ borderRadius: "999px" }}
          >
            <Icon>chat</Icon>
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={(e: any) => setMoreAnchorEl(e.currentTarget)}
            sx={{ borderRadius: "999px" }}
          >
            <Icon>more_vert</Icon>
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={connected ? disconnect : connect}
            color={connected ? 'error' : 'success'}
            sx={{ borderRadius: "999px" }}
          >
            <Icon>{connected ? 'call_end' : 'call'}</Icon>
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 250,
            borderRadius: 2,
            mb: 1
          }
        }}
      >
        <Label variant="overline" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>Microphone</Label>
        {audioDevices.map((device) => (
          <MenuItem
            key={device.deviceId}
            selected={device.deviceId === selectedDeviceId}
            onClick={() => {
              setSelectedDeviceId(device.deviceId);
              setAnchorEl(null);
            }}
          >
            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <Label variant="overline" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>Speaker</Label>
        {speakerDevices.map((device) => (
          <MenuItem
            key={device.deviceId}
            selected={device.deviceId === selectedSpeakerId}
            onClick={() => {
              setSelectedSpeakerId(device.deviceId);
              setSpeakerDevice(device.deviceId);
              setAnchorEl(null);
            }}
          >
            {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={() => setMoreAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 150,
            borderRadius: 2,
            mb: 1
          }
        }}
      >
        <MenuItem onClick={() => { setMoreAnchorEl(null); onSettings(); }}>
          Settings
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default memo(VoicePanel);
