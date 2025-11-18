// import { AudioRecorder } from '../utils/AudioRecorder';
// import { UseMediaStreamResult, useGeminiAPIContext } from '../utils/GeminiAPI';
// import { Icon } from '@mui/material';
// import { keyframes, styled } from '@mui/material/styles';
// import { ReactNode, RefObject, memo, useEffect, useRef, useState } from 'react';

// const hoverAnimation = keyframes`
//   from {
//     transform: translateY(0);
//   }
//   to {
//     transform: translateY(-3.5px);
//   }
// `;

// const pulseAnimation = keyframes`
//   from {
//     transform: scale(1, 1);
//   }
//   to {
//     transform: scale(1.2, 1.2);
//   }
// `;

// const opacityPulseAnimation = keyframes`
//   0% {
//     opacity: 0.9;
//   }
//   50% {
//     opacity: 1;
//   }
//   100% {
//     opacity: 0.9;
//   }
// `;

// const ActionButton = styled('button', {
//   shouldForwardProp: (prop) => !['disabled', 'outlined', 'connected'].includes(prop.toString()),
// })<{ disabled?: boolean; outlined?: boolean; connected?: boolean }>(
//   ({ theme, outlined, connected }) => ({
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: '#2a2f31',
//     color: '#888d8f',
//     fontSize: '1.25rem',
//     lineHeight: '1.75rem',
//     textTransform: 'lowercase',
//     cursor: 'pointer',
//     animation: `${opacityPulseAnimation} 3s ease-in infinite`,
//     transition: 'all 0.2s ease-in-out',
//     width: 48,
//     height: 48,
//     borderRadius: 18,
//     border: '1px solid rgba(0, 0, 0, 0)',
//     userSelect: 'none',

//     '&:focus': {
//       border: '2px solid #2a2f31',
//       outline: '2px solid #c3c6c7',
//     },

//     ...(outlined && {
//       background: '#181a1b',
//       border: '1px solid #2a2f31',
//     }),

//     '&:hover': {
//       background: 'rgba(0, 0, 0, 0)',
//       border: '1px solid #2a2f31',
//     },

//     ...(connected && {
//       background: '#0f3557',
//       color: '#1f94ff',
//       '&:hover': {
//         border: '1px solid #1f94ff',
//       },
//     }),

//     // Handling the .no-action nested class. This might be better as a separate component.
//     // For now, we assume it's a child element with that class.
//     '& .no-action': {
//       pointerEvents: 'none',
//     },
//   })
// );

// const MicButton = styled(ActionButton, {
//   shouldForwardProp: (prop) => ![''].includes(prop.toString()),
// })<{}>(({ theme }) => ({
//   position: 'relative',
//   backgroundColor: '#ff4600',
//   zIndex: 1,
//   color: 'black',
//   transition: 'all 0.2s ease-in',

//   '&:focus': {
//     border: '2px solid #2a2f31',
//     outline: '2px solid #ff4600',
//   },
//   '&:hover': {
//     backgroundColor: '#ff9c7a',
//   },

//   '&:before': {
//     position: 'absolute',
//     zIndex: -1,
//     top: 'calc(var(--volume) * -1)',
//     left: 'calc(var(--volume) * -1)',
//     display: 'block',
//     content: '""',
//     opacity: 0.35,
//     backgroundColor: '#ff4600',
//     width: 'calc(100% + var(--volume) * 2)',
//     height: 'calc(100% + var(--volume) * 2)',
//     borderRadius: 24,
//     transition: 'all 0.02s ease-in-out',
//     // We cannot directly style `&.disabled` on the parent from here.
//   },
// }));

// const ConnectToggle = styled(ActionButton, {
//   shouldForwardProp: (prop) => !['connected'].includes(prop.toString()),
// })<{ connected?: boolean }>(({ theme, connected }) => ({
//   '&:focus': {
//     border: '2px solid #2a2f31',
//     outline: '2px solid #c3c6c7',
//   },
//   // The :not(.connected) selector is handled via a prop.
//   ...(!connected && {
//     backgroundColor: '#1f94ff',
//     color: '#181a1b',
//   }),
// }));

