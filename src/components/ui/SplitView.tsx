import * as React from 'react'
import { ErrorBoundary } from "react-error-boundary";
import { Box, Stack, Menu, MenuItem, IconButton, Tab, useMediaQuery, useTheme, alpha } from '@mui/material'
import { SplitViewContext, SplitViewProvider, TabObject, TabsDirectory, SplitViewContextType } from '../contexts/SplitViewContext';
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps, DockviewApi, IDockviewPanelHeaderProps } from 'dockview-react';

// Additional extension to Math prototype for clamp
declare global {
  interface Number {
    clamp(min: number, max: number): number;
  }
}

if (!Number.prototype.clamp) {
  Number.prototype.clamp = function (min: number, max: number): number {
    return Math.min(Math.max(this as number, min), max);
  };
}

// FIXME: CustomTab doesn't re-render when props.api.isActive changes!
// FIXME: The dockview divider can't be customized!

const CustomTab = (props: IDockviewPanelHeaderProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isSelected, setSelected] = React.useState(props.api.isActive)
  React.useEffect(() => setSelected(props.api.isActive), [props.api.isActive])

  const onMove = () => {
    const groups = props.containerApi.groups;
    const currentGroup = props.api.group;
    const targetGroup = groups.find(g => g !== currentGroup) || groups[0];

    props.api.moveTo({ group: targetGroup });
  };

  return (
    <>
      <Tab
        label={props.api.title}
        {...(isSelected && { selected: true })}
        onContextMenu={(event) => {
          event.preventDefault();
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          whiteSpace: 'nowrap',
          minHeight: 48,
          height: 48,
        }}
        style={{ marginLeft: "-8px", marginRight: "-8px" }}
        iconPosition="end"
        icon={
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
            sx={{
              color: 'inherit',
              visibility: isSelected ? 'visible' : 'hidden'
            }}
            style={{ marginLeft: "-8px", marginRight: "-16px" }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>expand_more</span>
          </IconButton>
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { onMove(); setAnchorEl(null); }}>
          {props.api.group === props.containerApi.groups[0] ? 'Move to Sidebar' : 'Move to Main'}
        </MenuItem>
        <MenuItem onClick={() => { props.api.close(); setAnchorEl(null); }}>Close</MenuItem>
      </Menu>
    </>
  );
};

