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
  TableCell as MUITableCell,
  Dialog as MUIDialog,
  DialogActions as MUIDialogActions,
  DialogContent as MUIDialogContent,
  DialogContentText as MUIDialogContentText,
  DialogTitle as MUIDialogTitle,
} from '@mui/material'
import { 
  // eslint-disable-next-line import/no-named-default
  default as MUIDraggable 
} from 'react-draggable'
import { EditorReadOnly } from './Editor.jsx'

// This component doubles as Box and Paper.
export const Box = ({ paper, children, ...props }) => {
  if (paper === true)
    return (<MUIPaper {...props}>{children}</MUIPaper>)
  return (<MUIBox {...props}>{children}</MUIBox>)
}

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
    <MUITypography {...props} component={inline ? "span" : props.component} display={inline ? "inline" : props.display} variant={variant} color="inherit" sx={{ fontWeight: bold === true ? 900 : bold, fontStyle: italic ? "italic" : undefined, ...props.sx }}>
        {children}
    </MUITypography>
)

// Render HTML rich text content in a read-only view.
export const RichText = ({ children, ...props }) => (
    <EditorReadOnly value={children} {...props} />
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

// FIXME: Set default verticalAlign=text-top for Icon?

// To see a complete list of icons, visit: https://fonts.google.com/icons
export const Icon = ({ avatar = false, size = undefined, children, avatarProps, ...props }) => avatar ? (
  <MUIAvatar {...avatarProps} sx={{ width: size, height: size, ...avatarProps?.sx}}>
    <MUIIcon color="inherit" { ...props }>{children}</MUIIcon>
  </MUIAvatar>
) : (
  <MUIIcon color="inherit" { ...props }>{children}</MUIIcon>
)

export const Divider = ({ ...props }) => (
  <MUIDivider {...props} />
)

// Use this to space out a stack: [Content -----Spacer----- Content]
export const Spacer = ({ ...props }) => (
  <Box {...props} sx={{ flexGrow: 1 }} />
)

// FIXME: Pass props for TableHead, TableBody, TableRow, and TableCell.
// Usage: <KeyValueTable>{myCoolObject}</KeyValueTable>
export const KeyValueTable = ({ children, ...props }) => (
  <MUITable {...props}>
    <MUITableHead>
      <MUITableRow>
        <MUITableCell>Key</MUITableCell>
        <MUITableCell>Value</MUITableCell>
      </MUITableRow>
    </MUITableHead>
    <MUITableBody>
      {Object.entries(children).map(([tag, value]) => (
        <MUITableRow key={tag}>
          <MUITableCell>{tag}</MUITableCell>
          <MUITableCell>{value.toString()}</MUITableCell>
        </MUITableRow>
      ))}
    </MUITableBody>
  </MUITable>
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

export const TitledCard = ({ emphasized, title, color, children, ...props }) => {
  return(
    <MUIPaper sx={{ 
      borderLeftWidth: 15,
      borderLeftColor: color,
      borderLeftStyle: 'solid',
      borderTop: '1px solid #ccc',
      borderRight: '1px solid #ccc',
      borderBottom: '1px solid #ccc', 
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
      marginBottom: '8px',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }} {...props}>
      <Label 
        bold={500} 
        sx={{ 
          display: "inline-block",
          fontSize: "1.2em", 
          bgcolor: emphasized ? color : "background.paper",
          color: emphasized ? "background.paper" : "color.inherit",
          borderRadius: emphasized ? '0px 100em 100em 0px' : 0,
          p: 0.5, pr: 2.5,
        }}
      >
        {title}
      </Label>
      <Box sx={{ p: 1 }}>{children}</Box>
    </MUIPaper>
  )
}

function _MUIDraggablePaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <MUIDraggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <MUIPaper {...props} ref={nodeRef} />
    </MUIDraggable>
  );
}

export const Window = ({ title, open, onClose, children, ...props }) => {
  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      PaperComponent={_MUIDraggablePaperComponent}
      {...props}
    >
      <MUIDialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {title}
        <MUIIconButton
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <MUIIcon>close</MUIIcon>
        </MUIIconButton>
      </MUIDialogTitle>
      <MUIDialogContent dividers>
        {children}
      </MUIDialogContent>
      {/*
      <MUIDialogActions>
        <MUIButton autoFocus onClick={onClose}>Cancel</MUIButton>
        <MUIButton onClick={onClose}>Okay</MUIButton>
      </MUIDialogActions> 
      */}
    </MUIDialog>
  );
}