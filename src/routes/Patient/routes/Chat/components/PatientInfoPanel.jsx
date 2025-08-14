import React from "react"
import { Paper, Typography, Box } from "@mui/material";

export default function PatientInfoPanel() {
  const patient = {
    name: "John Miller",
    dob: "August 15, 1969",
    complaint: "Chest pain",
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: "100%",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Patient Information
        </Typography>

        <Typography><strong>Name:</strong> {patient.name}</Typography>
        <Typography><strong>DOB:</strong> {patient.dob}</Typography>
        <Typography><strong>Chief Complaint:</strong> {patient.complaint}</Typography>
      </Box>

      <Box
        mt={4}
        p={2}
        sx={{
          bgcolor: "info.light",
          borderLeft: "4px solid",
          borderColor: "info.main",
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          💡 Tip to Get Started
        </Typography>
        <Typography variant="body2">
          Say: “Hi this is Dr. ___, can you confirm your full name and date of birth?”
        </Typography>
      </Box>
    </Paper>
  );
}
