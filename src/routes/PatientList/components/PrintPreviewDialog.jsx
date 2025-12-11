import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  useTheme,
} from '@mui/material';

export const PrintPreviewDialog = ({ open, onClose, list }) => {
  const theme = useTheme();

  if (!list) return null;

  const patients =
    Array.isArray(list.patients) ? list.patients : Object.values(list.patients || {});

  const formatDob = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return val;
      return d.toLocaleDateString();
    } catch {
      return val;
    }
  };

  const getNameWithMrn = (p) => {
    const name = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim();
    const mrn = p.mrn || p.id || '';
    return mrn ? `${name} (${mrn})` : name;
  };

  // Listen for Cmd+P / Ctrl+P
  useEffect(() => {
    if (!open) return;

    const handlePrintShortcut = (e) => {
      // Cmd+P on Mac or Ctrl+P on Windows
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault(); // prevent default browser print
        window.print();      // trigger print
      }
    };

    window.addEventListener('keydown', handlePrintShortcut);
    return () => window.removeEventListener('keydown', handlePrintShortcut);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: '100%',
          '@media print': {
            boxShadow: 'none',
            m: 0,
            borderRadius: 0,
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#424242',
          color: '#fff',
          '@media print': { display: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Print Preview — {list.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#e0e0e0' }}>
            Last refreshed: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
          '@media print': { padding: 0 },
        }}
      >
        <Table
          size="small"
          sx={{
            borderCollapse: 'collapse',
            width: '100%',
            displayPrint: 'table',
            '& .MuiTableCell-root': {
              border: `1px solid ${theme.palette.divider}`,
              padding: '8px 10px',
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#424242',
                '@media print': { backgroundColor: '#424242', color: '#fff' },
              }}
            >
              <TableCell sx={{ color: '#fff', fontWeight: 700, width: '20%' }}>
                Patient Name (MRN)
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, width: '12%' }}>
                DOB
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, width: '25%' }}>
                Location
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, width: '13%' }}>
                Status
              </TableCell>
              <TableCell
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  width: '30%',
                  textAlign: 'center',
                }}
              >
                Notes
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    No patients in this list
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {patients.map((p, idx) => {
              const rowBg = idx % 2 === 0 ? 'common.white' : 'grey.100';

              return (
                <TableRow
                  key={p.id || idx}
                  sx={{
                    backgroundColor: rowBg,
                    height: 120, // fixed row height for screen
                    verticalAlign: 'top',
                    '@media print': {
                      height: 80, // fixed row height for print
                      backgroundColor: rowBg, // preserve alternation
                    },
                  }}
                >
                  <TableCell>{getNameWithMrn(p)}</TableCell>
                  <TableCell>{formatDob(p.birthdate || p.dob)}</TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {p.location || p.room || p.roomNumber || ''}
                      </Typography>
                      {p.bedStatus && (
                        <Typography variant="caption" color="text.secondary">
                          {p.bedStatus}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>{p.status || p.codeStatus || ''}</TableCell>

                  <TableCell
                    sx={{
                      verticalAlign: 'top',
                      width: 220,
                      paddingLeft: 12,
                      paddingRight: 12,
                    }}
                  >
                    {p.stickyNote || ''}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>

      {/* Buttons hidden in print */}
      <DialogActions sx={{ pr: 2, '@media print': { display: 'none' } }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => window.print()}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PrintPreviewDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  list: PropTypes.shape({
    name: PropTypes.string,
    patients: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  }),
};

PrintPreviewDialog.defaultProps = {
  open: false,
  onClose: () => {},
  list: null,
};
