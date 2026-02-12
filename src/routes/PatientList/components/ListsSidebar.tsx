import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Icon, TreeView } from 'components/ui/Core';
import { Database, useDatabase } from 'components/contexts/PatientContext'

const ExpandMoreIcon = () => <Icon>expand_more</Icon>
const ChevronRightIcon = () => <Icon>chevron_right</Icon>

export const ListsSidebar = ({ lists, selectedListId }: { lists: Database.PatientList[], selectedListId?: Database.PatientList.ID }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState(['my-lists', 'available-lists']);

  return (
    <Box paper
      sx={{
        minWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TreeView rich
        items={[
          {
            id: 'my-lists',
            label: 'My Lists',
            children: lists.filter((list) => list.type === 'my').map((list) => ({
              id: list.id,
              label: list.name,
            })),
          },
          {
            id: 'available-lists',
            label: 'Available Lists',
            children: lists.filter((list) => list.type === 'available' || list.type === 'system').map((list) => ({
              id: list.id,
              label: list.name,
            })),
          },
        ]}
        slots={{
          expandIcon: ChevronRightIcon,
          collapseIcon: ExpandMoreIcon,
        }}
        expandedItems={expandedItems}
        onExpandedItemsChange={(_event: any, nodeIds: string[]) => setExpandedItems(nodeIds)}
        selectedItems={selectedListId ? [selectedListId] : []}
        onItemClick={(event, itemId) => {
          if (itemId !== 'my-lists' && itemId !== 'available-lists') {
            navigate(`/list/${itemId}`);
          }
        }}
        itemsReordering={true}
        disableSelection
        sx={{
          p: 1,
          flex: 1,
          overflowY: 'auto',
        }}
      />
    </Box>
  );
};
