import React, { useState, useCallback } from 'react';
import { Popover, Switch } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Label, Button, Icon, Stack, IconButton, Menu, MenuItem, Divider, Grid } from 'components/ui/Core.jsx';
import { usePatient } from 'components/contexts/PatientContext.jsx';
import { DWVViewer } from './components/DWVViewer.jsx';

const dicomTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#000000', paper: '#1c1c1c' },
  },
});

const ImagingToolbar = ({
  data,
  currentLayout,
  onLayoutChange,
  viewOptions,
  onToggleViewOption,
  selectedViewMode,
  onViewModeChange,
  onPresetSelect
}) => {
  const [layoutAnchorEl, setLayoutAnchorEl] = useState(null);
  const [hoverLayout, setHoverLayout] = useState(null);
  const [showHideAnchorEl, setShowHideAnchorEl] = useState(null);
  const [presetsAnchorEl, setPresetsAnchorEl] = useState(null);
  const [viewModeAnchorEl, setViewModeAnchorEl] = useState(null);

  const viewModes = ['2D', 'MPR', '3D 4:1', '3D 6:1', 'Curved MPR'];

  const presets = [
    { name: 'Arterial', ww: 750, wl: 250 },
    { name: 'Bone', ww: 3077, wl: 570 },
    { name: 'Brain Sinus', ww: 155, wl: 42 },
    { name: 'Cervical Spine', ww: 195, wl: 111 },
    { name: 'Chest Abdomen', ww: 342, wl: 56 },
    { name: 'CT Lumbar Spine', ww: 877, wl: 108 },
    { name: 'Extremity', ww: 342, wl: 56 },
    { name: 'Femur', ww: 727, wl: 747 },
    { name: 'Foot', ww: 958, wl: 455 },
    { name: 'Liver', ww: 109, wl: 93 },
    { name: 'Lung', ww: 1465, wl: -498 },
    { name: 'Std', ww: 400, wl: 40 },
  ];

  const handlePresetsClick = (event) => setPresetsAnchorEl(event.currentTarget);
  const handlePresetsClose = () => setPresetsAnchorEl(null);

  const handleViewModeClick = (event) => setViewModeAnchorEl(event.currentTarget);
  const handleViewModeClose = () => setViewModeAnchorEl(null);
  const handleViewModeSelectLocal = (mode) => {
    onViewModeChange(mode);
    handleViewModeClose();
  };

  const openLayoutMenu = (event) => setLayoutAnchorEl(event.currentTarget);
  const closeLayoutMenu = () => {
    setLayoutAnchorEl(null);
    setHoverLayout(null);
  };
  const handleGridHover = (rows, cols) => setHoverLayout(`${rows}x${cols}`);
  const handleGridSelect = (rows, cols) => {
    onLayoutChange(`${rows}x${cols}`);
    closeLayoutMenu();
  };

  const handleShowHideClick = (event) => setShowHideAnchorEl(event.currentTarget);
  const handleShowHideClose = () => setShowHideAnchorEl(null);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        padding: '8px 16px',
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={0}>
        <Label variant="subtitle2" bold sx={{ color: 'text.primary', lineHeight: 1.2 }}>{data?.date}</Label>
        <Label variant="body2" sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{data?.test}</Label>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack direction="row" spacing={1}>
        <IconButton title="Layout" onClick={openLayoutMenu}><Icon>grid_view</Icon></IconButton>
        <IconButton title="Global Stack"><Icon>layers</Icon></IconButton>
        <Divider orientation="vertical" flexItem />
        <IconButton title="Show/Hide" onClick={handleShowHideClick}><Icon>toggle_on</Icon></IconButton>
        <IconButton title="Localizer Lines"><Icon>person</Icon></IconButton>
        <IconButton title="Linked Scrolling"><Icon>link</Icon></IconButton>

        {/* Show/Hide Menu */}
        <Menu
          anchorEl={showHideAnchorEl}
          open={Boolean(showHideAnchorEl)}
          onClose={handleShowHideClose}
          PaperProps={{ sx: { minWidth: 200 } }}
        >
          <MenuItem onClick={() => onToggleViewOption('showImageText')}>
            <Label sx={{ flexGrow: 1 }}>Image Text</Label>
            <Switch checked={viewOptions.showImageText} size="small" />
          </MenuItem>
          <MenuItem onClick={() => onToggleViewOption('showAnnotationOverlays')}>
            <Label sx={{ flexGrow: 1 }}>Annotation Overlays</Label>
            <Switch checked={viewOptions.showAnnotationOverlays} size="small" />
          </MenuItem>
          <MenuItem onClick={() => onToggleViewOption('showThumbnails')}>
            <Label sx={{ flexGrow: 1 }}>Thumbnails</Label>
            <Switch checked={viewOptions.showThumbnails} size="small" />
          </MenuItem>
          <MenuItem onClick={() => onToggleViewOption('showStackSlider')}>
            <Label sx={{ flexGrow: 1 }}>Stack Slider</Label>
            <Switch checked={viewOptions.showStackSlider} size="small" />
          </MenuItem>
          <MenuItem onClick={() => onToggleViewOption('show3DControls')}>
            <Label sx={{ flexGrow: 1 }}>3D Controls</Label>
            <Switch checked={viewOptions.show3DControls} size="small" />
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={layoutAnchorEl}
          open={Boolean(layoutAnchorEl)}
          onClose={closeLayoutMenu}
        >
          <Box sx={{ padding: 1, minWidth: 150 }}>
            <Label variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
              {hoverLayout || currentLayout}
            </Label>
            <Stack spacing={0.5}>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <Stack key={rowIndex} direction="row" spacing={0.5}>
                  {Array.from({ length: 6 }).map((_, colIndex) => {
                    const r = rowIndex + 1;
                    const c = colIndex + 1;

                    // Determine highlight state based on hover or current selection
                    const [hoverR, hoverC] = (hoverLayout || currentLayout).split('x').map(Number);
                    const isActive = r <= hoverR && c <= hoverC;

                    return (
                      <Box
                        key={`${rowIndex}-${colIndex}`}
                        onMouseEnter={() => handleGridHover(r, c)}
                        onClick={() => handleGridSelect(r, c)}
                        sx={{
                          width: 20,
                          height: 20,
                          border: isActive ? '1px solid' : '1px solid',
                          borderColor: isActive ? 'primary.main' : 'divider',
                          bgcolor: isActive ? 'primary.dark' : 'transparent',
                          cursor: 'pointer',
                          opacity: isActive ? 0.3 : 1,
                          '&:hover': {
                            bgcolor: 'primary.light',
                            opacity: 0.2
                          }
                        }}
                      />
                    );
                  })}
                </Stack>
              ))}
            </Stack>
          </Box>
        </Menu>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Stack direction="row" spacing={1}>
        <IconButton disabled><Icon>skip_previous</Icon></IconButton>
        <IconButton disabled><Icon>play_arrow</Icon></IconButton>
        <IconButton disabled><Icon>skip_next</Icon></IconButton>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Button
        variant="outlined"
        size="small"
        disabled
        endIcon={<Icon>arrow_drop_down</Icon>}
      >
        Study Actions
      </Button>
      <Divider orientation="vertical" flexItem />
      <Button
        variant="outlined"
        size="small"
        onClick={handleViewModeClick}
        endIcon={<Icon>arrow_drop_down</Icon>}
      >
        {selectedViewMode}
      </Button>
      <Menu
        anchorEl={viewModeAnchorEl}
        open={Boolean(viewModeAnchorEl)}
        onClose={handleViewModeClose}
        PaperProps={{ sx: { minWidth: 150 } }}
      >
        {viewModes.map((mode) => (
          <MenuItem key={mode} onClick={() => handleViewModeSelectLocal(mode)} selected={mode === selectedViewMode}>
            <Label>{mode}</Label>
          </MenuItem>
        ))}
      </Menu>
      <IconButton title="Window/Level Presets" onClick={handlePresetsClick}><Icon>tune</Icon></IconButton>
      <Menu
        anchorEl={presetsAnchorEl}
        open={Boolean(presetsAnchorEl)}
        onClose={handlePresetsClose}
        PaperProps={{ sx: { minWidth: 200, maxHeight: 400 } }}
      >
        {presets.map((preset) => (
          <MenuItem key={preset.name} onClick={handlePresetsClose}>
            <Label sx={{ flexGrow: 1, pr: 1 }}>{preset.name}</Label>
            <Label variant="caption" sx={{ color: 'text.secondary' }}>{`${preset.ww}×${preset.wl}`}</Label>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};

const ImagingThumbnail = ({ index, isSelected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      minWidth: 100,
      height: 100,
      position: 'relative',
      border: isSelected ? '2px solid' : '1px solid',
      borderColor: isSelected ? 'primary.main' : 'divider',
      cursor: 'pointer',
      backgroundColor: 'background.paper',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '&:hover': { borderColor: 'text.primary' }
    }}
  >
    {/* Simulate Image Content */}
    <Icon sx={{ color: 'text.secondary', fontSize: 40 }}>image</Icon>

    {/* Overlays */}
    <Box sx={{ position: 'absolute', top: 2, left: 4, zIndex: 1 }}>
      <Label variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>CT</Label>
    </Box>
    <Box sx={{ position: 'absolute', top: 2, right: 4, zIndex: 1 }}>
      <Label variant="caption" sx={{ fontSize: '0.7rem' }}>1</Label>
    </Box>
    <Box sx={{ position: 'absolute', bottom: 2, left: 4, zIndex: 1 }}>
      <Label variant="caption" sx={{ fontSize: '0.65rem' }}>S{index + 1}</Label>
    </Box>
    <Box sx={{ position: 'absolute', bottom: 2, right: 4, zIndex: 1 }}>
      <Label variant="caption" sx={{ fontSize: '0.65rem' }}>100%</Label>
    </Box>
  </Box>
);

const ImagingThumbnailGrid = ({ images, onSeriesSelect }) => (
  <Stack
    direction="row"
    spacing={0.5}
    sx={{
      overflowX: 'auto',
      p: 0.5,
      backgroundColor: 'background.default',
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&::-webkit-scrollbar': { height: '8px' },
      '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: '4px' }
    }}
  >
    {images.map((series, index) => {
      const isSelected = index === 0;
      return (
        <ImagingThumbnail
          key={index}
          index={index}
          isSelected={isSelected}
          onClick={() => onSeriesSelect(images.length === 1 ? [series] : series)}
        />
      );
    })}
  </Stack>
);

const ToolSelectMenu = ({ anchorEl, onToolChange }) => (
  <Popover
    open={anchorEl !== null}
    onClose={() => onToolChange(null)}
    anchorReference="anchorPosition"
    anchorPosition={
      anchorEl !== null
        ? { top: anchorEl.mouseY, left: anchorEl.mouseX }
        : undefined
    }
    PaperProps={{
      sx: {
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 4,
        p: 1
      }
    }}
  >
    <Grid sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
      <IconButton onClick={() => onToolChange('WindowLevel')}><Icon>brightness_6</Icon></IconButton>
      <IconButton onClick={() => onToolChange('ZoomAndPan')}><Icon>search</Icon></IconButton>
      <IconButton onClick={() => onToolChange('ZoomAndPan')}><Icon>open_with</Icon></IconButton>
      <IconButton onClick={() => onToolChange('Draw')}><Icon>straighten</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>architecture</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>collections</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>timeline</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>share</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>view_week</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>gesture</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>control_camera</Icon></IconButton>
      <IconButton onClick={() => onToolChange(null)}><Icon>refresh</Icon></IconButton>
    </Grid>
  </Popover>
);

const ImageView = ({
  viewerId,
  images,
  convertMonochrome,
  viewOptions,
  data,
}) => {
  const { useChart } = usePatient();
  const [chart] = useChart()();
  const [selectedTool, setSelectedTool] = useState('Scroll');
  const [contextMenu, setContextMenu] = useState(null);
  const [settings, setSettings] = useState({});

  const zoom = settings.zoom ? settings.zoom.toFixed(2) : '1.00';
  const ww = settings.ww ? Math.round(settings.ww) : 100;
  const wl = settings.wl ? Math.round(settings.wl) : 100;

  const handleViewerUpdate = useCallback((newSettings) => {
    setSettings(prev => {
      // Avoid unnecessary updates if values haven't changed significantly
      if (
        Math.abs((prev.ww || 0) - newSettings.ww) < 0.1 &&
        Math.abs((prev.wl || 0) - newSettings.wl) < 0.1 &&
        Math.abs((prev.zoom || 0) - newSettings.zoom) < 0.01
      ) {
        return prev;
      }
      return newSettings;
    });
  }, []);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null,
    );
  };

  const handleToolChange = (tool) => {
    if (tool) {
      setSelectedTool(tool);
    }
    setContextMenu(null);
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'text.primary',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <DWVViewer
        images={images}
        viewerId={viewerId}
        convertMonochrome={convertMonochrome}
        tool={selectedTool}
        onUpdate={handleViewerUpdate}
      />

      {viewOptions.showImageText && (
        <>
          {/* Top Left */}
          <Stack sx={{ position: 'absolute', top: 0, left: 0, p: 1, pointerEvents: 'none', zIndex: 1 }}>
            <Label variant="caption" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              {`${chart?.lastName ?? '?'}, ${chart?.firstName ?? '?'}`.toUpperCase()}
            </Label>
            <Label variant="caption">{`${chart?.id || '???????'}`}</Label>
            <Label variant="caption">{chart?.gender?.[0] ?? "?"} {chart?.birthdate || '??/??/????'}</Label>
            <Label variant="caption">Zoom Factor: {zoom}</Label>
          </Stack>

          {/* Top Right */}
          <Stack alignItems="flex-end" sx={{ position: 'absolute', top: 0, right: 0, p: 1, pointerEvents: 'none', zIndex: 1 }}>
            <Label variant="caption">Series 1 Image 1</Label>
            <Label variant="caption">120 kV 335 mA</Label>
          </Stack>

          {/* Bottom Left */}
          <Stack sx={{ position: 'absolute', bottom: 0, left: 0, p: 1, pointerEvents: 'none', zIndex: 1 }}>
            <Label variant="caption">NCCT</Label>
            <Label variant="caption">{data?.test || '?'}</Label>
            <Label variant="caption">{data?.date || '??/??/????'}</Label>
            <Label variant="caption">CC-CT3</Label>
            <Label variant="caption">Hospital</Label>
          </Stack>

          {/* Bottom Right */}
          <Stack alignItems="flex-end" sx={{ position: 'absolute', bottom: 0, right: 0, p: 1, pointerEvents: 'none', zIndex: 1 }}>
            <Label variant="caption">FOV: 220</Label>
            <Label variant="caption">512x512</Label>
            <Label variant="caption">WW: {ww} WL: {wl}</Label>
          </Stack>
        </>
      )}
      <ToolSelectMenu
        anchorEl={contextMenu}
        onToolChange={handleToolChange}
      />
    </Box>
  );
};

