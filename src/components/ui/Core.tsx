// eslint-disable-file no-nested-ternary
import React from "react"
import { debounce } from "../../util/helpers"

import {
  alpha as MUIalpha,
  Box as MUIBox,
  Stack as MUIStack,
  Grid as MUIGrid,
  GridLegacy as MUIGridLegacy,
  Typography as MUITypography,
  TextField as MUITextField,
  Autocomplete as MUIAutocomplete,
  AutocompleteRenderInputParams,
  Button as MUIButton,
  ButtonGroup as MUIButtonGroup,
  Icon as MUIIcon,
  IconButton as MUIIconButton,
  Avatar as MUIAvatar,
  Divider as MUIDivider,
  Paper as MUIPaper,
  Chip as MUIChip,
  Checkbox as MUICheckbox,
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
  Popover as MUIPopover,
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
  CheckboxProps,
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  DialogProps,
  TabProps,
  MenuProps,
  MenuItemProps,
  PopoverProps,
  ToggleButtonGroupProps,
  InputAdornment as MUIInputAdornment,
  TextFieldVariants,
  Tooltip as MUITooltip,
  TooltipProps,
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
  TimePicker as MUITimePicker,
  DatePickerProps,
  DateTimePickerProps,
  TimePickerProps
} from '@mui/x-date-pickers-pro'
import {
  TemporalPlainDateProvider,
  TemporalPlainDateTimeProvider,
  TemporalPlainTimeProvider,
  TemporalZonedDateTimeProvider
} from 'mui-temporal-pickers'
import {
  DataGridPremium as MUIDataGrid,
  useGridApiRef as MUIuseGridApiRef,
  useKeepGroupedColumnsHidden as MUIuseKeepGroupedColumnsHidden,
  DataGridPremiumProps
} from '@mui/x-data-grid-premium'
import {
  TreeItem as _MUITreeItem
} from '@mui/x-tree-view'
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
import {
  ErrorBoundary as ReactErrorBoundary
} from 'react-error-boundary'
import { MarkReviewed } from "./MarkReviewed"

LicenseInfo.setLicenseKey("")

// Add an alpha value dynamically to any color string.
export const alpha = (_color: string, _alpha: number) => MUIalpha(_color, _alpha)

export const ErrorBoundary: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ReactErrorBoundary fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>⚠️ Something went wrong</Box>}>
    {children}
  </ReactErrorBoundary>
)

