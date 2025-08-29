import React from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import BrowseTab from './tabs/Browse';
import PreferenceListTab from './tabs/PreferenceList';
import DiagnosisDatabaseTab from './tabs/Database';

const TabContentWrapper = () => {
    const [searchParams] = useSearchParams();

    // Get active tab from URL or default to 0 (Browse)
    const activeTab = parseInt(searchParams.get('tab') || '0');

    // Get search term from URL
    const searchTerm = searchParams.get('search') || '';

    // Only render the active tab component and pass searchTerm only to it
    const renderActiveTab = () => {
        switch (activeTab) {
            case 0:
                return <BrowseTab searchTerm={searchTerm} />;
            case 1:
                return <PreferenceListTab searchTerm={searchTerm} />;
            case 2:
                return <DiagnosisDatabaseTab searchTerm={searchTerm} />;
            default:
                return <BrowseTab searchTerm={searchTerm} />;
        }
    };

    return (
        <Box sx={{ height: '100%' }}>
            {renderActiveTab()}
        </Box>
    );
};

export default TabContentWrapper; 