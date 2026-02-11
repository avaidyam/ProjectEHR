import React, { useState, useCallback } from 'react';
import { Popover, Switch, Slider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Label, Button, Icon, Stack, IconButton, Menu, MenuItem, Divider, Grid } from 'components/ui/Core';
import { usePatient } from 'components/contexts/PatientContext';
import { DICOMViewer } from './components/DICOMViewer';

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
}: {
  data: any;
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
  viewOptions: any;
  onToggleViewOption: (option: string) => void;
  selectedViewMode: string;
  onViewModeChange: (mode: string) => void;
  onPresetSelect?: (preset: any) => void;
}) => {
  const [layoutAnchorEl, setLayoutAnchorEl] = useState<HTMLElement | null>(null);
  const [hoverLayout, setHoverLayout] = useState<string | null>(null);
  const [showHideAnchorEl, setShowHideAnchorEl] = useState<HTMLElement | null>(null);
  const [presetsAnchorEl, setPresetsAnchorEl] = useState<HTMLElement | null>(null);
  const [viewModeAnchorEl, setViewModeAnchorEl] = useState<HTMLElement | null>(null);

  const [fps, setFps] = useState(20);
  const [fpsAnchorEl, setFpsAnchorEl] = useState<HTMLElement | null>(null);
  const handleFpsClick = (event: React.MouseEvent<HTMLElement>) => setFpsAnchorEl(event.currentTarget);
  const handleFpsClose = () => setFpsAnchorEl(null);
  const handleFpsChange = (event: any, newValue: any) => setFps(newValue);

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

  const handlePresetsClick = (event: React.MouseEvent<HTMLElement>) => setPresetsAnchorEl(event.currentTarget);
  const handlePresetsClose = () => setPresetsAnchorEl(null);

  const handleViewModeClick = (event: React.MouseEvent<HTMLElement>) => setViewModeAnchorEl(event.currentTarget);
  const handleViewModeClose = () => setViewModeAnchorEl(null);
  const handleViewModeSelectLocal = (mode: string) => {
    onViewModeChange(mode);
    handleViewModeClose();
  };

  const openLayoutMenu = (event: React.MouseEvent<HTMLElement>) => setLayoutAnchorEl(event.currentTarget);
  const closeLayoutMenu = () => {
    setLayoutAnchorEl(null);
    setHoverLayout(null);
  };
  const handleGridHover = (rows: number, cols: number) => setHoverLayout(`${rows}x${cols}`);
  const handleGridSelect = (rows: number, cols: number) => {
    onLayoutChange(`${rows}x${cols}`);
    closeLayoutMenu();
  };

  const handleShowHideClick = (event: React.MouseEvent<HTMLElement>) => setShowHideAnchorEl(event.currentTarget);
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
        borderColor: 'divider',
        overflowX: 'auto'
      }}
    >
      <Stack spacing={0} sx={{ flexShrink: 0 }}>
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
        <IconButton onClick={handleFpsClick} title={`${fps} FPS`}>
          <Icon>speed</Icon>
        </IconButton>
        <Popover
          open={Boolean(fpsAnchorEl)}
          anchorEl={fpsAnchorEl}
          onClose={handleFpsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Label variant="caption" sx={{ mb: 1, whiteSpace: 'pre-line', textAlign: 'center', fontWeight: 'bold' }}>
              {`FPS\n${fps}`}
            </Label>
            <Slider
              orientation="vertical"
              value={fps}
              onChange={handleFpsChange}
              min={1}
              max={60}
            />
          </Box>
        </Popover>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Button
        variant="outlined"
        size="small"
        disabled
        endIcon={<Icon>arrow_drop_down</Icon>}
        sx={{ flexShrink: 0 }}
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

const ImagingThumbnail = ({ index, isSelected, onClick }: { index: number; isSelected: boolean; onClick: () => void }) => (
  <Box
    draggable
    onDragStart={(e: any) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ index }));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={onClick}
    sx={{
      minWidth: 100,
      height: 100,
      position: 'relative',
      border: isSelected ? '2px solid' : '1px solid',
      borderColor: isSelected ? 'primary.main' : 'divider',
      cursor: 'grab',
      backgroundColor: 'background.paper',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '&:hover': { borderColor: 'text.primary' },
      '&:active': { cursor: 'grabbing' }
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

const ImagingThumbnailGrid = ({ images, onSeriesSelect }: { images: any[]; onSeriesSelect: (series: any) => void }) => (
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
    {images.map((series: any, index: number) => {
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

const ToolSelectMenu = ({ anchorEl, onToolChange }: { anchorEl: any; onToolChange: (tool: string | null) => void }) => (
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
  onDrop,
  data,
}: {
  viewerId: string;
  images: any[];
  convertMonochrome?: boolean;
  viewOptions: any;
  onDrop?: (data: any) => void;
  data: any;
}) => {
  const { useChart } = usePatient();
  const [chart] = (useChart() as any)();
  const [selectedTool, setSelectedTool] = useState('Scroll');
  const [contextMenu, setContextMenu] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const zoom = settings.zoom ? settings.zoom.toFixed(2) : '1.00';
  const ww = settings.ww ? Math.round(settings.ww) : 100;
  const wl = settings.wl ? Math.round(settings.wl) : 100;

  const handleViewerUpdate = useCallback((newSettings: any) => {
    setSettings((prev: Record<string, any>) => {
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null,
    );
  };

  const handleToolChange = (tool: string | null) => {
    if (tool) {
      setSelectedTool(tool);
    }
    setContextMenu(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (onDrop) {
        onDrop(data);
      }
    } catch (error) {
      console.error('Failed to parse dropped data', error);
    }
  };

  return (
    <Box
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
      <DICOMViewer
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

      {/* Stack Slider (Vertical) */}
      {viewOptions.showStackSlider && (
        <Stack
          alignItems="center"
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            height: '50%',
            zIndex: 1,
            opacity: 0.5,
            '&:hover': {
              opacity: 1.0
            }
          }}
        >
          <Label variant="caption" sx={{ mb: 1, fontWeight: 'bold' }}>10</Label>
          <Box
            sx={{
              flexGrow: 1,
              width: 6,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {/* Custom Thumb/Handle */}
            <Slider
              orientation="vertical"
              valueLabelDisplay="auto"
              defaultValue={1}
              min={1}
              max={10}
              sx={{
                padding: 0,
                color: 'transparent',
                '& .MuiSlider-thumb': {
                  width: 8,
                  height: 24,
                  bgcolor: 'text.primary',
                  borderRadius: 0,
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: 'text.secondary'
                  }
                },
                '& .MuiSlider-track': { display: 'none' },
                '& .MuiSlider-rail': { display: 'none' },
                '& .MuiSlider-valueLabel': {
                  left: 'auto',
                  right: -10,
                  top: 10,
                  '&:before': { display: 'none' }
                }
              }}
            />
          </Box>
          <Label variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>1</Label>
        </Stack>
      )}

      {/* Scale Overlay */}
      {viewOptions.showAnnotationOverlays && (
        <Stack
          alignItems="center"
          sx={{
            position: 'absolute',
            top: '50%',
            right: 16,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
            height: '50%'
          }}
        >
          <Label variant="caption" sx={{ mb: 0.5 }}>1 cm</Label>
          <Box
            sx={{
              width: 10,
              flexGrow: 1,
              borderRight: '1px solid white',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                right: 0,
                width: 6,
                height: "1px",
                backgroundColor: 'white',
                transform: 'translateY(-50%)'
              }
            }}
          />
        </Stack>
      )
      }
      <ToolSelectMenu
        anchorEl={contextMenu}
        onToolChange={handleToolChange}
      />
    </Box >
  );
};

export const ImagingViewer = ({ data, viewerId, convertMonochrome }: { data: any; viewerId: string; convertMonochrome?: boolean }) => {
  const basePath = './img/Anonymized_20240903/series-00001/';
  const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
  const images = data?.image ? [data?.image] : dicomFiles;

  const [currentLayout, setCurrentLayout] = useState('1x1'); // "rows x cols"
  const [currentRows, currentCols] = (currentLayout || '1x1').split('x').map(Number);

  // Refactored state to track images per viewer index
  const [viewerImages, setViewerImages] = useState<Record<number, any[]>>({ 0: images });

  const handleSeriesSelect = (seriesFiles: any) => {
    // For now, clicking a thumbnail updates the first viewer (or active if we had one)
    setViewerImages(prev => ({ ...prev, 0: seriesFiles }));
  };

  const handleDrop = (viewerIndex: number, { index: sourceIndex }: { index: number }) => {
    const selectedItem = images[sourceIndex];
    if (selectedItem) {
      const seriesFiles = images.length === 1 ? [selectedItem] : selectedItem;
      setViewerImages((prev: Record<number, any[]>) => ({ ...prev, [viewerIndex]: seriesFiles }));
    }
  };
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
      <Stack sx={{ height: '100%', width: '100%', overflow: 'hidden', color: 'text.secondary' }}>
        <Box sx={{ flexShrink: 0 }}>
          <ImagingToolbar
            data={data}
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
            viewOptions={viewOptions}
            onToggleViewOption={(option: string) => setViewOptions((prev: any) => ({ ...prev, [option]: !prev[option] }))}
            selectedViewMode={selectedViewMode}
            onViewModeChange={setSelectedViewMode}
          />
          {viewOptions.showThumbnails && (
            <ImagingThumbnailGrid
              images={images}
              onSeriesSelect={handleSeriesSelect}
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
              images={viewerImages[index] || []}
              convertMonochrome={convertMonochrome}
              viewOptions={viewOptions}
              onDrop={(data: any) => handleDrop(index, data)}
              data={data}
            />
          ))}
        </Grid>
      </Stack>
    </ThemeProvider>
  );
};
