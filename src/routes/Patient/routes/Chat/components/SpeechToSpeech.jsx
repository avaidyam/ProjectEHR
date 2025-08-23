import React, { useEffect, useState } from "react"
import { Box, CircularProgress } from "@mui/material";
import { VoiceProvider } from "@humeai/voice-react";
import { fetchAccessToken } from "hume";
import PatientInfoPanel from "./PatientInfoPanel.jsx";
import VoiceCallPanel from "./VoiceCallPanel.jsx";

export default function SpeechToSpeech() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    fetchAccessToken({
      apiKey: '', // FIXME
      secretKey: '', // FIXME
    }).then((token) => setAccessToken(token));
  }, []);

  return !!accessToken ?
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId="e4f8eee2-beff-4fa5-aeca-9172e427f323"
      >
        <Box
            sx={{
            display: { xs: "block", md: "flex" },
            gap: 2,
            height: "calc(100vh - 100px)",
            }}
        >
            <Box sx={{ width: "300px", flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
            <VoiceCallPanel accessToken={accessToken} />
            </Box>
            <Box sx={{ width: "280px", flexShrink: 0 }}>
            <PatientInfoPanel />
            </Box>
        </Box>
        </VoiceProvider> :
    <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
}
