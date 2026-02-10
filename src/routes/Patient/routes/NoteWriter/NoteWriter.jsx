import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Tab, TabList, TabPanel, TabView, TextField } from 'components/ui/Core';
import { FormControl, Select, IconButton, Grid, Checkbox, Typography, Icon, Popover } from '@mui/material';
import { usePatient } from 'components/contexts/PatientContext';

const systemsTemplate = {
  "Review of Systems": [
    {
      title: 'Constitutional',
      symptoms: ['Fever', 'Chills', 'Weight loss', 'Malaise/Fatigue', 'Diaphoresis'],
    },
    {
      title: 'Skin',
      symptoms: ['Rash', 'Itching'],
    },
    {
      title: 'HENT',
      symptoms: [
        'Hearing loss',
        'Tinnitus',
        'Ear pain',
        'Ear discharge',
        'Nosebleeds',
        'Congestion',
        'Sinus pain',
        'Stridor',
        'Sore throat',
      ],
    },
    {
      title: 'Eyes',
      symptoms: [
        'Blurred vision',
        'Double vision',
        'Photophobia',
        'Eye pain',
        'Eye discharge',
        'Eye redness',
      ],
    },
    {
      title: 'Cardiovascular',
      symptoms: [
        'Chest pain',
        'Palpitations',
        'Orthopnea',
        'Claudication',
        'Leg swelling',
        'PND',
      ],
    },
    {
      title: 'Respiratory',
      symptoms: [
        'Cough',
        'Hemoptysis',
        'Sputum production',
        'Shortness of breath',
        'Wheezing',
      ],
    },
    {
      title: 'GI',
      symptoms: [
        'Heartburn',
        'Nausea',
        'Vomiting',
        'Abdominal pain',
        'Diarrhea',
        'Constipation',
        'Blood in stool',
        'Melena',
      ],
    },
    {
      title: 'GU',
      symptoms: [
        'Dysuria',
        'Urgency',
        'Frequency',
        'Hematuria',
        'Flank pain',
      ],
    },
    {
      title: 'Musculoskeletal',
      symptoms: [
        'Myalgias',
        'Neck pain',
        'Back pain',
        'Joint pain',
        'Falls',
      ],
    },
    {
      title: 'Endo/Heme/Allergy',
      symptoms: [
        'Easy bruising/bleeding',
        'Environmental allergies',
        'Polydipsia',
      ],
    },
    {
      title: 'Neurological',
      symptoms: [
        'Dizziness',
        'Headaches',
        'Tingling',
        'Tremor',
        'Sensory change',
        'Speech change',
        'Focal weakness',
        'Weakness',
        'Seizures',
        'LOC',
      ],
    },
    {
      title: 'Psychiatric',
      symptoms: [
        'Depression',
        'Suicidal ideas',
        'Substance abuse',
        'Hallucinations',
        'Nervous/Anxious',
        'Insomnia',
        'Memory loss',
      ],
    },
  ],
  "Physical Exam": [
    {
      title: 'Constitutional',
      subsections: [
        {
          // subsectionTitle: 'General', 
          checkboxes: ['Alert', 'Normal Weight', 'Normal Appearance', 'Obese'],
          symptoms: ['Acute Distress', 'Ill-Appearing', 'Toxic Appearing', 'Diaphoretic'],
        },
      ],
    },
    {
      title: 'Neck',
      subsections: [
        {
          checkboxes: ['ROM Normal', 'Supple'],
          symptoms: ['Neck Rigidity', 'Tenderness', 'Cervical Adenopathy', 'Carotid Bruit'],
        },
      ],
    },
    {
      title: 'Skin',
      subsections: [
        {
          checkboxes: ['Warm', 'Dry', 'Normal Color'],
          symptoms: ['Rash', 'Erythema', 'Pallor', 'Cyanosis'],
        },
      ],
    },
    {
      title: 'Respiratory',
      subsections: [
        {
          subsectionTitle: 'Breath Sounds',
          checkboxes: ['Clear to Auscultation Bilaterally'],
          symptoms: ['Wheezes', 'Rales', 'Rhonchi'],
        },
        {
          subsectionTitle: 'Respiratory Effort',
          checkboxes: ['Normal Effort', 'No Accessory Muscle Use'],
          symptoms: ['Labored Breathing', 'Retractions'],
        },
      ],
    },
    {
      title: 'Genitourinary / Anorectal',
      subsections: [
        {
          subsectionTitle: 'General',
          checkboxes: ['Normal External Appearance'],
          symptoms: ['Lesions', 'Discharge'],
        },
        {
          subsectionTitle: 'Anorectal',
          checkboxes: ['Normal Tone'],
          symptoms: ['Hemorrhoids', 'Fissures'],
        },
      ],
    },
    {
      title: 'Musculoskeletal',
      subsections: [
        {
          subsectionTitle: 'General',
          checkboxes: ['Full Range of Motion', 'No Deformity'],
          symptoms: ['Tenderness', 'Swelling', 'Limited ROM'],
        },
        {
          subsectionTitle: 'Spine',
          checkboxes: ['Normal Curvature'],
          symptoms: ['Tenderness', 'Kyphosis', 'Scoliosis'],
        },
      ],
    },
    {
      title: 'Neurological',
      subsections: [
        {
          subsectionTitle: 'Mental Status',
          checkboxes: ['Alert', 'Oriented x3'],
          symptoms: ['Confusion', 'Lethargy'],
        },
        {
          subsectionTitle: 'Motor Function',
          checkboxes: ['Normal Strength'],
          symptoms: ['Weakness', 'Tremor', 'Involuntary Movements'],
        },
        {
          subsectionTitle: 'Reflexes',
          checkboxes: ['Normal Reflexes'],
          symptoms: ['Hyperreflexia', 'Hyporeflexia'],
        },
      ],
    },
    {
      title: 'Psychiatric',
      subsections: [
        {
          subsectionTitle: 'Affect',
          checkboxes: ['Normal Affect'],
          symptoms: ['Flat', 'Anxious', 'Depressed'],
        },
        {
          subsectionTitle: 'Behavior',
          checkboxes: ['Cooperative'],
          symptoms: ['Agitated', 'Withdrawn'],
        },
      ],
    },
    {
      title: 'Gastrointestinal',
      subsections: [
        {
          subsectionTitle: 'Inspection',
          checkboxes: ['Non-Distended'],
          symptoms: ['Scars', 'Striae'],
        },
        {
          subsectionTitle: 'Palpation',
          checkboxes: ['Soft', 'Non-Tender'],
          symptoms: ['Tenderness', 'Guarding', 'Rebound'],
        },
        {
          subsectionTitle: 'Bowel Sounds',
          checkboxes: ['Normal Bowel Sounds'],
          symptoms: ['Hyperactive', 'Hypoactive', 'Absent'],
        },
      ],
    },
    {
      title: 'HEENT',
      subsections: [
        {
          subsectionTitle: 'Head',
          checkboxes: ['Normocephalic', 'Atraumatic'],
          symptoms: [],
        },
        {
          subsectionTitle: 'Eyes',
          checkboxes: ['PERRL', 'EOM Intact'],
          symptoms: ['Conjunctivae Normal', 'Scleral Icterus'],
        },
        {
          subsectionTitle: 'Ears (Right)',
          checkboxes: ['TM Normal', 'Canal Normal', 'External Ear Normal'],
          symptoms: ['Impacted Cerumen'],
        },
        {
          subsectionTitle: 'Ears (Left)',
          checkboxes: ['TM Normal', 'Canal Normal', 'External Ear Normal'],
          symptoms: ['Impacted Cerumen'],
        },
        {
          subsectionTitle: 'Nose',
          checkboxes: ['Nose Normal'],
          symptoms: ['Congestion', 'Rhinorrhea'],
        },
        {
          subsectionTitle: 'Mouth/Throat',
          checkboxes: ['Moist'],
          symptoms: ['Clear', 'Exudate', 'Erythema'],
        },
      ],
    },
    {
      title: 'Cardiovascular',
      subsections: [
        {
          subsectionTitle: 'Rate',
          checkboxes: ['Normal Rate', 'Tachycardia', 'Bradycardia'],
          symptoms: []
        },
        {
          subsectionTitle: 'Rhythm',
          checkboxes: ['Regular Rhythm', 'Irregular Rhythm'],
          symptoms: []
        },
        {
          subsectionTitle: 'Pulses and Heart Sounds',
          checkboxes: ['Pulses Normal', 'Heart Sounds Normal'],
          symptoms: ['Murmur', 'Friction Rub', 'Gallop']
        },
      ],
    },
  ],
};

