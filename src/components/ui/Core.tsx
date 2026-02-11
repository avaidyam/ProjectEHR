// eslint-disable-file no-nested-ternary
import React from "react"
// @ts-ignore
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
  MenuItem as MUIMenuItem,
  BoxProps,
  StackProps,
  GridProps,
  TypographyProps,
  TextFieldProps,
  AutocompleteProps,
  ButtonProps,
  ButtonGroupProps,
  IconButtonProps,
  IconProps,
  DividerProps,
  PaperProps,
  ChipProps,
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  DialogProps,
  TabProps,
  MenuProps,
  MenuItemProps
} from '@mui/material'
import {
  Masonry as MUIMasonry,
  TabContext as MUITabContext,
  TabList as MUITabList,
  TabPanel as MUITabPanel,
  TabListProps,
  TabPanelProps,
  TabContextProps
} from '@mui/lab'
import {
  DatePicker as MUIDatePicker,
  DateTimePicker as MUIDateTimePicker,
  DatePickerProps,
  DateTimePickerProps
} from '@mui/x-date-pickers-pro'
import {
  DataGridPremium as MUIDataGrid,
  useGridApiRef as MUIuseGridApiRef,
  useKeepGroupedColumnsHidden as MUIuseKeepGroupedColumnsHidden,
  DataGridPremiumProps
} from '@mui/x-data-grid-premium'
import {
  RichTreeViewPro as MUIRichTreeView,
  SimpleTreeView as MUISimpleTreeView,
  TreeItem as MUITreeItem,
  SimpleTreeViewProps,
  TreeItemProps
} from '@mui/x-tree-view-pro'
import { LicenseInfo } from '@mui/x-license'
import {
  // eslint-disable-next-line import/no-named-default
  default as MUIDraggable
} from 'react-draggable'
import {
  Editor as MUIEditor,
  EditorReadOnly as MUIEditorReadOnly
} from './Editor'

LicenseInfo.setLicenseKey("")

// Add an alpha value dynamically to any color string.
export const alpha = (_color: string, _alpha: number) => MUIalpha(_color, _alpha)

// Re-export dayjs from the library
export const dayjs = dayjs2

export const Box = React.forwardRef<any, BoxProps & { paper?: boolean, elevation?: number }>(({ paper, children, ...props }, ref) => {
  if (paper === true)
    return (<MUIPaper ref={ref} {...props as any}>{children}</MUIPaper>)
  return (<MUIBox ref={ref} {...props as any}>{children}</MUIBox>)
})

export const Stack: React.FC<StackProps> = ({ direction = "column", spacing = 0, children, ...props }) => (
  <MUIStack direction={direction} spacing={spacing} {...props}>
    {children}
  </MUIStack>
)

export const Grid: React.FC<GridProps & { masonry?: boolean, sequential?: boolean, columns?: any }> = ({ masonry = false, children, ...props }) => {
  if (masonry)
    return <MUIMasonry {...props as any}>{children}</MUIMasonry>
  return <MUIGrid {...props}>{children}</MUIGrid>
}

export const Label: React.FC<TypographyProps & { inline?: boolean, bold?: boolean | number, italic?: boolean, children?: any }> = ({ variant = 'body1', inline = false, bold = false, italic = false, children, ...props }) => (
  <MUITypography {...props} component={(inline ? "span" : props.component) as any} display={inline ? "inline" : props.display} variant={variant} color={props.color ?? "inherit"} sx={{ fontWeight: bold === true ? 900 : (bold === false ? undefined : bold), ...(italic ? { fontStyle: "italic" } : {}), ...props.sx }}>
    {children}
  </MUITypography>
)

// Render HTML rich text content in a read-only view.
export const RichText: React.FC<{ children?: any } & any> = ({ children, ...props }) => (
  <MUIEditorReadOnly value={children} {...props} />
)

export const RichTextEditor: React.FC<any> = ({ ...props }) => (
  <MUIEditor {...props} />
)

export const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, ...props }) => (
  <MUITextField
    label={label}
    value={value}
    onChange={onChange}
    variant="outlined"
    fullWidth
    {...props}
  />
)

export const Autocomplete: React.FC<Omit<AutocompleteProps<any, any, any, any>, 'renderInput'> & { label?: string, TextFieldProps?: any, renderInput?: any, renderOption?: any }> = ({ label, options, value, onChange, TextFieldProps, ...props }) => (
  <MUIAutocomplete
    fullWidth
    options={options}
    value={value}
    onChange={onChange}
    // @ts-ignore
    renderInput={(params) => <TextField {...params} variant="outlined" label={label} {...TextFieldProps} />}
    {...props}
  />
)

/**
 * To use as a ToggleButton, MUST provide `value`!
 */
