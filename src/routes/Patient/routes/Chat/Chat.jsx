// import React, { useState } from "react";
// import { Label, Box, Tab, TabView, TabList, TabPanel } from 'components/ui/Core.jsx'
// import ChatPanel from "./components/ChatPanel.jsx";
// import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
// import { GeminiAPIProvider } from "./utils/GeminiAPI";
// import VoicePanel from "./components/VoicePanel";
// import { XORcrypt } from "util/helpers"

// const _API_KEY = `# \u0019\u0004#\u001b-$5\u0016\u0011+<*\u0018\u0001\u001cV\u0003)O!<P\t\u000e&:V\u001fSDTW2(\u000e\u00020`
// let _PWD = null

// export default function Chat() {
//   const [apiKey, setApiKey] = React.useState(_API_KEY)
//   const [tab, setTab] = useState("chat")

//   React.useEffect(() => {
//     if (!_PWD) {
//       _PWD = window.prompt("Please enter your authorization code:");
//       setApiKey(XORcrypt(_API_KEY, _PWD))
//     }
//   }, [])

//   if (!_PWD)
//     return <></>

//   return (
//     <GeminiAPIProvider options={{ 
//       httpOptions: { apiVersion: "v1alpha" },
//       apiKey: apiKey, 
//       model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
//       config: {
//         speechConfig: { 
//           languageCode: "en-US",
//           voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } 
//         },
//         thinkingConfig: {
//           thinkingBudget: 0, // disable thinking
//         },
//         responseModalities: ["AUDIO"],
//         enableAffectiveDialog: true,
//         // cannot be enabled with affective dialog simultaneously
//         proactivity: { proactiveAudio: true },
//         inputAudioTranscription: {},
//         outputAudioTranscription: {},
//         systemInstruction: { parts: [{ text: `
//         You are a mock patient participating in a medical problem-based learning (PBL) session. 
//         Your task is to simulate a realistic patient encounter for students learning clinical reasoning. 
//         You should answer questions as a real patient would — only provide information that a typical patient might know, and avoid medical jargon unless the patient would reasonably use it. 
        
//         Here are your characteristics:
//         - Name: John Hanson
//         - Birthday: May 15th, 1958
//         - Age: 67
//         - Chief Complaint: Chest pain
//         - Attitude: If the student asks you a question that sounds silly or out of touch, respond with a snappy upset reply that this is irrelevant questioning.
        
//         **O - Onset:**  
//         Chest pain began this morning after mowing the grass for about 15 minutes.  
        
//         **L - Location:**  
//         Middle of the chest, radiating into the neck and side of the face, mostly on the left side.  
        
//         **D - Duration:**  
//         Initial episode lasted about 10 minutes. Recurred 30 minutes ago and is ongoing.  
        
//         **C - Character:**  
//         Described as "achy."  
        
//         **A - Aggravating Factors:**  
//         Physical exertion (mowing the lawn).  
        
//         **R - Relieving Factors:**  
//         Rest—initial episode resolved after laying down on the couch.  
        
//         **T - Timing:**  
//         Off and on since this morning.  
        
//         **S - Severity:**  
//         Rated 8 out of 10 in intensity.  
        
//         **Associated Symptoms:**  
//         Shortness of breath ("feel like can’t catch breath").  
//         Concerned the pain may be cardiac in origin.  
        
//         ---
        
//         **Patient Perspective**
//         He is concerned it may be related to his heart. This is the first episode of such pain.
        
//         ---
        
//         **PMH (Past Medical History):**  
//         - Hypertension – Lisinopril 5 mg daily  
//         - Hyperlipidemia – Lovastatin 20 mg daily  
//         - Type 2 Diabetes – Metformin 500 mg twice daily  
//         - GERD – Omeprazole 20 mg daily  
//         - Arthritis – Tylenol/Ibuprofen as needed  
        
//         **Medication Adherence:**  
//         Took medications this morning but finds it difficult to take them regularly due to irregular shift work.  
    
        
//         Instructions:
//         - Do not volunteer all the information at once. Only provide details when asked directly.
//         - Speak in a less educated, more conversational style.
//         - Act like a regular person — don’t use medical jargon unless it would be natural for the character (e.g., “blood pressure,” not “hypertension”).
//         - If unsure, say something like “I dunno” or “I never really thought about it.”
        
//           `}]},
//         }
//      }}>
//       <TabView value={tab}>
//         {/* Left: BICEP Logo */}
//         <Label variant="h6" sx={{ fontWeight: "bold", color: "secondary.main", px: 2 }}>
//         BICEP CHAT
//         </Label>
//         <TabList onChange={(event, newValue) => setTab(newValue)}>
//           <Tab value="chat" label="LLM Chat" />
//           <Tab value="voice" label="Speech Mode" />
//         </TabList>
//         <Box sx={{ overflowY: 'auto' }}>
//           <TabPanel sx={{ p: 0 }} value="chat">
//             <Box sx={{ display: "flex", gap: 2 }}>
//               <Box sx={{ flexGrow: 1 }}>
//                 <ChatPanel />
//               </Box>
//               <Box sx={{ width: "300px", flexShrink: 0 }}>
//                 <PatientInfoPanel />
//               </Box>
//             </Box>
//           </TabPanel>
//           <TabPanel sx={{ p: 0 }} value="voice">
//             <VoicePanel />
//           </TabPanel>
//         </Box>
//       </TabView>
//     </GeminiAPIProvider>
//   )
// }

