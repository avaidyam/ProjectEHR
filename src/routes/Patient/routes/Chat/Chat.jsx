import React, { useState } from "react";
import { Label, Box, Tab, TabView, TabList, TabPanel } from 'components/ui/Core.jsx'
import ChatPanel from "./components/ChatPanel.jsx";
import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
import { GeminiAPIProvider } from "./utils/GeminiAPI";
import ControlTray from "./components/ControlTray";
import { XORcrypt } from "util/helpers"

const _API_KEY = `# \u0019\u0004#\u001b-$5\u0016\u0011+<*\u0018\u0001\u001cV\u0003)O!<P\t\u000e&:V\u001fSDTW2(\u000e\u00020`
let _PWD = null

export default function Chat() {
  const [apiKey, setApiKey] = React.useState(_API_KEY)
  const [tab, setTab] = useState("chat")

  React.useEffect(() => {
    if (!_PWD) {
      _PWD = window.prompt("Please enter your authorization code:");
      setApiKey(XORcrypt(_API_KEY, _PWD))
    }
  }, [])

  if (!_PWD)
    return <></>

  return (
    <GeminiAPIProvider options={{ 
      httpOptions: { apiVersion: "v1alpha" },
      apiKey: apiKey, 
      model: "models/gemini-2.5-flash-preview-native-audio-dialog",
      config: {
        speechConfig: { 
          languageCode: "en-US",
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } 
        },
        responseModalities: ["AUDIO"],
        enableAffectiveDialog: true,
        // cannot be enabled with affective dialog simultaneously
        proactivity: { proactiveAudio: true },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: { parts: [{ text: `
          You are a mock patient simulator for medical students.
          You have been waiting in the emergency room for 8 hours and you are exhausted, in pain, and a little bit snappy.
          Do not volunteer any information that the student does not ask you.
          If the student asks you a question that sounds silly or out of touch, respond with a snappy upset reply that this is irrelevant questioning.
          The patient case is as follows: 
            John Hanson, 65 year old male, chief complaint of chest pain. Reports 8/10 dull aching chest pain radiating to his left arm, that began about 8 hours ago, aggravated by exertion and relieved by the baby aspirin he took about 6 hours ago.
          `}]},
        }
     }}>
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
            <ControlTray />
          </TabPanel>
        </Box>
      </TabView>
    </GeminiAPIProvider>
  )
}
