import React, { useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Box, Tab, Stack, Menu, MenuItem, IconButton, useMediaQuery, useTheme } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab';
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

const TabWithMenu = ({ onMove, onClose, isSelected, ...props }) => {
    const [anchorEl, setAnchorEl] = React.useState(null)
    return (
        <>
            <Tab
                onContextMenu={(event) => {
                    event.preventDefault()
                    setAnchorEl(event.currentTarget)
                }}
                sx={{
                    whiteSpace: 'nowrap',
                    minHeight: 48,
                    height: 48,
                    ...props.sx
                }}
                style={{ marginLeft: "-8px", marginRight: "-8px" }}
                {...props}
                iconPosition="end"
                icon={<IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation()
                        setAnchorEl(e.currentTarget)
                    }}
                    sx={{ color: 'inherit', visibility: isSelected ? undefined : "hidden" }}
                    style={{ marginLeft: "-8px", marginRight: "-16px" }}
                >
                    <span className="material-icons">expand_more</span>
                </IconButton>}
            />
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => {
                    onMove()
                    setAnchorEl(null)
                }}>Move to Sidebar</MenuItem>
                <MenuItem onClick={() => {
                    onClose()
                    setAnchorEl(null)
                }}>Close</MenuItem>
            </Menu>
        </>
    )
}

