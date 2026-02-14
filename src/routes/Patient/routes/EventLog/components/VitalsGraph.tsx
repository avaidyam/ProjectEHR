import * as React from 'react';
import { Box, Stack, Button } from '@mui/material';
import { LineChart } from '@mui/x-charts-pro/LineChart';

const VITALS_CONFIG = [
  { key: 'temp', label: 'Temp', color: '#ff5722' },
  { key: 'hr', label: 'HR', color: '#f822ffff' },
  { key: 'sbp', label: 'SBP', color: '#2196f3' },
  { key: 'dbp', label: 'DBP', color: '#2196f3' },
  { key: 'rr', label: 'RR', color: '#4caf50' },
  { key: 'spo2', label: 'SpO2', color: '#4caf50' },
];

export const VitalsGraph = ({ data }: { data: any[] }) => {
  const [hiddenSeries, setHiddenSeries] = React.useState<string[]>([]);

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev: string[]) =>
      prev.includes(key)
        ? prev.filter((k: string) => k !== key)
        : [...prev, key]
    );
  };

  return (
    <Stack spacing={1} sx={{ p: 1, height: '100%' }}>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <LineChart
          hideLegend
          dataset={data.map(x => ({ ...x, time: new Date(x.time.epochMilliseconds) }))} // Charts needs Date, not Temporal
          xAxis={[{
            dataKey: 'time',
            scaleType: 'time',
            valueFormatter: (date: any) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
