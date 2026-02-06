import { AudioRecorder } from '../utils/AudioRecorder';
import { useGeminiAPIContext } from '../utils/GeminiAPI';
import { Avatar, Icon, Select, MenuItem, FormControl, InputLabel, Box, LinearProgress, Typography } from '@mui/material';
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
    !['disabled', 'outlined', 'connected'].includes(prop.toString()),
})<{
  disabled?: boolean;
  outlined?: boolean;
  connected?: boolean;
}>(({ theme, outlined, connected }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark ? theme.palette.grey[900] : theme.palette.grey[100],
    color: isDark ? theme.palette.text.secondary : theme.palette.text.primary,
    fontSize: '1.25rem',
    cursor: 'pointer',
    animation: `${opacityPulseAnimation} 3s ease-in infinite`,
    transition: 'all 0.2s ease-in-out',
    width: 48,
    height: 48,
    borderRadius: 18,
    border: `1px solid transparent`,
    userSelect: 'none',

    '&:focus': {
      border: `2px solid ${theme.palette.divider}`,
      outline: `2px solid ${theme.palette.primary.light}`,
    },

    ...(outlined && {
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
    }),

    '&:hover': {
      background: isDark
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
      border: `1px solid ${theme.palette.divider}`,
    },

    ...(connected && {
      background: theme.palette.primary.dark,
      color: theme.palette.getContrastText(theme.palette.primary.dark),
      '&:hover': {
        border: `1px solid ${theme.palette.primary.main}`,
      },
    }),
  };
});

const MicButton = styled(ActionButton, {
  shouldForwardProp: (prop) => prop.toString() !== 'unmuted',
})<{ unmuted?: boolean }>(({ unmuted }) => ({
  position: 'relative',
  zIndex: 1,
  color: 'black',
  backgroundColor: unmuted ? '#22c55e' : '#ff4600',
  transition: 'all 0.2s ease-in',

  '&:focus': {
    border: '2px solid transparent',
    outline: `2px solid ${unmuted ? '#22c55e' : '#ff4600'}`,
  },

  '&:hover': {
    backgroundColor: unmuted ? '#6ee7b7' : '#ff9c7a',
  },

  '&:before': {
    position: 'absolute',
    zIndex: -1,
    top: 'calc(var(--volume) * -1)',
    left: 'calc(var(--volume) * -1)',
    display: 'block',
    content: '""',
    opacity: 0.35,
    backgroundColor: unmuted ? '#22c55e' : '#ff4600',
    width: 'calc(100% + var(--volume) * 2)',
    height: 'calc(100% + var(--volume) * 2)',
    borderRadius: 24,
    transition: 'all 0.02s ease-in-out',
  },
}));

const ConnectToggle = styled(ActionButton, {
  shouldForwardProp: (prop) => prop.toString() !== 'connected',
})<{ connected?: boolean }>(({ connected, theme }) => ({
  '&:focus': {
    border: `2px solid ${theme.palette.divider}`,
    outline: `2px solid ${theme.palette.primary.light}`,
  },
  ...(!connected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  }),
}));

/* ---------------- Layout Containers ---------------- */
const ControlTray = styled('section')(() => ({
  width: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 8,
  paddingBottom: 12,
  paddingTop: 20,
}));

const ConnectionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,

  '& .connection-button-container': {
    borderRadius: 27,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    padding: 10,
  },
}));

const ActionsNav = styled('nav')(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 27,
  display: 'inline-flex',
  gap: 12,
  alignItems: 'center',
  padding: 10,

  '& > *': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const AudioSettingsBar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'stretch',
  padding: '12px 16px',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  marginBottom: 16,
  gap: 12,
  maxWidth: 600,
  margin: '0 auto 16px',
}));

/* ---------------- Instruction box (bottom) ---------------- */
const InstructionBox = styled('div')(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    width: '100%',
    maxWidth: 520,
    margin: '12px auto 0',
    border: `1px solid ${theme.palette.divider}`,
    background: isDark
      ? theme.palette.grey[900]
      : theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 1.4,
  };
});

/* ---------------- Big square Zoom-style profile tile ---------------- */
const CallProfileCard = styled('div', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{
  state?: 'enter' | 'exit';
}>(({ theme, state }) => ({
  position: 'relative',
  width: 'calc(100% - 24px)',          // inset slightly from the edges
  maxWidth: 520,
  margin: '16px auto 0',               // spacing from top/content
  borderRadius: 16,                    // roundness back
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 24px',
  minHeight: 260,

  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 12px 25px rgba(0,0,0,0.5)'
      : '0 8px 18px rgba(0,0,0,0.12)',

  animation:
    state === 'enter'
      ? `${profileEnter} 300ms ease-out`
      : state === 'exit'
        ? `${profileExit} 500ms ease-in`
        : undefined,
}));

const CallProfileCenter = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
}));

