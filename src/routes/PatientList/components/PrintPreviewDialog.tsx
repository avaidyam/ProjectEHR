import * as React from 'react';
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
  GlobalStyles,
} from '@mui/material';
import { Database, useDatabase } from 'components/contexts/PatientContext';

export const PrintPreviewDialog = ({ open, onClose, list }: { open: boolean; onClose: () => void; list: Database.PatientList }) => {
  const [patientsDB] = useDatabase().patients();

  const patients = React.useMemo(() => {
    if (!list) return [];
    if (list.id === 'all-patients') return Object.values(patientsDB);

    return (list.patients || []).map((p) => {
      if (typeof p === 'string') {
        return patientsDB[p];
      }
      return p;
    }).filter(Boolean);
  }, [list, patientsDB]);

  const formatDob = (val: any) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return val;
      return d.toLocaleDateString();
    } catch {
      return val;
    }
  };

  const getNameWithMrn = (p: Database.Patient) => {
    return `${p.firstName} ${p.lastName} (${p.id})`
  };

  // Listen for Cmd+P / Ctrl+P
  React.useEffect(() => {
    if (!open) return;

    const handlePrintShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    window.addEventListener('keydown', handlePrintShortcut);
    return () => window.removeEventListener('keydown', handlePrintShortcut);
  }, [open]);

  if (!list) return null;

  return (
    <>
      <GlobalStyles styles={{
        '@media print': {
          '@page': {
            size: 'auto',
            margin: '0mm',
          },
          'body *': {
            visibility: 'hidden',
          },
          '.print-dialog, .print-dialog *': {
            visibility: 'visible',
          },
          '.print-dialog': {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw !important',
            maxWidth: 'none !important',
            height: '100vh !important',
            margin: '0 !important',
            padding: '20px !important',
            boxShadow: 'none !important',
            borderRadius: '0 !important',
          },
        }
      }} />
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          className: 'print-dialog',
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
            bgcolor: '#bbbbbb',
            '@media print': { display: 'none' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Print Preview</Typography>
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
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 500, textAlign: 'left' }}
          >
            {list.name || 'TEAM NAME'} – Last Refreshed: {new Date().toLocaleString()}
          </Typography>

          <Table
            size="small"
            sx={{
              borderCollapse: 'collapse',
              width: '100%',
              '@media print': {
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              },
              '& .MuiTableCell-root': {
                border: `1px solid divider`,
                borderColor: "divider",
                padding: '8px 10px',
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: '#bbbbbb',
                  '@media print': {
                    backgroundColor: '#bbbbbb',
                    color: '#fff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 700, width: '20%' }}>Patient Name (MRN)</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>DOB</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '22%' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '13%' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '35%' }}>Notes</TableCell>
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

              {patients.map((p: any, idx: number) => {
                const rowBg = idx % 2 === 0 ? 'common.white' : 'grey.100';

                return (
                  <TableRow
                    key={p.id || idx}
                    sx={{
                      backgroundColor: rowBg,
                      height: 100,
                      verticalAlign: 'top',
                      '@media print': {
                        height: 100,
                        backgroundColor: rowBg,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        breakInside: 'avoid',
                      },
                    }}
                  >
                    <TableCell>{getNameWithMrn(p)}</TableCell>
                    <TableCell>{formatDob(p.birthdate || p.dob)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{p.location || p.room || p.roomNumber || ''}</Typography>
                        {p.bedStatus && (
                          <Typography variant="caption" color="text.secondary">
                            {p.bedStatus}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{p.status || p.codeStatus || ''}</TableCell>
                    <TableCell> {p.smartData?.stickyNotes?.["__PRIVATE__"] ?? ""} </TableCell>
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
    </>
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
  onClose: () => { },
  list: null,
};
