import * as React from 'react';
import { Box, Collapse, SxProps, Theme } from '@mui/material';
import { Icon, IconButton } from './Core';

interface CollapsiblePaneProps {
  children: React.ReactNode;
  width?: number;
  defaultOpen?: boolean;
  side?: 'left' | 'right';
  sx?: SxProps<Theme>;
}

export const CollapsiblePane: React.FC<CollapsiblePaneProps> = ({ children, width = 250, defaultOpen = true, side = 'left', sx }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const isLeft = side === 'left';

  return (
    <Box sx={{ position: 'relative', display: 'flex', height: '100%', ...sx }}>
      {/* The collapsible content */}
      <Box
        sx={{
          width: isOpen ? width : 0,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: isLeft ? 1 : 0,
          borderLeft: !isLeft ? 1 : 0,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          height: '100%',
          order: isLeft ? 1 : 2 // Content order based on side
        }}
      >
        <Collapse in={isOpen} orientation="horizontal" timeout="auto" sx={{ height: '100%', '& .MuiCollapse-wrapperInner': { height: '100%', width } }}>
          <Box sx={{ height: '100%', overflowY: 'auto', width }}>
            {children}
          </Box>
        </Collapse>
      </Box>

      {/* The toggle button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        size="small"
        sx={{
          position: 'absolute',
          top: '1.5rem',
          [isLeft ? 'left' : 'right']: isOpen ? width - 12 : -12, // Position relative to the pane edge
          zIndex: 1001,
          width: 24,
          height: 24,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          transition: `${isLeft ? 'left' : 'right'} 0.3s ease-in-out`,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          order: isLeft ? 2 : 1 // Button order based on side
        }}
      >
        <Icon fontSize="small">
          {isLeft
            ? (isOpen ? 'chevron_left' : 'chevron_right')
            : (isOpen ? 'chevron_right' : 'chevron_left')
          }
        </Icon>
      </IconButton>
    </Box>
  );
};
