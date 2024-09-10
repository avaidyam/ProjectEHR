import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    AppBar,
    Typography,
    IconButton,
    Stack,
    LinearProgress,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    Slide,
    Toolbar,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ContrastIcon from '@mui/icons-material/Contrast';
import SearchIcon from '@mui/icons-material/Search';
import StraightenIcon from '@mui/icons-material/Straighten';
import { styled } from '@mui/system';
import {
    App,
    decoderScripts
} from 'dwv';

// Define worker scripts paths
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

const AppBarStyled = styled(AppBar)({
    position: 'relative',
});

const ContentWrapper = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden', 
});

const ButtonWrapper = styled(Box)({
    display: 'flex',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '8px', 
    paddingBottom: '8px'
});

const DWVViewer = ({ open, onClose, images }) => {
    const [dwvApp, setDwvApp] = useState(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [selectedTool, setSelectedTool] = useState('Scroll');

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
                // Remove this line to prevent automatic tool selection
                // setSelectedTool(app.canScroll() ? 'Scroll' : 'ZoomAndPan');
            });

            app.loadURLs(images);
            setDwvApp(app);

            // Set the initial tool to 'Scroll' and update the state
            app.setTool('Scroll');
            setSelectedTool('Scroll');

            return () => {
                app.reset();
                setDwvApp(null);
            };
        }
    }, [open, images]);

    const handleToolChange = (event, newTool) => {
        if (newTool && dwvApp) {
            setSelectedTool(newTool);
            dwvApp.setTool(newTool);
            if (newTool === 'Draw') {
                dwvApp.setToolFeatures({shapeName: 'Ruler'});
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullScreen fullWidth TransitionComponent={Slide}>
            <AppBarStyled>
                <Toolbar>
                    <IconButton color="inherit" onClick={onClose} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                        DICOM Viewer
                    </Typography>
                </Toolbar>
            </AppBarStyled>

            <ContentWrapper>
                <LinearProgress variant="determinate" value={loadProgress} />

                <ButtonWrapper>
                    <ToggleButtonGroup size="small" color="primary" value={selectedTool} exclusive onChange={handleToolChange}>
                        <ToggleButton
                            value="Scroll"
                            title="Scroll"
                            disabled={!dataLoaded}
                            sx={{
                                backgroundColor: 'grey', 
                                '&.Mui-selected': {
                                    backgroundColor: 'white', 
                                },
                                '&:hover': {
                                    backgroundColor: 'lightgrey', 
                                },
                            }}
                        >
                            <MenuIcon />
                        </ToggleButton>
                        <ToggleButton
                            value="ZoomAndPan"
                            title="ZoomAndPan"
                            disabled={!dataLoaded}
                            sx={{
                                backgroundColor: 'grey', 
                                '&.Mui-selected': {
                                    backgroundColor: 'white', 
                                },
                                '&:hover': {
                                    backgroundColor: 'grey', 
                                },
                            }}
                        >
                            <SearchIcon />
                        </ToggleButton>
                        <ToggleButton
                            value="WindowLevel"
                            title="WindowLevel"
                            disabled={!dataLoaded}
                            sx={{
                                backgroundColor: 'grey', 
                                '&.Mui-selected': {
                                    backgroundColor: 'white', 
                                },
                                '&:hover': {
                                    backgroundColor: 'grey', 
                                },
                            }}
                        >
                            <ContrastIcon />
                        </ToggleButton>
                        <ToggleButton
                            value="Draw"
                            title="Draw"
                            disabled={!dataLoaded}
                            sx={{
                                backgroundColor: 'grey', 
                                '&.Mui-selected': {
                                    backgroundColor: 'white', 
                                },
                                '&:hover': {
                                    backgroundColor: 'grey', 
                                },
                            }}
                        >
                            <StraightenIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </ButtonWrapper>

                <LayerGroup id="layerGroup0"></LayerGroup>

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
