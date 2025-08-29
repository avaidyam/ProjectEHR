import React, { useState } from "react";
import { Label, Box, Tab, TabView, TabList, TabPanel } from 'components/ui/Core.jsx'
import ChatPanel from "./components/ChatPanel.jsx";
import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
import SpeechToSpeech from "./components/SpeechToSpeech.jsx";

export default function Chat() {
  const [tab, setTab] = useState("chat")
  return (
    <TabView value={tab}>
      {/* Left: BICEP Logo */}
      <Label variant="h6" sx={{ fontWeight: "bold", color: "secondary.main", px: 2 }}>
      BICEP CHAT
      </Label>
      <TabList onChange={(event, newValue) => setTab(newValue)}>
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
    </TabView>
  )
}
