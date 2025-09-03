import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Menu,
    MenuItem,
    Box,
    LinearProgress
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

const DWVViewer = ({ images, viewerId }) => {
    const [dwvApp, setDwvApp] = useState(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [selectedTool, setSelectedTool] = useState('Scroll');
    const [contextMenu, setContextMenu] = useState(null);
    
    useEffect(() => {
        console.log(`called useeffect with ${dwvApp}!`)

        const app = new App();
        setDwvApp(app)
        
        app.init({
            dataViewConfigs: { '*': [{ divId: viewerId }] },
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

        app.addEventListener('loadstart', () => {
            setLoadProgress(0);
            setDataLoaded(false);
        });

        app.addEventListener('loadprogress', (event) => {
            setLoadProgress(event.loaded);
        });

        app.addEventListener('load', (event) => {
            setMetaData(app.getMetaData(event.dataid));
            setDataLoaded(true);
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

        app.setTool('Scroll');
        setSelectedTool('Scroll');

        return () => {
            console.log(`called cleanup with ${app}!`)
            app?.reset()
            setDwvApp(null)
            document.getElementById(viewerId)?.replaceChildren([])
        };
    }, []);

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null,
        );
    }, [contextMenu]);

    const handleToolChange = (tool) => {
        setSelectedTool(tool);
        dwvApp.setTool(tool);
        if (tool === 'Draw') {
            dwvApp.setToolFeatures({shapeName: 'Ruler'});
        }
        setContextMenu(null);
    };

    return (
        <Box>
            <LinearProgress variant="determinate" value={loadProgress} />
            <Box 
                id={viewerId} 
                onContextMenu={handleContextMenu} 
                sx={{
                    display: 'inline-block',
                    position: 'relative',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    backgroundColor: '#000',
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
