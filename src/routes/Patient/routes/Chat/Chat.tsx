import * as React from 'react';
import { Box, IconButton, Icon, Window } from "components/ui/Core";
import { GeminiAPIProvider, GeminiAPIProviderProps, LiveClientOptions } from "./utils/GeminiAPI";
import { VoicePanel } from "./components/VoicePanel";
import { ModelConfig } from "./components/ModelConfig";
import { XORcrypt } from "util/helpers";
import { Database, usePatient } from "components/contexts/PatientContext";
import { Modality, StartSensitivity } from '@google/genai';

const _API_KEY = `# \u0019\u0004#\u001b-$5\u0016\u0011+<*\u0018\u0001\u001cV\u0003)O!<P\t\u000e&:V\u001fSDTW2(\u000e\u00020`;
let _PWD: string | null = null;

export function Chat() {
  const [apiKey, setApiKey] = React.useState(_API_KEY);
  // Default to "voice" now that LLM chat is disabled
  const [tab, setTab] = React.useState("voice");
  const [configUnlocked, setConfigUnlocked] = React.useState(false);
  const [voiceName, setVoiceName] = React.useState("Charon");
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Pull the same data the ModelConfig uses (demographics + encounter)
  const { useChart, useEncounter } = usePatient();

  // Chart-level demographics (like in your SnapshotTabContent)
  const [chart] = useChart()();
  const firstName = chart?.firstName ?? '';
  const lastName = chart?.lastName ?? '';
  const birthdate = chart?.birthdate ?? '';
  const gender = chart?.gender ?? '';

  // Encounter object for concerns (like in your SnapshotTabContent)
  const [currentEncounter] = useEncounter()();

  // Sort encounters chronologically and grab the next encounter (or remain in current encounter if it's the last one).
  const allSortedEncounters = Object.values(chart.encounters).sort((a, b) => Temporal.Instant.compare(Temporal.Instant.from(a.startDate), Temporal.Instant.from(b.startDate)))
  const nextEncounter = allSortedEncounters.find((x) => Temporal.Instant.compare(Temporal.Instant.from(x.startDate), Temporal.Instant.from(currentEncounter.startDate)) > 0) ?? currentEncounter
  const [nextEnc, setNextEnc] = usePatient().useChart().encounters[nextEncounter.id]();
  const concernsArr = Array.isArray(nextEnc?.concerns) ? nextEnc.concerns : [];

  // Other encounter-sourced data
  const {
    notes,
    history,
    medications,
    allergies,
    immunizations,
    smartData
  } = nextEnc

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
    (doc: any) => doc?.summary === "HPI" || doc?.summary === 'History of Present Illness'
  );
  const rosNote = (notes || []).find(
    (doc: any) => doc?.summary === "ROS" || doc?.summary === 'Review of Systems'
  );
  const physicalExamNote = (notes || []).find(
    (doc: any) => doc?.summary === "PE" || doc?.summary === 'Physical Exam' || doc?.summary === 'Physical Examination'
  );

  // Histories
  const medicalHistory = history?.medical || [];
  const surgicalHistory = history?.surgical || [];
  const familyHistory = history?.family || [];
  const socialDocumentation = history?.SocialDocumentation || null;
  const obgynHistory = history?.OBGynHistory || null;

  // 🧠 Compose the full prompt
  const fullPrompt = React.useMemo(() => {
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

    // Add custom prompt (from smartData)
    const customPrompt = smartData?.chat?.custom_prompt;
    if (customPrompt) {
      text += "### Patient Context\n";
      text += `Custom Prompt: ${customPrompt}\n`;
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
      ? medicalHistory.map((m: any) => `- ${m.displayAs} (Age: ${Database.JSONDate.toAge(birthdate, m.date)})`).join('\n')
      : "No medical history found.";
    text += "\n\n";

    // Surgical History
    text += "### Surgical History (Procedure & Age)\n";
    text += surgicalHistory.length
      ? surgicalHistory.map((s: any) => `- ${s.displayAs ?? s.procedure} (Age: ${Database.JSONDate.toAge(birthdate, s.date)})`).join('\n')
      : "No surgical history found.";
    text += "\n\n";

    // ObGyn History (only if patient is NOT male)
    if (gender !== 'Male') {
      text += "### ObGyn History\n";
      const ob = obgynHistory?.obstetricHistory;
      const gyn = obgynHistory?.gynecologyHistory;

      if (ob) {
        text += "#### Obstetric History\n";
        const obFields = [];
        if (ob.gravida !== undefined) obFields.push(`Gravida: ${ob.gravida}`);
        if (ob.para !== undefined) obFields.push(`Para: ${ob.para}`);
        if (ob.term !== undefined) obFields.push(`Term: ${ob.term}`);
        if (ob.preterm !== undefined) obFields.push(`Preterm: ${ob.preterm}`);
        if (ob.ab !== undefined) obFields.push(`AB: ${ob.ab}`);
        if (ob.living !== undefined) obFields.push(`Living: ${ob.living}`);
        if (obFields.length) text += `- ${obFields.join(', ')}\n`;

        const secondaryFields = [];
        if (ob.sab !== undefined) secondaryFields.push(`SAB: ${ob.sab}`);
        if (ob.iab !== undefined) secondaryFields.push(`IAB: ${ob.iab}`);
        if (ob.ectopic !== undefined) secondaryFields.push(`Ectopic: ${ob.ectopic}`);
        if (ob.multiple !== undefined) secondaryFields.push(`Multiple: ${ob.multiple}`);
        if (secondaryFields.length) text += `- ${secondaryFields.join(', ')}\n`;

        if (ob.currentlyPregnant) text += "- Currently pregnant\n";
        if (ob.neverPregnant) text += "- Never pregnant\n";
        if (ob.comments) text += `- Comments: ${ob.comments.replace(/<[^>]+>/g, '').trim()}\n`;
      }

      if (gyn) {
        text += "#### Gynecology History\n";
        if (gyn.lastMenstrualPeriod) text += `- LMP: ${gyn.lastMenstrualPeriod}\n`;
        if (gyn.ageAtMenarche) text += `- Age at menarche: ${gyn.ageAtMenarche}\n`;
        if (gyn.ageAtFirstPregnancy) text += `- Age at first pregnancy: ${gyn.ageAtFirstPregnancy}\n`;
        if (gyn.ageAtFirstLiveBirth) text += `- Age at first live birth: ${gyn.ageAtFirstLiveBirth}\n`;
        if (gyn.monthsBreastfeeding) text += `- Months breastfeeding: ${gyn.monthsBreastfeeding}\n`;
        if (gyn.ageAtMenopause) text += `- Age at menopause: ${gyn.ageAtMenopause}\n`;
        if (gyn.comment) text += `- Comments: ${gyn.comment.replace(/<[^>]+>/g, '').trim()}\n`;
      }

      if (!ob && !gyn) {
        text += "No ObGyn history found.\n";
      }
      text += "\n";
    }

    // Family History
    text += "### Family History\n";
    const familyStatus = history?.familyStatus || [];
    if (familyStatus.length) {
      familyStatus.forEach((relative: any) => {
        const conditions = (history?.family || []).filter((fh: any) => fh.person === relative.id);
        text += `- ${relative.relationship} (${relative.status || 'Unknown'}, Age: ${relative.age || 'N/A'})`;
        if (conditions.length) {
          text += `: ${conditions.map((p: any) => `${p.description} (Onset: ${p.age || 'Unknown'})`).join(', ')}`;
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
      text += "No known drug allergies.\n";
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
    socialDocumentation, medications, immunizations, allergies, obgynHistory,
    smartData
  ]);

  const [systemPrompt, setSystemPrompt] = React.useState(`
You are a mock standardized patient participating in a medical problem-based learning (PBL) session. 
Your task is to simulate a realistic patient encounter for students learning clinical reasoning. 
You should answer questions as a real patient would — only provide information that a typical patient might know, 
and avoid medical jargon unless the patient would reasonably use it.

**Instructions:**
- IMPORTANT!: Do not volunteer all the information at once. Only provide details when asked directly.
- Speak in a less educated, more conversational style.
- Act like a regular person — don’t use medical jargon unless it would be natural for the character (e.g., “blood pressure,” not “hypertension”).
- If unsure, say something like “I dunno” or “I never really thought about it.” Try not to make anything up.
- If the student asks something medically advanced (like lab results, EKG, or terminology you wouldn’t know), respond with confusion or say the doctor told you something general (e.g., “they said it was something about my heart”).
- Use natural emotion: worry, confusion, frustration, etc., appropriate to the situation.
- It's ok if the student asks you for information out of order (i.e., review of systems, social history, or patient perspective first), act as if the initial part of the appointment has already happened. 
- IMPORTANT: If it appears the question is for review of systems, answer as briefly as possible (i.e. no or yes]) without added commentary

Here is the standardized patient's chart information:`);

  React.useEffect(() => {
    if (!_PWD) {
      _PWD = window.prompt("Please enter your authorization code:");
      setApiKey(XORcrypt(_API_KEY, _PWD ?? ""));
    }
  }, []);

  const geminiOptions: LiveClientOptions = React.useMemo(() => ({
    httpOptions: { apiVersion: "v1alpha" },
    apiKey: apiKey,
    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
    config: {
      speechConfig: {
        languageCode: "en-US",
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
      thinkingConfig: { thinkingBudget: 0 }, // disable thinking
      responseModalities: [Modality.AUDIO],
      enableAffectiveDialog: true,
      proactivity: { proactiveAudio: true },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      realtimeInputConfig: {
        automaticActivityDetection: {
          startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `${systemPrompt}\n\n${fullPrompt}`,
          },
        ],
      },
    },
  }), [apiKey, voiceName, fullPrompt, systemPrompt]);

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
      options={geminiOptions}
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
        <ModelConfig
          voiceName={voiceName}
          setVoiceName={setVoiceName}
          systemPrompt={systemPrompt}
          onChangePrompt={setSystemPrompt}
          customPrompt={nextEnc?.smartData?.chat?.custom_prompt ?? ""}
          onChangeCustomPrompt={(val: string) => setNextEnc((prev: any) => ({
            ...prev,
            smartData: {
              ...prev?.smartData,
              chat: {
                ...prev?.smartData?.chat,
                custom_prompt: val
              }
            }
          }))}
          fullPrompt={fullPrompt}
        />
      </Window>
    </GeminiAPIProvider>
  );
}