export const ImagingViewer = ({ data, viewerId, convertMonochrome }) => {
  const basePath = './img/Anonymized_20240903/series-00001/';
  const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
  const images = data?.image ? [data?.image] : dicomFiles;

  const [currentLayout, setCurrentLayout] = useState('1x1'); // "rows x cols"
  const [currentRows, currentCols] = (currentLayout || '1x1').split('x').map(Number);
  const [currentImageSet, setCurrentImageSet] = useState(images);
  const [selectedViewMode, setSelectedViewMode] = useState('2D');
  const [viewOptions, setViewOptions] = useState({
    showImageText: true,
    showAnnotationOverlays: true,
    showThumbnails: true,
    showStackSlider: true,
    show3DControls: true,
  });

  return (
    <ThemeProvider theme={dicomTheme}>
      <Stack elevation={3} sx={{ height: '100%', width: '100%', overflow: 'hidden', color: 'text.secondary' }}>
        <Box sx={{ flexShrink: 0 }}>
          <ImagingToolbar
            data={data}
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
            viewOptions={viewOptions}
            onToggleViewOption={(option) => setViewOptions(prev => ({ ...prev, [option]: !prev[option] }))}
            selectedViewMode={selectedViewMode}
            onViewModeChange={setSelectedViewMode}
          />
          {viewOptions.showThumbnails && (
            <ImagingThumbnailGrid
              images={images}
              onSeriesSelect={(seriesFiles) => setCurrentImageSet(seriesFiles)}
            />
          )}
        </Box>
        <Grid sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: `repeat(${currentRows}, 1fr)`,
          gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
          gap: '1px',
          bgcolor: 'background.paper'
        }}>
          {Array.from({ length: currentRows * currentCols }).map((_, index) => (
            <ImageView
              key={index}
              viewerId={`${viewerId}-${index}`}
              images={currentImageSet}
              convertMonochrome={convertMonochrome}
              viewOptions={viewOptions}
              data={data}
            />
          ))}
        </Grid>
      </Stack>
    </ThemeProvider>
  );
};
