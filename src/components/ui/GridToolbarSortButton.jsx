import React, { useState } from 'react';
import {
  useGridApiContext,
  useGridRootProps,
  GridArrowUpwardIcon,
  GridArrowDownwardIcon,
  useGridSelector,
  gridSortModelSelector,
  gridColumnDefinitionsSelector,
} from '@mui/x-data-grid-premium';
import { Icon } from './Core.jsx';
import {
  Button,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box
} from '@mui/material';

/**
 * 
 * Note: A little known feature of the DataGrid is that CMD-clicking a sort 
 * button in the column header allows the user to add multiple sort options!
 * @returns 
 */
export function GridToolbarSortButton() {
  const [anchorEl, setAnchorEl] = useState(null);
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const fields = useGridSelector(apiRef, gridColumnDefinitionsSelector);
  const sortModel = useGridSelector(apiRef, gridSortModelSelector);
  const sortableFields = fields.filter((field) => field.sortable !== false);
  const alwaysMultiSort = rootProps.multipleColumnsSortingMode === 'always';

  return (
    <>
      <Button
        size="small"
        startIcon={
          <Badge badgeContent={sortModel.length} color="primary" variant="dot">
            <Icon size={20}>swap_vert</Icon>
          </Badge>
        }
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Sort
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        transitionDuration={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ minWidth: 250 }}>
          <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography fontWeight={500}>Sort by</Typography>
          </Box>

          <List>
            {sortableFields.map((field) => {
              const fieldIndexInSortModel = sortModel.findIndex(
                (sort) => sort.field === field.field,
              );
              const fieldInSortModel = sortModel[fieldIndexInSortModel];
              let nextSort = 'asc';

              if (fieldInSortModel) {
                nextSort = fieldInSortModel.sort === 'asc' ? 'desc' : null;
              }

              return (
                <ListItem key={field.field} disablePadding>
                  <ListItemButton
                    onClick={(e) => {
                      // Allow multi-sort when modifier key is pressed, or always if multipleColumnsSortingMode="always"
                      const isMultiSort = alwaysMultiSort || e.metaKey || e.ctrlKey || e.altKey;
                      apiRef.current.sortColumn(field.field, nextSort, isMultiSort);
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {fieldInSortModel && (
                        <Badge
                          badgeContent={
                            sortModel.length > 1 ? fieldIndexInSortModel + 1 : null
                          }
                        >
                          {fieldInSortModel.sort === 'asc' ? (
                            <GridArrowUpwardIcon />
                          ) : (
                            <GridArrowDownwardIcon />
                          )}
                        </Badge>
                      )}
                    </ListItemIcon>
                    <ListItemText>{field.headerName || field.field}</ListItemText>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Popover>
    </>
  );
}