export const SplitView = ({ defaultMainTabs, defaultSideTabs, overflowMenuTabs = [], tabsDirectory, accessories, ...props }: {
  defaultMainTabs: TabObject[];
  defaultSideTabs: TabObject[];
  overflowMenuTabs?: TabObject[];
  tabsDirectory: TabsDirectory;
  accessories?: React.ReactNode;
}) => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'))
  const [api, setApi] = React.useState<DockviewApi>();

  const [mainTabs, setMainTabs] = React.useState<TabObject[]>(defaultMainTabs)
  const [sideTabs, setSideTabs] = React.useState<TabObject[]>(defaultSideTabs)
  const [selectedMainTab, setSelectedMainTab] = React.useState(0)
  const [selectedSideTab, setSelectedSideTab] = React.useState(0)
  const [overflowMenuAnchor, setOverflowMenuAnchor] = React.useState<null | HTMLElement>(null)

  const dockviewComponents = React.useMemo(() => {
    const comps: any = {};
    for (const [key, Renderer] of Object.entries(tabsDirectory)) {
      comps[key] = (props: IDockviewPanelProps) => (
        <ErrorBoundary fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.paper', color: 'text.primary' }}>⚠️ Something went wrong</Box>}>
          <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
            {Renderer(props.params)}
          </Box>
        </ErrorBoundary>
      );
    }
    return comps;
  }, [tabsDirectory]);

  const updateStateFromApi = React.useCallback(() => {
    if (!api) return;

    // We expect exactly two groups if possible, but at least one.
    // Dockview might merge them if empty and not configured otherwise, 
    // but we'll try to find panels by their group association.
    const groups = api.groups;
    if (groups.length === 0) return;

    const mainGroup = groups[0];
    const sideGroup = groups[1];

    const newMainTabs = mainGroup.panels.map(p => ({ [p.id]: p.params }));
    setMainTabs(newMainTabs);

    const newSideTabs = sideGroup ? sideGroup.panels.map(p => ({ [p.id]: p.params })) : [];
    setSideTabs(newSideTabs);

    const activePanel = api.activePanel;
    if (activePanel) {
      if (activePanel.group === mainGroup) {
        setSelectedMainTab(mainGroup.panels.indexOf(activePanel));
      } else if (sideGroup && activePanel.group === sideGroup) {
        setSelectedSideTab(sideGroup.panels.indexOf(activePanel));
      }
    }
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    const disposables = [
      api.onDidAddPanel(updateStateFromApi),
      api.onDidRemovePanel(updateStateFromApi),
      api.onDidActivePanelChange(updateStateFromApi),
      api.onDidLayoutChange(updateStateFromApi) // Catch group movements/merges
    ];
    return () => disposables.forEach(d => d.dispose());
  }, [api, updateStateFromApi]);

  const closeTab = React.useCallback((name: string, pane: "main" | "side" | null = null): boolean => {
    if (!api) return false;
    const panel = api.getPanel(name);
    if (panel) {
      api.removePanel(panel);
      return true;
    }
    return false;
  }, [api]);

  const closeMainTab = React.useCallback((index: number) => {
    // Note: with Dockview, the user might have moved tabs around.
    // We'll try to find the panel from the main group's index.
    if (api && api.groups[0] && api.groups[0].panels[index]) {
      api.removePanel(api.groups[0].panels[index]);
    }
  }, [api]);

  const closeSideTab = React.useCallback((index: number) => {
    if (api && api.groups[1] && api.groups[1].panels[index]) {
      api.removePanel(api.groups[1].panels[index]);
    }
  }, [api]);

  const openTab = React.useCallback((name: string, data: any, pane: "main" | "side" = "main", selectIfExists = true): number => {
    if (!api) return -1;
    const existingPanel = api.getPanel(name);
    if (existingPanel) {
      if (selectIfExists) {
        existingPanel.api.setActive();
      }
      return api.panels.indexOf(existingPanel);
    }

    // Ensure we have at least one group (main)
    if (api.groups.length === 0) api.addGroup();

    // Ensure we have a second group (side) if requested
    if (pane === 'side' && api.groups.length === 1) {
      api.addGroup({ direction: 'right' });
    }

    const referenceGroup = pane === 'side' ? api.groups[1] : api.groups[0];

    const panel = api.addPanel({
      id: name,
      component: name,
      title: name,
      params: data,
      position: { referenceGroup }
    });

    if (panel && selectIfExists) {
      panel.api.setActive();
    }
    return api.panels.length - 1;
  }, [api]);

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);

    // Create the two primary groups immediately
    const mainGroup = event.api.addGroup();
    const sideGroup = event.api.addGroup({ direction: 'right' });

    // Load main tabs into the first group
    defaultMainTabs.forEach((tab) => {
      const title = Object.keys(tab)[0];
      const data = tab[title];
      event.api.addPanel({
        id: title,
        component: title,
        title: title,
        params: data,
        position: { referenceGroup: mainGroup }
      });
    });

    // Load side tabs into the second group
    defaultSideTabs.forEach((tab) => {
      const title = Object.keys(tab)[0];
      const data = tab[title];
      event.api.addPanel({
        id: title,
        component: title,
        title: title,
        params: data,
        position: { referenceGroup: sideGroup }
      });
    });
  };

  const RightHeaderActions = ({ group }: { group: any }) => {
    const { openTab, mainTabs, sideTabs } = React.useContext(SplitViewContext);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', px: 0.5 }}>
        <IconButton
          size="small"
          sx={{ color: 'common.white', p: 0.5 }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>more_vert</span>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          {(() => {
            const currentMainTabNames = mainTabs.flatMap((x: TabObject) => Object.keys(x));
            const currentSideTabNames = sideTabs.flatMap((x: TabObject) => Object.keys(x));

            const closedDefaultMainTabs = defaultMainTabs
              .flatMap((x: TabObject) => Object.entries(x))
              .filter(([name]) => !currentMainTabNames.includes(name))
              .map(([name, data]) => ({ name, data, pane: "main" as const }));

            const closedDefaultSideTabs = defaultSideTabs
              .flatMap((x: TabObject) => Object.entries(x))
              .filter(([name]) => !currentSideTabNames.includes(name))
              .map(([name, data]) => ({ name, data, pane: "side" as const }));

            const overflowTabs = (overflowMenuTabs || [])
              .flatMap((x: TabObject) => Object.entries(x))
              .filter(([name]) => !currentMainTabNames.includes(name) && !currentSideTabNames.includes(name))
              .map(([name, data]) => ({ name, data, pane: "main" as const }));

            const allClosedDefaultTabs = [...closedDefaultMainTabs, ...closedDefaultSideTabs, ...overflowTabs];

            if (allClosedDefaultTabs.length === 0) {
              return <MenuItem disabled>No closed tabs</MenuItem>;
            }

            return allClosedDefaultTabs.map(({ name, data, pane }) => (
              <MenuItem
                key={name}
                onClick={() => {
                  openTab(name, data, pane, false);
                  setAnchorEl(null);
                }}
              >
                {name}
              </MenuItem>
            ));
          })()}
        </Menu>
      </Box>
    );
  };

  const PrefixHeaderActions = ({ group }: { group: any }) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', px: 0.5 }}>
        {accessories}
      </Box>
    );
  };

  const providerState = {
    mainTabs, setMainTabs,
    sideTabs, setSideTabs,
    selectedMainTab, setSelectedMainTab,
    selectedSideTab, setSelectedSideTab,
    closeMainTab,
    closeSideTab,
    closeTab,
    openTab,
  };

  return (
    <SplitViewProvider value={providerState}>
      <Box
        sx={(theme) => ({
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '--dv-paneview-active-outline-color': theme.palette.primary.main,
          '--dv-tabs-and-actions-container-font-size': '13px',
          '--dv-tabs-and-actions-container-height': '48px',
          '--dv-tab-close-icon': '"close"',
          '--dv-drag-over-background-color': alpha(theme.palette.primary.main, 0.12),
          '--dv-drag-over-border-color': theme.palette.primary.main,
          '--dv-tabs-container-scrollbar-color': alpha(theme.palette.text.primary, 0.2),
          '--dv-group-view-background-color': theme.palette.background.default,
          '--dv-tabs-and-actions-container-background-color': theme.palette.primary.main,
          '--dv-activegroup-visiblepanel-tab-background-color': 'transparent',
          '--dv-activegroup-hiddenpanel-tab-background-color': 'transparent',
          '--dv-inactivegroup-visiblepanel-tab-background-color': 'transparent',
          '--dv-inactivegroup-hiddenpanel-tab-background-color': 'transparent',
          '--dv-tab-divider-color': 'transparent',
          '--dv-activegroup-visiblepanel-tab-color': theme.palette.primary.contrastText,
          '--dv-activegroup-hiddenpanel-tab-color': alpha(theme.palette.primary.contrastText, 0.7),
          '--dv-inactivegroup-visiblepanel-tab-color': alpha(theme.palette.primary.contrastText, 0.6),
          '--dv-inactivegroup-hiddenpanel-tab-color': alpha(theme.palette.primary.contrastText, 0.4),
          '--dv-separator-border': theme.palette.divider,
          '--dv-paneview-header-border-color': theme.palette.divider,
          '--dv-icon-hover-background-color': alpha(theme.palette.common.white, 0.1),
          '--dv-floating-box-shadow': theme.shadows[8],
          '--dv-active-sash-color': theme.palette.primary.main,
          '--dv-background-color': theme.palette.background.default,
        })}
      >
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <DockviewReact
            components={dockviewComponents}
            defaultTabComponent={CustomTab}
            onReady={onReady}
            prefixHeaderActionsComponent={PrefixHeaderActions}
            rightHeaderActionsComponent={RightHeaderActions}
            theme={{
              name: 'mui-theme',
              className: 'dockview-theme-mui',
              gap: 0,
              dndOverlayMounting: 'absolute' as const,
              dndPanelOverlay: 'group' as const,
            }}
          />
        </Box>
      </Box>
    </SplitViewProvider>
  )
}
