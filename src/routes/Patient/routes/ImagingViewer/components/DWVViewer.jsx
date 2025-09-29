import React, { useEffect, useState, useCallback, useRef } from 'react'; 
import { 
    Menu, 
    MenuItem, 
    Box, 
    LinearProgress 
} from '@mui/material'; 
import { 
    App 
} from 'dwv'; 
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
    const [metaData, setMetaData] = useState({}); 
    const [selectedTool, setSelectedTool] = useState('Scroll'); 
    const [contextMenu, setContextMenu] = useState(null); 
     
    useEffect(() => { 
        const app = new App() 
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
            } 
        }) 

        const listeners = { 
            'loadstart': () => { 
                setLoadProgress(0) 
                setDataLoaded(false) 
            },  
            'loadprogress':  (event) => { 
                setLoadProgress(event.loaded)
            },  
            'load': (event) => { 
                setMetaData(app.getMetaData(event.dataid)) 
                setDataLoaded(true) 
                // Re-enable and correctly use fitToContainer
                app.fitToContainer()
            }, 
            'error': (event) => { 
                console.error(event) 
            }, 
            'abort': (event) => { 
                // silent... 
            }, 
            'renderend': () => { 
                // silent... 
            } 
        } 

        for (const [key, value] of Object.entries(listeners)) 
            app.addEventListener(key, value) 

        // Load images
        if (images && images.length > 0) {
            if (images[0]?.startsWith?.("data:image/")) {
                image2DICOM(images[0], true).then(image => {
                    app.loadFiles([new File([image], "file.dcm", { type: "application/dicom" })])
                })
                //app.loadFiles([b64ToFile(images[0])])
            } else {
                app.loadURLs(images)
            }
        }

        app.setTool('Scroll') 
        setSelectedTool('Scroll') 

        return () => { 
            app?.abortAllLoads() 
            app?.removeDataViewConfig("*", viewerId) 
            app?.reset() 
            for (const [key, value] of Object.entries(listeners)) 
                app?.removeEventListener(key, value) 
            setDwvApp(null) 
        } 
    }, []) 

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
                    position: 'relative', 
                    // Set a fixed height for the container
                    height: '600px', // Adjust this value as needed
                    padding: '20px', 
                    boxSizing: 'border-box', 
                    backgroundColor: '#000', 
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