import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    Slide,
    Menu,
    MenuItem,
    Box,
    LinearProgress,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import {
    App,
    decoderScripts
} from 'dwv';

decoderScripts.jpeg2000 = `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpeg2000.js`;
decoderScripts['jpeg-lossless'] = `${process.env.PUBLIC_URL}/assets/dwv/decoders/rii-mango/decode-jpegloss.js`;
decoderScripts['jpeg-baseline'] = `${process.env.PUBLIC_URL}/assets/dwv/decoders/pdfjs/decode-jpegbaseline.js`;
decoderScripts.rle = `${process.env.PUBLIC_URL}/assets/dwv/decoders/dwv/decode-rle.js`;

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

const DWVViewer = ({ open, onClose, images }) => {
    const [dwvApp, setDwvApp] = useState(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [selectedTool, setSelectedTool] = useState('Scroll');
    const [contextMenu, setContextMenu] = useState(null);

    useEffect(() => {
        if (open) {
            console.log("Initializing DWV...");

            const app = new App();
            app.init({
                dataViewConfigs: { '*': [{ divId: 'layerGroup0' }] },
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

            app.addEventListener('renderend', () => {
            });

            app.loadURLs(images);
            setDwvApp(app);

            app.setTool('Scroll');
            setSelectedTool('Scroll');

            return () => {
                app.reset();
                setDwvApp(null);
            };
        }
    }, [open, images]);

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null,
        );
    }, [contextMenu]);

    const handleToolChange = (tool) => {
        if (tool && dwvApp) {
            setSelectedTool(tool);
            dwvApp.setTool(tool);
            if (tool === 'Draw') {
                dwvApp.setToolFeatures({shapeName: 'Ruler'});
            }
        }
        setContextMenu(null);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullScreen 
            fullWidth 
            TransitionComponent={Slide}
            className="prevent-default-context-menu"
        >
            <CloseButton onClick={onClose} aria-label="close">
                <CloseIcon />
            </CloseButton>
            <ContentWrapper>
                <LinearProgress variant="determinate" value={loadProgress} />

                <LayerGroup id="layerGroup0" onContextMenu={handleContextMenu}></LayerGroup>

                <BlackMenu
                    open={contextMenu !== null}
                    onClose={() => setContextMenu(null)}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
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
        </Dialog>
    );
};

DWVViewer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    images: PropTypes.array.isRequired,
};

export default DWVViewer;