const generateHTML = (systemsState, sectionToGenerate = null) => {
  let html = '';
  const sections = sectionToGenerate ? [sectionToGenerate] : Object.keys(systemsState || {});

  sections.forEach(section => {
    const sectionData = systemsState?.[section];
    if (!sectionData) return;

    let sectionHtml = "";

    // Iterate over systems (e.g. Constitutional, Eyes)
    Object.entries(sectionData).forEach(([systemName, systemData]) => {
      if (!systemData) return;

      const customNote = systemData.custom;
      const flatPositives = [];
      const flatNegatives = [];
      const flatFindings = []; // From top-level checkboxes
      const subsectionsParts = [];

      // Helper to process a bundle of symptoms/checkboxes
      const processBundle = (symptomsObj, checkboxesObj) => {
        const p = [], n = [], f = [];
        if (symptomsObj) {
          Object.entries(symptomsObj).forEach(([k, v]) => {
            if (v === true) p.push(k);
            if (v === false) n.push(k);
          });
        }
        if (checkboxesObj) {
          Object.entries(checkboxesObj).forEach(([k, v]) => {
            if (v === true) f.push(k);
          });
        }
        return { p, n, f };
      };

      // 1. Check for specific known container keys (symptoms, checkboxes) at top level
      const topBundle = processBundle(systemData.symptoms, systemData.checkboxes);

      // 2. Iterate keys to find:
      //    a) Direct boolean values (Flat style where symptoms are direct properties)
      //    b) Subsections (Objects that are not 'symptoms' or 'checkboxes')
      Object.entries(systemData).forEach(([key, val]) => {
        if (key === 'custom' || key === 'symptoms' || key === 'checkboxes') return;

        if (typeof val === 'boolean') {
          if (val === true) flatPositives.push(key);
          if (val === false) flatNegatives.push(key);
        } else if (typeof val === 'object' && val !== null) {
          // It's a subsection
          const { p, n, f } = processBundle(val.symptoms, val.checkboxes);

          if (p.length || n.length || f.length) {
            let subStr = "";
            // Subsection title
            subStr += `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> `;
            const parts = [];
            if (p.length) parts.push(`Positive for ${p.join(", ")}`);
            if (n.length) parts.push(`Negative for ${n.join(", ")}`);
            if (f.length) parts.push(`Findings: ${f.join(", ")}`);
            subStr += parts.join(". ");
            subsectionsParts.push(subStr);
          }
        }
      });

      // Merge top-level structured data into flat arrays
      flatPositives.push(...topBundle.p);
      flatNegatives.push(...topBundle.n);
      flatFindings.push(...topBundle.f);

      // Construct the text for this system
      const systemParts = [];

      // Add Subsection texts
      if (subsectionsParts.length) {
        systemParts.push(...subsectionsParts);
      }

      // Add Flat texts
      const flatParts = [];
      if (flatPositives.length) flatParts.push(`Positive for ${flatPositives.join(", ")}`);
      if (flatNegatives.length) flatParts.push(`Negative for ${flatNegatives.join(", ")}`);
      if (flatFindings.length) flatParts.push(`Findings: ${flatFindings.join(", ")}`);

      if (flatParts.length) {
        systemParts.push(flatParts.join(". "));
      }

      if (customNote) {
        systemParts.push(customNote);
      }

      if (systemParts.length > 0) {
        // Start header for the section (e.g. Review of Systems) if not started
        if (sectionHtml === '') sectionHtml += `<h3>${section}:</h3><ul>`;

        const systemLabel = systemName.charAt(0).toUpperCase() + systemName.slice(1);
        sectionHtml += `<li><strong>${systemLabel}:</strong> ${systemParts.join(". ")}.</li>`;
      }
    });

    if (sectionHtml) {
      sectionHtml += "</ul>";
      html += sectionHtml;
    }
  });

  return html;
};

