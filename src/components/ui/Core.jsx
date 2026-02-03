// eslint-disable-file no-nested-ternary
import React from "react"
import { debounce } from "lodash"
import dayjs2 from "dayjs"
import {
  alpha as MUIalpha,
  Box as MUIBox,
  Stack as MUIStack,
  Grid as MUIGrid,
  GridLegacy as MUIGridLegacy,
  Typography as MUITypography,
  TextField as MUITextField,
  Autocomplete as MUIAutocomplete,
  Button as MUIButton,
  ButtonGroup as MUIButtonGroup,
  Icon as MUIIcon,
  IconButton as MUIIconButton,
  Avatar as MUIAvatar,
  Divider as MUIDivider,
  Paper as MUIPaper,
  Chip as MUIChip,
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
  Tab as MUITab,
  Menu as MUIMenu,
  MenuItem as MUIMenuItem
} from '@mui/material'
import {
  Masonry as MUIMasonry,
  TabContext as MUITabContext,
  TabList as MUITabList,
  TabPanel as MUITabPanel
} from '@mui/lab'
import {
  DatePicker as MUIDatePicker
} from '@mui/x-date-pickers-pro'
import {
  DataGridPremium as MUIDataGrid,
  useGridApiRef as MUIuseGridApiRef,
  useKeepGroupedColumnsHidden as MUIuseKeepGroupedColumnsHidden
} from '@mui/x-data-grid-premium'
import {
  RichTreeViewPro as MUIRichTreeView,
  SimpleTreeView as MUISimpleTreeView,
  TreeItem as MUITreeItem
} from '@mui/x-tree-view-pro'
import { LicenseInfo } from '@mui/x-license-pro'
import {
  // eslint-disable-next-line import/no-named-default
  default as MUIDraggable
} from 'react-draggable'
import {
  Editor as MUIEditor,
  EditorReadOnly as MUIEditorReadOnly
} from './Editor.jsx'
LicenseInfo.setLicenseKey("")

// Add an alpha value dynamically to any color string.
export const alpha = (_color, _alpha) => MUIalpha(_color, _alpha)

// Re-export dayjs from the library
export const dayjs = dayjs2

// This component doubles as Box and Paper.
export const Box = React.forwardRef(({ paper, children, ...props }, ref) => {
  if (paper === true)
    return (<MUIPaper ref={ref} {...props}>{children}</MUIPaper>)
  return (<MUIBox ref={ref} {...props}>{children}</MUIBox>)
})

