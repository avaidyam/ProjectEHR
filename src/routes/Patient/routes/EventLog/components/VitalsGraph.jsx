import React, { useState } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const VITALS_CONFIG = [
  { key: 'hr', label: 'HR', color: '#ff5722' },
  { key: 'bpSys', label: 'BP Sys', color: '#e91e63' },
  { key: 'bpDia', label: 'BP Dia', color: '#9c27b0' },
  { key: 'temp', label: 'Temp', color: '#2196f3' },
  { key: 'spo2', label: 'SpO2', color: '#4caf50' },
];

export const VitalsGraph = ({ data }) => {
  const [hiddenSeries, setHiddenSeries] = useState([]);

  const toggleSeries = (key) => {
    setHiddenSeries(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <Stack spacing={1} sx={{ p: 1, height: '100%' }}>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <LineChart
          dataset={data}
          xAxis={[{
            dataKey: 'time',
            scaleType: 'time',
            valueFormatter: (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]}
          series={VITALS_CONFIG.filter(
            config => !hiddenSeries.includes(config.key)
          ).map(config => ({
            dataKey: config.key,
            label: config.label,
            color: config.color,
            showMark: false
          }))}
          grid={{ vertical: true, horizontal: true }}
          margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
          slotProps={{ legend: { hidden: true } }}
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        {VITALS_CONFIG.map(config => {
          const isHidden = hiddenSeries.includes(config.key);
          return (
            <Button
              key={config.key}
              size="small"
              onClick={() => toggleSeries(config.key)}
              variant={isHidden ? "outlined" : "contained"}
              sx={{
                flexShrink: 0,
                boxShadow: 'none',
                ...(isHidden ? {
                  color: 'text.disabled',
                  bgcolor: 'transparent',
                } : {
                  bgcolor: config.color,
                  color: '#fff'
                })
              }}
            >
              {config.label}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
};
