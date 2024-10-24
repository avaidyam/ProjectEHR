import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const TagsTable = ({ data }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Tag</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(data).map(([tag, value]) => (
          <TableRow key={tag}>
            <TableCell>{tag}</TableCell>
            <TableCell>{value.toString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

TagsTable.propTypes = {
  data: PropTypes.object.isRequired,
};

export default TagsTable;
