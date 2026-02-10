import React from 'react'
import { Alert, Snackbar } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext'

export const EncounterAlert: React.FC = () => {
    const { useEncounter } = usePatient() as any;
    const [orderList] = useEncounter().orders([]) as [any[], any];
    const [currentSlide, setCurrentSlide] = React.useState<number | null>(null)
    const [showSnackbar, setShowSnackbar] = React.useState<boolean>(false)

    const slides = (orderList || []).filter((x: any) => x.name === "__ADVANCE_PATIENT_BICEP_SLIDE__").length
    React.useEffect(() => {
        if (currentSlide === null) {
            setCurrentSlide(slides)
        } else if (slides > currentSlide) {
            setShowSnackbar(true)
            setCurrentSlide(slides)
        }
    }, [slides, currentSlide])

    return (
        <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={showSnackbar}
            onClose={() => setShowSnackbar(false)}
            autoHideDuration={5000}
        >
            <Alert
                onClose={() => setShowSnackbar(false)}
                severity="error"
                variant="filled"
                sx={{ width: '100%' }}
            >
                You have new items to review in the Chart Review tab.
            </Alert>
        </Snackbar>
    );
};
