
export const PROVIDER_ROLE_TYPES = {
    PCP: 'PCP',
}

export const PROVIDER_TITLE = {
    DO: 'DO',
    MD: 'MD',
    RN: 'RN',
}

export const TEST_PATIENT_INFO = ({ patientMRN }) => ({
    firstName: 'Anthony',
    lastName: 'Bosshardt',
    dateOfBirth: '1995-05-15',
    age: 28,
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
      kind: 'Encounters',
      data: {
        summary: 'Summary 1',
        type: 'Type',
        encClosed: 'Yes',
        with: 'Doctor Anthony Fauci',
        description: 'Former NIAID Director',
        dischData: '01-01-2023',
        csn: 'CSN12345',
        }
      },
      {
      kind: 'Encounters' ,
      data: {
        summary: 'Summary 2',
        type: 'Type',
        encClosed: 'No',
        with: 'Doctor Vivek Murthy',
        description: '21st Surgeon General',
        dischData: '02-01-2023',
        csn: 'CSN67890',
      }
      },
      {
        kind: 'Note',
        data: {
          summary: 'Note Summary 1',
          filingDate: '01-02-2023',
          encDate: '01-01-2023',
          encDept: 'Dept A',
          author: 'Author 1',
          encType: 'Type A',
          category: 'Category A',
          status: 'Active',
          tag: 'Tag A',
          encounterProvider: 'Provider 1',
          noteType: 'Type A',
        }
      },
      {
        kind: 'Note',
        data: {
          summary: 'Note Summary 2',
          filingDate: '02-02-2023',
          encDate: '02-01-2023',
          encDept: 'Dept B',
          author: 'Author 2',
          encType: 'Type B',
          category: 'Category B',
          status: 'Inactive',
          tag: 'Tag B',
          encounterProvider: 'Provider 2',
          noteType: 'Type B',
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
            // ... additional properties for Lab
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
            // ... additional properties for Cardiac
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
      }
    ]
  }
)