export const Button: React.FC<ButtonProps & { contained?: boolean, outlined?: boolean, value?: any }> = ({ contained = false, outlined = false, color = 'primary', value, children, ...props }) => {
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
export const ButtonGroup: React.FC<ButtonGroupProps & { exclusive?: boolean, onChange?: (event: any, value: any) => void, value?: any }> = ({ exclusive = false, variant, value, onChange, children, ...props }) => {
  const childrenWithProps = React.Children.map(children, child => {
    if (!React.isValidElement(child))
      return child
    // Must have value for parent ButtonGroup and child Button to be considered a toggle
    // If exclusive toggle, check array contains, else must equal
    const childEl = child as React.ReactElement<any>;
    const isToggle = !!value && !!childEl.props.value
    const isSelected = isToggle && ((Array.isArray(value) && value.includes(childEl.props.value)) || (value === childEl.props.value))
    return React.cloneElement(childEl, {
      variant: isToggle ? (isSelected ? "contained" : "outlined") : variant,
      onClick: (event: React.MouseEvent) => {
        // Call parent ButtonGroup onChange if requested, providing child Button 
        // value (click source), then call child Button onClick if necessary
        onChange?.(event, childEl.props.value)
        childEl.props.onClick?.(event)
      }
    })
  })
  return <MUIButtonGroup {...props}>{childrenWithProps}</MUIButtonGroup>
}

export const IconButton: React.FC<IconButtonProps & { iconProps?: any }> = ({ size = "medium", color = "inherit", children, iconProps, ...props }) => (
  <MUIIconButton size={size} color={color} {...props}>
    <MUIIcon fontSize={size} {...iconProps}>{children}</MUIIcon>
  </MUIIconButton>
)

export const Chip: React.FC<ChipProps> = ({ children, ...props }) => (
  <MUIChip label={children} {...props} />
)

// FIXME: Set default verticalAlign=text-top for Icon?

// To see a complete list of icons, visit: https://fonts.google.com/icons
export const Icon: React.FC<IconProps & { avatar?: boolean, size?: number, avatarProps?: any }> = ({ avatar = false, size = undefined, children, avatarProps, ...props }) => avatar ? (
  <MUIAvatar {...avatarProps} sx={{ width: size, height: size, ...avatarProps?.sx }}>
    <MUIIcon color="inherit" {...props}>{children}</MUIIcon>
  </MUIAvatar>
) : (
  <MUIIcon color="inherit" {...props}>{children}</MUIIcon>
)

export const Divider: React.FC<DividerProps> = ({ ...props }) => (
  <MUIDivider {...props} />
)

// Use this to space out a stack: [Content -----Spacer----- Content]
export const Spacer: React.FC<BoxProps> = ({ ...props }) => (
  <Box {...props} sx={{ flexGrow: 1 }} />
)

// FIXME: Pass props for TableHead, TableBody, TableRow, and TableCell.
// Usage: <KeyValueTable>{myCoolObject}</KeyValueTable>
export const KeyValueTable: React.FC<{ children: any } & TableProps> = ({ children, ...props }) => (
  <MUITable {...props as any}>
    <MUITableHead>
      <MUITableRow>
        {Object.keys(children[0]).map(x => (
          <MUITableCell key={x}>{x}</MUITableCell>
        ))}
      </MUITableRow>
    </MUITableHead>
    <MUITableBody>
      {Object.entries(children).map(([tag, value]: [string, any]) => (
        <MUITableRow key={tag}>
          {Object.values(value).map((x: any, i) => (
            <MUITableCell key={i}>{x}</MUITableCell>
          ))}
        </MUITableRow>
      ))}
    </MUITableBody>
  </MUITable>
)

export const KeyValueTable2: React.FC<{ children: any } & TableProps> = ({ children, ...props }) => (
  <MUITable {...props as any}>
    <MUITableHead>
      <MUITableRow>
        <MUITableCell>Key</MUITableCell>
        <MUITableCell>Value</MUITableCell>
      </MUITableRow>
    </MUITableHead>
    <MUITableBody>
      {Object.entries(children).map(([tag, value]: [string, any]) => (
        <MUITableRow key={tag}>
          <MUITableCell>{tag}</MUITableCell>
          <MUITableCell>{value.toString()}</MUITableCell>
        </MUITableRow>
      ))}
    </MUITableBody>
  </MUITable>
)

export const Table: React.FC<TableProps> = ({ children, ...props }) => (
  <MUITable {...props}>
    {children}
  </MUITable>
)

export const TableHead: React.FC<TableHeadProps> = ({ children, ...props }) => (
  <MUITableHead {...props}>
    {children}
  </MUITableHead>
)

export const TableBody: React.FC<TableBodyProps> = ({ children, ...props }) => (
  <MUITableBody {...props}>
    {children}
  </MUITableBody>
)

export const TableRow: React.FC<TableRowProps> = ({ children, ...props }) => (
  <MUITableRow {...props}>
    {children}
  </MUITableRow>
)

export const TableCell: React.FC<TableCellProps> = ({ children, ...props }) => (
  <MUITableCell {...props}>
    {children}
  </MUITableCell>
)

export const TreeView: React.FC<SimpleTreeViewProps<any> & { rich?: boolean } & Record<string, any>> = ({ rich = false, children, ...props }) => {
  const proRef = React.useRef<any>(null)
  React.useEffect(() => {
    for (const div of proRef?.current?.querySelectorAll('div').values() ?? []) {
      if (div.textContent?.trim().startsWith("MUI X") && div.children.length === 0)
        div.style.display = 'none'
    }
  }, [proRef.current])
  if (rich)
    return <MUIRichTreeView ref={proRef} {...props as any}>{children}</MUIRichTreeView>
  return <MUISimpleTreeView {...props}>{children}</MUISimpleTreeView>
}

export const TreeItem: React.FC<TreeItemProps> = ({ children, ...props }) => (
  <MUITreeItem {...props}>
    {children}
  </MUITreeItem>
)

export const DatePicker: React.FC<DatePickerProps<any> & { children?: React.ReactNode }> = ({ children, ...props }) => (
  <MUIDatePicker {...props}>
    {children}
  </MUIDatePicker>
)

export const DateTimePicker: React.FC<DateTimePickerProps<any> & { children?: React.ReactNode }> = ({ children, ...props }) => (
  <MUIDateTimePicker {...props}>
    {children}
  </MUIDateTimePicker>
)

export const Tab: React.FC<TabProps> = ({ children, ...props }) => (
  <MUITab {...props}>
    {children}
  </MUITab>
)

// TODO: Automate the React.useState()/onChange() so the client does not need to worry
export const TabList: React.FC<TabListProps> = ({ children, ...props }) => (
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

export const TabPanel: React.FC<TabPanelProps> = ({ children, ...props }) => (
  <MUITabPanel {...props}>
    {children}
  </MUITabPanel>
)

export const TabView: React.FC<TabContextProps> = ({ children, ...props }) => (
  <MUITabContext {...props}>
    {children}
  </MUITabContext>
)

export const DataGrid: React.FC<DataGridPremiumProps & { children?: React.ReactNode }> = ({ children, ...props }) => {
  const proRef = React.useRef<any>(null)
  React.useEffect(() => {
    for (const div of proRef?.current?.querySelectorAll('div').values() ?? []) {
      if (div.textContent?.trim().startsWith("MUI X") && div.children.length === 0)
        div.style.display = 'none'
    }
  }, [proRef.current])
  return (
    // @ts-ignore
    <MUIDataGrid ref={proRef} {...props}>
      {children}
    </MUIDataGrid>
  )
}

/**
 * To provide an icon for the title:
 * ```
 * title={<><Icon>token</Icon> Title</>}
 * ```
 */
interface TitledCardProps extends Omit<PaperProps, 'title'> {
  emphasized?: boolean;
  title?: React.ReactNode;
  color?: string;
  toolbar?: React.ReactNode;
  toolbarProps?: any;
  boxProps?: any;
}
export const TitledCard: React.FC<TitledCardProps> = ({ emphasized, title, color, sx, toolbar, toolbarProps, boxProps, children, ...props }) => {
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
      position: 'relative',
      ...sx
    }} {...props}>
      <Label
        bold={500}
        sx={{
          display: "inline-block",
          fontSize: "1.2em",
          bgcolor: emphasized ? MUIalpha(color || "", 0.25) : "background.paper",
          color: emphasized ? color : "color.inherit",
          borderRadius: emphasized ? '0px 100em 100em 0px' : 0,
          p: 0.5, pr: 2.5, mr: 1
        }}
      >
        {title}
      </Label>
      <Box component="span" {...toolbarProps}>{toolbar}</Box>
      <Box {...boxProps} sx={{ p: 1, ...(boxProps?.sx ?? {}) }}>{children}</Box>
    </MUIPaper>
  )
}