const CallProfileName = styled('div')(() => ({
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: 2,
}));

const CallProfileMeta = styled('div')(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

const CallStatusPill = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  fontSize: 11,
  padding: '3px 10px',
  borderRadius: 999,
  background: theme.palette.primary.dark,
  color: theme.palette.getContrastText(theme.palette.primary.dark),
  textTransform: 'uppercase',
  letterSpacing: 0.08,
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
      ? theme.palette.text.primary
      : theme.palette.text.disabled,
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
        (line, i) =>
        (line.style.height = `${Math.min(
          24,
          4 + volume * (i === 1 ? 400 : 60)
        )}px`)
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
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume } = useGeminiAPIContext();

  const { useChart } = usePatient();
  const [firstName] = useChart().firstName();
  const [lastName] = useChart().lastName();
  const [avatarUrl] = useChart().avatarUrl();
  const [mrn] = useChart().id();

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
      // Select default if available and nothing selected
      if (devices.length > 0 && !selectedDeviceId) {
        // Prefer "default" or the first one
        const defaultDevice = devices.find(d => d.deviceId === 'default');
        setSelectedDeviceId(defaultDevice ? defaultDevice.deviceId : devices[0].deviceId);
      }
    });

    // Handle device change updates
    const handleDeviceChange = async () => {
      const devices = await audioRecorder.getDevices();
      setAudioDevices(devices);
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    }
  }, [audioRecorder]);

  // New: manage enter/exit animation state for the profile tile
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
    if (!connected && connectButtonRef.current) connectButtonRef.current.focus();
  }, [connected]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--volume',
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

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
    <>
      {/* Audio Settings Bar */}
      <AudioSettingsBar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Icon color="action">mic</Icon>
          <FormControl variant="standard" sx={{ minWidth: 200, flex: 1 }}>
            <Select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Select Audio Input' }}
              sx={{ fontSize: '0.9rem' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              }}
            >
              {audioDevices.length === 0 && <MenuItem value="">Default Default</MenuItem>}
              {audioDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          If the patient can't hear you, please verify your selected input device.
        </Typography>

      </AudioSettingsBar >

      {/* Animated big square call tile at the top when connected */}
      {
        renderProfile && (
          <CallProfileCard state={profileState}>
            <CallStatusPill>In call</CallStatusPill>

            <CallProfileCenter>
              <Avatar
                src={avatarUrl || undefined}
                alt={fullName}
                sx={{ width: 96, height: 96, fontSize: 32 }}
              >
                {initials}
              </Avatar>

              <CallProfileName>{initials}</CallProfileName>

              <CallProfileMeta>
                {fullName}
                {mrn ? ` · MRN: ${mrn}` : ''}
              </CallProfileMeta>
            </CallProfileCenter>
          </CallProfileCard>
        )
      }

      {/* Buttons near the bottom */}
      <ControlTray>
        <ActionsNav>
          {connected && (
            <MicButton
              unmuted={!muted}
              onClick={() => setMuted((prev) => !prev)}
            >
              {!muted ? <Icon>mic</Icon> : <Icon>mic_off</Icon>}
            </MicButton>
          )}

          <ActionButton className="outlined no-action">
            <AudioPulse volume={volume} active={connected && !muted} />
          </ActionButton>

          {children}
        </ActionsNav>

        <ConnectionContainer>
          <div className="connection-button-container">
            <ConnectToggle
              ref={connectButtonRef}
              connected={connected}
              onClick={connected ? disconnect : connect}
            >
              <Icon>{connected ? 'call_end' : 'call'}</Icon>
            </ConnectToggle>
          </div>
        </ConnectionContainer>
      </ControlTray>

      {/* Instructions at the bottom */}
      <InstructionBox aria-live="polite" role="status">
        {connected ? (
          <>
            💡 Tip: <b>You can ❗mute❗ the call to go into discussion!</b>
            <br />
            <br />
            Click the microphone to toggle mute/unmute
            <br />
            or hold space bar for push-to-talk
          </>
        ) : (
          'Click the phone to start the call'
        )}
      </InstructionBox>
    </>
  );
}

export default memo(VoicePanel);
