import React from 'react';
import { Box, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import { Icon } from 'components/ui/Core.jsx';

interface SecondaryBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const SecondaryBar: React.FC<SecondaryBarProps> = ({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
}) => {
  const tabs = [
    { value: 'encounter-vitals', label: 'Encounter Vitals' },
    { value: 'vs-pt-reported', label: 'VS/Pt Reported' },
    { value: 'travel-history', label: 'Travel History' },
    { value: 'labs', label: 'Labs' },
  ];

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
};