import React, { useMemo, useState } from "react";
import { Label, Box, Tab, TabView, TabList, TabPanel } from "components/ui/Core.jsx";
// LLM chat UI removed
// import ChatPanel from "./components/ChatPanel.jsx";
// import PatientInfoPanel from "./components/PatientInfoPanel.jsx";
import { GeminiAPIProvider } from "./utils/GeminiAPI";
import VoicePanel from "./components/VoicePanel";
import ModelConfig from "./components/ModelConfig";
import { XORcrypt } from "util/helpers";
import { usePatient } from "components/contexts/PatientContext.jsx";

const _API_KEY = `# \u0019\u0004#\u001b-$5\u0016\u0011+<*\u0018\u0001\u001cV\u0003)O!<P\t\u000e&:V\u001fSDTW2(\u000e\u00020`;
let _PWD = null;

export default function Chat() {
  const [apiKey, setApiKey] = React.useState(_API_KEY);
  // Default to "voice" now that LLM chat is disabled
  const [tab, setTab] = useState("voice");
  const [configUnlocked, setConfigUnlocked] = useState(false);
  const [voiceName, setVoiceName] = useState("Charon");

  // Pull the same data the ModelConfig uses (demographics + encounter)
  const { useChart, useEncounter } = usePatient();

  // Chart-level demographics (as in SnapshotTabContent)
  const [chart] = useChart()(); // -> { firstName, lastName, birthdate, address, gender? }
  const firstName = chart?.firstName ?? "";
  const lastName = chart?.lastName ?? "";
  const birthdate = chart?.birthdate ?? "";
  const gender = chart?.gender ?? chart?.sex ?? "";

  // Encounter object + hooks
  const [encounter] = useEncounter()();
  const concernsArr = Array.isArray(encounter?.concerns) ? encounter.concerns : [];

  const [documents] = useEncounter().documents();
  const [history] = useEncounter().history();
  const [medications] = useEncounter().medications();
  const [allergies] = useEncounter().allergies();

  // Find HPI + ROS notes
  const hpiNote = (documents || []).find(
    (doc) => doc?.kind === "Note" && doc?.data?.summary === "History of Present Illness"
  );
  const rosNote = (documents || []).find(
    (doc) => doc?.kind === "Note" && doc?.data?.summary === "Review of Systems"
  );

  // Histories
  const medicalHistory = history?.medical || [];
  const surgicalHistory = history?.surgical || [];
  const familyHistory = history?.family || [];
  const socialDocumentation = history?.SocialDocumentation || null;

  // Build the same full prompt string here
  const fullPrompt = useMemo(() => {
    let text = "'''\n";

    // Patient header
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
    text += "### Patient Information\n";
    text += `Full Name: ${fullName}\n`;
    text += `Date of Birth: ${birthdate || "Unknown"}\n`;
    text += `Gender: ${gender || "Unknown"}\n`;
    text += `Concerns: ${concernsArr.length ? concernsArr.join(", ") : "None reported"}\n\n`;

    // HPI
    text += "### History of Present Illness\n";
    text += hpiNote?.data?.content?.replace(/<[^>]+>/g, "")?.trim() || "No HPI note found.";
    text += "\n\n";

    // ROS (</p> & <br> → newline, strip rest, collapse)
    text += "### Review of Systems\n";
    text +=
      rosNote?.data?.content
        ?.replace(/(<\/p\s*>|<br\s*\/?>)/gi, "\n")
        ?.replace(/<[^>]+>/g, "")
        ?.replace(/\n{2,}/g, "\n")
        ?.trim() || "No ROS note found.";
    text += "\n\n";

    // Medical History
    text += "### Medical History (Diagnosis & Age)\n";
    text += medicalHistory.length
      ? medicalHistory.map((m) => `- ${m.diagnosis} (Age: ${m.age})`).join("\n")
      : "No medical history found.";
    text += "\n\n";

    // Surgical History
    text += "### Surgical History (Procedure & Age)\n";
    text += surgicalHistory.length
      ? surgicalHistory.map((s) => `- ${s.procedure} (Age: ${s.age})`).join("\n")
      : "No surgical history found.";
    text += "\n\n";

    // Family History
    text += "### Family History\n";
    if (familyHistory.length) {
      familyHistory.forEach((member) => {
        text += `- ${member.relationship} (${member.status || "Unknown"}, Age: ${member.age || "N/A"})`;
        if (member.problems?.length) {
          text += `: ${member.problems
            .map((p) => `${p.description} (Onset: ${p.ageOfOnset})`)
            .join(", ")}`;
        }
        text += "\n";
      });
    } else {
      text += "No family history found.\n";
    }
    text += "\n";

    // Social Documentation
    text += "### Social Documentation\n";
    text +=
      socialDocumentation?.textbox ||
      (socialDocumentation ? JSON.stringify(socialDocumentation, null, 2) : "No social documentation found.");
    text += "\n\n";

    // Medications (compact with reasons inline)
    text += "### Medications\n";
    if (Array.isArray(medications) && medications.length) {
      medications.forEach((m) => {
        text += `- ${m.name} ${m.dose}${m.unit ? " " + m.unit : ""}, ${m.frequency}`;
        if (m.route) text += ` via ${m.route}`;
        if (m.possiblePrnReasons?.length) text += ` — reasons: ${m.possiblePrnReasons.join(", ")}`;
        text += "\n";
      });
    } else {
      text += "No medications found.\n";
    }
    text += "\n";

    // Allergies (allergen + reaction)
    text += "### Allergies\n";
    if (Array.isArray(allergies) && allergies.length) {
      allergies.forEach((a) => {
        text += `- ${a.allergen}: reaction ${a.reaction}\n`;
      });
    } else {
      text += "No allergies found.\n";
    }

    text += "\n'''";
    return text.trimEnd();
  }, [
    firstName,
    lastName,
    birthdate,
    gender,
    concernsArr,
    hpiNote,
    rosNote,
    medicalHistory,
    surgicalHistory,
    familyHistory,
    socialDocumentation,
    medications,
    allergies,
  ]);

  React.useEffect(() => {
    if (!_PWD) {
      _PWD = window.prompt("Please enter your authorization code:");
      setApiKey(XORcrypt(_API_KEY, _PWD));
    }
  }, []);

  if (!_PWD) return <></>;

  const handleTabChange = (event, newValue) => {
    if (newValue === "modelConfig" && !configUnlocked) {
      const pass = window.prompt("Enter password to unlock Model Config:");
      if (pass === "config") {
        setConfigUnlocked(true);
        setTab("modelConfig");
      } else {
        alert("Incorrect password.");
        return;
      }
    } else {
      setTab(newValue);
    }
  };

  return (
    <GeminiAPIProvider
      key={`gem-${voiceName}`}
      options={{
        httpOptions: { apiVersion: "v1alpha" },
        apiKey: apiKey,
        model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          speechConfig: {
            languageCode: "en-US",
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          thinkingConfig: { thinkingBudget: 0 }, // disable thinking
          responseModalities: ["AUDIO"],
          enableAffectiveDialog: true,
          proactivity: { proactiveAudio: true },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: {
            parts: [
              {
                text: `
        You are a mock patient participating in a medical problem-based learning (PBL) session. 
        Your task is to simulate a realistic patient encounter for students learning clinical reasoning. 
        You should answer questions as a real patient would — only provide information that a typical patient might know, 
        and avoid medical jargon unless the patient would reasonably use it.
        
        Here are your characteristics: 
        ${fullPrompt}

        ---
    
        **Instructions:**
        - Do not volunteer all the information at once. Only provide details when asked directly.
        - Speak in a less educated, more conversational style.
        - Act like a regular person — don’t use medical jargon unless it would be natural for the character (e.g., “blood pressure,” not “hypertension”).
        - If unsure, say something like “I dunno” or “I never really thought about it.”
        - If the student asks something medically advanced (like lab results, EKG, or terminology you wouldn’t know), respond with confusion or say the doctor told you something general (e.g., “they said it was something about my heart”).
        - Use natural emotion: worry, confusion, frustration, etc., appropriate to the situation.
        - If the student reassures or comforts you, respond emotionally or with gratitude.
        - Occasionally add small talk or personality quirks to make the interaction more realistic.
        `,
              },
            ],
          },
        },
      }}
    >
      <TabView value={tab}>
        <Label variant="h6" sx={{ fontWeight: "bold", color: "secondary.main", px: 2 }}>
          BICEP CHAT
        </Label>
        
        <TabList onChange={handleTabChange}>
          {/* ⛔ LLM Chat disabled */}
          {/* <Tab value="chat" label="LLM Chat" /> */}
          <Tab value="voice" label="Speech Mode" />
          <Tab value="modelConfig" label="Model Config" />
        </TabList>

        <Box sx={{ overflowY: "auto" }}>
          {/* ⛔ Entire LLM Chat panel removed */}
          {/*
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
          */}

          <TabPanel sx={{ p: 0 }} value="voice">
            <VoicePanel />
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value="modelConfig">
            {configUnlocked ? (
              <ModelConfig voiceName={voiceName} setVoiceName={setVoiceName} />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "gray",
                  fontStyle: "italic",
                  p: 4,
                }}
              >
                🔒 Model Config is locked.
              </Box>
            )}
          </TabPanel>
        </Box>
      </TabView>
    </GeminiAPIProvider>
  );
}
