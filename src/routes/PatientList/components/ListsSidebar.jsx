import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Icon, TreeView } from 'components/ui/Core.jsx';
import { useDatabase } from 'components/contexts/PatientContext'
import { usePatientLists } from 'components/contexts/PatientListContext.jsx';

const ExpandMoreIcon = () => <Icon>expand_more</Icon>
const ChevronRightIcon = () => <Icon>chevron_right</Icon>



const createTreeItems = (lists) => {
  const myLists = lists.filter((list) => list.type === 'my');
  const availableLists = lists.filter((list) => list.type === 'available' || list.type === 'system');

  return [
    {
      id: 'my-lists',
      label: 'My Lists',
      children: myLists.map((list) => ({
        id: list.id,
        label: list.name,
      })),
    },
    {
      id: 'available-lists',
      label: 'Available Lists',
      children: availableLists.map((list) => ({
        id: list.id,
        label: list.name,
      })),
    },
  ];
};

export const ListsSidebar = () => {
  const navigate = useNavigate();
  const { lists, selectedListId } = usePatientLists();
  const [expandedItems, setExpandedItems] = useState(['my-lists', 'available-lists']);

  const handleItemClick = (event, itemId) => {
    if (itemId !== 'my-lists' && itemId !== 'available-lists') {
      navigate(`/list/${itemId}`);
    }
  };

  const handleExpansionChange = (_event, nodeIds) => {
    setExpandedItems(nodeIds);
  };

  return (
    <Box paper
      variant='outlined'
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
        onExpandedItemsChange={handleExpansionChange}
        selectedItems={selectedListId ? [selectedListId] : []}
        onItemClick={handleItemClick}
        itemsReordering={true}
        experimentalFeatures={{ indentationAtItemLevel: true, itemsReordering: true }}
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
