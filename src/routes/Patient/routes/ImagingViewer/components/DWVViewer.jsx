import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Menu,
    MenuItem,
    LinearProgress
} from '@mui/material';
import { App } from 'dwv';
import { Box } from '../../../../../components/ui/Core.jsx';

import { Buffer } from 'buffer';
import { Jimp } from "jimp";
import dcmjs from "dcmjs";
const { DicomDict, DicomMetaDictionary, datasetToDict } = dcmjs.data

// ONLY WORKS IN NODEJS ENVIRONMENT!
// channels = 4 = RGBA, 3 = RGB, 1 = MONOCHROME
function convertImageBuffer(source, width, height, inChannels = 3, outChannels = 1) {
    if (outChannels === 2 || inChannels === 2)
        return source // error! 
    if (outChannels >= inChannels) 
        return source // error! 
    const buf = Buffer.alloc(width * height * outChannels)
    for (let i = 0, j = 0; i < source.length; i += inChannels) {
        const R = source[i + 0]
        const G = source[i + 1]
        const B = source[i + 2]
        if (outChannels === 1) { // Rec.709 conversion
            buf[j++] = Math.round((R * 0.2126) + (G * 0.7152) + (B * 0.0722))
        } else {
            buf[j++] = R
            buf[j++] = G
            buf[j++] = B
        }
    }
    return buf
}

// FIXME: this should ideally be performed at upload-time not render-time!
async function image2DICOM(input, monochrome = true, compression = false) {
    let image = await Jimp.read(input)
    let buffer = null
    if (compression) {
        if (monochrome)
            image = image.greyscale()
        buffer = await image.getBuffer("image/jpeg", { quality: 99 })
    } else {
        buffer = convertImageBuffer(image.bitmap.data, image.width, image.height, 4, 1)
    }
    const dataset = {
        _meta: {
            TransferSyntaxUID: {
                Value: [compression ? "1.2.840.10008.1.2.4.50" : "1.2.840.10008.1.2.1"],
            },
        },
        Rows: image.height,
        Columns: image.width,
        BitsAllocated: 8,
        BitsStored: 8,
        HighBit: 7,
        SamplesPerPixel: monochrome ? 1 : 3,
        PixelRepresentation: 0,
        PlanarConfiguration: 0,
        PhotometricInterpretation: monochrome ? "MONOCHROME2" : "RGB",
        PixelData: buffer,
    }
    return new Blob([datasetToDict(dataset).write()], { type: 'application/dicom' })
}

function blob2b64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

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
    const viewerRef = React.useRef(null);

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

        // For auto-resizing the view when parent bounds change
        const observer = new ResizeObserver((entries) => app.onResize())
        if (viewerRef.current) {
            observer.observe(viewerRef.current)
        }

        // Load images
        if (images && images.length > 0) {
            console.log(`DWVViewer(${viewerId}): Attempting to load ${images.length} images.`);
            if (images[0]?.startsWith?.("data:image/")) {
                image2DICOM(images[0], true).then(image => {
                    app.loadFiles([new File([image], "file.dcm", { type: "application/dicom" })])
                })
                //app.loadFiles([b64ToFile(images[0])])
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
            observer.disconnect()
        };
    }, [viewerRef, viewerId, images]);

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
            {loadProgress < 100 && 
                <LinearProgress variant="determinate" value={loadProgress} sx={{ position: 'absolute', top: "50%", width: '100%' }} />
            }
            <Box 
                id={viewerId} 
                ref={viewerRef}
                onContextMenu={handleContextMenu} 
                sx={{
                    width: '100%',
                    height: '100%',
                    "& .viewLayer": {
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