export const Box = React.forwardRef<any, BoxProps & PaperProps & { paper?: boolean }>(({ paper, children, ...props }, ref) => {
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
  <MUIEditor disableStickyMenuBar disableStickyFooter {...props} />
)

export const Autocomplete: React.FC<Omit<AutocompleteProps<any, any, any, any>, 'renderInput'> & { label?: string, placeholder?: string, variant?: TextFieldVariants, TextFieldProps?: TextFieldProps, renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode, renderOption?: any }> = ({ label, placeholder, variant, options, value, onChange, TextFieldProps, ...props }) => (
  <MUIAutocomplete
    options={options}
    value={value}
    onChange={onChange}
    renderInput={(params) => (
      <MUITextField
        {...params}
        {...TextFieldProps}
        variant={variant ?? "outlined"}
        label={label}
        placeholder={placeholder}
        InputProps={{
          ...params.InputProps,
          ...TextFieldProps?.InputProps,
          startAdornment: TextFieldProps?.InputProps?.startAdornment ?
            <MUIInputAdornment position="start">{params.InputProps.startAdornment}{TextFieldProps.InputProps.startAdornment}</MUIInputAdornment> :
            params.InputProps.startAdornment,
          endAdornment: TextFieldProps?.InputProps?.endAdornment ?
            <MUIInputAdornment position="end">{params.InputProps.endAdornment}{TextFieldProps.InputProps.endAdornment}</MUIInputAdornment> :
            params.InputProps.endAdornment
        }}
      />
    )}
    {...props}
  />
)

/**
 * A specialized Autocomplete component that manages an array of values.
 * It automatically appends an empty field at the end to allow for easy multi-item entry.
 * Clearing a field removes it from the array, but at least one empty field is always presented.
 *
 * @param label - The label for the entire group of inputs (appears notched on the border)
 * @param value - An array of strings representing the currently selected items
 * @param onChange - Callback triggered when the array of values changes
 * @param options - The list of options to display in each Autocomplete field
 * @param exclusive - If true, duplicate values will be automatically removed (defaults to true)
 */
export interface AutocompleteListProps extends Omit<AutocompleteProps<any, any, any, any>, 'value' | 'onChange' | 'label' | 'renderInput'> {
  label?: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  options: any[];
  exclusive?: boolean;
}

export const AutocompleteList: React.FC<AutocompleteListProps> = ({
  label,
  options,
  value,
  onChange,
  sx,
  exclusive = true,
  ...props
}) => {
  const values = React.useMemo(() => Array.isArray(value) ? value : (value ? [value] : []), [value]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [revision, setRevision] = React.useState(0);

  const handleValueChange = (idx: number, newVal: string | null) => {
    const updated = [...values];
    if (idx < updated.length) {
      updated[idx] = newVal || '';
    } else if (newVal) {
      updated.push(newVal);
    }

    let filtered = updated.filter(v => v && v.trim() !== '');
    if (exclusive) {
      const originalCount = filtered.length;
      filtered = Array.from(new Set(filtered));
      if (filtered.length < originalCount) {
        setRevision(r => r + 1); // Force reset of inputs to clear duplicates
      }
    }
    onChange?.(filtered);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        mt: label ? 1.5 : 0,
        ...sx
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {label && (
        <Label
          variant="caption"
          sx={{
            position: 'absolute',
            top: -10,
            left: 12,
            px: 1,
            bgcolor: 'background.paper',
            color: isFocused ? 'primary.main' : 'text.secondary',
            zIndex: 1,
            transition: 'color 0.2s'
          }}
        >
          {label}
        </Label>
      )}
      <Stack
        spacing={0}
        sx={{
          p: 1,
          border: '1px solid',
          borderColor: isFocused ? 'primary.main' : 'rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...(isFocused && { boxShadow: (theme: any) => `0 0 0 1px ${theme.palette.primary.main}` })
        }}
      >
        {[...values, ''].map((v: string, idx: number) => (
          <Autocomplete
            key={`${idx}-${revision}`}
            fullWidth
            freeSolo
            size="small"
            placeholder={idx === values.length ? `Add ${label || 'item'}...` : ''}
            options={options}
            value={v}
            onChange={(e: any, val: any) => handleValueChange(idx, val)}
            onInputChange={(e: any, val: any) => {
              if (!val && idx < values.length) handleValueChange(idx, '');
            }}
            onBlur={(e: any) => {
              const typedVal = e.target.value;
              if (typedVal && typedVal.trim() !== '' && !values.includes(typedVal)) {
                handleValueChange(idx, typedVal);
              }
            }}
            variant="standard"
            TextFieldProps={{
              sx: {
                '& .MuiInput-root': {
                  py: 0.5,
                  px: 1,
                  '&:before, &:after': { display: 'none' }
                },
              }
            }}
            sx={{
              mb: idx < values.length ? 0.5 : 0,
              ...(idx < values.length && { borderBottom: '1px solid', borderColor: 'divider' })
            }}
            {...props}
          />
        ))}
      </Stack>
    </Box>
  );
};

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
export const ButtonGroup: React.FC<Omit<ButtonGroupProps, 'onChange'> & { exclusive?: boolean, onChange?: (event: React.MouseEvent<HTMLElement>, value: any) => void, value?: any }> = ({ exclusive = false, variant, value, onChange, children, ...props }) => {
  const childrenWithProps = React.Children.map(children, child => {
    if (!React.isValidElement(child))
      return child
    // Must have value for parent ButtonGroup and child Button to be considered a toggle
    // If exclusive toggle, check array contains, else must equal
    const childEl = child as React.ReactElement<ButtonProps>;
    const isToggle = !!value && !!childEl.props.value
    const isSelected = isToggle && ((Array.isArray(value) && value.includes(childEl.props.value)) || (value === childEl.props.value))
    return React.cloneElement(childEl, {
      variant: isToggle ? (isSelected ? "contained" : "outlined") : variant,
      onClick: (event) => {
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

export const Checkbox: React.FC<CheckboxProps> = ({ ...props }) => (
  <MUICheckbox {...props} />
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
  <MUIBox {...props} sx={{ flexGrow: 1 }} />
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

export const JSONTreeItem = ({ label, value, path, ...props }: { label: string; value: any; path: string } & Partial<TreeItemProps>) => {
  const { itemId: _itemId, ...rest } = props;
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)

  if (isObject) {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return (
        <TreeItem
          {...rest}
          itemId={path}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Label inline bold variant="body2">{label}:</Label>
              <Label inline color="textSecondary" variant="body2">{isArray ? '[]' : '{}'}</Label>
            </Box>
          }
        />
      )
    }

    return (
      <TreeItem
        {...rest}
        itemId={path}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Label inline bold variant="body2">{label}</Label>
            <Label inline color="primary" variant="caption" sx={{ opacity: 0.7 }}>
              {isArray ? `[${value.length}]` : `{${keys.length}}`}
            </Label>
          </Box>
        }
      >
        {keys.map((key) => (
          <JSONTreeItem
            key={key}
            label={key}
            value={value[key]}
            path={`${path}.${key}`}
          />
        ))}
      </TreeItem>
    )
  }

  return (
    <TreeItem
      {...rest}
      itemId={path}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
          <Label inline bold variant="body2" sx={{ minWidth: 100 }}>{label}:</Label>
          <Label
            inline
            variant="body2"
            sx={{
              color: typeof value === 'string' ? 'success.main' : (typeof value === 'number' ? 'info.main' : (typeof value === 'boolean' ? 'warning.main' : 'textSecondary')),
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}
          >
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </Label>
        </Box>
      }
    />
  )
}

export const JSONTree = ({ data, label = "Root", path = "root", ...props }: { data: any, label?: string, path?: string } & SimpleTreeViewProps<any>) => {
  return (
    <TreeView
      defaultExpandedItems={[path]}
      {...props}
    >
      <JSONTreeItem label={label} value={data} path={path} />
    </TreeView>
  )
}

export const TimePicker: React.FC<TimePickerProps<any> & { convertString?: boolean, fullWidth?: boolean, size?: 'small' | 'medium', helperText?: string }> = ({ convertString, fullWidth, size, value, helperText, onChange, ...props }) => (
  <ErrorBoundary>
    <TemporalPlainTimeProvider>
      <MUITimePicker
        value={!!value && value.length > 0 && convertString ? Temporal.PlainTime.from(value) : ((value?.length ?? 0) > 0 ? value : undefined)}
        onChange={(value: Temporal.PlainTime, context) => onChange?.(!!value && convertString ? value.toString() : value, context)}
        onAccept={(value: Temporal.PlainTime, context) => onChange?.(!!value && convertString ? value.toString() : value, context)}
        slotProps={{ textField: { size, fullWidth, helperText } }}
        {...props}
      />
    </TemporalPlainTimeProvider>
  </ErrorBoundary>
)

export const DatePicker: React.FC<DatePickerProps<any> & { convertString?: boolean, fullWidth?: boolean, size?: 'small' | 'medium', helperText?: string }> = ({ convertString, fullWidth, size, value, helperText, onChange, ...props }) => (
  <ErrorBoundary>
    <TemporalPlainDateProvider>
      <MUIDatePicker
        value={!!value && convertString && typeof value === 'string' ? Temporal.Instant.from(value).toZonedDateTimeISO('UTC').toPlainDate() : (value || undefined)}
        onChange={(value: Temporal.PlainDate, context) => onChange?.(!!value && convertString ? value.toZonedDateTime('UTC').toInstant().toString() : value, context)}
        onAccept={(value: Temporal.PlainDate, context) => onChange?.(!!value && convertString ? value.toZonedDateTime('UTC').toInstant().toString() : value, context)}
        slotProps={{ textField: { size, fullWidth, helperText } }}
        minDate={Temporal.PlainDate.from("1890-01-01")}
      />
    </TemporalPlainDateProvider>
  </ErrorBoundary>
)

// wraps the Temporal conversion to JSONDate for you
export const DateTimePicker: React.FC<DateTimePickerProps<any> & { convertString?: boolean, fullWidth?: boolean, size?: 'small' | 'medium', helperText?: string }> = ({ convertString, fullWidth, size, value, helperText, onChange, ...props }) => (
  <ErrorBoundary>
    <TemporalPlainDateTimeProvider>
      <MUIDateTimePicker
        value={!!value && convertString && typeof value === 'string' ? Temporal.Instant.from(value).toZonedDateTimeISO('UTC').toPlainDateTime() : (value || undefined)}
        onChange={(value: Temporal.PlainDateTime, context) => onChange?.(!!value && convertString ? value.toZonedDateTime('UTC').toInstant().toString() : value, context)}
        onAccept={(value: Temporal.PlainDateTime, context) => onChange?.(!!value && convertString ? value.toZonedDateTime('UTC').toInstant().toString() : value, context)}
        slotProps={{ textField: { size, fullWidth, helperText } }}
        minDate={Temporal.PlainDateTime.from("1890-01-01T00:00:00.000")}
        {...props}
      />
    </TemporalPlainDateTimeProvider>
  </ErrorBoundary>
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

export const Window: React.FC<Omit<DialogProps, 'title'> & { title?: React.ReactNode, header?: React.ReactNode, footer?: React.ReactNode, HeaderProps?: any, ContentProps?: any, FooterProps?: any }> = ({ title, open, onClose, header, footer, HeaderProps, ContentProps, FooterProps, children, ...props }) => {
  return (
    <MUIDialog
      open={open}
      onClose={onClose}
      PaperComponent={_MUIDraggablePaperComponent}
      {...props}
    >
      <MUIDialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title" {...HeaderProps}>
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
      <MUIDialogContent dividers {...ContentProps}>
        {children}
      </MUIDialogContent>
      {!!footer &&
        <MUIDialogActions {...FooterProps}>
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

export const Tooltip: React.FC<TooltipProps> = (props) => <MUITooltip {...props} />;

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

export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => (
  <MUIPopover {...props}>
    {children}
  </MUIPopover>
)

export { MarkReviewed }
