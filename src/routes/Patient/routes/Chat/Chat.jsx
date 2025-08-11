import React, { useState } from "react";
import { Typography, Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ChatPanel from "./components/ChatPanel.jsx";
import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
import SpeechToSpeech from "./components/SpeechToSpeech.jsx";

export default function Chat() {
  const [tab, setTab] = useState("chat")
  return (
      <TabContext value={tab}>
        {/* Left: BICEP Logo */}
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "secondary.main", px: 2 }}>
        BICEP CHAT
        </Typography>
        <TabList 
            variant="scrollable" 
            textColor="inherit"
            scrollButtons="auto"
            allowScrollButtonsMobile 
            onChange={(event, newValue) => setTab(newValue)}
        >
            <Tab value="chat" label="LLM Chat" />
            <Tab value="voice" label="Speech Mode" />
        </TabList>
        <Box sx={{ overflowY: 'auto' }}>
            <TabPanel sx={{ p: 0 }} value="chat">
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <ChatPanel />
                  </Box>
                  <Box sx={{ width: "300px", flexShrink: 0 }}>
                    <PatientInfoPanel />
                  </Box>
                </Box>
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value="voice">
                <SpeechToSpeech />
            </TabPanel>
        </Box>
      </TabContext>
  )
}
