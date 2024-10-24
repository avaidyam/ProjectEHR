import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Icon, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Box } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import { usePatientMRN } from '../../../../util/urlHelpers.js';
import { TEST_PATIENT_INFO } from '../../../../util/data/PatientSample.js';
import ProblemListEditor from './ProblemListEditor.js';

// FIXME: This is temporary!
const _diagnosisList = ['Acne', 'Acute cholecystitis', 'Acute lymphoblastic leukaemia', 'Acute lymphoblastic leukaemia: Children', 'Acute lymphoblastic leukaemia: Teenagers and young adults', 'Acute myeloid leukaemia', 'Acute myeloid leukaemia: Children', 'Acute myeloid leukaemia: Teenagers and young adults', 'Acute pancreatitis', 'Addison\'s disease', 'Alcohol-related liver disease', 'Allergic rhinitis', 'Allergies', 'Alzheimer\'s disease', 'Anal cancer', 'Anaphylaxis', 'Angioedema', 'Ankylosing spondylitis', 'Anorexia nervosa', 'Anxiety', 'Anxiety disorders in children', 'Appendicitis', 'Arthritis', 'Asbestosis', 'Asthma', 'Atopic eczema', 'Attention deficit hyperactivity disorder (ADHD)', 'Autistic spectrum disorder (ASD)', 'Bacterial vaginosis', 'Benign prostate enlargement', 'Bile duct cancer (cholangiocarcinoma)', 'Binge eating', 'Bipolar disorder', 'Bladder cancer', 'Blood poisoning (sepsis)', 'Bone cancer', 'Bone cancer: Teenagers and young adults', 'Bowel cancer', 'Bowel incontinence', 'Bowel polyps', 'Brain stem death', 'Brain tumours', 'Brain tumours: Children', 'Brain tumours: Teenagers and young adults', 'Breast cancer (female)', 'Breast cancer (male)', 'Bronchiectasis', 'Bronchitis', 'Bulimia', 'Bunion', 'Carcinoid syndrome and carcinoid tumours', 'Catarrh', 'Cellulitis', 'Cerebral palsy', 'Cervical cancer', 'Chest infection', 'Chest pain', 'Chickenpox', 'Chilblains', 'Chlamydia', 'Chronic fatigue syndrome', 'Chronic kidney disease', 'Chronic lymphocytic leukaemia', 'Chronic myeloid leukaemia', 'Chronic obstructive pulmonary disease', 'Chronic pain', 'Chronic pancreatitis', 'Cirrhosis', 'Clostridium difficile', 'Coeliac disease', 'Cold sore', 'Coma', 'Common cold', 'Common heart conditions', 'Congenital heart disease', 'Conjunctivitis', 'Constipation', 'Coronavirus (COVID-19)', 'Cough', 'Crohn\'s disease', 'Croup', 'Cystic fibrosis', 'Cystitis', 'Deafblindness', 'Deep vein thrombosis', 'Dehydration', 'Dementia', 'Dementia with Lewy bodies', 'Dental abscess', 'Depression', 'Dermatitis herpetiformis', 'Diabetes', 'Diarrhoea', 'Discoid eczema', 'Diverticular disease and diverticulitis', 'Dizziness (Lightheadedness)', 'Down\'s syndrome', 'Dry mouth', 'Dysphagia (swallowing problems)', 'Dystonia', 'Earache', 'Earwax build-up', 'Ebola virus disease', 'Ectopic pregnancy', 'Ehlers-Danlos syndromes', 'Elective care', 'Endometriosis', 'Enterovirus D68', 'Epilepsy', 'Erectile dysfunction', 'Ewing sarcoma: Teenagers and young adults', 'Eye cancer', 'Eye cancer: Teenagers and young adults', 'Eyelid problems', 'Facial palsy', 'Fainting', 'Febrile seizures', 'Fetal alcohol spectrum disorder', 'Fever', 'Fibroids', 'Fibromyalgia', 'Flat feet', 'Flu', 'Folliculitis', 'Food poisoning', 'Foot drop', 'Fragile X syndrome', 'Gallbladder cancer', 'Gallstones', 'Ganglion cyst', 'Gastritis', 'Gastroenteritis', 'Gastro-oesophageal reflux disease (GORD)', 'Genital herpes', 'Genital warts', 'Gestational diabetes', 'Gilbert\'s syndrome', 'Glandular fever', 'Glaucoma', 'Glue ear', 'Gout', 'Group B streptococcus', 'Guillain-Barré syndrome', 'Gynaecomastia', 'Haemochromatosis', 'Haemophilia', 'Head and neck cancer', 'Head lice and nits', 'Headaches', 'Hearing loss', 'Heart failure', 'Heart palpitations', 'Helicobacter pylori infection', 'Hidradenitis suppurativa', 'High cholesterol', 'HIV', 'Hodgkin lymphoma', 'Homocystinuria', 'Housemaid\'s knee (prepatellar bursitis)', 'Huntington\'s disease', 'Hydrocephalus', 'Hyperglycaemia (high blood sugar)', 'Hyperhidrosis', 'Hyperopia (long-sightedness)', 'Hyperthyroidism (overactive thyroid)', 'Hypospadias', 'Hypothyroidism (underactive thyroid)', 'Ileostomy', 'Impetigo', 'Indigestion', 'Infant colic', 'Infective endocarditis', 'Inflammatory bowel disease (IBD)', 'Influenza (flu)', 'Insomnia', 'Insulinoma', 'Intellectual disability', 'Interstitial cystitis', 'Intracranial hypertension', 'Invasive meningococcal disease', 'Iron deficiency anaemia', 'Irritable bowel syndrome (IBS)', 'Itching', 'Jaundice', 'Joint hypermobility syndrome', 'Juvenile idiopathic arthritis', 'Kidney cancer', 'Kidney infection', 'Kidney stones', 'Korsakoff\'s syndrome', 'Krabbe disease', 'Kyphosis', 'Labyrinthitis', 'Langerhans cell histiocytosis', 'Laryngitis', 'Leg cramps', 'Leukaemia', 'Leukaemia: Children', 'Leukaemia: Teenagers and young adults', 'Lewy body dementia', 'Lichen planus', 'Lichen sclerosus', 'Lipoma', 'Liver cancer', 'Liver disease', 'Long-sightedness (hyperopia)', 'Loss of libido', 'Low blood pressure (hypotension)', 'Lung cancer', 'Lupus', 'Lyme disease', 'Lymphoedema', 'Lymphoma', 'Malaria', 'Male menopause', 'Malnutrition', 'Marfan syndrome', 'Mastitis', 'Measles', 'Medulloblastoma', 'Melanoma', 'Melanoma: Teenagers and young adults', 'Meningitis', 'Menopause', 'Menorrhagia (heavy periods)', 'Menstrual cycle', 'Mesothelioma', 'Metastatic cancer', 'Microcephaly', 'Middle ear infection (otitis media)', 'Migraine', 'Miscarriage', 'Motor neurone disease (MND)', 'Mouth cancer', 'Mouth ulcer', 'MRSA', 'Multiple myeloma', 'Multiple sclerosis (MS)', 'Mumps', 'Muscle cramps', 'Muscular dystrophy', 'Myasthenia gravis', 'Myocardial infarction (heart attack)', 'Myocarditis', 'Myopia (short-sightedness)', 'Narcolepsy', 'Nasal and sinus cancer', 'Nasal polyps', 'Nausea and vomiting in adults', 'Necrotising fasciitis', 'Nephrotic syndrome', 'Neuroblastoma', 'Neuroblastoma: Children', 'Neurofibromatosis type 1', 'Neurofibromatosis type 2', 'Non-Hodgkin lymphoma', 'Non-melanoma skin cancer', 'Non-ulcer dyspepsia', 'Nonalcoholic fatty liver disease', 'Norovirus', 'Nosebleed', 'Obesity', 'Obsessive compulsive disorder (OCD)', 'Oesophageal cancer', 'Oesophagitis', 'Oral thrush', 'Oropharyngeal cancer', 'Osteoarthritis', 'Osteomyelitis', 'Osteosarcoma', 'Osteosarcoma: Teenagers and young adults', 'Ovarian cancer', 'Ovarian cyst', 'Overactive thyroid', 'Paget\'s disease of the nipple', 'Pancreatic cancer', 'Panic disorder', 'Parkinson\'s disease', 'Patau\'s syndrome', 'Pelvic inflammatory disease', 'Pelvic organ prolapse', 'Penile cancer', 'Peripheral neuropathy', 'Personality disorder', 'Pleurisy', 'Pneumonia', 'Polymyalgia rheumatica', 'Post-polio syndrome', 'Post-traumatic stress disorder (PTSD)', 'Postnatal depression', 'Pregnancy and baby', 'Pressure ulcers', 'Prostate cancer', 'Psoriasis', 'Psoriatic arthritis', 'Psychosis', 'Pubic lice', 'Rare tumours', 'Raynaud\'s phenomenon', 'Reactive arthritis', 'Restless legs syndrome', 'Retinoblastoma: Children', 'Rhabdomyosarcoma', 'Rheumatoid arthritis', 'Ringworm and other fungal infections', 'Rosacea', 'Scabies', 'Scarlet fever', 'Schizophrenia', 'Scoliosis', 'Septic shock', 'Shingles', 'Shortness of breath', 'Sickle cell disease', 'Sinusitis', 'Sjogren\'s syndrome', 'Skin cancer (melanoma)', 'Skin cancer (non-melanoma)', 'Slapped cheek syndrome', 'Soft tissue sarcomas', 'Soft tissue sarcomas: Teenagers and young adults', 'Sore throat', 'Spleen problems and spleen removal', 'Stillbirth', 'Stomach ache and abdominal pain', 'Stomach cancer', 'Stomach ulcer', 'Streptococcus A (strep A)', 'Stress, anxiety and low mood', 'Stroke', 'Sudden infant death syndrome (SIDS)', 'Suicide', 'Sunburn', 'Swollen glands', 'Syphilis', 'Testicular cancer', 'Testicular cancer: Teenagers and young adults', 'Testicular lumps and swellings', 'Thirst', 'Threadworms', 'Thrush', 'Thyroid cancer', 'Thyroid cancer: Teenagers and young adults', 'Tinnitus', 'Tonsillitis', 'Tooth decay', 'Toothache', 'Transient ischaemic attack (TIA)', 'Trigeminal neuralgia', 'Tuberculosis (TB)', 'Type 1 diabetes', 'Type 2 diabetes', 'Trichomonas infection', 'Transverse myelitis', 'Ulcerative colitis', 'Underactive thyroid', 'Urinary incontinence', 'Urinary tract infection (UTI)', 'Urinary tract infection (UTI) in children', 'Urticaria (hives)', 'Vaginal cancer', 'Vaginal discharge', 'Varicose eczema', 'Venous leg ulcer', 'Vertigo', 'Vitamin B12 or folate deficiency anaemia', 'Vomiting in adults', 'Vulval cancer', 'Warts and verrucas', 'Whooping cough', 'Wilms\' tumor', 'Womb (uterus) cancer', 'Yellow fever']

