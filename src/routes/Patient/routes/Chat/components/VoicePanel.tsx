import { AudioRecorder } from '../utils/AudioRecorder';
import { useGeminiAPIContext } from '../utils/GeminiAPI';
import { Avatar, Select, MenuItem, FormControl, Menu } from '@mui/material';
import { Icon, Box, Label, IconButton } from 'components/ui/Core';
import { keyframes, styled } from '@mui/material/styles';
import { ReactNode, memo, useEffect, useRef, useState } from 'react';
import { usePatient } from "components/contexts/PatientContext.jsx";

/* ---------------- Animations ---------------- */
const hoverAnimation = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-3.5px); }
`;

const opacityPulseAnimation = keyframes`
  0% { opacity: 0.9; }
  50% { opacity: 1; }
  100% { opacity: 0.9; }
`;

// New: profile enter/exit animations
const profileEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.98) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const profileExit = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.98) translateY(8px);
  }
`;

/* ---------------- Styled Buttons ---------------- */
const ActionButton = styled('button', {
  shouldForwardProp: (prop) =>
    !['disabled', 'outlined', 'connected', 'red'].includes(prop.toString()),
})<{
  disabled?: boolean;
  outlined?: boolean;
  connected?: boolean;
  red?: boolean;
}>(({ theme, outlined, connected, red }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: red ? '#ea4335' : (isDark ? '#3c4043' : theme.palette.grey[100]),
    color: 'white',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    width: 44,
    height: 44,
    borderRadius: 22,
    border: 'none',
    userSelect: 'none',

    '&:hover': {
      background: red ? '#d93025' : (isDark ? '#4a4e52' : theme.palette.grey[200]),
    },

    ...(outlined && {
      background: 'transparent',
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
    }),
  };
});

const MicButton = styled(ActionButton, {
  shouldForwardProp: (prop) => prop.toString() !== 'unmuted',
})<{ unmuted?: boolean }>(({ unmuted }) => ({
  position: 'relative',
  zIndex: 1,
  color: unmuted ? 'black' : 'white',
  backgroundColor: unmuted ? '#f8d7da' : '#3c4043',
  width: 44,
  height: 44,
  borderRadius: '22px 0 0 22px',

  '&:hover': {
    backgroundColor: unmuted ? '#f1c1c6' : '#4a4e52',
  },
}));

const MicDropdownButton = styled(ActionButton, {
  shouldForwardProp: (prop) => prop.toString() !== 'unmuted',
})<{ unmuted?: boolean }>(({ unmuted }) => ({
  width: 24,
  height: 44,
  borderRadius: '0 22px 22px 0',
  marginLeft: '1px',
  backgroundColor: unmuted ? '#f8d7da' : '#3c4043',
  color: unmuted ? 'black' : 'white',
  fontSize: '0.8rem',

  '&:hover': {
    backgroundColor: unmuted ? '#f1c1c6' : '#4a4e52',
  },
}));

/* ---------------- Layout Containers ---------------- */
const VoiceContainer = styled('div')(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
}));

const MainArea = styled('main')(() => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}));

const ControlTray = styled('section')(({ theme }) => ({
  height: 80,
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
}));

/* ---------------- Call Profile ---------------- */
const CallProfileCard = styled('div', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{
  state?: 'enter' | 'exit';
}>(({ theme, state }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  maxWidth: 1200,
  borderRadius: 16,
  backgroundColor: '#3c4043',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  animation:
    state === 'enter'
      ? `${profileEnter} 300ms ease-out`
      : state === 'exit'
        ? `${profileExit} 500ms ease-in`
        : undefined,
}));

/* ---------------- Audio Pulse ---------------- */
const AudioPulseDiv = styled('div')<{ active?: boolean }>(({ active, theme }) => ({
  display: 'flex',
  width: 24,
  justifyContent: 'space-evenly',
  alignItems: 'center',
  height: 4,

  '& > div': {
    backgroundColor: active
      ? 'white'
      : '#9aa0a6',
    borderRadius: 1000,
    width: 4,
    minHeight: 4,
    transition: 'height 0.1s',
  },
}));

export function AudioPulse({
  active,
  volume,
  lineCount = 3,
}: {
  active: boolean;
  volume: number;
  lineCount?: number;
}) {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeout: number | null = null;

    const update = () => {
      lines.current.forEach(
        (line, i) => {
          if (line) {
            line.style.height = `${Math.min(
              24,
              4 + volume * (i === 1 ? 400 : 60)
            )}px`;
          }
        }
      );
      timeout = window.setTimeout(update, 100);
    };

    update();
    return () => clearTimeout(timeout as number);
  }, [volume]);

  return (
    <AudioPulseDiv active={active}>
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => (lines.current[i] = el!) as any}
            style={{ animationDelay: `${i * 133}ms` }}
          />
        ))}
    </AudioPulseDiv>
  );
}

