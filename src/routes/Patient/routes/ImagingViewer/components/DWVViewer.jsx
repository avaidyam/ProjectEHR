import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Menu,
    MenuItem,
    Box,
    LinearProgress,
    IconButton,
    styled
} from '@mui/material';
import {
    App,
    decoderScripts
} from 'dwv';

decoderScripts.jpeg2000 = `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpeg2000.js`;
decoderScripts['jpeg-lossless'] = `${process.env.PUBLIC_URL}/assets/dwv/decoders/rii-mango/decode-jpegloss.js`;
decoderScripts['jpeg-baseline'] = `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpegbaseline.js`;
decoderScripts.rle = `${process.env.PUBLIC_URL}/assets/dwv/decoders/dwv/decode-rle.js`;

/**
 * Convert a base64 url to an ArrayBuffer.
 */
export function b64ToFile(str) {
    const parts = str.split(';base64,');
    const byteChars = window.atob(parts[1]);
    const buf = new ArrayBuffer(byteChars.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = byteChars.length; i < strLen; i++) {
      bufView[i] = byteChars.charCodeAt(i);
    }

    const type = parts[0].replace("data:", "")
    return new File([new Blob([buf])], type.replace('/', '.'), { type })
}

const LayerGroup = styled('div')({
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
});

const ContentWrapper = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden', 
});

const CloseButton = styled(IconButton)({
    position: 'absolute',
    right: 8,
    top: 8,
    color: 'white',
    zIndex: 1,
});

const BlackMenu = styled(Menu)({
    '& .MuiPaper-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', 
    },
    '& .MuiMenuItem-root': {
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        },
        '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.5)', 
        },
    },
});

const DWVViewer = ({ images, viewerId }) => {
    const [dwvApp, setDwvApp] = useState(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [selectedTool, setSelectedTool] = useState('Scroll');
    const [contextMenu, setContextMenu] = useState(null);
    
    // Use refs to track the current app instance and prevent race conditions
    const currentAppRef = useRef(null);
    const isInitializingRef = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        // Prevent multiple concurrent initializations
        if (isInitializingRef.current) {
            return;
        }

        isInitializingRef.current = true;

        // Clean up any existing app first
        if (currentAppRef.current) {
            try {
                currentAppRef.current.reset();
            } catch (error) {
                // Silent cleanup
            }
            currentAppRef.current = null;
        }

        // Clear the DOM element to ensure clean state
        const element = document.getElementById(viewerId);
        if (element) {
            // Clear any existing content
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }

        const app = new App();
        currentAppRef.current = app;
        
        try {
            app.init({
                dataViewConfigs: { '*': [{ divId: viewerId}] },
                tools: {
                    Scroll: {},
                    ZoomAndPan: {},
                    WindowLevel: {},
                    Draw: {
                        options: ['Ruler']
                    }
                },
                workerScripts: decoderScripts
            });

            // Only set up event listeners if component is still mounted
            if (!mountedRef.current) {
                app.reset();
                currentAppRef.current = null;
                isInitializingRef.current = false;
                return;
            }

            app.addEventListener('loadstart', () => {
                if (mountedRef.current) {
                    setLoadProgress(0);
                    setDataLoaded(false);
                }
            });

            app.addEventListener('loadprogress', (event) => {
                if (mountedRef.current) {
                    setLoadProgress(event.loaded);
                }
            });

            app.addEventListener('load', (event) => {
                if (mountedRef.current) {
                    setMetaData(app.getMetaData(event.dataid));
                    setDataLoaded(true);
                }
            });

            app.addEventListener('error', (event) => {
                // Handle error silently
            });

            app.addEventListener('abort', (event) => {
                // Handle abort silently
            });

            app.addEventListener('renderend', () => {
                // Render completed
            });

            // Load images
            if (images && images.length > 0) {
                if (images[0]?.startsWith?.("data:")) {
                    app.loadFiles([b64ToFile(images[0])]);
                } else {
                    app.loadURLs(images);
                }
            }

            // Only update state if component is still mounted
            if (mountedRef.current) {
                setDwvApp(app);
                app.setTool('Scroll');
                setSelectedTool('Scroll');
            }

        } catch (error) {
            if (currentAppRef.current) {
                currentAppRef.current.reset();
                currentAppRef.current = null;
            }
        }

        isInitializingRef.current = false;

        // Cleanup function
        return () => {
            if (currentAppRef.current) {
                try {
                    currentAppRef.current.reset();
                } catch (error) {
                    // Silent cleanup
                }
                currentAppRef.current = null;
            }
            setDwvApp(null);
        };
    }, [images, viewerId]);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (currentAppRef.current) {
                try {
                    currentAppRef.current.reset();
                } catch (error) {
                    // Silent cleanup
                }
                currentAppRef.current = null;
            }
        };
    }, [viewerId]);

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null,
        );
    }, [contextMenu]);

    const handleToolChange = (tool) => {
        if (tool && dwvApp && currentAppRef.current === dwvApp) {
            setSelectedTool(tool);
            dwvApp.setTool(tool);
            if (tool === 'Draw') {
                dwvApp.setToolFeatures({shapeName: 'Ruler'});
            }
        }
        setContextMenu(null);
    };

    return (
        <ContentWrapper>
            <LinearProgress variant="determinate" value={loadProgress} />
            <LayerGroup id={viewerId} onContextMenu={handleContextMenu} />
            <BlackMenu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }>
                <MenuItem onClick={() => handleToolChange('Scroll')} disabled={!dataLoaded}>
                    Scroll
                </MenuItem>
                <MenuItem onClick={() => handleToolChange('ZoomAndPan')} disabled={!dataLoaded}>
                    Zoom and Pan
                </MenuItem>
                <MenuItem onClick={() => handleToolChange('WindowLevel')} disabled={!dataLoaded}>
                    Window Level
                </MenuItem>
                <MenuItem onClick={() => handleToolChange('Draw')} disabled={!dataLoaded}>
                    Draw
                </MenuItem>
            </BlackMenu>
        </ContentWrapper>
    );
};

export default DWVViewer;