const ProblemListTabContent = ({ children, ...other }) => {
  const [patientMRN, setPatientMRN] = usePatientMRN();
  const patientData = TEST_PATIENT_INFO({ patientMRN });
  const diagnosesArray = _diagnosisList;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDiagnoses, setFilteredDiagnoses] = useState(diagnosesArray);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null); // Track selected diagnosis
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [problems, setProblems] = useState(patientData.problems); // State to hold problems array
  const [expandedRows, setExpandedRows] = useState(Array(problems.length).fill(false));

  const [indexToUpdate, setIndexToUpdate] = useState(null);

  const handleExpandRow = (rowIndex) => {
    const newExpandedRows = expandedRows.map((item, index) => index === rowIndex ? !item : item);
    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
    setFilteredDiagnoses(
      diagnosesArray.filter(diagnosis => diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, diagnosesArray]);

  const handleOpenModal = (index) => {
    setIndexToUpdate(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDiagnosis(null); // Clear selected diagnosis on modal close
    setIndexToUpdate(null); // Clear index to update
  };

  const handleDiagnosisClick = (diagnosis) => {
    setSelectedDiagnosis(diagnosis === selectedDiagnosis ? null : diagnosis);
  };

  const handleAccept = () => {
    if (selectedDiagnosis) {
      console.log("Index to update", indexToUpdate, indexToUpdate===null);
      if (indexToUpdate !== null) {
        // UPDATE the existing problem
        const updatedProblems = problems.map((problem, i) =>
          i === indexToUpdate ? { ...problem, diagnosis: selectedDiagnosis } : problem
        );
        setProblems(updatedProblems);
      } else {
        // ADD a new problem
        const newProblem = {
          diagnosis: selectedDiagnosis,
          // Add other properties as needed for the new problem row
        };
        setProblems([...problems, newProblem]);
      }
      handleCloseModal();
    }
  };
  

  const handleDeleteProblem = (index) => {
    const updatedProblems = problems.filter((_, i) => i !== index);
    setProblems(updatedProblems);
    const updatedExpandedRows = expandedRows.filter((_, i) => i !== index);
    setExpandedRows(updatedExpandedRows);
  };

  return (
    <div className="tab-content-container">
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em', marginTop: '1em', marginRight: '1em', marginLeft: '1em'}}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search for problem"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => handleOpenModal(null)}
              style={{ marginRight: 0 }}
            />
            <Button
              variant="outlined"
              style={{ height: '56px', marginLeft: '-1px' }} // Adjust marginLeft to remove space
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1em' }}>
            <Typography>Show:</Typography>
            <Checkbox name="showPastProblems" />
            <Typography>Past Problems</Typography>
            <Button variant="outlined" style={{ marginLeft: '1em' }}>
              View Drug-Disease Interactions
            </Button>
          </div>
        </div>
        <TableContainer component={Paper} style={{ marginTop: '1em' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '60%' }}>Diagnosis</TableCell>
                <TableCell style={{ width: '13%' }}>Notes</TableCell>
                <TableCell style={{ width: '5%' }}>Hospital</TableCell>
                <TableCell style={{ width: '5%' }}>Principal</TableCell>
                <TableCell style={{ width: '7%' }}>Change Dx</TableCell>
                <TableCell style={{ width: '5%' }}>Resolved</TableCell>
                <TableCell style={{ width: '5%' }}/>
              </TableRow>
            </TableHead>
            <TableBody>
              {problems.map((problem, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>{problem.display ? problem.display : problem.diagnosis}</TableCell>
                    <TableCell>
                      <Button>Create Overview</Button>
                    </TableCell>
                    <TableCell>
                      <Checkbox name="hospitalCheckbox" />
                    </TableCell>
                    <TableCell>
                      <Button><PentagonOutlinedIcon /></Button>
                    </TableCell>
                    <TableCell>
                      <Button><ChangeHistoryIcon /></Button>
                    </TableCell>
                    <TableCell>
                      <Button><ClearIcon /></Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleExpandRow(index)}><KeyboardDoubleArrowDownOutlinedIcon /></Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows[index] && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <ProblemListEditor
                          data={problem}
                          index={index}
                          expandedRows={handleExpandRow}
                          onDelete={handleDeleteProblem}
                          onOpenModal={handleOpenModal}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <TextField
              label="Search for problem"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '1em' }}
            />
            <Button
              variant="outlined"
              style={{ height: '56px', marginLeft: '-1px' }} // Adjust marginLeft to remove space
            >
              <Icon color="success">add_task</Icon>Add
            </Button>
            <TableContainer component={Paper} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Diagnosis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDiagnoses.map((diagnosis, index) => (
                    <TableRow
                      key={index}
                      onClick={() => handleDiagnosisClick(diagnosis)}
                      style={{ cursor: 'pointer', backgroundColor: selectedDiagnosis === diagnosis ? '#e0f7fa' : 'inherit' }}
                    >
                      <TableCell>{diagnosis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              style={{ marginRight: '1em' }}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ProblemListTabContent;
