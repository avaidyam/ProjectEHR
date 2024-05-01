
export const PROVIDER_ROLE_TYPES = {
    PCP: 'PCP',
}

export const PROVIDER_TITLE = {
    DO: 'DO',
    MD: 'MD',
    RN: 'RN',
}

export const TEST_PATIENT_INFO = ({ patientMRN }) => ({
    firstName: 'John',
    lastName: 'Hanson',
    dateOfBirth: '1958-05-15',
    age: 66,
    avatarUrl: null,
    preferredLanguage: 'English',
    gender: 'Male',
    mrn: patientMRN,
    primaryProvider: {
      providerFirstName: 'John',
      providerLastName: 'David Squire II, USAF',
      providerTitle: PROVIDER_TITLE.RN,
      providerRole: PROVIDER_ROLE_TYPES.PCP,
      providerAvatarUrl: null,
    },
    insurance: {
      carrierName: 'UnitedHealthcare',
    },
    careGaps: [
      { id: '1', name: 'COVID Booster #8' },
      { id: '2', name: 'COVID Booster #9' },
      { id: '3', name: 'Hypertension' },
    ],
    problems: [],
    vitals: [
      {
        id: '123456789',
        measurementDate: '2023-10-02',
        bloodPressureSystolic: 148,
        bloodPressureDiastolic: 96,
        height: `6' 0"`,
        weight: 210,
        bmi: 28.5,
        respiratoryRate: 12,
        heartRate: 65,
      },
      {
        id: '123456790',
        measurementDate: '2023-09-15',
        bloodPressureSystolic: 142,
        bloodPressureDiastolic: 92,
        height: `6' 0"`,
        weight: 212,
        bmi: 28.5,
        respiratoryRate: 14,
        heartRate: 73,
      },
      {
        id: '123456790',
        measurementDate: '2023-04-01',
        bloodPressureSystolic: 152,
        bloodPressureDiastolic: 90,
        height: `6' 0"`,
        weight: 218,
        bmi: 29.5,
        respiratoryRate: 14,
        heartRate: 80,
      },
      {
        id: '123456791',
        measurementDate: '2022-12-03',
        bloodPressureSystolic: 158,
        bloodPressureDiastolic: 96,
        height: `6' 0"`,
        weight: 220,
        bmi: 29.5,
        respiratoryRate: 14,
        heartRate: 80,
      },
    ],
    documents: [
      {
        kind: "Encounters",
        data: {
          id: "A1B2C3D4E",
          summary: "Regular office visit for hypertension management.",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. Samantha Jones",
          description: "Follow-up for hypertension and medication adjustment.",
          dischData: "05-10-2022",
          csn: "CSN12345",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Regular office visit for hypertension management\nVisit Diagnosis: Hypertension"
        }
      },
      {
        kind: "Encounters",
        data: {
          id: "F5G6H7I8J",
          summary: "Follow-up appointment for hyperlipidemia.",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. Samantha Jones",
          description: "Discussion about lipid profile results and lifestyle modifications.",
          dischData: "08-15-2022",
          csn: "CSN67890",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Follow-up appointment for hyperlipidemia\nVisit Diagnosis: Hyperlipidemia"

        }
      },
      {
        kind: "Encounters",
        data: {
          id: "K9L0M1N2O",
          summary: "Regular check-up for diabetes management.",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. Samantha Jones",
          description: "Review of blood glucose logs and adjustment of insulin regimen.",
          dischData: "11-20-2022",
          csn: "CSN24680",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Regular check-up for diabetes management\nVisit Diagnosis: Diabetes"
        }
      },
      {
        kind: "Encounters",
        data: {
          id: "P3Q4R5S6T",
          summary: "Appointment for osteoarthritis follow-up.",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. Jason Smith",
          description: "Discussion about joint pain management and physical therapy.",
          dischData: "01-05-2023",
          csn: "CSN13579",
          content: "Location: Office\nProvider: Dr. Jason Smith\nReason for Visit: Appointment for osteoarthritis follow-up\nVisit Diagnosis: Osteoarthritis"
        }
      },
      {
        kind: "Encounters",
        data: {
          id: "U7V8W9X0Y",
          summary: "Consultation for gastro-esophageal reflux disease.",
          type: "Consultation",
          encClosed: "No",
          with: "Dr. Samantha Jones",
          description: "Evaluation of symptoms and discussion of treatment options.",
          dischData: "03-15-2023",
          csn: "CSN97531",
          content: "Location: Consultation\nProvider: Dr. Samantha Jones\nReason for Visit: Consultation for gastro-esophageal reflux disease\nVisit Diagnosis: Gastro-esophageal reflux disease"
        }
      },
      {
        kind: "Encounters",
        data: {
          id: "Z1A2B3C4D",
          summary: "Follow-up for right foot fracture.",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. Jason Smith",
          description: "X-ray review and assessment of healing progress.",
          dischData: "06-30-2023",
          csn: "CSN35791",
          content: "Location: Office\nProvider: Dr. Jason Smith\nReason for Visit: Follow-up for right foot fracture\nVisit Diagnosis: Right foot fracture"
        }
      },
      {
        kind: "Note",
        data: {
          id: "BJ0Q11LRR",
          summary: "Patient presented with elevated blood pressure readings.",
          filingDate: "01-02-2023",
          encDate: "01-01-2023",
          encDept: "Cardiology",
          author: "Dr. Samantha Jones",
          encType: "Office Visit",
          category: "Hypertension Management",
          status: "Active",
          tag: "Medical",
          encounterProvider: "Dr. Samantha Jones",
          noteType: "Progress Note",
          content: "History:\n- Patient, a 55-year-old male, presented with elevated blood pressure readings during a routine check-up. He reports occasional headaches but denies any chest pain, shortness of breath, or vision changes. Past medical history includes hypertension, controlled with medication.\n\nPhysical Examination:\n- Vital signs: Blood pressure 160/95 mmHg, heart rate 80 bpm, respiratory rate 16/min, temperature 37°C. General appearance: Alert and oriented, no acute distress. Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops. Respiratory: Clear breath sounds bilaterally. Abdomen: Soft, non-tender, non-distended, no organomegaly. Extremities: No edema, pulses intact bilaterally.\n\nAssessment:\n- Hypertension, stable\n\nPlan:\n- Increased dose of antihypertensive medication.\n- Follow-up in 4 weeks."
        }
      },
      {
        kind: "Note",
        data: {
          id: "ZRIU6JMTD",
          summary: "Discussion about dietary modifications and exercise regimen.",
          filingDate: "02-02-2023",
          encDate: "02-01-2023",
          encDept: "Nutrition",
          author: "Dr. Samantha Jones",
          encType: "Office Visit",
          category: "Lifestyle Counseling",
          status: "Inactive",
          tag: "Health Education",
          encounterProvider: "Dr. Samantha Jones",
          noteType: "Consultation Note",
          content: "History:\n- Patient presented for a follow-up appointment to discuss dietary modifications and exercise regimen. He reports adhering to a low-sodium diet and engaging in regular exercise but expresses frustration with slow weight loss progress.\n\nPhysical Examination:\n- Weight stable from previous visit. No other significant changes noted.\n\nAssessment:\n- Lifestyle counseling\n\nPlan:\n- Reinforcement of dietary and exercise recommendations.\n- Referral to nutritionist for further guidance."

        }
      },
      {
        kind: "Note",
        data: {
          id: "IL4EEGBZP",
          summary: "Discussion about statin therapy and lipid profile monitoring.",
          filingDate: "03-02-2023",
          encDate: "08-15-2022",
          encDept: "Cardiology",
          author: "Dr. Samantha Jones",
          encType: "Office Visit",
          category: "Hyperlipidemia Management",
          status: "Active",
          tag: "Medication Management",
          encounterProvider: "Dr. Samantha Jones",
          noteType: "Progress Note",
          content: "History:\n- Patient presented with concerns about starting statin therapy due to fear of side effects. He reports a family history of heart disease and acknowledges the importance of cholesterol management.\n\nPhysical Examination:\n- No significant findings.\n\nAssessment:\n- Hyperlipidemia\n\nPlan:\n- Discussion of benefits and risks of statin therapy.\n- Lipid profile monitoring scheduled in 3 months."
        }
      },
      {
        kind: "Note",
        data: {
          id: "8CR3QJZ17",
          summary: "Patient demonstrated proper insulin administration technique.",
          filingDate: "04-02-2023",
          encDate: "11-20-2022",
          encDept: "Endocrinology",
          author: "Dr. Samantha Jones",
          encType: "Office Visit",
          category: "Diabetes Management",
          status: "Active",
          tag: "Treatment Compliance",
          encounterProvider: "Dr. Samantha Jones",
          noteType: "Progress Note",
          content: "History:\n- Patient presented for a follow-up appointment for diabetes management. He reports compliance with insulin regimen but expresses frustration with difficulty in achieving glycemic control.\n\nPhysical Examination:\n- No abnormalities noted.\n\nAssessment:\n- Diabetes, uncontrolled\n\nPlan:\n- Adjustment of insulin regimen.\n- Education on carbohydrate counting provided."
        }
      },
      {
        kind: "Note",
        data: {
          id: "SVF729ALY",
          summary: "Discussion about joint pain relief options.",
          filingDate: "05-02-2023",
          encDate: "01-05-2023",
          encDept: "Orthopedics",
          author: "Dr. Jason Smith",
          encType: "Office Visit",
          category: "Osteoarthritis Management",
          status: "Active",
          tag: "Pain Management",
          encounterProvider: "Dr. Jason Smith",
          noteType: "Progress Note",
          content: "History:\n- Patient presented with complaints of worsening joint pain in his knees. He reports difficulty with activities of daily living and decreased mobility.\n\nPhysical Examination:\n- Limited range of motion in both knees. Crepitus noted on movement.\n\nAssessment:\n- Osteoarthritis, bilateral knees\n\nPlan:\n- Referral to orthopedic specialist for further evaluation.\n- Trial of nonsteroidal anti-inflammatory drugs (NSAIDs) for pain management."

        }
      },
      {
        kind: "Note",
        data: {
          id: "OXV5SX525",
          summary: "Discussion about GERD triggers and lifestyle modifications.",
          filingDate: "06-02-2023",
          encDate: "03-15-2023",
          encDept: "Gastroenterology",
          author: "Dr. Samantha Jones",
          encType: "Consultation",
          category: "GERD Management",
          status: "Active",
          tag: "Health Education",
          encounterProvider: "Dr. Samantha Jones",
          noteType: "Consultation Note",
          content: "History:\n- Patient presented with symptoms of gastroesophageal reflux disease (GERD) including heartburn and regurgitation. Symptoms worsen after large meals and lying down.\n\nPhysical Examination:\n- No abnormalities found.\n\nAssessment:\n- GERD, uncomplicated\n\nPlan:\n- Lifestyle modifications advised, including dietary changes and elevation of the head of the bed.\n- Trial of proton pump inhibitor (PPI) therapy for symptom relief."

        }
      },
      {
        kind: "Note",
        data: {
          id: "0ECOQCCC9",
          summary: "X-ray confirms healing progress of right foot fracture.",
          filingDate: "07-02-2023",
          encDate: "06-30-2023",
          encDept: "Orthopedics",
          author: "Dr. Jason Smith",
          encType: "Office Visit",
          category: "Orthopedic Assessment",
          status: "Active",
          tag: "Diagnostic Imaging",
          encounterProvider: "Dr. Jason Smith",
          noteType: "Progress Note",
          content: "History:\n- Patient presented for a follow-up appointment for a right foot fracture sustained from a fall at home. He reports decreased pain and improved mobility since the injury.\n\nPhysical Examination:\n- X-ray confirms healing progress. No signs of infection.\n\nAssessment:\n- Right foot fracture, healing\n\nPlan:\n- Continue weight-bearing restrictions as tolerated.\n- Follow-up X-ray in 6 weeks."

        }
      },
      {kind: 'Imaging',
          data:{
            patientSharing: 'Shared',
            orderedDate: '01-03-2023',
            status: 'Final Result',
            statusDate: '01-04-2023',
            accessionNumber: '123456',
            exam: 'MRI Brain',
            abnormal: 'No',
            acuity: 'Normal',
            encounter: 'Diagnostic Imaging Encounter 1',
            provider: 'Imaging Provider 1',
          },
        },
        {kind: 'Imaging',
          data: {
            patientSharing: 'Not Shared',
            orderedDate: '02-03-2023',
            status: 'Final Result',
            statusDate: '02-04-2023',
            accessionNumber: '789012',
            exam: 'X-Ray Chest',
            abnormal: 'Yes',
            acuity: 'Moderate',
            encounter: 'Diagnostic Imaging Encounter 2',
            provider: 'Imaging Provider 2',
          },
        }, {
          kind: 'Lab',
          data: {
            'Patient Sharing': 'Shared',
            'Date/Time': '01-03-2023 09:30 AM',
            'Test': 'Blood Test',
            'Status': 'Completed',
            'Abnormal?': 'No',
            'Expected Date': '01-10-2023',
            'Expiration': 'N/A',
            'Encounter Provider': 'Dr. Smith'
          }
        },
        {
          kind: 'Cardiac',
          data: {
            'Patient Sharing': 'Not Shared',
            'Ordered': '01-02-2023',
            'Performed': '01-03-2023',
            'Test': 'ECG',
            'Status': 'Completed',
            'Accession #': '123456',
            'Encounter Type': 'Consultation',
            'Auth Provider': 'Dr. Johnson',
            'Perf Provider': 'Dr. Williams'
          }
        },
        {
          kind: 'Specialty Test',
          data: {
            'Patient Sharing': 'Shared',
            'Ordered': '01-02-2023',
            'Performed': '01-03-2023',
            'Test': 'MRI',
            'Status': 'Completed',
            'Accession #': '789012',
            'Encounter Type': 'Consultation',
            'Auth Provider': 'Dr. Anderson',
            'Perf Provider': 'Dr. Davis'
          }
        },
        {
          kind: 'Other',
          data: {
            'Patient Sharing': 'Shared',
            'Ordered': '01-02-2023',
            'Performed': '01-03-2023',
            'Test': 'X-ray',
            'Status': 'Completed',
            'Accession #': '345678',
            'Encounter Type': 'Consultation',
            'Auth Provider': 'Dr. Miller',
            'Perf Provider': 'Dr. Wilson'
          }
        },
        {
          kind: 'Meds',
          data: {
            'Date': '01-01-2023',
            'AMB/IP': 'AMB',
            'Medication': 'Medicine A',
            'Order Detail': '1 tablet per day',
            'Long-term': 'Yes',
            'End Date': 'N/A',
            'Discountinue': 'No',
            'Discontinue Reason': 'N/A',
            'Provider': 'Dr. Brown'
          }
        },
        {
          kind: 'Letter',
          data: {
            'Viewed by pt': 'Yes',
            'Letter Date': '01-05-2023',
            'Letter From': 'Dr. White',
            'Reason': 'Follow-up',
            'Comments': 'N/A',
            'Status': 'Sent',
            'Encounter Date': '01-03-2023'
          }
        },
        {
          kind: 'Referrals',
          data: {
            'Order Attachemnt': 'Yes',
            'Date': '01-04-2023',
            'To Specialty': 'Cardiology',
            'To PRovider': 'Dr. Taylor',
            'Status': 'Pending',
            'Auth #': '987654',
            'Diagnosis': 'Heart Disease',
            'Order': 'Consultation',
            'Procedure': 'Angiogram',
            'Form Provider': 'Dr. Parker'
          }
        },
        {
          kind: 'Scan Doc',
          data: {
            'Dcoument Type': 'Report',
            'Description': 'Medical Report',
            'Enc Date': '01-03-2023',
            'Scan Date': '01-02-2023',
            'Expiration date': 'N/A',
            'File attached to': 'Encounter'
          }
        },
          {
        kind: 'Lab',
        data: {
          'Patient Sharing': 'Not Shared',
          'Date/Time': '01-05-2023 10:45 AM',
          'Test': 'Urine Test',
          'Status': 'Pending',
          'Abnormal?': 'Yes',
          'Expected Date': '01-12-2023',
          'Expiration': '01-15-2023',
          'Encounter Provider': 'Dr. Martinez'
        }
      },
      {
        kind: 'Cardiac',
        data: {
          'Patient Sharing': 'Shared',
          'Ordered': '01-04-2023',
          'Performed': '01-06-2023',
          'Test': 'Echocardiogram',
          'Status': 'Completed',
          'Accession #': '234567',
          'Encounter Type': 'Consultation',
          'Auth Provider': 'Dr. Hall',
          'Perf Provider': 'Dr. Lopez'
        }
      },
      {
        kind: 'Specialty Test',
        data: {
          'Patient Sharing': 'Not Shared',
          'Ordered': '01-07-2023',
          'Performed': '01-09-2023',
          'Test': 'CT Scan',
          'Status': 'Completed',
          'Accession #': '345678',
          'Encounter Type': 'Consultation',
          'Auth Provider': 'Dr. Adams',
          'Perf Provider': 'Dr. Reed'
        }
      },
      {
        kind: 'Other',
        data: {
          'Patient Sharing': 'Shared',
          'Ordered': '01-08-2023',
          'Performed': '01-10-2023',
          'Test': 'Ultrasound',
          'Status': 'Completed',
          'Accession #': '456789',
          'Encounter Type': 'Consultation',
          'Auth Provider': 'Dr. Turner',
          'Perf Provider': 'Dr. Parker'
        }
      },
      {
        kind: 'Meds',
        data: {
          'Date': '01-05-2023',
          'AMB/IP': 'IP',
          'Medication': 'Medicine B',
          'Order Detail': '2 tablets per day',
          'Long-term': 'Yes',
          'End Date': 'N/A',
          'Discountinue': 'No',
          'Discontinue Reason': 'N/A',
          'Provider': 'Dr. Lewis'
        }
      },
      {
        kind: 'Letter',
        data: {
          'Viewed by pt': 'No',
          'Letter Date': '01-07-2023',
          'Letter From': 'Dr. Turner',
          'Reason': 'Follow-up',
          'Comments': 'N/A',
          'Status': 'Sent',
          'Encounter Date': '01-06-2023'
        }
      },
      {
        kind: 'Referrals',
        data: {
          'Order Attachment': 'No',
          'Date': '01-09-2023',
          'To Specialty': 'Neurology',
          'To Provider': 'Dr. Hughes',
          'Status': 'Approved',
          'Auth #': '876543',
          'Diagnosis': 'Migraine',
          'Order': 'Consultation',
          'Procedure': 'MRI Scan',
          'Form Provider': 'Dr. Turner'
        }
      },
      {
        kind: 'Scan Doc',
        data: {
          'Document Type': 'Prescription',
          'Description': 'Prescription Document',
          'Encounter Date': '01-10-2023',
          'Scan Date': '01-09-2023',
          'Expiration Date': 'N/A',
          'File Attached to': 'Prescription'
        }
      },
      {
        kind: "Data",
        data: {
          id: "A1B2C3D4E",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Regular office visit for hypertension management\nVisit Diagnosis: Hypertension"
        }
      },
      {
        kind: "Data",
        data: {
          id: "F5G6H7I8J",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Follow-up appointment for hyperlipidemia\nVisit Diagnosis: Hyperlipidemia"
        }
      },
      {
        kind: "Data",
        data: {
          id: "K9L0M1N2O",
          content: "Location: Office\nProvider: Dr. Samantha Jones\nReason for Visit: Regular check-up for diabetes management\nVisit Diagnosis: Diabetes"
        }
      },
      {
        kind: "Data",
        data: {
          id: "P3Q4R5S6T",
          content: "Location: Office\nProvider: Dr. Jason Smith\nReason for Visit: Appointment for osteoarthritis follow-up\nVisit Diagnosis: Osteoarthritis"
        }
      },
      {
        kind: "Data",
        data: {
          id: "U7V8W9X0Y",
          content: "Location: Consultation\nProvider: Dr. Samantha Jones\nReason for Visit: Consultation for gastro-esophageal reflux disease\nVisit Diagnosis: Gastro-esophageal reflux disease"
        }
      },
      {
        kind: "Data",
        data: {
          id: "Z1A2B3C4D",
          content: "Location: Office\nProvider: Dr. Jason Smith\nReason for Visit: Follow-up for right foot fracture\nVisit Diagnosis: Right foot fracture"
        }
      },
      {
        kind: "Data",
        data: {
          id: "BJ0Q11LRR",
          content: "History:\n- Patient, a 55-year-old male, presented with elevated blood pressure readings during a routine check-up. He reports occasional headaches but denies any chest pain, shortness of breath, or vision changes. Past medical history includes hypertension, controlled with medication.\n\nPhysical Examination:\n- Vital signs: Blood pressure 160/95 mmHg, heart rate 80 bpm, respiratory rate 16/min, temperature 37°C. General appearance: Alert and oriented, no acute distress. Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops. Respiratory: Clear breath sounds bilaterally. Abdomen: Soft, non-tender, non-distended, no organomegaly. Extremities: No edema, pulses intact bilaterally.\n\nAssessment:\n- Hypertension, stable\n\nPlan:\n- Increased dose of antihypertensive medication.\n- Follow-up in 4 weeks."
        }
      },
      {
        kind: "Data",
        data: {
          id: "ZRIU6JMTD",
          content: "History:\n- Patient presented for a follow-up appointment to discuss dietary modifications and exercise regimen. He reports adhering to a low-sodium diet and engaging in regular exercise but expresses frustration with slow weight loss progress.\n\nPhysical Examination:\n- Weight stable from previous visit. No other significant changes noted.\n\nAssessment:\n- Lifestyle counseling\n\nPlan:\n- Reinforcement of dietary and exercise recommendations.\n- Referral to nutritionist for further guidance."
        }
      },
      {
        kind: "Data",
        data: {
          id: "IL4EEGBZP",
          content: "History:\n- Patient presented with concerns about starting statin therapy due to fear of side effects. He reports a family history of heart disease and acknowledges the importance of cholesterol management.\n\nPhysical Examination:\n- No significant findings.\n\nAssessment:\n- Hyperlipidemia\n\nPlan:\n- Discussion of benefits and risks of statin therapy.\n- Lipid profile monitoring scheduled in 3 months."
        }
      },
      {
        kind: "Data",
        data: {
          id: "8CR3QJZ17",
          content: "History:\n- Patient presented for a follow-up appointment for diabetes management. He reports compliance with insulin regimen but expresses frustration with difficulty in achieving glycemic control.\n\nPhysical Examination:\n- No abnormalities noted.\n\nAssessment:\n- Diabetes, uncontrolled\n\nPlan:\n- Adjustment of insulin regimen.\n- Education on carbohydrate counting provided."
        }
      },
      {
        kind: "Data",
        data: {
          id: "SVF729ALY",
          content: "History:\n- Patient presented with complaints of worsening joint pain in his knees. He reports difficulty with activities of daily living and decreased mobility.\n\nPhysical Examination:\n- Limited range of motion in both knees. Crepitus noted on movement.\n\nAssessment:\n- Osteoarthritis, bilateral knees\n\nPlan:\n- Referral to orthopedic specialist for further evaluation.\n- Trial of nonsteroidal anti-inflammatory drugs (NSAIDs) for pain management."
        }
      },
      {
        kind: "Data",
        data: {
          id: "OXV5SX525",
          content: "History:\n- Patient presented with symptoms of gastroesophageal reflux disease (GERD) including heartburn and regurgitation. Symptoms worsen after large meals and lying down.\n\nPhysical Examination:\n- No abnormalities found.\n\nAssessment:\n- GERD, uncomplicated\n\nPlan:\n- Lifestyle modifications advised, including dietary changes and elevation of the head of the bed.\n- Trial of proton pump inhibitor (PPI) therapy for symptom relief."
        }
      },
      {
        kind: "Data",
        data: {
          id: "0ECOQCCC9",
          content: "History:\n- Patient presented for a follow-up appointment for a right foot fracture sustained from a fall at home. He reports decreased pain and improved mobility since the injury.\n\nPhysical Examination:\n- X-ray confirms healing progress. No signs of infection.\n\nAssessment:\n- Right foot fracture, healing\n\nPlan:\n- Continue weight-bearing restrictions as tolerated.\n- Follow-up X-ray in 6 weeks."
        }
      }
    ]
  }
)

