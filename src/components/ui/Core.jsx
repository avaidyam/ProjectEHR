import React from 'react';
import {
  Box as MUIBox, 
  Stack as MUIStack, 
  Typography as MUITypography, 
  TextField as MUITextField, 
  Button as MUIButton, 
  Divider as MUIDivider,
  Table as MUITable,
  TableHead as MUITableHead,
  TableBody as MUITableBody,
  TableRow as MUITableRow,
  TableCell as MUITableCell
} from '@mui/material';

// TODO: Create a tooltip wrapped version of each of these.

export const Box = ({ children, ...props }) => (
    <MUIBox {...props}>
        {children}
    </MUIBox>
);

export const VStack = ({ children, spacing = 2, ...props }) => (
  <MUIStack direction="column" spacing={spacing} {...props}>
    {children}
  </MUIStack>
);

export const HStack = ({ children, spacing = 2, ...props }) => (
  <MUIStack direction="row" spacing={spacing} {...props}>
    {children}
  </MUIStack>
);

export const Label = ({ children, variant = 'body1', ...props }) => (
    <MUITypography variant={variant} {...props}>
        {children}
    </MUITypography>
);

export const TextField = ({ label, value, onChange, ...props }) => (
    <MUITextField
        label={label}
        value={value}
        onChange={onChange}
        variant="outlined"
        fullWidth
        {...props}
    />
);

export const Button = ({ children, variant = 'contained', color = 'primary', ...props }) => (
    <MUIButton variant={variant} color={color} {...props}>
        {children}
    </MUIButton>
);

export const Divider = (props) => (
  <MUIDivider {...props} />
);

export const Table = ({ children, ...props }) => (
  <MUITable {...props}>
    {children}
  </MUITable>
);

export const TableHead = ({ children, ...props }) => (
  <MUITableHead {...props}>
    {children}
  </MUITableHead>
);

export const TableBody = ({ children, ...props }) => (
  <MUITableBody {...props}>
    {children}
  </MUITableBody>
);

export const TableRow = ({ children, ...props }) => (
  <MUITableRow {...props}>
    {children}
  </MUITableRow>
);

export const TableCell = ({ children, ...props }) => (
  <MUITableCell {...props}>
    {children}
  </MUITableCell>
);