// const ControlTray = styled('section', {
//   shouldForwardProp: (prop) => ![''].includes(prop.toString()),
// })<{}>(({ theme }) => ({
//   width: '100%',
//   height: '100%',
//   display: 'inline-flex',
//   justifyContent: 'center',
//   alignItems: 'flex-start',
//   gap: 8,
//   paddingBottom: 18,
//   paddingTop: 30,

//   // Handling nested selectors for disabled states.
//   [`& .disabled ${ActionButton}, ${ActionButton}.disabled`]: {
//     background: 'rgba(0, 0, 0, 0)',
//     border: '1px solid #404547',
//     color: '#404547',
//   },
// }));

// const ConnectionContainer = styled('div', {
//   shouldForwardProp: (prop) => !['connected'].includes(prop.toString()),
// })<{ connected?: boolean }>(({ theme, connected }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   alignItems: 'center',
//   gap: 4,

//   '& .connection-button-container': {
//     borderRadius: 27,
//     border: '1px solid #404547',
//     background: '#181a1b',
//     padding: 10,
//   },
//   '& .text-indicator': {
//     fontSize: 11,
//     color: '#1f94ff',
//     userSelect: 'none',
//     ...(!connected && {
//       opacity: 0,
//     }),
//   },
// }));

// const ActionsNav = styled('nav', {
//   shouldForwardProp: (prop) => !['disabled'].includes(prop.toString()),
// })<{ disabled?: boolean }>(({ theme }) => ({
//   background: '#181a1b',
//   border: '1px solid #404547',
//   borderRadius: 27,
//   display: 'inline-flex',
//   gap: 12,
//   alignItems: 'center',
//   overflow: 'clip',
//   padding: 10,
//   transition: 'all 0.6s ease-in',

//   '& > *': {
//     display: 'flex',
//     alignItems: 'center',
//     flexDirection: 'column',
//     gap: '1rem',
//   },
// }));

// const AudioPulseDiv = styled('div', {
//   shouldForwardProp: (prop) => !['active', 'hover'].includes(prop.toString()),
// })<{ active?: boolean; hover?: boolean }>(({ theme, active, hover }) => ({
//   display: 'flex',
//   width: 24,
//   justifyContent: 'space-evenly',
//   alignItems: 'center',
//   transition: 'all 0.5s',
//   height: 4,
//   opacity: active ? 1 : undefined,

//   '& > div': {
//     backgroundColor: active ? '#c3c6c7' : '#404547',
//     borderRadius: 1000,
//     width: 4,
//     minHeight: 4,
//     transition: 'height 0.1s',
//     ...(hover && {
//       animation: `${hoverAnimation} 1.4s infinite alternate ease-in-out`,
//     }),
//   },
// }));

// export function AudioPulse({
//   active,
//   volume,
//   hover,
//   lineCount = 3,
// }: {
//   active: boolean;
//   volume: number;
//   hover?: boolean;
//   lineCount?: number;
// }) {
//   const lines = useRef<HTMLDivElement[]>([]);

//   useEffect(() => {
//     let timeout: number | null = null;
//     const update = () => {
//       lines.current.forEach(
//         (line, i) => (line.style.height = `${Math.min(24, 4 + volume * (i === 1 ? 400 : 60))}px`)
//       );
//       timeout = window.setTimeout(update, 100);
//     };

//     update();

//     return () => clearTimeout((timeout as number)!);
//   }, [volume]);

//   return (
//     <AudioPulseDiv className={`${active ? 'active' : ''} ${hover ? 'hover' : ''}`.trim()}>
//       {Array(lineCount)
//         .fill(null)
//         .map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => (lines.current[i] = el!) as any}
//             style={{ animationDelay: `${i * 133}ms` }}
//           />
//         ))}
//     </AudioPulseDiv>
//   );
// }

