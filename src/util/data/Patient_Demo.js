export const TEST_PATIENT_INFO = ({ patientMRN }) => ({
    firstName: 'Alex',
    lastName: 'Bowman',
    dateOfBirth: '1993-05-15',
    age: 30,
    avatarUrl: null,
    preferredLanguage: 'English',
    gender: 'Female',
    mrn: patientMRN,
    PCP: {
      name: 'Chris Nelson',
      title: "MD",
      role: "PCP",
      avatarUrl: null,
    },
    insurance: {
      carrierName: 'UnitedHealthcare',
    },
    careGaps: [
      { id: '1', name: 'COVID Booster #8' },
      { id: '2', name: 'COVID Booster #9' },
    ],
    encounter: {
      date: "10/24/2024",
      type: "Office visit",
      concerns: [
        "Abdominal Pain"
      ]
    },
    problems: [
    ],
    diagnosisList: ['Acne', 'Acute cholecystitis', 'Acute lymphoblastic leukaemia', 'Acute lymphoblastic leukaemia: Children', 'Acute lymphoblastic leukaemia: Teenagers and young adults', 'Acute myeloid leukaemia', 'Acute myeloid leukaemia: Children', 'Acute myeloid leukaemia: Teenagers and young adults', 'Acute pancreatitis', 'Addison\'s disease', 'Alcohol-related liver disease', 'Allergic rhinitis', 'Allergies', 'Alzheimer\'s disease', 'Anal cancer', 'Anaphylaxis', 'Angioedema', 'Ankylosing spondylitis', 'Anorexia nervosa', 'Anxiety', 'Anxiety disorders in children', 'Appendicitis', 'Arthritis', 'Asbestosis', 'Asthma', 'Atopic eczema', 'Attention deficit hyperactivity disorder (ADHD)', 'Autistic spectrum disorder (ASD)', 'Bacterial vaginosis', 'Benign prostate enlargement', 'Bile duct cancer (cholangiocarcinoma)', 'Binge eating', 'Bipolar disorder', 'Bladder cancer', 'Blood poisoning (sepsis)', 'Bone cancer', 'Bone cancer: Teenagers and young adults', 'Bowel cancer', 'Bowel incontinence', 'Bowel polyps', 'Brain stem death', 'Brain tumours', 'Brain tumours: Children', 'Brain tumours: Teenagers and young adults', 'Breast cancer (female)', 'Breast cancer (male)', 'Bronchiectasis', 'Bronchitis', 'Bulimia', 'Bunion', 'Carcinoid syndrome and carcinoid tumours', 'Catarrh', 'Cellulitis', 'Cerebral palsy', 'Cervical cancer', 'Chest infection', 'Chest pain', 'Chickenpox', 'Chilblains', 'Chlamydia', 'Chronic fatigue syndrome', 'Chronic kidney disease', 'Chronic lymphocytic leukaemia', 'Chronic myeloid leukaemia', 'Chronic obstructive pulmonary disease', 'Chronic pain', 'Chronic pancreatitis', 'Cirrhosis', 'Clostridium difficile', 'Coeliac disease', 'Cold sore', 'Coma', 'Common cold', 'Common heart conditions', 'Congenital heart disease', 'Conjunctivitis', 'Constipation', 'Coronavirus (COVID-19)', 'Cough', 'Crohn\'s disease', 'Croup', 'Cystic fibrosis', 'Cystitis', 'Deafblindness', 'Deep vein thrombosis', 'Dehydration', 'Dementia', 'Dementia with Lewy bodies', 'Dental abscess', 'Depression', 'Dermatitis herpetiformis', 'Diabetes', 'Diarrhoea', 'Discoid eczema', 'Diverticular disease and diverticulitis', 'Dizziness (Lightheadedness)', 'Down\'s syndrome', 'Dry mouth', 'Dysphagia (swallowing problems)', 'Dystonia', 'Earache', 'Earwax build-up', 'Ebola virus disease', 'Ectopic pregnancy', 'Ehlers-Danlos syndromes', 'Elective care', 'Endometriosis', 'Enterovirus D68', 'Epilepsy', 'Erectile dysfunction', 'Ewing sarcoma: Teenagers and young adults', 'Eye cancer', 'Eye cancer: Teenagers and young adults', 'Eyelid problems', 'Facial palsy', 'Fainting', 'Febrile seizures', 'Fetal alcohol spectrum disorder', 'Fever', 'Fibroids', 'Fibromyalgia', 'Flat feet', 'Flu', 'Folliculitis', 'Food poisoning', 'Foot drop', 'Fragile X syndrome', 'Gallbladder cancer', 'Gallstones', 'Ganglion cyst', 'Gastritis', 'Gastroenteritis', 'Gastro-oesophageal reflux disease (GORD)', 'Genital herpes', 'Genital warts', 'Gestational diabetes', 'Gilbert\'s syndrome', 'Glandular fever', 'Glaucoma', 'Glue ear', 'Gout', 'Group B streptococcus', 'Guillain-Barré syndrome', 'Gynaecomastia', 'Haemochromatosis', 'Haemophilia', 'Head and neck cancer', 'Head lice and nits', 'Headaches', 'Hearing loss', 'Heart failure', 'Heart palpitations', 'Helicobacter pylori infection', 'Hidradenitis suppurativa', 'High cholesterol', 'HIV', 'Hodgkin lymphoma', 'Homocystinuria', 'Housemaid\'s knee (prepatellar bursitis)', 'Huntington\'s disease', 'Hydrocephalus', 'Hyperglycaemia (high blood sugar)', 'Hyperhidrosis', 'Hyperopia (long-sightedness)', 'Hyperthyroidism (overactive thyroid)', 'Hypospadias', 'Hypothyroidism (underactive thyroid)', 'Ileostomy', 'Impetigo', 'Indigestion', 'Infant colic', 'Infective endocarditis', 'Inflammatory bowel disease (IBD)', 'Influenza (flu)', 'Insomnia', 'Insulinoma', 'Intellectual disability', 'Interstitial cystitis', 'Intracranial hypertension', 'Invasive meningococcal disease', 'Iron deficiency anaemia', 'Irritable bowel syndrome (IBS)', 'Itching', 'Jaundice', 'Joint hypermobility syndrome', 'Juvenile idiopathic arthritis', 'Kidney cancer', 'Kidney infection', 'Kidney stones', 'Korsakoff\'s syndrome', 'Krabbe disease', 'Kyphosis', 'Labyrinthitis', 'Langerhans cell histiocytosis', 'Laryngitis', 'Leg cramps', 'Leukaemia', 'Leukaemia: Children', 'Leukaemia: Teenagers and young adults', 'Lewy body dementia', 'Lichen planus', 'Lichen sclerosus', 'Lipoma', 'Liver cancer', 'Liver disease', 'Long-sightedness (hyperopia)', 'Loss of libido', 'Low blood pressure (hypotension)', 'Lung cancer', 'Lupus', 'Lyme disease', 'Lymphoedema', 'Lymphoma', 'Malaria', 'Male menopause', 'Malnutrition', 'Marfan syndrome', 'Mastitis', 'Measles', 'Medulloblastoma', 'Melanoma', 'Melanoma: Teenagers and young adults', 'Meningitis', 'Menopause', 'Menorrhagia (heavy periods)', 'Menstrual cycle', 'Mesothelioma', 'Metastatic cancer', 'Microcephaly', 'Middle ear infection (otitis media)', 'Migraine', 'Miscarriage', 'Motor neurone disease (MND)', 'Mouth cancer', 'Mouth ulcer', 'MRSA', 'Multiple myeloma', 'Multiple sclerosis (MS)', 'Mumps', 'Muscle cramps', 'Muscular dystrophy', 'Myasthenia gravis', 'Myocardial infarction (heart attack)', 'Myocarditis', 'Myopia (short-sightedness)', 'Narcolepsy', 'Nasal and sinus cancer', 'Nasal polyps', 'Nausea and vomiting in adults', 'Necrotising fasciitis', 'Nephrotic syndrome', 'Neuroblastoma', 'Neuroblastoma: Children', 'Neurofibromatosis type 1', 'Neurofibromatosis type 2', 'Non-Hodgkin lymphoma', 'Non-melanoma skin cancer', 'Non-ulcer dyspepsia', 'Nonalcoholic fatty liver disease', 'Norovirus', 'Nosebleed', 'Obesity', 'Obsessive compulsive disorder (OCD)', 'Oesophageal cancer', 'Oesophagitis', 'Oral thrush', 'Oropharyngeal cancer', 'Osteoarthritis', 'Osteomyelitis', 'Osteosarcoma', 'Osteosarcoma: Teenagers and young adults', 'Ovarian cancer', 'Ovarian cyst', 'Overactive thyroid', 'Paget\'s disease of the nipple', 'Pancreatic cancer', 'Panic disorder', 'Parkinson\'s disease', 'Patau\'s syndrome', 'Pelvic inflammatory disease', 'Pelvic organ prolapse', 'Penile cancer', 'Peripheral neuropathy', 'Personality disorder', 'Pleurisy', 'Pneumonia', 'Polymyalgia rheumatica', 'Post-polio syndrome', 'Post-traumatic stress disorder (PTSD)', 'Postnatal depression', 'Pregnancy and baby', 'Pressure ulcers', 'Prostate cancer', 'Psoriasis', 'Psoriatic arthritis', 'Psychosis', 'Pubic lice', 'Rare tumours', 'Raynaud\'s phenomenon', 'Reactive arthritis', 'Restless legs syndrome', 'Retinoblastoma: Children', 'Rhabdomyosarcoma', 'Rheumatoid arthritis', 'Ringworm and other fungal infections', 'Rosacea', 'Scabies', 'Scarlet fever', 'Schizophrenia', 'Scoliosis', 'Septic shock', 'Shingles', 'Shortness of breath', 'Sickle cell disease', 'Sinusitis', 'Sjogren\'s syndrome', 'Skin cancer (melanoma)', 'Skin cancer (non-melanoma)', 'Slapped cheek syndrome', 'Soft tissue sarcomas', 'Soft tissue sarcomas: Teenagers and young adults', 'Sore throat', 'Spleen problems and spleen removal', 'Stillbirth', 'Stomach ache and abdominal pain', 'Stomach cancer', 'Stomach ulcer', 'Streptococcus A (strep A)', 'Stress, anxiety and low mood', 'Stroke', 'Sudden infant death syndrome (SIDS)', 'Suicide', 'Sunburn', 'Swollen glands', 'Syphilis', 'Testicular cancer', 'Testicular cancer: Teenagers and young adults', 'Testicular lumps and swellings', 'Thirst', 'Threadworms', 'Thrush', 'Thyroid cancer', 'Thyroid cancer: Teenagers and young adults', 'Tinnitus', 'Tonsillitis', 'Tooth decay', 'Toothache', 'Transient ischaemic attack (TIA)', 'Trigeminal neuralgia', 'Tuberculosis (TB)', 'Type 1 diabetes', 'Type 2 diabetes', 'Trichomonas infection', 'Transverse myelitis', 'Ulcerative colitis', 'Underactive thyroid', 'Urinary incontinence', 'Urinary tract infection (UTI)', 'Urinary tract infection (UTI) in children', 'Urticaria (hives)', 'Vaginal cancer', 'Vaginal discharge', 'Varicose eczema', 'Venous leg ulcer', 'Vertigo', 'Vitamin B12 or folate deficiency anaemia', 'Vomiting in adults', 'Vulval cancer', 'Warts and verrucas', 'Whooping cough', 'Wilms\' tumor', 'Womb (uterus) cancer', 'Yellow fever'],
    vitals: [
      {
        id: '123456789',
        measurementDate: '2024-04-02',
        bloodPressureSystolic: 105,
        bloodPressureDiastolic: 60,
        height: `5' 5"`,
        weight: 140,
        bmi: 23,
        respiratoryRate: 12,
        heartRate: 65,
      },
      {
        id: '123456790',
        measurementDate: '2022-09-15',
        bloodPressureSystolic: 110,
        bloodPressureDiastolic: 76,
        height: `5' 5"`,
        weight: 141,
        bmi: 23,
        respiratoryRate: 14,
        heartRate: 73,
      },
    ],
    documents: [
      {
        kind: "Encounters",
        data: {
          id: "A1B2C3D4E",
          summary: "Annual OBGYN Visit",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. OBGYN",
          description: "Annual Visit",
          dischData: "04-02-2024",
          csn: "CSN12345",
          content: "Location: Office\nProvider: Dr. OBGYN\nReason for Visit: Annual Visit\nVisit Diagnosis: Regular Visit"
        }
      },
      {
        kind: "Encounters",
        data: {
          id: "F5G6H7I8J",
          summary: "Physical",
          type: "Office Visit",
          encClosed: "Yes",
          with: "Dr. PCP",
          description: "Annual Visit",
          dischData: "09-15-2022",
          csn: "CSN67890",
          content: "Location: Office\nProvider: Dr. PCP\nReason for Visit: Annual Visit\nVisit Diagnosis: Regular Visit"
        }
      },
      {
    "kind": "Note",
    "data": {
      "id": "OBGYN20231001",
      "summary": "Annual Pap smear and mammogram both normal.",
      "filingDate": "04-02-2024",
      "encDate": "04-02-2024",
      "encDept": "OBGYN",
      "author": "Dr. OBGYN",
      "encType": "Annual Visit",
      "category": "Preventive Care",
      "status": "Normal",
      "tag": "Screening Results",
      "encounterProvider": "Dr. OBGYN",
      "noteType": "Routine Exam Note",
      "content": "History:\n- Patient presented for an annual wellness exam including a Pap smear and mammogram.\n\nPhysical Examination:\n- Breast exam and pelvic exam were unremarkable.\n\nResults:\n- Pap smear: Normal\n- Mammogram: No abnormalities detected.\n\nAssessment:\n- Routine preventive screening, normal findings.\n\nPlan:\n- Continue with annual screenings as per guidelines."
    }
  },
  {
    "kind": "Note",
    "data": {
      "id": "PCP20231002",
      "summary": "Annual physical with orders for routine blood draw.",
      "filingDate": "09-15-2022",
      "encDate": "09-15-2022",
      "encDept": "Primary Care",
      "author": "Dr. PCP",
      "encType": "Annual Visit",
      "category": "Preventive Care",
      "status": "Pending Lab Results",
      "tag": "Routine Lab Orders",
      "encounterProvider": "Dr. PCP",
      "noteType": "Routine Exam Note",
      "content": "History:\n- Patient presented for an annual physical exam.\n\nPhysical Examination:\n- General examination normal. No abnormalities found.\n\nAssessment:\n- Routine check-up.\n\nPlan:\n- Ordered routine blood tests, including CBC, lipid panel, and metabolic panel.\n- Follow-up after lab results."
    }
      },
        {
          kind: 'Lab',
          data: {
            'Date/Time': '09-23-2022 09:30 AM',
            'Test': 'Complete Blood Count',
            'Status': 'Completed',
            'Abnormal?': 'No',
            'Expected Date': '01-10-2023',
            'Expiration': 'N/A',
            'Encounter Provider': 'Dr. PCP',
          },
        labResults: [
          {
            "name": "WBC",
            "low": 4.0,
            "high": 11,
            "units": "K/uL",
            "value": "5.4",
            "comment": "This is a sample lab value comment"
          },
          {
            "name": "RBC",
            "low": 4.40,
            "high": 6.00,
            "units": "M/uL",
            "value": "5.20",
            "comment": null
          },
          {
            "name": "Hemoglobin",
            "low": 13.5,
            "high": 18,
            "units": "g/dL",
            "value": "16",
            "comment": null
          },
          {
            "name": "Hematocrit",
            "low": 40.0,
            "high": 52.0,
            "units": "%",
            "value": 47.2,
            "comment": "This is a sample lab value comment"
          },
          {
            "name": "MCV",
            "low": 80,
            "high": 100,
            "units": "fL",
            "value": 88,
            "comment": null
          },
          {
            "name": "MCH",
            "low": 27.0,
            "high": 33.0,
            "units": "pg",
            "value": 30.8,
            "comment": null
          },
          {
            "name": "MCHC",
            "low": 31.0,
            "high": 36.0,
            "units": "g/dL",
            "value": "33.9",
            "comment": null
          },
          {
            "name": "RDW",
            "low": null,
            "high": 16.4,
            "units": "%",
            "value": 12.7,
            "comment": null
          },
          {
            "name": "Platelet Count",
            "low": 150,
            "high": 400,
            "units": "K/uL",
            "value": "160",
            "comment": null
          },
          {
            "name": "Neutrophil %",
            "low": 49.0,
            "high": 74.0,
            "units": "%",
            "value": 56,
            "comment": null
          },
          {
            "name": "Lymphocyte %",
            "low": 26.0,
            "high": 46.0,
            "units": "%",
            "value": 27.8,
            "comment": null
          },
          {
            "name": "Monocyte %",
            "low": 2.0,
            "high": 12.0,
            "units": "%",
            "value": "10.0",
            "comment": null
          },
          {
            "name": "Eosinophil %",
            "low": 0.0,
            "high": 5.0,
            "units": "%",
            "value": "3.9",
            "comment": null
          },
          {
            "name": "Basophil %",
            "low": 0.0,
            "high": 2.0,
            "units": "%",
            "value": 1.0,
            "comment": null
          },
          {
            "name": "Abs Neutrophil",
            "low": 2.0,
            "high": 8.0,
            "units": "K/uL",
            "value": "3.1",
            "comment": null
          },
          {
            "name": "Abs. Lymphocyte",
            "low": 1.0,
            "high": 5.1,
            "units": "K/uL",
            "value": 1.2,
            "comment": null
          },
          {
            "name": "Abs. Monocyte",
            "low": 0.0,
            "high": 0.8,
            "units": "K/uL",
            "value": "0.7",
            "comment": null
          },
          {
            "name": "Abs. Eosinophil",
            "low": 0.0,
            "high": 0.5,
            "units": "K/uL",
            "value": "0.4",
            "comment": null
          },
          {
            "name": "Abs. Basophil",
            "low": 0.0,
            "high": 0.2,
            "units": "K/uL",
            "value": "0.0",
            "comment": null
          }
        ],
        collected: "2024-01-01 05:00:00",
        resulted: null,
        labReportComment: "This is an example lab report comment.",
        resultingAgency: "Carle Foundational Hospital"
        },
        {
        kind: "Lab",
          data: {
          "Date/Time": "04-12-2024 10:00 AM",
          "Test": "Pap Smear",
          "Status": "Completed",
          "Abnormal?": "No",
          "Expected Date": "04-12-2024",
          "Expiration": "N/A",
          "Encounter Provider": "Dr. Emily Carter"
        },
  labResults: [
    {
      "name": "Epithelial Cell Abnormality",
      "low": null,
      "high": null,
      "units": null,
      "value": "None",
      "comment": "No atypical squamous cells."
    },
    {
      "name": "Endocervical Transformation Zone",
      "low": null,
      "high": null,
      "units": null,
      "value": "Present",
      "comment": "Satisfactory sample."
    },
    {
      "name": "Organisms",
      "low": null,
      "high": null,
      "units": null,
      "value": "Negative",
      "comment": "No organisms identified."
    },
    {
      "name": "HPV Test",
      "low": null,
      "high": null,
      "units": null,
      "value": "Negative",
      "comment": "High-risk HPV DNA not detected."
    }
  ],
  "collected": "04-02-2024 10:00 AM",
  "resulted": "04-12-2024 03:00 PM",
  "labReportComment": "Normal Pap smear. No signs of atypical cells or HPV.",
  "resultingAgency": "Carle Foundational Hospital"
  }
    ],
    history: {"medical": [
    ],
    "surgical": [],
    "family": [
      {
        "relationship": "Father",
        "name": "",
        "status": "Alive",
        "age": 57,
        "problems": [
          {
            "description": "Hypertension",
            "ageOfOnset": "45"
          }
        ]
      },
      {
        "relationship": "Mother",
        "name": "",
        "status": "Alive",
        "age": 55,
        "problems": [
        ]
      },
      {
        "relationship": "Daughter",
        "name": "",
        "status": "",
        "age": 3,
        "problems": [
        ]
      },
    ],
    "SubstanceSexualHealth": {
      "tobacco": {
        "smokingStatus": "None",
        "types": [
          ""
        ],
        "startDate": "",
        "packsPerDay": 0,
        "packYears": 0,
        "smokelessStatus": {
          "smokelessStatus": "Never",
          "comments": ""
        }
      },
      "alcohol": {
        "alcoholStatus": "Yes",
        "drinksPerWeek": {
          "wineGlasses": 0,
          "beerCans": 1,
          "liquorShots": 0,
          "drinksContainingAlcohol": 0,
          "standardDrinks": 0
        }
      },
      "drugs": {
        "drugStatus": "Not Currently",
        "drugTypes": [],
        "usePerWeek": "",
        "comments": "Marijuana once in college"
      }
    },
    "Socioeconomic": {
      "occupation": "Social Worker",
      "employer": "Local High School",
      "occupationalHistory": [
      ],
      "demographics": {
        "maritalStatus": "Married",
        "spouseName": "Unknown",
        "numberOfChildren": 1,
        "yearsOfEducation": 26,
        "highestEducationLevel": "Advanced Degree",
        "preferredLanguage": "",
        "ethnicGroup": "",
        "race": ""
      }
    },
    "SocialDocumentation": {
      "textbox":`
    Lives with spouse and daughter in Savoy, IL. Married for 5 years
    `
    }
    }
  }
  )