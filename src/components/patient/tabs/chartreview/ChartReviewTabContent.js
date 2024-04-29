import React, { useState } from 'react';
import { Box, Chip, Divider, Table, TableHead, TableRow, TableCell, Dialog, DialogContent, Typography } from '@mui/material'
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import LabReport from '../snapshot/LabReportTab.js';

const tabLabels = [
  "Encounters",
  "Note",
  "Imaging",
  "Lab",
  "Cardiac",
  "Specialty Test",
  "Other",
  "Meds",
  "Letter",
  "Referrals"
];

export const ChartReviewDataContent = ({ selectedTabLabel, data, ...props }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  // Filter data based on selectedTabLabel
  const filteredData = data.filter(item => item.kind === selectedTabLabel);

  // Retrieve columns dynamically from the properties of the objects in filteredData
  const columns = filteredData.length > 0 ? Object.keys(filteredData[0].data) : [];

  // Filter out columns where all rows have data
  const visibleColumns = columns.filter(column =>
    filteredData.every(row => row.data[column] !== undefined && row.data[column] !== null && row.data[column] !== '')
  );

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            {visibleColumns.map((column, index) => (
              <TableCell key={index}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <tbody>
          {filteredData.map((row, index) => (
            <TableRow key={index} onClick={() => handleRowClick(row.data)}>
              {visibleColumns.map((column, columnIndex) => (
                <TableCell key={columnIndex}>{row.data[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </Table>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogContent>
          {selectedRow && Object.keys(selectedRow).map((key, index) => (
            <Box key={index}>
              <strong>{key}:</strong> {selectedRow[key]}
            </Box>
          ))}
          <Divider />
          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
            enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
            imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
            Convallis convallis tellus id interdum velit laoreet id donec ultrices.
            Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
            adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
            nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
            leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
            feugiat vivamus at augue. At augue eget arcu dictum varius duis at
            consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
            sapien faucibus et molestie ac.
          </Typography>
          <Typography paragraph>
            Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
            eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
            neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
            tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
            sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
            tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
            gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
            et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
            tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
            eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
            posuere sollicitudin aliquam ultrices sagittis orci a.
          </Typography>
          
          {/* Render the LabReport only if selectedTabLabel is 'Lab' */}
          {selectedTabLabel === 'Lab' && selectedRow && (
            <LabReport selectedRow={selectedRow} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export const ChartReview = ({ ...props }) => {
  const [subValue, setValue] = useState(0);
  const [selectedTabLabel, setSelectedTabLabel] = useState('Encounters');
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const { documents } = TEST_PATIENT_INFO({ patientMRN })
  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {tabLabels.map((label, idx) => (
          <Chip
            key={idx}
            label={label}
            onClick={(idx2, label2) => {
              setValue(idx);
              setSelectedTabLabel(label);
            }}
            variant={subValue === idx ? "filled" : "outlined"}
            color={subValue === idx ? "primary" : "default"}
            style={{ margin: 5 }}
          />
        ))}
      </Box>
      <ChartReviewDataContent selectedTabLabel={selectedTabLabel} data={documents} />
    </div>
  );
}