// function VoicePanel({ children }: { children?: ReactNode }) {
//   const [inVolume, setInVolume] = useState(0);
//   const [audioRecorder] = useState(() => new AudioRecorder());
//   const [muted, setMuted] = useState(false);
//   const connectButtonRef = useRef<HTMLButtonElement>(null);

//   const { client, connected, connect, disconnect, volume, config, setConfig } =
//     useGeminiAPIContext();

//   useEffect(() => {
//     if (!connected && connectButtonRef.current) {
//       connectButtonRef.current.focus();
//     }
//   }, [connected]);
//   useEffect(() => {
//     document.documentElement.style.setProperty(
//       '--volume',
//       `${Math.max(5, Math.min(inVolume * 200, 8))}px`
//     );
//   }, [inVolume]);

//   useEffect(() => {
//     const onData = (base64: string) => {
//       client.sendRealtimeInput([
//         {
//           mimeType: 'audio/pcm;rate=16000',
//           data: base64,
//         },
//       ]);
//     };
//     if (connected && !muted && audioRecorder) {
//       audioRecorder.on('data', onData).on('volume', setInVolume).start();
//     } else {
//       audioRecorder.stop();
//     }
//     return () => {
//       audioRecorder.off('data', onData).off('volume', setInVolume);
//     };
//   }, [connected, client, muted, audioRecorder]);

//   return (
//     <ControlTray>
//       <ActionsNav disabled={!connected}>
//         <MicButton onClick={() => setMuted(!muted)}>
//           {!muted ? <Icon>mic</Icon> : <Icon>mic_off</Icon>}
//         </MicButton>

//         <ActionButton className="outlined no-action">
//           <AudioPulse volume={volume} active={connected} hover={false} />
//         </ActionButton>
//         {children}
//       </ActionsNav>

//       <ConnectionContainer connected={connected}>
//         <div className="connection-button-container">
//           <ConnectToggle
//             ref={connectButtonRef}
//             connected={connected}
//             onClick={connected ? disconnect : connect}
//           >
//             <Icon>{connected ? 'pause' : 'play_arrow'}</Icon>
//           </ConnectToggle>
//         </div>
//         <span className="text-indicator">Streaming</span>
//       </ConnectionContainer>
//     </ControlTray>
//   );
// }

// export default memo(VoicePanel);

import { AudioRecorder } from '../utils/AudioRecorder';
import { useGeminiAPIContext } from '../utils/GeminiAPI';
import { Icon } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import { ReactNode, memo, useEffect, useRef, useState } from 'react';

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

/* ---------------- Styled Buttons ---------------- */
const ActionButton = styled('button', {
  shouldForwardProp: (prop) => !['disabled', 'outlined', 'connected'].includes(prop.toString()),
})<{ disabled?: boolean; outlined?: boolean; connected?: boolean }>(
  ({ outlined, connected }) => ({
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

    '& .no-action': {
      pointerEvents: 'none',
    },
  })
);