const GenericBodySystemComponent = React.memo(({ title, subsections, state, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempNote, setTempNote] = useState('');

  const handleCustomNoteClick = (event) => {
    setTempNote(state?.custom || '');
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    onUpdate(null, 'custom', null, tempNote);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? `simple-popover-${title}` : undefined;

  return (
    <Box sx={{ border: '1px solid #ddd', padding: 1, marginBottom: 1, width: '100%', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Grid container spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ borderBottom: '1px solid #eee', pb: 0.5, mb: 1 }}>
        <Grid>
          <IconButton aria-describedby={id} onClick={handleCustomNoteClick} size="small">
            <Icon sx={{ color: state?.custom ? 'primary.main' : 'action.active', fontSize: 20 }}>description</Icon>
          </IconButton>
        </Grid>
        <Grid size="grow">
          <Typography variant="subtitle2" sx={{ marginLeft: 1, fontWeight: 'bold' }}>{title}</Typography>
        </Grid>
      </Grid>
      {subsections.map((sub, idx) => {
        const subTitle = sub.subsectionTitle || sub.title || '';
        const subKey = subTitle.toLowerCase();
        // If we have a subTitle, we expect nested state. Otherwise, we use the root state of this system.
        const subState = subTitle ? (state[subKey] || {}) : state;

        const getVal = (type, key) => {
          if (type === 'checkbox') return subState.checkboxes?.[key] || false;
          if (type === 'symptom') return subState.symptoms?.[key] ?? subState[key];
        };

        const triggerUpdate = (type, key, val) => {
          onUpdate(subTitle, type, key, val);
        };

        return (
          <Box key={idx} sx={{ mb: 1 }}>
            {!!subTitle && <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: 0.5 }}>{subTitle}</Typography>}
            {/* Checkboxes */}
            {sub.checkboxes?.length > 0 && (
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {sub.checkboxes.map(cb => (
                  <Grid key={cb} size={6}>
                    <Box
                      onClick={() => triggerUpdate('checkbox', cb, !getVal('checkbox', cb))}
                      sx={{
                        display: 'flex', alignItems: 'center', p: 0.5, borderRadius: 1,
                        cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }
                      }}>
                      <Checkbox size="small" checked={!!getVal('checkbox', cb)} sx={{ p: 0.5, mr: 0.5 }} />
                      <Typography variant="caption" sx={{ lineHeight: 1.2 }}>{cb}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            {/* Symptoms */}
            {sub.symptoms?.length > 0 && (
              <Grid container spacing={1}>
                {sub.symptoms.map(sym => {
                  const val = getVal('symptom', sym);
                  return (
                    <Grid key={sym} size={6}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        p: 0.5, px: 1, borderRadius: 1,
                        bgcolor: val === true ? 'error.light' : val === false ? 'success.light' : 'action.selected',
                        color: val != null ? 'white' : 'text.primary',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: val != null ? 'bold' : 'normal', flex: 1 }}>{sym}</Typography>
                        <Box sx={{ display: 'flex' }}>
                          <Icon
                            onClick={(e) => { e.stopPropagation(); triggerUpdate('symptom', sym, true); }}
                            sx={{ fontSize: 16, opacity: val === true ? 1 : 0.5, '&:hover': { opacity: 1 }, mr: 1 }}>add</Icon>
                          <Icon
                            onClick={(e) => { e.stopPropagation(); triggerUpdate('symptom', sym, false); }}
                            sx={{ fontSize: 16, opacity: val === false ? 1 : 0.5, '&:hover': { opacity: 1 } }}>remove</Icon>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        );
      })}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            placeholder={`Add note for ${title}...`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Popover>
    </Box>
  );
});

const GenericNoteWriterTab = ({ data, state, updateState }) => {
  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={2}>
        {data.map((system, idx) => (
          <Grid key={idx} size={{ xs: 12, md: 6, lg: 4 }}>
            <GenericBodySystemComponent
              title={system.title}
              subsections={system.subsections || [{ title: '', symptoms: system.symptoms, checkboxes: [] }]}
              state={state[system.title.toLowerCase()] || {}}
              onUpdate={(subTitle, type, key, val) => {
                updateState(prev => {
                  const sysKey = system.title.toLowerCase();
                  const sysState = prev[sysKey] ? { ...prev[sysKey] } : {};

                  if (type === 'custom') {
                    sysState.custom = val;
                  } else {
                    let targetState = sysState;
                    if (subTitle) {
                      const subKeyLower = subTitle.toLowerCase();
                      sysState[subKeyLower] = { ...sysState[subKeyLower] };
                      targetState = sysState[subKeyLower];
                    }

                    if (type === 'checkbox') {
                      targetState.checkboxes = { ...targetState.checkboxes, [key]: val };
                    } else if (type === 'symptom') {
                      // Handle both structured symptoms object and flat symptom keys
                      if (typeof targetState.symptoms === 'object' || subTitle) {
                        // If we are in a subsection, or if we already have a symptoms object
                        // Ensure symptoms object exists
                        targetState.symptoms = { ...targetState.symptoms };
                        const current = targetState.symptoms[key];
                        targetState.symptoms[key] = current === val ? null : val;
                      } else {
                        // Fallback for simple ROS-style flat structure
                        const current = targetState[key];
                        targetState[key] = current === val ? null : val;
                      }
                    }
                  }

                  return { ...prev, [sysKey]: sysState };
                });
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const Notewriter = () => {
  const { useEncounter } = usePatient()
  const [activeNote, setActiveNote] = useEncounter().smartData.activeNote()
  const [selectedTabLabel, setSelectedTabLabel] = useState(Object.keys(systemsTemplate)[0] ?? '')

  const systemsState = activeNote?.systems || {};

  const setSystemState = (systemName, newStateOrFn) => {
    setActiveNote(prev => {
      if (!prev) return prev;
      const currentSystems = prev.systems || {};
      const currentSystemState = currentSystems[systemName] || {};

      const newValue = typeof newStateOrFn === 'function' ? newStateOrFn(currentSystemState) : newStateOrFn;

      return {
        ...prev,
        systems: {
          ...currentSystems,
          [systemName]: newValue
        }
      };
    });
  };

  const TABS_CONFIG = Object.keys(systemsTemplate).map(key => ({
    id: key,
    label: key,
    data: systemsTemplate[key],
    state: systemsState[key] || {},
    setter: (val) => setSystemState(key, val)
  }));

  const handleCopy = async () => {
    const html = generateHTML(systemsState);
    if (!html) return;

    try {
      // Create a plain text version that attempts to preserve some structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.replace(/<\/li>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/p>/g, '\n\n');
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        })
      ]);
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      // Fallback for browsers that might not support ClipboardItem fully or restricted contexts
      navigator.clipboard.writeText(html); // Fallback to storing raw HTML as text if rich copy fails
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TabView value={selectedTabLabel}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <TabList onChange={(event, newTab) => setSelectedTabLabel(newTab)}>
            {TABS_CONFIG.map((tab) => (
              <Tab key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </TabList>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopy}
          >
            Copy Text
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {TABS_CONFIG.map(tab => (
            <TabPanel key={tab.id} value={tab.id} sx={{ p: 0, height: '100%' }}>
              <GenericNoteWriterTab
                data={tab.data}
                state={tab.state}
                updateState={tab.setter}
              />
            </TabPanel>
          ))}
        </Box>
      </TabView>
    </div>
  );
};
export default Notewriter;
