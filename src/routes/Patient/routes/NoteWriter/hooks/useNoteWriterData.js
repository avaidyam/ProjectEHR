import { useState, useEffect } from 'react';

export const exampleContent =
    '<h2 style="text-align: center">Hey there 👋</h2><p>This is a <em>basic</em> example of <code>mui-tiptap</code>, which combines <a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a> with customizable <a target="_blank" rel="noopener noreferrer nofollow" href="https://mui.com/">MUI (Material-UI)</a> styles, plus a suite of additional components and extensions! Sure, there are <strong>all <em>kinds</em> of <s>text</s> <u>formatting</u> options</strong> you’d probably expect from a rich text editor. But wait until you see the <span data-type="mention" data-id="15" data-label="Axl Rose">@Axl Rose</span> mentions and lists:</p><ul><li><p>That’s a bullet list with one …</p></li><li><p>… or two list items.</p></li></ul><p>Isn’t that great? And all of that is editable. <strong><span style="color: #ff9900">But wait, </span><span style="color: #403101"><mark data-color="#ffd699" style="background-color: #ffd699; color: inherit">there’s more!</mark></span></strong> Let’s try a code block:</p><pre><code class="language-css">body {\n  display: none;\n}</code></pre><p></p><p>That’s only the tip of the iceberg. Feel free to add and resize images:</p><img height="auto" src="https://picsum.photos/600/400" alt="random image" width="350" style="aspect-ratio: 3 / 2"><p></p><p>Organize information in tables:</p><table><tbody><tr><th colspan="1" rowspan="1"><p>Name</p></th><th colspan="1" rowspan="1"><p>Role</p></th><th colspan="1" rowspan="1"><p>Team</p></th></tr><tr><td colspan="1" rowspan="1"><p>Alice</p></td><td colspan="1" rowspan="1"><p>PM</p></td><td colspan="1" rowspan="1"><p>Internal tools</p></td></tr><tr><td colspan="1" rowspan="1"><p>Bob</p></td><td colspan="1" rowspan="1"><p>Software</p></td><td colspan="1" rowspan="1"><p>Infrastructure</p></td></tr></tbody></table><p></p><p>Or write down your groceries:</p><ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Milk</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Eggs</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Sriracha</p></div></li></ul><blockquote><p>Wow, that’s amazing. Good work! 👏 <br>— Mom</p></blockquote><p>Give it a try and click around!</p>';

export const bodySystems = [
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
];

export const physicalExamBodySystems = [
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
];

const temporaryStorage = {};

const generateInitialRosState = (systems) => {
    const initialState = {};
    systems.forEach(system => {
        const systemState = {};
        system.symptoms.forEach(symptom => {
            systemState[symptom] = null;
        });
        systemState['custom'] = null;
        initialState[system.title.toLowerCase()] = systemState;
    });
    return initialState;
};

const generateInitialPEState = (systems) => {
    const initialState = {};
    systems.forEach(system => {
        const systemState = {};
        system.subsections.forEach((subsection) => {
            const subsectionTitle = subsection.subsectionTitle ? subsection.subsectionTitle.toLowerCase() : '';
            systemState[subsectionTitle] = { symptoms: null, checkboxes: null };
        });
        initialState[system.title.toLowerCase()] = systemState;
        systemState['custom'] = null;
    });
    return initialState;
};

