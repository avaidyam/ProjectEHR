import { Box, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BottomBar = ({ onAddOrder, onAddDx, onSignEncounter }) => {
    return (
        <Box
            sx={{
                borderTop: 1,
                borderColor: 'divider'
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={2}
                py={1}
            >
                <Box display="flex" gap={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onAddOrder}
                    >
                        Add order
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onAddDx}
                    >
                        Add Dx
                    </Button>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        disabled
                        onClick={onSignEncounter}
                    >
                        Sign encounter
                    </Button>
                </Box>
            </Box>
        </Box >
    );
};

export default BottomBar;