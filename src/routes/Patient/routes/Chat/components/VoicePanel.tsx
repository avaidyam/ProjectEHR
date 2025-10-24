import { AudioRecorder } from '../utils/AudioRecorder';
import { UseMediaStreamResult, useGeminiAPIContext } from '../utils/GeminiAPI';
import { Icon } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { ReactNode, RefObject, memo, useEffect, useRef, useState } from 'react';

const hoverAnimation = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-3.5px);
  }
`;

const pulseAnimation = keyframes`
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(1.2, 1.2);
  }
`;

const opacityPulseAnimation = keyframes`
  0% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.9;
  }
`;

const ActionButton = styled('button', {
  shouldForwardProp: (prop) => !['disabled', 'outlined', 'connected'].includes(prop.toString()),
})<{ disabled?: boolean; outlined?: boolean; connected?: boolean }>(
  ({ theme, outlined, connected }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#2a2f31',
    color: '#888d8f',
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    textTransform: 'lowercase',
    cursor: 'pointer',
    animation: `${opacityPulseAnimation} 3s ease-in infinite`,
    transition: 'all 0.2s ease-in-out',
    width: 48,
    height: 48,
    borderRadius: 18,
    border: '1px solid rgba(0, 0, 0, 0)',
    userSelect: 'none',

    '&:focus': {
      border: '2px solid #2a2f31',
      outline: '2px solid #c3c6c7',
    },

    ...(outlined && {
      background: '#181a1b',
      border: '1px solid #2a2f31',
    }),

    '&:hover': {
      background: 'rgba(0, 0, 0, 0)',
      border: '1px solid #2a2f31',
    },

    ...(connected && {
      background: '#0f3557',
      color: '#1f94ff',
      '&:hover': {
        border: '1px solid #1f94ff',
      },
    }),

    // Handling the .no-action nested class. This might be better as a separate component.
    // For now, we assume it's a child element with that class.
    '& .no-action': {
      pointerEvents: 'none',
    },
  })
);

const MicButton = styled(ActionButton, {
  shouldForwardProp: (prop) => ![''].includes(prop.toString()),
})<{}>(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#ff4600',
  zIndex: 1,
  color: 'black',
  transition: 'all 0.2s ease-in',

  '&:focus': {
    border: '2px solid #2a2f31',
    outline: '2px solid #ff4600',
  },
  '&:hover': {
    backgroundColor: '#ff9c7a',
  },

  '&:before': {
    position: 'absolute',
    zIndex: -1,
    top: 'calc(var(--volume) * -1)',
    left: 'calc(var(--volume) * -1)',
    display: 'block',
    content: '""',
    opacity: 0.35,
    backgroundColor: '#ff4600',
    width: 'calc(100% + var(--volume) * 2)',
    height: 'calc(100% + var(--volume) * 2)',
    borderRadius: 24,
    transition: 'all 0.02s ease-in-out',
    // We cannot directly style `&.disabled` on the parent from here.
  },
}));

const ConnectToggle = styled(ActionButton, {
  shouldForwardProp: (prop) => !['connected'].includes(prop.toString()),
})<{ connected?: boolean }>(({ theme, connected }) => ({
  '&:focus': {
    border: '2px solid #2a2f31',
    outline: '2px solid #c3c6c7',
  },
  // The :not(.connected) selector is handled via a prop.
  ...(!connected && {
    backgroundColor: '#1f94ff',
    color: '#181a1b',
  }),
}));

const ControlTray = styled('section', {
  shouldForwardProp: (prop) => ![''].includes(prop.toString()),
})<{}>(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 8,
  paddingBottom: 18,
  paddingTop: 30,

  // Handling nested selectors for disabled states.
  [`& .disabled ${ActionButton}, ${ActionButton}.disabled`]: {
    background: 'rgba(0, 0, 0, 0)',
    border: '1px solid #404547',
    color: '#404547',
  },
}));

const ConnectionContainer = styled('div', {
  shouldForwardProp: (prop) => !['connected'].includes(prop.toString()),
})<{ connected?: boolean }>(({ theme, connected }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,

  '& .connection-button-container': {
    borderRadius: 27,
    border: '1px solid #404547',
    background: '#181a1b',
    padding: 10,
  },
  '& .text-indicator': {
    fontSize: 11,
    color: '#1f94ff',
    userSelect: 'none',
    ...(!connected && {
      opacity: 0,
    }),
  },
}));

const ActionsNav = styled('nav', {
  shouldForwardProp: (prop) => !['disabled'].includes(prop.toString()),
})<{ disabled?: boolean }>(({ theme }) => ({
  background: '#181a1b',
  border: '1px solid #404547',
  borderRadius: 27,
  display: 'inline-flex',
  gap: 12,
  alignItems: 'center',
  overflow: 'clip',
  padding: 10,
  transition: 'all 0.6s ease-in',

  '& > *': {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '1rem',
  },
}));

const AudioPulseDiv = styled('div', {
  shouldForwardProp: (prop) => !['active', 'hover'].includes(prop.toString()),
})<{ active?: boolean; hover?: boolean }>(({ theme, active, hover }) => ({
  display: 'flex',
  width: 24,
  justifyContent: 'space-evenly',
  alignItems: 'center',
  transition: 'all 0.5s',
  height: 4,
  opacity: active ? 1 : undefined,

  '& > div': {
    backgroundColor: active ? '#c3c6c7' : '#404547',
    borderRadius: 1000,
    width: 4,
    minHeight: 4,
    transition: 'height 0.1s',
    ...(hover && {
      animation: `${hoverAnimation} 1.4s infinite alternate ease-in-out`,
    }),
  },
}));

export function AudioPulse({
  active,
  volume,
  hover,
  lineCount = 3,
}: {
  active: boolean;
  volume: number;
  hover?: boolean;
  lineCount?: number;
}) {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach(
        (line, i) => (line.style.height = `${Math.min(24, 4 + volume * (i === 1 ? 400 : 60))}px`)
      );
      timeout = window.setTimeout(update, 100);
    };

    update();

    return () => clearTimeout((timeout as number)!);
  }, [volume]);

  return (
    <AudioPulseDiv className={`${active ? 'active' : ''} ${hover ? 'hover' : ''}`.trim()}>
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

function VoicePanel({ children }: { children?: ReactNode }) {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume, config, setConfig } =
    useGeminiAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--volume',
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData).on('volume', setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData).off('volume', setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  return (
    <ControlTray>
      <ActionsNav disabled={!connected}>
        <MicButton onClick={() => setMuted(!muted)}>
          {!muted ? <Icon>mic</Icon> : <Icon>mic_off</Icon>}
        </MicButton>

        <ActionButton className="outlined no-action">
          <AudioPulse volume={volume} active={connected} hover={false} />
        </ActionButton>
        {children}
      </ActionsNav>

      <ConnectionContainer connected={connected}>
        <div className="connection-button-container">
          <ConnectToggle
            ref={connectButtonRef}
            connected={connected}
            onClick={connected ? disconnect : connect}
          >
            <Icon>{connected ? 'pause' : 'play_arrow'}</Icon>
          </ConnectToggle>
        </div>
        <span className="text-indicator">Streaming</span>
      </ConnectionContainer>
    </ControlTray>
  );
}

export default memo(VoicePanel);
