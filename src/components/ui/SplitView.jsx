import React, { useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Box, Tab, Stack, Menu, MenuItem } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DragDropContext, Droppable, DropResult, Draggable } from "@hello-pangea/dnd";
import { SplitViewContext, SplitViewProvider, useSplitView } from 'components/contexts/SplitViewContext.jsx';

const DraggableTab = ({ index, child, ...props }) => {
  return (
    <Draggable
      draggableId={`${index}`}
      index={index}
      disableInteractiveElementBlocking
    >
      {(draggableProvided) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
        >
          {React.cloneElement(child, {
            ...props,
            ...draggableProvided.dragHandleProps
          })}
        </div>
      )}
    </Draggable>
  );
}

const TabWithMenu = ({ onMove, onClose, ...props }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  return (
    <>
    <Tab
      onContextMenu={(event) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget)
      }}
      {...props}
    />
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={() => setAnchorEl(null)}>
      <MenuItem onClick={onMove}>Move to Sidebar</MenuItem>
      <MenuItem onClick={onClose}>Close</MenuItem>
    </Menu>
    </>
  )
}

export const SplitView = ({ defaultMainTabs, defaultSideTabs, tabsDirectory, accessories, ...props }) => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))

  const [mainTabs, setMainTabs] = useState(defaultMainTabs)
  const [sideTabs, setSideTabs] = useState(defaultSideTabs)
  const [mainTab, setMainTab] = useState(0)
  const [sideTab, setSideTab] = useState(0)

  return (
    <SplitViewContext.Provider value={[mainTabs, setMainTabs]}>
        <DragDropContext onDragEnd={({ source, destination }) => {
            if (destination == null) return;
            if (source.droppableId === "main" && destination.droppableId === "main") {
                const newTabs = [...mainTabs];
                const draggedTab = newTabs.splice(source.index, 1)[0];
                newTabs.splice(destination.index, 0, draggedTab);
                setMainTabs(newTabs);
                setMainTab(destination.index)
            } else if (source.droppableId === "side" && destination.droppableId === "side") {
                const newTabs = [...sideTabs];
                const draggedTab = newTabs.splice(source.index, 1)[0];
                newTabs.splice(destination.index, 0, draggedTab);
                setSideTabs(newTabs);
                setSideTab(destination.index)
            } else if (source.droppableId === "main" && destination.droppableId === "side") {
                const newMainTabs = [...mainTabs];
                const newSideTabs = [...sideTabs];
                const draggedTab = newMainTabs.splice(source.index, 1)[0];
                newSideTabs.splice(destination.index, 0, draggedTab);
                setMainTabs(newMainTabs);
                setSideTabs(newSideTabs);
                setMainTab((source.index - 1).clamp(0, newMainTabs.length - 1));
                setSideTab(destination.index);
            } else if (source.droppableId === "side" && destination.droppableId === "main") { 
                const newMainTabs = [...mainTabs];
                const newSideTabs = [...sideTabs];
                const draggedTab = newSideTabs.splice(source.index, 1)[0];
                newMainTabs.splice(destination.index, 0, draggedTab);
                setMainTabs(newMainTabs);
                setSideTabs(newSideTabs);
                setSideTab((source.index - 1).clamp(0, newMainTabs.length - 1));
                setMainTab(destination.index);
            }           
        }}>
        <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={35}>
                <TabContext value={mainTab}>
                    <Stack direction="row" sx={{ position: "sticky", top: 0, width: "100%", zIndex: 100, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        {accessories}
                        <Droppable droppableId="main" direction="horizontal"> 
                            {(droppable) => (
                            <TabList 
                                ref={droppable.innerRef}
                                {...droppable.droppableProps}
                                variant="scrollable" 
                                textColor="inherit"
                                scrollButtons="auto"
                                allowScrollButtonsMobile 
                                TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
                                onChange={(event, newValue) => setMainTab(newValue)}
                            >
                                {mainTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => 
                                <DraggableTab
                                    label={k}
                                    index={i}
                                    value={i}
                                    key={i}
                                    child={<TabWithMenu 
                                    onClose={() => {
                                        setMainTabs(prev => prev.filter((x2, i2) => i2 !== i))
                                    }}
                                    onMove={() => {
                                        setMainTabs(prev => prev.filter((x2, i2) => i2 !== i))
                                        setSideTabs(prev => [...prev, {[k]: v}])
                                    }}
                                    />}
                                />
                                )}
                                {droppable ? droppable.placeholder : null}
                            </TabList>
                            )}
                        </Droppable>
                    </Stack>
                    <Box sx={{ overflowY: 'auto', height: "100%" }}>
                        {mainTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => (
                            <TabPanel sx={{ p: 0 }} key={i} value={i}>{tabsDirectory[k](v)}</TabPanel>
                        ))}
                    </Box>
                </TabContext>
            </Panel>
            {(!isMobile && sideTabs.length > 0) && 
                <PanelResizeHandle>
                    <Box sx={{ bgcolor: "primary.main", width: "8px", height: "100%" }} />
                </PanelResizeHandle>
            }
            {(!isMobile && sideTabs.length > 0) &&
                <Panel collapsible defaultSize={50} minSize={35} collapsedSize={0}>
                    <TabContext value={sideTab}>
                        <Stack direction="row" sx={{ position: "sticky", top: 0, width: "100%", zIndex: 100, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            <Droppable droppableId="side" direction="horizontal"> 
                            {(droppable) => (
                                <TabList 
                                    ref={droppable.innerRef}
                                    {...droppable.droppableProps}
                                    variant="scrollable" 
                                    textColor="inherit"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile 
                                    TabIndicatorProps={{ style: { backgroundColor: '#fff' }}}
                                    onChange={(event, newValue) => setSideTab(newValue)}
                                >
                                    {sideTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => 
                                        <DraggableTab
                                        label={k}
                                        index={i}
                                        value={i}
                                        key={i}
                                        child={<TabWithMenu 
                                            onClose={() => {
                                            setSideTabs(prev => prev.filter((x2, i2) => i2 !== i))
                                            }}
                                            onMove={() => {
                                            setMainTabs(prev => [...prev, {[k]: v}])
                                            setSideTabs(prev => prev.filter((x2, i2) => i2 !== i))
                                            }}
                                        />}
                                        />
                                    )}
                                    {droppable ? droppable.placeholder : null}
                                </TabList>
                            )}
                            </Droppable>
                        </Stack>
                        <Box sx={{ overflowY: 'auto', height: "100%" }}>
                            {sideTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => (
                                <TabPanel sx={{ p: 0 }} key={i} value={i}>{tabsDirectory[k](v)}</TabPanel>
                            ))}
                        </Box>
                    </TabContext>
                </Panel>
            }
        </PanelGroup>
        </DragDropContext>
    </SplitViewContext.Provider>
  )
}
