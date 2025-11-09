import React from 'react'
import { Box, Alert, Snackbar } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext.jsx'

export const EncounterAlert = ({ ...props }) => {
    const { useChart, useEncounter } = usePatient()
    const [orderList, setOrderList] = useEncounter().orders([])
    const [currentSlide, setCurrentSlide] = React.useState(null)
    const [showSnackbar, setShowSnackbar] = React.useState(false)

    const slides = orderList.filter(x => x.name === "__ADVANCE_PATIENT_BICEP_SLIDE__").length
    React.useEffect(() => {
        if (currentSlide === null) {
            setCurrentSlide(slides)
        } else {
            setShowSnackbar(true)
        }
    }, [slides])

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
