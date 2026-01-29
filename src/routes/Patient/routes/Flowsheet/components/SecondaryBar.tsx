import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface SecondaryBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  tabs?: { id: string; label: string }[];
}

export const SecondaryBar: React.FC<SecondaryBarProps> = ({
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  tabs = []
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
};