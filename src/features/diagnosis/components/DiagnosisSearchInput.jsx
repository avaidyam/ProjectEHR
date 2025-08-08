import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

const DiagnosisSearchInput = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = parseInt(searchParams.get('tab') || '0');
    const urlSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const urlUpdateTimeoutRef = useRef(null);

    // Sync with URL changes
    useEffect(() => {
        setSearchTerm(urlSearch);
    }, [urlSearch]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear previous timeout
        if (urlUpdateTimeoutRef.current) {
            clearTimeout(urlUpdateTimeoutRef.current);
        }

        const updateURL = () => {
            const newParams = new URLSearchParams(searchParams);
            if (value.trim()) {
                newParams.set('search', value);
            } else {
                newParams.delete('search');
            }
            setSearchParams(newParams, { replace: true });
        };

        if (activeTab === 2) {
            // Database tab: Debounce URL updates to prevent excessive API calls
            urlUpdateTimeoutRef.current = setTimeout(updateURL, 300);
        } else {
            // Browse & Preference tabs: Immediate URL updates for instant local filtering
            updateURL();
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (urlUpdateTimeoutRef.current) {
                clearTimeout(urlUpdateTimeoutRef.current);
            }
        };
    }, []);

    return (
        <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            slotProps={{
                input: {
                    endAdornment: (
                        <IconButton size="small">
                            <SearchIcon />
                        </IconButton>
                    ),
                },
            }}
        />
    );
};

export default DiagnosisSearchInput; 