/* ---------------- Mic Button (green when unmuted) ---------------- */
const MicButton = styled(ActionButton, {
  shouldForwardProp: (prop) => prop.toString() !== 'unmuted',
})<{ unmuted?: boolean }>(({ unmuted }) => ({
  position: 'relative',
  zIndex: 1,
  color: 'black',
  transition: 'all 0.2s ease-in',
  backgroundColor: unmuted ? '#22c55e' : '#ff4600',

  '&:focus': {
    border: '2px solid #2a2f31',
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
  shouldForwardProp: (prop) => !['connected'].includes(prop.toString()),
})<{ connected?: boolean }>(({ connected }) => ({
  '&:focus': {
    border: '2px solid #2a2f31',
    outline: '2px solid #c3c6c7',
  },
  ...(!connected && {
    backgroundColor: '#1f94ff',
    color: '#181a1b',
  }),
}));

/* ---------------- Layout Containers ---------------- */
const ControlTray = styled('section')(() => ({
  width: '100%',
  height: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 8,
  paddingBottom: 12,
  paddingTop: 20,

  [`& .disabled ${ActionButton}, ${ActionButton}.disabled`]: {
    background: 'rgba(0, 0, 0, 0)',
    border: '1px solid #404547',
    color: '#404547',
  },
}));

const ConnectionContainer = styled('div')<{ connected?: boolean }>(({ connected }) => ({
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
}));

const ActionsNav = styled('nav')<{ disabled?: boolean }>(({ disabled }) => ({
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

/* ---------------- Audio Pulse ---------------- */
const AudioPulseDiv = styled('div')<{ active?: boolean; hover?: boolean }>(({ active, hover }) => ({
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
    ...(hover && { animation: `${hoverAnimation} 1.4s infinite alternate ease-in-out` }),
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
        (line, i) =>
          (line.style.height = `${Math.min(24, 4 + volume * (i === 1 ? 400 : 60))}px`)
      );
      timeout = window.setTimeout(update, 100);
    };
    update();
    return () => clearTimeout(timeout as number);
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

/* ---------------- Instruction Box (below all buttons) ---------------- */
const InstructionBox = styled('div')(() => ({
  width: '100%',
  maxWidth: 520,
  margin: '8px auto 0',
  border: '1px solid #2a2f31',
  background: '#111415',
  color: '#c3c6c7',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 16,
  lineHeight: 1.35,
  textAlign: 'center',
  boxShadow: '0 1px 0 rgba(0,0,0,0.2) inset',
}));

/* ---------------- Voice Panel ---------------- */
function VoicePanel({ children }: { children?: ReactNode }) {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume } = useGeminiAPIContext();

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
      audioRecorder.on('data', onData).on('volume', setInVolume).start();
    } else {
      audioRecorder.stop();
    }

    return () => {
      audioRecorder.off('data', onData).off('volume', setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  const isEditableTarget = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return true;
    if (el.isContentEditable) return true;
    return !!el.closest?.('[contenteditable=""],[contenteditable="true"]');
  };

  // Push-to-talk (Space to hold) with 1-second delayed re-mute
  useEffect(() => {
    const spacebarTimeoutRef = { current: null as number | null };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ') && !isEditableTarget(e.target)) {
        if (!e.repeat) {
          e.preventDefault();

          // Cancel any pending re-mute timeout
          if (spacebarTimeoutRef.current) {
            clearTimeout(spacebarTimeoutRef.current);
            spacebarTimeoutRef.current = null;
          }

          setMuted(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ') && !isEditableTarget(e.target)) {
        e.preventDefault();

        // Delay re-muting by 1 second
        spacebarTimeoutRef.current = window.setTimeout(() => {
          setMuted(true);
          spacebarTimeoutRef.current = null;
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
      window.removeEventListener('keyup', handleKeyUp, { capture: true } as any);

      if (spacebarTimeoutRef.current) {
        clearTimeout(spacebarTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <ControlTray>
        <ActionsNav disabled={!connected}>
        <MicButton
          unmuted={!muted}
          onClick={() => setMuted((prev) => !prev)}
          aria-pressed={!muted}
          title={muted ? 'Click or hold Space to talk' : 'Click to mute (or release Space)'}
        >
          {!muted ? <Icon>mic</Icon> : <Icon>mic_off</Icon>}
        </MicButton>
          <ActionButton className="outlined no-action">
            <AudioPulse volume={volume} active={connected && !muted} hover={false} />
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
              <Icon>{connected ? 'call_end' : 'call'}</Icon>
            </ConnectToggle>
          </div>
        </ConnectionContainer>
      </ControlTray>

      {/* Instruction message in its own box, always visible, below all buttons */}
      <InstructionBox aria-live="polite" role="status">
        {connected ? (
          <>
            💡 Tip: You can ❗mute❗ the call to go into discussion!
            <br />
            <br />
            <b>Click</b> the microphone or hold <b>spacebar</b> to toggle mute/unmute
          </>
        ) : (
          'Click the phone to start the call'
        )}
      </InstructionBox>
    </>
  );
}

export default memo(VoicePanel);