export const useNoteWriterData = (patientMRN, enc) => {
    const [activeContextId, setActiveContextId] = useState(null);
    const currentContextId = patientMRN && enc ? `${patientMRN}-${enc}` : null;

    // Force re-render helper
    const [_, setTick] = useState(0);

    useEffect(() => {
        if (!currentContextId) return;

        if (temporaryStorage[patientMRN]?.[enc] === undefined) {
            if (!temporaryStorage[patientMRN]) temporaryStorage[patientMRN] = {};

            temporaryStorage[patientMRN][enc] = {
                editorState: exampleContent,
                peState: generateInitialPEState(physicalExamBodySystems),
                rosState: generateInitialRosState(bodySystems)
            };
        }
        setActiveContextId(currentContextId);
    }, [currentContextId, patientMRN, enc]);

    const isReady = activeContextId === currentContextId;

    // Accessors
    const getStorage = () => temporaryStorage[patientMRN]?.[enc];

    const editorState = isReady ? getStorage().editorState : exampleContent;
    const peState = isReady ? getStorage().peState : {};
    const rosState = isReady ? getStorage().rosState : {};

    // Setters
    const setEditorState = (newState) => {
        if (isReady && getStorage()) {
            getStorage().editorState = newState;
        }
    };

    const setPEState = (newStateOrFn) => {
        if (isReady && getStorage()) {
            const newValue = typeof newStateOrFn === 'function' ? newStateOrFn(getStorage().peState) : newStateOrFn;
            getStorage().peState = newValue;
            setTick(t => t + 1); // Trigger re-render to reflect updates
        }
    };

    const setRosState = (newStateOrFn) => {
        if (isReady && getStorage()) {
            const newValue = typeof newStateOrFn === 'function' ? newStateOrFn(getStorage().rosState) : newStateOrFn;
            getStorage().rosState = newValue;
            setTick(t => t + 1);
        }
    };

    return {
        isReady,
        editorState,
        setEditorState,
        peState,
        setPEState,
        rosState,
        setRosState,
        bodySystems,
        physicalExamBodySystems
    };
};

export const generateROSHtml = (rosState) => {
    let html = '';

    Object.entries(rosState).forEach(([systemName, symptoms]) => {
        const positives = [];
        const negatives = [];
        let customNote = null;

        Object.entries(symptoms).forEach(([symptom, state]) => {
            if (state === true) positives.push(symptom);
            if (state === false) negatives.push(symptom);
            if (symptom === 'custom' && state) customNote = state;
        });

        if (positives.length || negatives.length || customNote) {
            if (html === '') html += "<h3>Review of Systems:</h3><ul>";

            let line = `<strong>${systemName.charAt(0).toUpperCase() + systemName.slice(1)}:</strong> `;
            const parts = [];
            if (positives.length) parts.push(`Positive for ${positives.join(", ")}`);
            if (negatives.length) parts.push(`Negative for ${negatives.join(", ")}`);
            if (customNote) parts.push(customNote);

            line += parts.join(". ") + ".";
            html += `<li>${line}</li>`;
        }
    });

    if (html) html += "</ul>";
    return html;
};

export const generatePEHtml = (peState) => {
    let html = '';

    Object.entries(peState).forEach(([systemName, systemData]) => {
        if (!systemData) return;

        const customNote = systemData.custom;
        let systemTextParts = [];
        let hasSubsectionText = false;

        Object.entries(systemData).forEach(([subsectionTitle, subsectionData]) => {
            if (subsectionTitle === 'custom' || !subsectionData) return;

            const positives = [];
            const negatives = [];
            const checkboxesText = [];

            Object.entries(subsectionData.symptoms || {}).forEach(([symptom, state]) => {
                if (state === true) positives.push(symptom);
                if (state === false) negatives.push(symptom);
            });

            Object.entries(subsectionData.checkboxes || {}).forEach(([checkbox, state]) => {
                if (state) checkboxesText.push(checkbox);
            });

            if (positives.length || negatives.length || checkboxesText.length) {
                hasSubsectionText = true;
                let subText = "";

                if (subsectionTitle) {
                    subText += `<strong>${subsectionTitle.charAt(0).toUpperCase() + subsectionTitle.slice(1)}:</strong> `;
                }

                const subParts = [];
                if (positives.length) subParts.push(`Positive for ${positives.join(", ")}`);
                if (negatives.length) subParts.push(`Negative for ${negatives.join(", ")}`);
                if (checkboxesText.length) subParts.push(`Findings: ${checkboxesText.join(", ")}`);

                subText += subParts.join(". ");
                systemTextParts.push(subText);
            }
        });

        if (customNote) {
            systemTextParts.push(customNote);
        }

        if (hasSubsectionText || customNote) {
            if (html === '') html += "<h3>Physical Exam:</h3><ul>";

            let systemLine = `<strong>${systemName.charAt(0).toUpperCase() + systemName.slice(1)}:</strong> `;
            // If we have distinct subsections, we might want to list them or just join them
            // For simplicity in a list item, let's join them with newlines or spaces
            systemLine += systemTextParts.join(". "); // Simplified join
            html += `<li>${systemLine}.</li>`;
        }
    });

    if (html) html += "</ul>";
    return html;
};