export const TEST_PATIENT_HISTORY = ({patientMRN}) => (   
  {"medical": [
  {
    "diagnosis": "Hypertension",
    "date": "2010-01-15",
    "age": "52"
  },
  {
    "diagnosis": "Hyperlipidemia",
    "date": "2015-02-20",
    "age": "57"
  },
  {
    "diagnosis": "Non-insulin-dependent diabetes mellitus",
    "date": "2018-03-10",
    "age": "60"
  },
  {
    "diagnosis": "Osteoarthritis",
    "date": "2020-04-05",
    "age": "62"
  },
  {
    "diagnosis": "Prior history of right foot fracture",
    "date": "2021-05-20",
    "age": "63"
  },
  {
    "diagnosis": "Gastro-esophageal reflux disease",
    "date": "2022-06-10",
    "age": "64"
  }
],
"surgical": [
  {
    "procedure": "Cholecystectomy",
    "laterality": "",
    "date": "1994-06-15",
    "age": "48",
    "comment": ""
  },
  {
    "procedure": "Foot surgery",
    "laterality": "",
    "date": "2019-04-22",
    "age": "61",
    "comment": ""
  }
],
"family": [
  {
    "relationship": "Father",
    "name": "",
    "status": "Deceased",
    "age": 65,
    "problems": [
      {
        "description": "Heart disease",
        "ageOfOnset": "65"
      }
    ]
  },
  {
    "relationship": "Mother",
    "name": "",
    "status": "Deceased",
    "age": 78,
    "problems": [
      {
        "description": "Breast cancer",
        "ageOfOnset": "78"
      }
    ]
  },
  {
    "relationship": "Brother",
    "name": "",
    "status": "",
    "age": 62,
    "problems": [
      {
        "description": "Coronary artery disease with MI",
        "ageOfOnset": "62"
      },
      {
        "description": "Coronary artery bypass graft surgery",
        "ageOfOnset": "62"
      }
    ]
  }
],
"SubstanceSexualHealth": {
  "tobacco": {
    "smokingStatus": "Everyday",
    "types": [
      "Cigarette"
    ],
    "startDate": "1980-01-01",
    "packsPerDay": 1,
    "packYears": 50,
    "smokelessStatus": {
      "smokelessStatus": "Never",
      "comments": ""
    }
  },
  "alcohol": {
    "alcoholStatus": "Yes",
    "drinksPerWeek": {
      "wineGlasses": 0,
      "beerCans": 3,
      "liquorShots": 0,
      "drinksContainingAlcohol": 0,
      "standardDrinks": 0
    }
  },
  "drugs": {
    "drugStatus": "Not Currently",
    "drugTypes": [],
    "usePerWeek": "",
    "comments": ""
  }
},
"Socioeconomic": {
  "occupation": "Delivery truck driver",
  "employer": "Local furniture store",
  "occupationalHistory": [
    {
      "occupation": "Floor manager",
      "employer": "Printing facility"
    },
    {
      "occupation": "Delivery truck driver",
      "employer": "Local furniture store"
    },
    {
      "occupation": "Odd jobs worker",
      "employer": "Local construction and concrete laying companies"
    }
  ],
  "demographics": {
    "maritalStatus": "Married",
    "spouseName": "Unknown",
    "numberOfChildren": 2,
    "yearsOfEducation": 0,
    "highestEducationLevel": "Some College",
    "preferredLanguage": "",
    "ethnicGroup": "",
    "race": ""
  }
},
"SocialDocumentation": {
  "textbox":"- John Hanson was a floor manager at a printing facility in Mattoon, IL, where he worked for 22 years before the factory shut down and he lost his job. \n- He currently works as a part-time delivery truck driver for a local furniture store. \n- He also works odd jobs at a local construction company and a concrete laying company. \n- He lives with his wife of 35 years who has multiple sclerosis. She is unable to walk and uses a wheelchair for mobility. \n- He is her primary caregiver. \n- They have two sons who do not live in the area. \n- He has smoked since he was a teenager and currently smokes a pack per day. \n- He has 3-4 beers a week. \n- He denies recreational drug use. \n- Since his fall and right foot fracture 5 years ago, he has gained 70 lbs., which he attributes to lack of exercise since his injury and resultant chronic right foot and knee pain. \n- His diet is mostly take-out fast food. \n- He remembers to take his medications. However, it is hard for him to take them regularly, given his odd shift hours including night shifts."
}
}) 