export const SplitView = ({ defaultMainTabs, defaultSideTabs, overflowMenuTabs = [], tabsDirectory, accessories, ...props }) => {
    const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))
    const [isCollapsed, setCollapsed] = useState(false)
    const sidePanelRef = React.useRef(null)

    // FIXME: if isCollapsed=true, display sideTabs alongside mainTabs

    const [mainTabs, setMainTabs] = useState(defaultMainTabs)
    const [sideTabs, setSideTabs] = useState(defaultSideTabs)
    const [selectedMainTab, setSelectedMainTab] = useState(0)
    const [selectedSideTab, setSelectedSideTab] = useState(0)
    const [overflowMenuAnchor, setOverflowMenuAnchor] = useState(null)

    const closeMainTab = (index) => {
        const newTabs = mainTabs.filter((_, i) => i !== index)
        setMainTabs(newTabs)
        setSelectedMainTab(prevSelected => {
            if (newTabs.length === 0) return 0
            if (index === prevSelected) {
                // Closing currently selected tab - select closest neighbor
                return Math.min(index, newTabs.length - 1)
            } else if (index < prevSelected) {
                // Closing a tab before selected - shift index down
                return prevSelected - 1
            }
            return prevSelected
        })
    }

    const closeSideTab = (index) => {
        const newTabs = sideTabs.filter((_, i) => i !== index)
        setSideTabs(newTabs)
        setSelectedSideTab(prevSelected => {
            if (newTabs.length === 0) return 0
            if (index === prevSelected) {
                // Closing currently selected tab - select closest neighbor
                return Math.min(index, newTabs.length - 1)
            } else if (index < prevSelected) {
                // Closing a tab before selected - shift index down
                return prevSelected - 1
            }
            return prevSelected
        })
    }

    /**
     * Close a tab by name
     * @param {string} name - The name of the tab to close
     * @param {"main"|"side"|null} pane - Which pane to search ("main", "side", or null for either)
     * @returns {boolean} - True if a tab was closed, false otherwise
     */
    const closeTab = (name, pane = null) => {
        if (pane === null || pane === "main") {
            const index = mainTabs.findIndex(tab => Object.keys(tab)[0] === name)
            if (index !== -1) {
                closeMainTab(index)
                return true
            }
        }

        if (pane === null || pane === "side") {
            const index = sideTabs.findIndex(tab => Object.keys(tab)[0] === name)
            if (index !== -1) {
                closeSideTab(index)
                return true
            }
        }

        return false
    }

    /**
     * Open a tab, or select it if it already exists
     * @param {string} name - The name of the tab
     * @param {any} data - The data to pass to the tab
     * @param {"main"|"side"} pane - Which pane to open in ("main" or "side")
     * @param {boolean} selectIfExists - If true and tab exists, select it instead of opening duplicate
     * @returns {number} - The index of the opened/selected tab
     */
    const openTab = (name, data, pane = "main", selectIfExists = true) => {
        if (pane === "main") {
            const existingIndex = mainTabs.findIndex(tab => Object.keys(tab)[0] === name)
            if (existingIndex !== -1 && selectIfExists) {
                setSelectedMainTab(existingIndex)
                return existingIndex
            }

            const newTab = { [name]: data }
            setMainTabs(prev => [...prev, newTab])
            const newIndex = mainTabs.length
            setSelectedMainTab(newIndex)
            return newIndex
        } else if (pane === "side") {
            const existingIndex = sideTabs.findIndex(tab => Object.keys(tab)[0] === name)
            if (existingIndex !== -1 && selectIfExists) {
                setSelectedSideTab(existingIndex)
                return existingIndex
            }

            const newTab = { [name]: data }
            setSideTabs(prev => [...prev, newTab])
            const newIndex = sideTabs.length
            setSelectedSideTab(newIndex)
            return newIndex
        }

        return -1
    }

    const providerState = {
        mainTabs, setMainTabs,
        sideTabs, setSideTabs,
        selectedMainTab, setSelectedMainTab,
        selectedSideTab, setSelectedSideTab,
        closeMainTab,
        closeSideTab,
        closeTab,
        openTab,
    }

    return (
        <SplitViewContext.Provider value={providerState}>
            <DragDropContext onDragEnd={({ source, destination }) => {
                if (destination == null) return;
                if (source.droppableId === "main" && destination.droppableId === "main") {
                    const newTabs = [...mainTabs];
                    const draggedTab = newTabs.splice(source.index, 1)[0];
                    newTabs.splice(destination.index, 0, draggedTab);
                    setMainTabs(newTabs);
                    setSelectedMainTab(destination.index)
                } else if (source.droppableId === "side" && destination.droppableId === "side") {
                    const newTabs = [...sideTabs];
                    const draggedTab = newTabs.splice(source.index, 1)[0];
                    newTabs.splice(destination.index, 0, draggedTab);
                    setSideTabs(newTabs);
                    setSelectedSideTab(destination.index)
                } else if (source.droppableId === "main" && destination.droppableId === "side") {
                    const newMainTabs = [...mainTabs];
                    const newSideTabs = [...sideTabs];
                    const draggedTab = newMainTabs.splice(source.index, 1)[0];
                    newSideTabs.splice(destination.index, 0, draggedTab);
                    setMainTabs(newMainTabs);
                    setSideTabs(newSideTabs);
                    setSelectedMainTab((source.index - 1).clamp(0, newMainTabs.length - 1));
                    setSelectedSideTab(destination.index);
                } else if (source.droppableId === "side" && destination.droppableId === "main") {
                    const newMainTabs = [...mainTabs];
                    const newSideTabs = [...sideTabs];
                    const draggedTab = newSideTabs.splice(source.index, 1)[0];
                    newMainTabs.splice(destination.index, 0, draggedTab);
                    setMainTabs(newMainTabs);
                    setSideTabs(newSideTabs);
                    setSelectedSideTab((source.index - 1).clamp(0, newMainTabs.length - 1));
                    setSelectedMainTab(destination.index);
                }
            }}>
                <PanelGroup direction="horizontal" onLayout={(layout) => setCollapsed(layout[1] === 0)}>
                    <Panel defaultSize={65} minSize={35}>
                        <TabContext value={selectedMainTab}>
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                                TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
                                                onChange={(event, newValue) => setSelectedMainTab(newValue)}
                                            >
                                                {mainTabs.flatMap(x => Object.entries(x)).map(([k, v], i) =>
                                                    <DraggableTab
                                                        label={k}
                                                        index={i}
                                                        value={i}
                                                        key={i}
                                                        child={<TabWithMenu
                                                            isSelected={selectedMainTab === i}
                                                            onClose={() => closeMainTab(i)}
                                                            onMove={() => {
                                                                setMainTabs(prev => prev.filter((x2, i2) => i2 !== i))
                                                                setSideTabs(prev => [...prev, { [k]: v }])
                                                            }}
                                                        />}
                                                    />
                                                )}
                                                {droppable ? droppable.placeholder : null}
                                            </TabList>
                                        )}
                                    </Droppable>
                                    <IconButton
                                        size="small"
                                        sx={{ color: 'inherit', borderRadius: 1, ml: 'auto' }}
                                        onClick={(e) => setOverflowMenuAnchor(e.currentTarget)}
                                    >
                                        <span className="material-icons">more_vert</span>
                                    </IconButton>
                                    <Menu
                                        anchorEl={overflowMenuAnchor}
                                        open={!!overflowMenuAnchor}
                                        onClose={() => setOverflowMenuAnchor(null)}
                                    >
                                        {(() => {
                                            const currentMainTabNames = mainTabs.flatMap(x => Object.keys(x));
                                            const currentSideTabNames = sideTabs.flatMap(x => Object.keys(x));

                                            const closedDefaultMainTabs = defaultMainTabs
                                                .flatMap(x => Object.entries(x))
                                                .filter(([name, data]) => !currentMainTabNames.includes(name))
                                                .map(([name, data]) => ({ name, data, pane: "main" }));

                                            const closedDefaultSideTabs = defaultSideTabs
                                                .flatMap(x => Object.entries(x))
                                                .filter(([name, data]) => !currentSideTabNames.includes(name))
                                                .map(([name, data]) => ({ name, data, pane: "side" }));

                                            const overflowTabs = overflowMenuTabs
                                                .flatMap(x => Object.entries(x))
                                                .filter(([name, data]) => !currentMainTabNames.includes(name) && !currentSideTabNames.includes(name))
                                                .map(([name, data]) => ({ name, data, pane: "main" }));

                                            const allClosedDefaultTabs = [...closedDefaultMainTabs, ...closedDefaultSideTabs, ...overflowTabs];

                                            if (allClosedDefaultTabs.length === 0) {
                                                return <MenuItem disabled>No closed tabs</MenuItem>;
                                            }

                                            return allClosedDefaultTabs.map(({ name, data, pane }) => (
                                                <MenuItem
                                                    key={name}
                                                    onClick={() => {
                                                        openTab(name, data, pane, false);
                                                        setOverflowMenuAnchor(null);
                                                    }}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ));
                                        })()}
                                    </Menu>
                                </Stack>
                                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                    {mainTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => (
                                        <TabPanel sx={{ p: 0, height: '100%', overflowY: "auto" }} key={i} value={i}>{tabsDirectory[k](v)}</TabPanel>
                                    ))}
                                </Box>
                            </Box>
                        </TabContext>
                    </Panel>
                    {(!isMobile && sideTabs.length > 0) &&
                        <PanelResizeHandle>
                            <Box
                                sx={{
                                    bgcolor: "primary.main",
                                    width: "8px",
                                    height: "100%",
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        if (sidePanelRef.current) {
                                            if (sidePanelRef.current.isCollapsed()) {
                                                sidePanelRef.current.expand()
                                                setCollapsed(false)
                                            } else {
                                                sidePanelRef.current.collapse()
                                                setCollapsed(true)
                                            }
                                        }
                                    }}
                                    sx={{
                                        bgcolor: "primary.main",
                                        color: "primary.contrastText",
                                        position: "absolute",
                                        padding: "4px",
                                        borderRadius: "4px",
                                        "&:hover": {
                                            bgcolor: "primary.dark"
                                        },
                                        zIndex: 1000,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: 16 }}>
                                        {isCollapsed ? 'chevron_left' : 'chevron_right'}
                                    </span>
                                    {isCollapsed && <span style={{ writingMode: 'vertical-rl', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Sidebar</span>}
                                </IconButton>
                            </Box>
                        </PanelResizeHandle>
                    }
                    {(!isMobile && sideTabs.length > 0) &&
                        <Panel ref={sidePanelRef} collapsible defaultSize={35} minSize={35} collapsedSize={0}>
                            <TabContext value={selectedSideTab}>
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                                    TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
                                                    onChange={(event, newValue) => setSelectedSideTab(newValue)}
                                                >
                                                    {sideTabs.flatMap(x => Object.entries(x)).map(([k, v], i) =>
                                                        <DraggableTab
                                                            label={k}
                                                            index={i}
                                                            value={i}
                                                            key={i}
                                                            child={<TabWithMenu
                                                                isSelected={selectedSideTab === i}
                                                                onClose={() => closeSideTab(i)}
                                                                onMove={() => {
                                                                    setMainTabs(prev => [...prev, { [k]: v }])
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
                                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                        {sideTabs.flatMap(x => Object.entries(x)).map(([k, v], i) => (
                                            <TabPanel sx={{ p: 0, height: '100%', overflowY: "auto" }} key={i} value={i}>{tabsDirectory[k](v)}</TabPanel>
                                        ))}
                                    </Box>
                                </Box>
                            </TabContext>
                        </Panel>
                    }
                </PanelGroup>
            </DragDropContext>
        </SplitViewContext.Provider>
    )
}
