import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Menu,
    MenuItem,
    Box,
    LinearProgress
} from '@mui/material';
import { App } from 'dwv';

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

const DWVViewer = ({ images, viewerId }) => {
    const [dwvApp, setDwvApp] = useState(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    useEffect(() => {
        console.log(`DWVViewer(${viewerId}): Component mounted or viewerId/images changed. Initializing DWV app...`);
        
        const app = new App();
        setDwvApp(app);

        app.init({
            dataViewConfigs: { '*': [{ divId: viewerId }] },
            tools: {
                Scroll: {},
                ZoomAndPan: {},
                WindowLevel: {},
                Draw: {
                    options: ['Ruler']
                }
            }
        });

        const listeners = {
            'loadstart': () => {
                console.log(`DWVViewer(${viewerId}): Load start event triggered.`);
                setLoadProgress(0);
                setDataLoaded(false);
            }, 
            'loadprogress': (event) => {
                console.log(`DWVViewer(${viewerId}): Load progress: ${event.loaded}%`);
                setLoadProgress(event.loaded);
            }, 
            'load': (event) => {
                console.log(`DWVViewer(${viewerId}): Load finished successfully.`);
                // get a handle on the data, not strictly needed but good practice
                // const data = app.getData(event.dataId);
                setDataLoaded(true);
                app.fitToContainer();
            },
            'error': (event) => {
                console.error(`DWVViewer(${viewerId}): An error occurred during loading.`, event);
            },
            'abort': () => {
                console.log(`DWVViewer(${viewerId}): Load aborted.`);
            },
            'renderend': () => {
                console.log(`DWVViewer(${viewerId}): Render finished.`);
            }
        };

        for (const [key, value] of Object.entries(listeners)) {
            app.addEventListener(key, value);
        }

        // Load images
        if (images && images.length > 0) {
            console.log(`DWVViewer(${viewerId}): Attempting to load ${images.length} images.`);
            if (images[0]?.startsWith?.("data:")) {
                app.loadFiles([b64ToFile(images[0])]);
            } else {
                app.loadURLs(images);
            }
        }

        app.setTool('Scroll');

        return () => {
            console.log(`DWVViewer(${viewerId}): Component unmounting. Cleaning up...`);
            app?.abortAllLoads();
            app?.removeDataViewConfig("*", viewerId);
            app?.reset();
            for (const [key, value] of Object.entries(listeners)) {
                app?.removeEventListener(key, value);
            }
        };
    }, [viewerId, images]); // Re-run effect if viewerId or images change

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null,
        );
    }, [contextMenu]);

    const handleToolChange = (tool) => {
        if (dwvApp) {
            dwvApp.setTool(tool);
            if (tool === 'Draw') {
                dwvApp.setToolFeatures({shapeName: 'Ruler'});
            }
        }
        setContextMenu(null);
    };

    return (
        <Box 
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <LinearProgress variant="determinate" value={loadProgress} sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
            <Box 
                id={viewerId} 
                onContextMenu={handleContextMenu} 
                sx={{
                    width: '100%',
                    height: '100%',
                    "& .viewLayer": {
                        backgroundColor: '#000',
                        position: 'absolute',
                    },
                    "& .drawLayer": {
                        position: 'absolute',
                    }
                }} 
            />
            <Menu
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
            </Menu>
        </Box>
    );
};

export default DWVViewer;