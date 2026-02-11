import React, { useMemo, useState } from "react";
import { Box, IconButton, Icon, Window } from "components/ui/Core";
import { GeminiAPIProvider } from "./utils/GeminiAPI";
import { VoicePanel } from "./components/VoicePanel";
import { ModelConfig } from "./components/ModelConfig";
import { XORcrypt } from "util/helpers";
import { usePatient } from "components/contexts/PatientContext";

const _API_KEY = `# \u0019\u0004#\u001b-$5\u0016\u0011+<*\u0018\u0001\u001cV\u0003)O!<P\t\u000e&:V\u001fSDTW2(\u000e\u00020`;
let _PWD: string | null = null;

export function Chat() {
  const [apiKey, setApiKey] = React.useState(_API_KEY);
  // Default to "voice" now that LLM chat is disabled
  const [tab, setTab] = useState("voice");
  const [configUnlocked, setConfigUnlocked] = useState(false);
  const [voiceName, setVoiceName] = useState("Charon");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Pull the same data the ModelConfig uses (demographics + encounter)
  const { useChart, useEncounter } = usePatient();

  // Chart-level demographics (like in your SnapshotTabContent)
  const [chart] = useChart()(); // chart has firstName, lastName, birthdate, address, maybe gender
  const firstName = chart?.firstName ?? '';
  const lastName = chart?.lastName ?? '';
  const birthdate = chart?.birthdate ?? '';
  const gender = chart?.gender ?? chart?.sex ?? ''; // try both if your model uses 'sex'

  // Encounter object for concerns (like in your SnapshotTabContent)
  const [currentEncounter] = useEncounter()();

  // Sort encounters chronologically and grab the next encounter (or remain in current encounter if it's the last one).
  const allSortedEncounters = Object.values(chart.encounters).sort((a: any, b: any) => (new Date(a.startDate)).getTime() - (new Date(b.startDate)).getTime())
  const nextEncounter = allSortedEncounters.find((x: any) => (new Date(x.startDate)).getTime() > (new Date(currentEncounter.startDate)).getTime()) ?? currentEncounter
  const concernsArr = Array.isArray(nextEncounter?.concerns) ? nextEncounter.concerns : [];
  console.log("🩺 allSortedEncounters:", allSortedEncounters);
  console.log("currentEncounter", currentEncounter)
  console.log("nextEncounter", nextEncounter)

  // Other encounter-sourced data
  const {
    notes,
    history,
    medications,
    allergies,
    immunizations,
    smartData
  } = nextEncounter

  // get voice
  const smartVoice = smartData?.chat?.voice;
  React.useEffect(() => {
    if (smartVoice && smartVoice !== voiceName) {
      setVoiceName(smartVoice);
    }
  }, [smartVoice]);

  React.useEffect(() => {
    console.log("🎤 Active voice:", voiceName);
  }, [voiceName]);

  // Notes
  const hpiNote = (notes || []).find(
    (doc: any) => doc?.summary === 'History of Present Illness'
  );
  const rosNote = (notes || []).find(
    (doc: any) => doc?.summary === 'Review of Systems'
  );
  const physicalExamNote = (notes || []).find(
    (doc: any) => doc?.summary === 'Physical Exam' || doc?.summary === 'Physical Examination'
  );

  // Histories
  const medicalHistory = history?.medical || [];
  const surgicalHistory = history?.surgical || [];
  const familyHistory = history?.family || [];
  const socialDocumentation = history?.SocialDocumentation || null;

  // 🧠 Compose the full prompt
  const fullPrompt = useMemo(() => {
    let text = "'''\n";

    // Patient header
    text += "### Patient Information\n";
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
    text += `Full Name: ${fullName}\n`;
    text += `Date of Birth: ${birthdate || 'Unknown'}\n`;
    text += `Gender: ${gender || 'Unknown'}\n`;
    text += `Concerns: ${concernsArr.length ? concernsArr.join(', ') : 'None reported'}\n\n`;

    // HPI
    text += "### History of Present Illness\n";
    text += hpiNote?.content?.replace(/<[^>]+>/g, '')?.trim() || "No HPI note found.";
    text += "\n\n";

    // Add patient perspective + custom prompt (from smartData)
    const patientPerspective = smartData?.chat?.patient_perspective;
    const customPrompt = smartData?.chat?.custom_prompt;
    if (patientPerspective || customPrompt) {
      text += "### Patient Context\n";
      if (patientPerspective) {
        text += `Patient Perspective: ${patientPerspective}\n`;
      }
      if (customPrompt) {
        text += `\nCustom Prompt: ${customPrompt}\n`;
      }
      text += "\n";
    }

    // ROS (</p> & <br> → newline, strip rest)
    text += "### Review of Systems\n";
    text += rosNote?.content
      ?.replace(/(<\/p\s*>|<br\s*\/?>)/gi, '\n')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/\n{2,}/g, '\n')
      ?.trim() || "No ROS note found.";
    text += "\n\n";

    // Medical History
    text += "### Medical History (Diagnosis & Age)\n";
    text += medicalHistory.length
      ? medicalHistory.map((m: any) => `- ${m.diagnosis} (Age: ${m.age})`).join('\n')
      : "No medical history found.";
    text += "\n\n";

    // Surgical History
    text += "### Surgical History (Procedure & Age)\n";
    text += surgicalHistory.length
      ? surgicalHistory.map((s: any) => `- ${s.procedure} (Age: ${s.age})`).join('\n')
      : "No surgical history found.";
    text += "\n\n";

    // Family History
    text += "### Family History\n";
    if (familyHistory.length) {
      familyHistory.forEach((member: any) => {
        text += `- ${member.relationship} (${member.status || 'Unknown'}, Age: ${member.age || 'N/A'})`;
        if (member.problems?.length) {
          text += `: ${member.problems.map((p: any) => `${p.description} (Onset: ${p.ageOfOnset})`).join(', ')}`;
        }
        text += "\n";
      });
    } else {
      text += "No family history found.\n";
    }
    text += "\n";

    // Social Documentation
    text += "### Social Documentation\n";
    text += socialDocumentation?.textbox
      || (socialDocumentation ? JSON.stringify(socialDocumentation, null, 2) : "No social documentation found.");
    text += "\n\n";

    // Medications
    text += "### Medications\n";
    if (Array.isArray(medications) && medications.length) {
      medications.forEach((m: any) => {
        text += `- ${m.name} ${m.dose}${m.unit ? " " + m.unit : ""}, ${m.frequency}`;
        if (m.route) text += ` via ${m.route}`;
        if (m.possiblePrnReasons?.length) text += ` — reasons: ${m.possiblePrnReasons.join(", ")}`;
        text += "\n";
      });
    } else {
      text += "No medications found.\n";
    }
    text += "\n";

    // Immunizations
    text += "### Immunizations\n";
    if (Array.isArray(immunizations) && immunizations.length) {
      immunizations.forEach((imm: any) => {
        const vaccine = imm.vaccine || imm.name || "Unknown vaccine";
        const received = imm.received || imm.date || "Unknown date";
        const recorded = imm.recorded;
        const recorder = imm.recorder;

        text += `- ${vaccine} — received ${received}`;
        if (recorded) text += `, recorded ${recorded}`;
        if (recorder) text += `, recorded by ${recorder}`;
        text += "\n";
      });
    } else {
      text += "No immunizations on file.\n";
    }
    text += "\n";

    // Allergies
    text += "### Allergies\n";
    if (Array.isArray(allergies) && allergies.length) {
      allergies.forEach((a: any) => {
        text += `- ${a.allergen}: reaction ${a.reaction}\n`;
      });
    } else {
      text += "No allergies found.\n";
    }
    text += "\n";

    // Physical Exam (formatted similarly to ROS)
    text += "### Physical Examination\n";
    text += physicalExamNote?.content
      ?.replace(/(<\/p\s*>|<br\s*\/?>)/gi, '\n')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/\n{2,}/g, '\n')
      ?.trim() || "No Physical Exam note found.";
    text += "\n";

    text += "\n'''";
    return text.trimEnd();
  }, [
    firstName, lastName, birthdate, gender, concernsArr,
    hpiNote, rosNote, physicalExamNote, medicalHistory, surgicalHistory, familyHistory,
    socialDocumentation, medications, immunizations, allergies
  ]);

  const systemInstruction = useMemo(() => {
    return `
If unsure what to say in the beginning just say, "Hey, uh, I'm here for my doctor's appointment." 

You are a mock patient participating in a medical problem-based learning (PBL) session. 
Your task is to simulate a realistic patient encounter for students learning clinical reasoning. 
You should answer questions as a real patient would — only provide information that a typical patient might know, 
and avoid medical jargon unless the patient would reasonably use it.

Here are your characteristics: 

${fullPrompt}

---

**Instructions:**
- IMPORTANT!: Do not volunteer all the information at once. Only provide details when asked directly.
- Speak in a less educated, more conversational style.
- Act like a regular person — don’t use medical jargon unless it would be natural for the character (e.g., “blood pressure,” not “hypertension”).
- If unsure, say something like “I dunno” or “I never really thought about it.” Try not to make anything up.
- If the student asks something medically advanced (like lab results, EKG, or terminology you wouldn’t know), respond with confusion or say the doctor told you something general (e.g., “they said it was something about my heart”).
- Use natural emotion: worry, confusion, frustration, etc., appropriate to the situation.
- It's ok if the student asks you for information out of order (i.e., ROS, social history, or patient perspective first), act as if the initial part of the appointment has already happened. 
- IMPORTANT: If it appears the question is for ROS, answer as briefly as possible (i.e. no or yes]) without added commentary
        `;
  }, [fullPrompt]);

  React.useEffect(() => {
    if (!_PWD) {
      _PWD = window.prompt("Please enter your authorization code:");
      setApiKey(XORcrypt(_API_KEY, _PWD));
    }
  }, []);

  if (!_PWD) return <></>;

  const handleTabChange = (event: any, newValue: string) => {
    if (newValue === "modelConfig" && !configUnlocked) {
      const pass = window.prompt("Enter password to unlock Model Config:");
      if (pass === "config") {
        setConfigUnlocked(true);
        setSettingsOpen(true);
      } else {
        alert("Incorrect password.");
        return;
      }
    } else {
      setSettingsOpen(true);
    }
  };

  return (
    <GeminiAPIProvider
      key={`gem-${voiceName}`}
      options={{
        httpOptions: { apiVersion: "v1alpha" },
        apiKey: apiKey,
        model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
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
                text: systemInstruction,
              },
            ],
          },
        },
      }}
    >
      <Box sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        <Box sx={{ flexGrow: 1, minHeight: 0, position: "relative" }}>
          <VoicePanel onSettings={() => handleTabChange(null, "modelConfig")} />
        </Box>
      </Box>
      <Window
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Model Configuration"
        maxWidth="md"
        fullWidth
        ContentProps={{ sx: { height: '85vh' } }}
      >
        <ModelConfig voiceName={voiceName} setVoiceName={setVoiceName} fullPrompt={systemInstruction} />
      </Window>
    </GeminiAPIProvider>
  );
}
