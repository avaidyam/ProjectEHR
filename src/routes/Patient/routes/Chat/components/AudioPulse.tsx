import React, { useEffect, useRef } from "react";
import { styled, keyframes } from '@mui/material/styles'

const lineCount = 3;

export type AudioPulseProps = {
  active: boolean;
  volume: number;
  hover?: boolean;
};

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

const AudioPulseDiv = styled('div', {
  shouldForwardProp: prop => !['active', 'hover'].includes(prop.toString())
})<{ active?: boolean, hover?: boolean }>(({ theme, active, hover }) => ({
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

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach(
        (line, i) =>
        (line.style.height = `${Math.min(
          24,
          4 + volume * (i === 1 ? 400 : 60),
        )}px`),
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
