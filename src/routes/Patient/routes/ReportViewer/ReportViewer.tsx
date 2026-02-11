import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Box, Label, Icon, Stack, Button } from 'components/ui/Core';
import { useSplitView } from 'components/contexts/SplitViewContext';

const formatReferenceInterval = (low: any, high: any, units: string) => {
  let interval = '';
  if (low !== null && high !== null) {
    interval = `${low} — ${high}`;
  } else if (low !== null) {
    interval = `< ${low}`;
  } else if (high !== null) {
    interval = `> ${high}`;
  }
  return interval ? `${interval} ${units ? units : ''}` : null;
};
const hasLowOrHighValues = (components: any[]) => {
  return components.some(item => {
    const numericValue = parseFloat(item.value);
    if (!isNaN(numericValue)) {
      return (item.low !== null && numericValue < item.low) || (item.high !== null && numericValue > item.high);
    }
    return false;
  });
};
const isValueOutsideRange = (value: any, low: any, high: any) => {
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue)) {
    return (low !== null && numericValue < low) || (high !== null && numericValue > high);
  }
  return false;
};

export const ReportViewer = ({ data, ...props }: { data: any;[key: string]: any }) => {
  const { openTab }: any = useSplitView();
  const isAbnormal = hasLowOrHighValues(data?.components ?? [])

  const handleOpenImaging = () => {
    const isPathologySlide = data?.accessionNumber?.startsWith("PATH") || data?.id?.startsWith("PATH");
    const viewerId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    openTab("Imaging Viewer", { data: data, viewerId: viewerId, convertMonochrome: !isPathologySlide }, "main", false);
  };

  return (
    <Stack direction="column" spacing={2} sx={{ p: 2 }}>
      <Label variant="h6">Results</Label>
      <Box paper sx={{
        borderLeft: isAbnormal ? '4px solid #fbc02d' : '1px solid #e0e0e0',
        borderTop: '1px solid #e0e0e0',
        borderRight: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isAbnormal && (
                <Icon sx={{ color: '#d32f2f' }}>error_outline</Icon>
              )}
              <Label
                variant="h6"
                sx={{
                  color: isAbnormal ? '#d32f2f' : 'text.primary',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {data?.test ?? "Unknown Result"}
              </Label>
            </Stack>
            <Label sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              Order: {data?.id ?? "0"}
            </Label>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
            <span>Status: <strong>{(data?.resulted ?? false) ? "Final result" : "Pending"}</strong></span>
          </Stack>
          {(data?.image) && (
            <Button
              variant="contained"
              startIcon={<Icon>image</Icon>}
              onClick={handleOpenImaging}
              sx={{ mt: 2, mb: 1 }}
            >
              View Images
            </Button>
          )}
        </Box>
        {(data?.components?.length > 0) && (
          <TableContainer component={Box}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #e0e0e0', width: '60%', py: 0.5 }}>
                    <Label variant="body2" bold>Component</Label>
                    <Label variant="caption" color="textSecondary">Ref Range & Units</Label>
                  </TableCell>
                  <TableCell align="left" sx={{ borderBottom: '1px solid #e0e0e0', py: 0.5 }}>
                    <Label variant="body2" bold>{data?.collected ?? "Date Unknown"}</Label>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.components ?? []).map((item: any, index: number) => {
                  if (item.value === null || item.name === null) return null;

                  const referenceInterval = formatReferenceInterval(item.low, item.high, item.units);
                  const isOutOfRange = isValueOutsideRange(item.value, item.low, item.high);

                  // Determine symbol and color based on value compared to reference range
                  let symbol = '';
                  let valueColor = 'text.primary';
                  let highlightBg = 'transparent';

                  if (isOutOfRange) {
                    const numericValue = parseFloat(item.value);
                    if (!isNaN(numericValue)) {
                      symbol = numericValue > item.high ? '▲' : '▼'; // Geometric shapes matching style better than caret
                      valueColor = '#d32f2f'; // Red
                      highlightBg = '#fff9c4'; // Light yellow
                    }
                  }

                  return (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ py: 0.5 }}>
                        <Label variant="body2" bold sx={{ color: 'text.primary' }}>
                          {item.name}
                        </Label>
                        {referenceInterval && (
                          <Label variant="caption" display="block" color="textSecondary">
                            {referenceInterval}
                          </Label>
                        )}
                        {item.comment && (
                          <Label variant="caption" display="block" color="textSecondary">
                            {item.comment}
                          </Label>
                        )}
                      </TableCell>
                      <TableCell align="left" sx={{ py: 0.5, verticalAlign: 'top' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: highlightBg,
                            color: valueColor,
                            border: isOutOfRange ? '1px solid #fbc02d' : 'none',
                            borderRadius: 1,
                            px: isOutOfRange ? 1 : 0,
                            py: isOutOfRange ? 0.5 : 0
                          }}
                        >
                          <Label variant="body2" fontWeight={isOutOfRange ? 'bold' : 'normal'}>
                            {item.value}
                          </Label>
                          {isOutOfRange && (
                            <Label variant="body2" component="span" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                              {symbol}
                            </Label>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data?.image && (
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Label variant="body2" bold sx={{ mb: 0.5 }}>Narrative</Label>
            <Label variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{data?.narrative ?? "No narrative available."}</Label>

            <Label variant="body2" bold sx={{ mb: 0.5 }}>Impression</Label>
            <Label variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{data?.impression ?? "No impression available."}</Label>
          </Box>
        )}

        <Box sx={{ p: 2, pt: 2 }}>
          <Label sx={{ color: 'text.secondary' }}>{data?.comment ?? ""}</Label>
          <Label variant="caption" color="textSecondary">
            Resulting Agency: {data?.resultingAgency ?? ""}
          </Label>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Label variant="body2" color="textSecondary">
              <strong>Specimen Collected:</strong> {data?.collected ?? "Unknown"}
            </Label>
            <Label variant="body2" color="textSecondary">
              <strong>Last Resulted:</strong> {data?.resulted ?? "Unknown"}
            </Label>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            <Button variant="text" startIcon={<Icon>table_chart</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              Lab Flowsheet
            </Button>
            <Button variant="text" startIcon={<Icon>search</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              Order Details
            </Button>
            <Button variant="text" startIcon={<Icon>hub</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              View Encounter
            </Button>
            <Button variant="text" startIcon={<Icon>attach_file</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              Lab and Collection Details
            </Button>
            <Button variant="text" startIcon={<Icon>forward_to_inbox</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              Routing
            </Button>
            <Button variant="text" startIcon={<Icon>history</Icon>} sx={{ textTransform: 'none', fontWeight: 500 }}>
              Result History
            </Button>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};
