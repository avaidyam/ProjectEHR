import React from 'react'
import {
  Box as MUIBox, 
  Stack as MUIStack, 
  Typography as MUITypography, 
  TextField as MUITextField, 
  Button as MUIButton, 
  IconButton as MUIIconButton,
  Icon as MUIIcon,
  Divider as MUIDivider,
  Table as MUITable,
  TableHead as MUITableHead,
  TableBody as MUITableBody,
  TableRow as MUITableRow,
  TableCell as MUITableCell
} from '@mui/material'

// TODO: Create a tooltip wrapped version of each of these.

export const Box = ({ children, ...props }) => (
    <MUIBox {...props}>
        {children}
    </MUIBox>
)

export const VStack = ({ children, spacing = 2, ...props }) => (
  <MUIStack direction="column" spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const HStack = ({ children, spacing = 2, ...props }) => (
  <MUIStack direction="row" spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const Label = ({ children, variant = 'body1', bold = false, italic = false, ...props }) => (
    <MUITypography color="inherit" variant={variant} sx={{ fontWeight: bold ? 900 : undefined, fontStyle: italic ? "italic" : undefined, ...props.sx }} {...props}>
        {children}
    </MUITypography>
)

export const TextField = ({ label, value, onChange, ...props }) => (
    <MUITextField
        label={label}
        value={value}
        onChange={onChange}
        variant="outlined"
        fullWidth
        {...props}
    />
)

export const Button = ({ children, contained = false, outlined = false, color = 'inherit', ...props }) => (
    // eslint-disable-next-line no-nested-ternary
    <MUIButton variant={contained ? "contained" : outlined ? "outlined" : "text"} color={color} {...props}>
        {children}
    </MUIButton>
)

export const IconButton = ({ children, ...props }) => (
  <MUIIconButton color="inherit" { ...props }>
    <MUIIcon>{children}</MUIIcon>
  </MUIIconButton>
)

export const Divider = (props) => (
  <MUIDivider {...props} />
)

export const Table = ({ children, ...props }) => (
  <MUITable {...props}>
    {children}
  </MUITable>
)

export const TableHead = ({ children, ...props }) => (
  <MUITableHead {...props}>
    {children}
  </MUITableHead>
)

export const TableBody = ({ children, ...props }) => (
  <MUITableBody {...props}>
    {children}
  </MUITableBody>
)

export const TableRow = ({ children, ...props }) => (
  <MUITableRow {...props}>
    {children}
  </MUITableRow>
)

export const TableCell = ({ children, ...props }) => (
  <MUITableCell {...props}>
    {children}
  </MUITableCell>
)