/* ---------------- Voice Panel ---------------- */
function VoicePanel({ children }: { children?: ReactNode }) {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));

  const { client, connected, connect, disconnect, volume } = useGeminiAPIContext();

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
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  useEffect(() => {
    audioRecorder.getDevices().then((devices) => {
      setAudioDevices(devices);
      if (devices.length > 0 && !selectedDeviceId) {
        const defaultDevice = devices.find(d => d.deviceId === 'default');
        setSelectedDeviceId(defaultDevice ? defaultDevice.deviceId : devices[0].deviceId);
      }
    });

    const handleDeviceChange = async () => {
      const devices = await audioRecorder.getDevices();
      setAudioDevices(devices);
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    }
  }, [audioRecorder, selectedDeviceId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Profile animation state
  const [renderProfile, setRenderProfile] = useState(false);
  const [profileState, setProfileState] = useState<'enter' | 'exit' | undefined>();

  useEffect(() => {
    if (connected) {
      setRenderProfile(true);
      setProfileState('enter');
    } else if (renderProfile) {
      setProfileState('exit');
      const timeout = window.setTimeout(() => {
        setRenderProfile(false);
        setProfileState(undefined);
      }, 190);
      return () => window.clearTimeout(timeout);
    }
  }, [connected, renderProfile]);

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
    <VoiceContainer>
      <MainArea>
        {renderProfile ? (
          <CallProfileCard state={profileState}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={avatarUrl || undefined}
                alt={fullName}
                sx={{ width: 120, height: 120, fontSize: 40, border: '4px solid #8ab4f8' }}
              >
                {initials}
              </Avatar>
              <Label variant="h4" sx={{ color: 'white' }}>{fullName}</Label>
              {mrn && <Label variant="body2" sx={{ color: '#9aa0a6' }}>MRN: {mrn}</Label>}
            </Box>
            <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Label variant="caption" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', px: 1, borderRadius: 1 }}>{fullName}</Label>
            </Box>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Icon sx={{ color: muted ? '#f28b82' : '#8ab4f8' }}>{muted ? 'mic_off' : 'mic'}</Icon>
            </Box>
          </CallProfileCard>
        ) : (
          <Label>No one's in this call</Label>
        )}
      </MainArea>

      <ControlTray>
        {/* Time and Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white', minWidth: 120 }}>
          <Label variant="body1">{currentTime}</Label>
          <Label variant="body1" sx={{ color: '#5f6368', mx: 0.5 }}>|</Label>
          <Label variant="body1">BICEP</Label>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MicButton
              unmuted={!muted}
              disabled={!connected}
              onClick={() => setMuted((prev) => !prev)}
            >
              <Icon>{!muted ? 'mic' : 'mic_off'}</Icon>
            </MicButton>
            <MicDropdownButton
              unmuted={!muted}
              disabled={!connected}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
            >
              <Icon sx={{ fontSize: '1rem' }}>keyboard_arrow_up</Icon>
            </MicDropdownButton>
          </Box>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>videocam_off</Icon>
          </ActionButton>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>present_to_all</Icon>
          </ActionButton>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>sentiment_satisfied</Icon>
          </ActionButton>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>closed_caption</Icon>
          </ActionButton>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>front_hand</Icon>
          </ActionButton>

          <ActionButton outlined sx={{ width: 44 }}>
            <Icon>more_vert</Icon>
          </ActionButton>

          <ActionButton
            red
            onClick={connected ? disconnect : connect}
            sx={{ width: 64, borderRadius: 24 }}
          >
            <Icon>{connected ? 'call_end' : 'call'}</Icon>
          </ActionButton>
        </Box>

        {/* Right Info Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white', minWidth: 120, justifyContent: 'flex-end' }}>
          <Icon>info</Icon>
          <Icon>group</Icon>
          <Icon>chat</Icon>
          <Icon>apps</Icon>
          <Icon>security</Icon>
        </Box>
      </ControlTray>

      {/* Mic Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: '#3c4043',
            color: 'white',
            minWidth: 250,
            borderRadius: 2,
            mb: 1
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Label variant="overline" sx={{ color: '#9aa0a6', display: 'block', mb: 1 }}>Microphone</Label>
          <FormControl variant="standard" fullWidth>
            <Select
              value={selectedDeviceId}
              onChange={(e: any) => {
                setSelectedDeviceId(e.target.value);
                setAnchorEl(null);
              }}
              sx={{ color: 'white', '&:before': { borderColor: 'gray' }, '&:after': { borderColor: 'white' } }}
            >
              {audioDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Label variant="caption" sx={{ color: '#9aa0a6', display: 'block', mt: 2, fontStyle: 'italic' }}>
            Verify your selected input device if needed.
          </Label>
        </Box>
      </Menu>
    </VoiceContainer>
  );
}

export default memo(VoicePanel);