function _MUIDraggablePaperComponent(props: PaperProps) {
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

export const Window: React.FC<DialogProps & { title?: React.ReactNode, header?: React.ReactNode, footer?: React.ReactNode, HeaderProps?: any, ContentProps?: any, FooterProps?: any }> = ({ title, open, onClose, header, footer, children, ...props }) => {
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
          onClick={onClose as any}
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

export const Scrollable: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement<any>(child, { style: { ...(child.props as any).style, overflow: 'visible' } })
          : child
      )}
    </>
  )
}

export function useLazyEffect(effect: () => void | (() => void), deps: any[] = [], wait = 250) {
  const cleanUp = React.useRef<void | (() => void)>(undefined)
  const effectRef = React.useRef<() => void | (() => void)>(undefined)
  effectRef.current = React.useCallback(effect, deps)
  const lazyEffect = React.useCallback(
    debounce(() => (cleanUp.current = effectRef.current?.()), wait),
    []
  )
  React.useEffect(lazyEffect, deps)
  React.useEffect(() => {
    return () => {
      if (cleanUp.current instanceof Function) {
        cleanUp.current()
      }
    }
  }, [])
}

export const useGridApiRef = MUIuseGridApiRef
export const useKeepGroupedColumnsHidden = MUIuseKeepGroupedColumnsHidden

export const Menu: React.FC<MenuProps> = ({ children, ...props }) => (
  <MUIMenu {...props}>
    {children}
  </MUIMenu>
)

export const MenuItem: React.FC<MenuItemProps> = ({ children, ...props }) => (
  <MUIMenuItem {...props}>
    {children}
  </MUIMenuItem>
)
