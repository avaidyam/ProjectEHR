import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Icon, TreeView } from 'components/ui/Core';
import { useDatabase } from 'components/contexts/PatientContext'


const ExpandMoreIcon = () => <Icon>expand_more</Icon>
const ChevronRightIcon = () => <Icon>chevron_right</Icon>



const createTreeItems = (lists: any[]) => {
  const myLists = lists.filter((list: any) => list.type === 'my');
  const availableLists = lists.filter((list: any) => list.type === 'available' || list.type === 'system');

  return [
    {
      id: 'my-lists',
      label: 'My Lists',
      children: myLists.map((list: any) => ({
        id: list.id,
        label: list.name,
      })),
    },
    {
      id: 'available-lists',
      label: 'Available Lists',
      children: availableLists.map((list: any) => ({
        id: list.id,
        label: list.name,
      })),
    },
  ];
};

export const ListsSidebar = ({ lists, selectedListId }: { lists: any[], selectedListId?: string }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState(['my-lists', 'available-lists']);

  const handleItemClick = (event: React.MouseEvent, itemId: string) => {
    if (itemId !== 'my-lists' && itemId !== 'available-lists') {
      navigate(`/list/${itemId}`);
    }
  };

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
        items={createTreeItems(lists)}
        slots={{
          expandIcon: ChevronRightIcon,
          collapseIcon: ExpandMoreIcon,
        }}
        expandedItems={expandedItems}
        onExpandedItemsChange={(_event: any, nodeIds: string[]) => setExpandedItems(nodeIds)}
        selectedItems={selectedListId ? [selectedListId] : []}
        onItemClick={handleItemClick}
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