export const Stack = ({ direction = "column", spacing = 0, children, ...props }) => (
  <MUIStack direction={direction} spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const Grid = ({ masonry = false, children, ...props }) => {
  if (masonry)
    return <MUIMasonry {...props}>{children}</MUIMasonry>
  return <MUIGrid {...props}>{children}</MUIGrid>
}

export const Label = ({ variant = 'body1', inline = false, bold = false, italic = false, children, ...props }) => (
  <MUITypography {...props} component={inline ? "span" : props.component} display={inline ? "inline" : props.display} variant={variant} color="inherit" sx={{ fontWeight: bold === true ? 900 : bold, fontStyle: italic ? "italic" : undefined, ...props.sx }}>
    {children}
  </MUITypography>
)

// Render HTML rich text content in a read-only view.
export const RichText = ({ children, ...props }) => (
  <MUIEditorReadOnly value={children} {...props} />
)

export const RichTextEditor = ({ ...props }) => (
  <MUIEditor {...props} />
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

export const Autocomplete = ({ label, options, value, onChange, TextFieldProps, ...props }) => (
  <MUIAutocomplete
    fullWidth
    options={options}
    value={value}
    onChange={onChange}
    renderInput={(params) => <TextField {...params} variant="outlined" label={label} {...TextFieldProps} />}
    {...props}
  />
)

// To use as a ToggleButton, MUST provide `value`!
export const Button = ({ contained = false, outlined = false, color = 'primary', value, children, ...props }) => {
  return (
    <MUIButton
      value={value}
      variant={contained ? "contained" : outlined ? "outlined" : "text"}
      color={color}
      {...props}
    >
      {children}
    </MUIButton>
  )
}

// FIXME: Need to make sure `exclusive=false` mode works correctly!
// Buttons inside this MUST have prop `toggle={true}`
export const ButtonGroup = ({ exclusive = false, variant, value, onChange, children, ...props }) => {
  const childrenWithProps = React.Children.map(children, child => {
    if (!React.isValidElement(child))
      return child
    // Must have value for parent ButtonGroup and child Button to be considered a toggle
    // If exclusive toggle, check array contains, else must equal
    const isToggle = !!value && !!child.props.value
    const isSelected = isToggle && ((Array.isArray(value) && value.includes(child.props.value)) || (value === child.props.value))
    return React.cloneElement(child, {
      variant: isToggle ? (isSelected ? "contained" : "outlined") : variant,
      onClick: (event) => {
        // Call parent ButtonGroup onChange if requested, providing child Button 
        // value (click source), then call child Button onClick if necessary
        onChange?.(event, child.props.value)
        child.props.onClick?.(event)
      }
    })
  })
  return <MUIButtonGroup {...props}>{childrenWithProps}</MUIButtonGroup>
}

export const IconButton = ({ size = "medium", color = "inherit", children, iconProps, ...props }) => (
  <MUIIconButton size={size} color={color} {...props}>
    <MUIIcon fontSize={size} {...iconProps}>{children}</MUIIcon>
  </MUIIconButton>
)

export const Chip = ({ children, ...props }) => (
  <MUIChip label={children} {...props} />
)

// FIXME: Set default verticalAlign=text-top for Icon?

// To see a complete list of icons, visit: https://fonts.google.com/icons
export const Icon = ({ avatar = false, size = undefined, children, avatarProps, ...props }) => avatar ? (
  <MUIAvatar {...avatarProps} sx={{ width: size, height: size, ...avatarProps?.sx }}>
    <MUIIcon color="inherit" {...props}>{children}</MUIIcon>
  </MUIAvatar>
) : (
  <MUIIcon color="inherit" {...props}>{children}</MUIIcon>
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
        {Object.keys(children[0]).map(x => (
          <MUITableCell>{x}</MUITableCell>
        ))}
      </MUITableRow>
    </MUITableHead>
    <MUITableBody>
      {Object.entries(children).map(([tag, value]) => (
        <MUITableRow key={tag}>
          {Object.values(value).map(x => (
            <MUITableCell>{x}</MUITableCell>
          ))}
        </MUITableRow>
      ))}
    </MUITableBody>
  </MUITable>
)

export const KeyValueTable2 = ({ children, ...props }) => (
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

export const TreeView = ({ rich = false, children, ...props }) => {
  const proRef = React.useRef(null)
  React.useEffect(() => {
    for (const div of proRef?.current?.querySelectorAll('div').values() ?? []) {
      if (div.textContent?.trim().startsWith("MUI X") && div.children.length === 0)
        div.style.display = 'none'
    }
  }, [proRef.current])
  if (rich)
    return <MUIRichTreeView ref={proRef} {...props}>{children}</MUIRichTreeView>
  return <MUISimpleTreeView {...props}>{children}</MUISimpleTreeView>
}

export const TreeItem = ({ children, ...props }) => (
  <MUITreeItem {...props}>
    {children}
  </MUITreeItem>
)

export const DatePicker = ({ children, ...props }) => (
  <MUIDatePicker {...props}>
    {children}
  </MUIDatePicker>
)

export const Tab = ({ children, ...props }) => (
  <MUITab {...props}>
    {children}
  </MUITab>
)

// TODO: Automate the useState()/onChange() so the client does not need to worry
export const TabList = ({ children, ...props }) => (
  <MUITabList
    variant="scrollable"
    textColor="inherit"
    scrollButtons="auto"
    allowScrollButtonsMobile
    {...props}
  >
    {children}
  </MUITabList>
)

export const TabPanel = ({ children, ...props }) => (
  <MUITabPanel {...props}>
    {children}
  </MUITabPanel>
)

export const TabView = ({ children, ...props }) => (
  <MUITabContext {...props}>
    {children}
  </MUITabContext>
)

export const DataGrid = ({ children, ...props }) => {
  const proRef = React.useRef(null)
  React.useEffect(() => {
    for (const div of proRef?.current?.querySelectorAll('div').values() ?? []) {
      if (div.textContent?.trim().startsWith("MUI X") && div.children.length === 0)
        div.style.display = 'none'
    }
  }, [proRef.current])
  return (
    <MUIDataGrid ref={proRef} {...props}>
      {children}
    </MUIDataGrid>
  )
}

/**
 To provide an icon for the title:
 ```
 title={<><Icon>token</Icon> Title</>}
 ```
 */
export const TitledCard = ({ emphasized, title, color, children, ...props }) => {
  return (
    <MUIPaper sx={{
      borderLeftWidth: 8,
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
          bgcolor: emphasized ? MUIalpha(color, 0.25) : "background.paper",
          color: emphasized ? color : "color.inherit",
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

export const Window = ({ title, open, onClose, header, footer, children, ...props }) => {
  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      PaperComponent={_MUIDraggablePaperComponent}
      {...props}
    >
      <MUIDialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title" {...props.HeaderProps}>
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
        {header}
      </MUIDialogTitle>
      <MUIDialogContent dividers {...props.ContentProps}>
        {children}
      </MUIDialogContent>
      {!!footer &&
        <MUIDialogActions {...props.FooterProps}>
          {footer}
        </MUIDialogActions>
      }
    </MUIDialog>
  );
}

export const Scrollable = ({ children }) => React.Children.map(children, child =>
  React.cloneElement(child, { style: { ...child.props.style, overflow: 'visible' } })
)

export function useLazyEffect(effect, deps = [], wait = 250) {
  const cleanUp = React.useRef()
  const effectRef = React.useRef()
  effectRef.current = React.useCallback(effect, deps)
  const lazyEffect = React.useCallback(
    debounce(() => (cleanUp.current = effectRef.current?.()), wait),
    []
  )
  React.useEffect(lazyEffect, deps)
  React.useEffect(() => {
    return () =>
      cleanUp.current instanceof Function ? cleanUp.current() : undefined
  }, [])
}


export const useGridApiRef = MUIuseGridApiRef
export const useKeepGroupedColumnsHidden = MUIuseKeepGroupedColumnsHidden

export const Menu = ({ children, ...props }) => (
  <MUIMenu {...props}>
    {children}
  </MUIMenu>
)

export const MenuItem = ({ children, ...props }) => (
  <MUIMenuItem {...props}>
    {children}
  </MUIMenuItem>
)
