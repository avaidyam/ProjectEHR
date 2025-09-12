import React, { useState } from 'react';
import { Grid, Box } from '../../../../components/ui/Core.jsx';
import DWVViewer from './components/DWVViewer.jsx';
import DWVControls from './components/DWVControls.jsx';

export const ImagingTabContent = ({ selectedRow, viewerId }) => {
    console.log("ImagingTabContent: Component rendering.");
    const basePath = './img/Anonymized_20240903/series-00001/';
    const dicomFiles = Array.from({ length: 21 }, (_, i) => `${basePath}image-${String(i).padStart(5, '0')}.dcm`);
    const images = selectedRow?.data?.image ? [selectedRow?.data?.image] : dicomFiles;

    const [currentLayout, setCurrentLayout] = useState('1x1');
    const [currentImageSet, setCurrentImageSet] = useState(images);

    console.log(`ImagingTabContent: Current layout is ${currentLayout}.`);

    const layoutGridProps = {
        '1x1': { xs: 12 },
        '1x2': { xs: 6 },
        '2x2': { xs: 6 },
    };

    const numViewers = parseInt(currentLayout.charAt(0)) * parseInt(currentLayout.charAt(2));

    const handleSeriesSelection = (seriesFiles) => {
        setCurrentImageSet(seriesFiles);
    };

    return (
        <Box elevation={3} sx={{ padding: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DWVControls
                images={[images]}
                currentLayout={currentLayout}
                onLayoutChange={setCurrentLayout}
                onSelectSeries={handleSeriesSelection}
            />

            <Grid container spacing={1} sx={{ flexGrow: 1, marginTop: 2 }}>
                {Array.from({ length: numViewers }).map((_, index) => (
                    <Grid 
                        item 
                        key={index}
                        {...layoutGridProps[currentLayout]}
                        sx={{
                            height: (numViewers > 2) ? '50%' : '100%',
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            backgroundColor: '#000'
                        }}
                    >
                        <DWVViewer 
                            images={currentImageSet} 
                            viewerId={`${viewerId}-${index}`} 
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ImagingTabContent;