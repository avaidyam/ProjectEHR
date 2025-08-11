import React from 'react'
import {
  Box as MUIBox, 
  Stack as MUIStack, 
  Typography as MUITypography, 
  TextField as MUITextField, 
  Button as MUIButton, 
  IconButton as MUIIconButton,
  Icon as MUIIcon,
  Avatar as MUIAvatar,
  Divider as MUIDivider,
  Paper as MUIPaper,
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

export const VStack = ({ spacing = 2, children, ...props }) => (
  <MUIStack direction="column" spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const HStack = ({ spacing = 2, children, ...props }) => (
  <MUIStack direction="row" spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const Label = ({ variant = 'body1', inline = false, bold = false, italic = false, children, ...props }) => (
    <MUITypography component={inline ? "span" : props.component} display={inline ? "inline" : props.display} variant={variant} color="inherit" sx={{ fontWeight: bold ? 900 : undefined, fontStyle: italic ? "italic" : undefined, ...props.sx }} {...props}>
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

export const Button = ({ contained = false, outlined = false, color = 'inherit', children, ...props }) => (
    // eslint-disable-next-line no-nested-ternary
    <MUIButton variant={contained ? "contained" : outlined ? "outlined" : "text"} color={color} {...props}>
        {children}
    </MUIButton>
)

export const IconButton = ({ size = "medium", color = "inherit", children, iconProps, ...props }) => (
  <MUIIconButton size={size} color={color} { ...props }>
    <MUIIcon fontSize={size} {...iconProps}>{children}</MUIIcon>
  </MUIIconButton>
)

export const Icon = ({ avatar = false, size = undefined, children, avatarProps, ...props }) => avatar ? (
  <MUIAvatar sx={{ width: size, height: size, ...avatarProps?.sx}} {...avatarProps}>
    <MUIIcon color="inherit" { ...props }>{children}</MUIIcon>
  </MUIAvatar>
) : (
  <MUIIcon color="inherit" { ...props }>{children}</MUIIcon>
)

export const Divider = ({ children, ...props }) => (
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

export const TitledCard = ({ title, color, children, ...props }) => {
  return(
    <MUIPaper sx={{ 
      borderLeftWidth: 15,
      borderLeftColor: color,
      borderLeftStyle: 'solid',  // Define the left border style
      borderTop: '1px solid #ccc',  // Other borders individually defined
      borderRight: '1px solid #ccc',
      borderBottom: '1px solid #ccc', 
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
      marginBottom: '8px',
      padding: '16px',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }} {...props}>
      <Label bold variant="h3" style={{ fontSize: "1.2em", marginTop: 0, color}}>{title}</Label>
      <Box style={{ margin: 0 }}>{children}</Box>
    </MUIPaper>
  )
}
