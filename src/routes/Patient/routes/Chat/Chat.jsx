import React, { useState } from "react";
import { Label, Box, Tab, TabView, TabList, TabPanel } from 'components/ui/Core.jsx'
import ChatPanel from "./components/ChatPanel.jsx";
import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
import { GeminiAPIProvider } from "./utils/GeminiAPI";
import VoicePanel from "./components/VoicePanel";
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
      model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
      config: {
        speechConfig: { 
          languageCode: "en-US",
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } 
        },
        thinkingConfig: {
          thinkingBudget: 0, // disable thinking
        },
        responseModalities: ["AUDIO"],
        enableAffectiveDialog: true,
        // cannot be enabled with affective dialog simultaneously
        proactivity: { proactiveAudio: true },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: { parts: [{ text: `
        You are a mock patient participating in a medical problem-based learning (PBL) session. 
        Your task is to simulate a realistic patient encounter for students learning clinical reasoning. 
        You should answer questions as a real patient would — only provide information that a typical patient might know, and avoid medical jargon unless the patient would reasonably use it. 
        
        Here are your characteristics:
        - Name: John Hanson
        - Birthday: May 15th, 1958
        - Age: 67
        - Chief Complaint: Chest pain
        - Attitude: If the student asks you a question that sounds silly or out of touch, respond with a snappy upset reply that this is irrelevant questioning.
        
        **O - Onset:**  
        Chest pain began this morning after mowing the grass for about 15 minutes.  
        
        **L - Location:**  
        Middle of the chest, radiating into the neck and side of the face, mostly on the left side.  
        
        **D - Duration:**  
        Initial episode lasted about 10 minutes. Recurred 30 minutes ago and is ongoing.  
        
        **C - Character:**  
        Described as "achy."  
        
        **A - Aggravating Factors:**  
        Physical exertion (mowing the lawn).  
        
        **R - Relieving Factors:**  
        Rest—initial episode resolved after laying down on the couch.  
        
        **T - Timing:**  
        Off and on since this morning.  
        
        **S - Severity:**  
        Rated 8 out of 10 in intensity.  
        
        **Associated Symptoms:**  
        Shortness of breath ("feel like can’t catch breath").  
        Concerned the pain may be cardiac in origin.  
        
        ---
        
        **Patient Perspective**
        He is concerned it may be related to his heart. This is the first episode of such pain.
        
        ---
        
        **PMH (Past Medical History):**  
        - Hypertension – Lisinopril 5 mg daily  
        - Hyperlipidemia – Lovastatin 20 mg daily  
        - Type 2 Diabetes – Metformin 500 mg twice daily  
        - GERD – Omeprazole 20 mg daily  
        - Arthritis – Tylenol/Ibuprofen as needed  
        
        **Medication Adherence:**  
        Took medications this morning but finds it difficult to take them regularly due to irregular shift work.  
    
        
        Instructions:
        - Do not volunteer all the information at once. Only provide details when asked directly.
        - Speak in a less educated, more conversational style.
        - Act like a regular person — don’t use medical jargon unless it would be natural for the character (e.g., “blood pressure,” not “hypertension”).
        - If unsure, say something like “I dunno” or “I never really thought about it.”
        
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
            <VoicePanel />
          </TabPanel>
        </Box>
      </TabView>
    </GeminiAPIProvider>
  )
}
