declare const __brand: unique symbol
type Brand<B> = { readonly [__brand]: B }
export type Branded<T, B> = T & Brand<B>

export type UUID = string
export type JSONDate = Branded<string, 'JSONDate'>
export type DiagnosisCode = Branded<string, 'DiagnosisCode'>

//type JSONDate =
//  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z` |
//  `${number}-${number}-${number}T${number}:${number}:${number}Z`;

export namespace JSONDate {
  export const toAge = (date: JSONDate, from?: JSONDate, tz: Temporal.TimeZoneLike = 'UTC') => {
    try {
      const birthDate = Temporal.Instant.from(date).toZonedDateTimeISO(tz).toPlainDate();
      const referenceDate = from
        ? Temporal.Instant.from(from).toZonedDateTimeISO(tz).toPlainDate()
        : Temporal.Now.plainDateISO(tz);
      return referenceDate.since(birthDate, { largestUnit: 'years' }).years
    } catch (e) {
      console.error(e)
      return 0
    }
  }
  export const toDateString = (date?: JSONDate, tz: Temporal.TimeZoneLike = 'UTC'): string | undefined => {
    try {
      if (date) {
        return Temporal.Instant.from(date).toZonedDateTimeISO(tz).toPlainDate().toLocaleString()
      }
      return undefined
    } catch (e) {
      console.error(e)
      return undefined
    }
  }
}

export namespace Units {
  export enum Mass {
    MG = 'mg',
    G = 'g',
    MC = 'mcg',
    MGML = 'mg/ml',
    MGKG = 'mg/kg'
  }

  export enum Volume {
    ML = 'ml',
    L = 'L',
    CC = 'cc'
  }

  export enum Time {
    MIN = 'minutes',
    HR = 'hours',
    DAY = 'days'
  }
}

export interface Root {
  version?: number
  departments: Department[]
  locations: Location[]
  providers: Provider[]
  flowsheets: Flowsheet.Definition[]
  lists: PatientList[]
  appointments: Appointment[]
  patients: {
    [key: Patient.ID]: Patient
  },
  orderables?: {
    procedures: {
      [key: string]: string
    }
    result_map: {
      [key: string]: string[]
    }
    components: {
      [key: string]: string
    }
    rxnorm: {
      name: string
      alias: string[]
      route: {
        [key: string]: {
          [key: string]: string
        }
      }
    }[]
  }
}

export type Specialty = Branded<string, 'Specialty.Name'>

export namespace Specialty {
  export const SPECIALTIES = [
    'Cardiology',
    'Dermatology',
    'Family Medicine',
    'Gastroenterology',
    'General Surgery',
    'Internal Medicine',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Orthopedic Surgery',
    'Pediatrics',
    'Psychiatry',
    'Surgery',
    'Urology'
  ]
}

export type ServiceArea = Branded<string, 'ServiceArea.Name'>

export interface Department {
  id: Department.ID
  name: string
  location?: string
  specialty: Specialty
  identityId?: number // remove
  serviceArea?: string // should be facility!
}

export namespace Department {
  export type ID = Branded<UUID, 'Department.ID'>
  export type Fragment = Partial<Omit<Department, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Location {
  departmentId: Department.ID
  id: Location.ID
  name: string
  type: string
  status: string
}

export namespace Location {
  export type ID = Branded<UUID, 'Location.ID'>
  export type Fragment = Partial<Omit<Location, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Provider {
  department: Department.ID
  id: Provider.ID
  name: string
  role: string
  specialty: Specialty
}

export namespace Provider {
  export type ID = Branded<UUID, 'Provider.ID'>
  export type Fragment = Partial<Omit<Provider, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export namespace Flowsheet {
  export interface Definition {
    id: Flowsheet.Definition.ID
    name?: string
    rows?: Flowsheet.Definition.Row[]
  }

  export namespace Definition {
    export type ID = Branded<UUID, 'Flowsheet.Definition.ID'>
    export type Fragment = Partial<Omit<Definition, 'id'>>
    export namespace ID {
      export const create = (): ID => crypto.randomUUID() as ID
    }

    export interface Row {
      category?: string
      description?: string
      label: string
      name: string
      options?: string[]
      type: string
    }
  }

  export interface Entry {
    id: Flowsheet.Entry.ID
    flowsheet: Flowsheet.Definition.ID
    date: JSONDate
    [key: string]: any;
  }

  export namespace Entry {
    export type ID = Branded<UUID, 'Flowsheet.Entry.ID'>
    export type Fragment = Partial<Omit<Entry, 'id'>>
    export namespace ID {
      export const create = (): ID => crypto.randomUUID() as ID
    }
  }
}

export interface PatientList {
  id: string
  name: string
  type: string
  patients: Patient.ID[]
  columns: PatientList.Column[]
}

export namespace PatientList {
  export type ID = Branded<UUID, 'PatientList.ID'>
  export type Fragment = Partial<Omit<PatientList, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export interface Column {
    id: string
    label: string
    order: number
    selected: boolean
  }
}

export interface Appointment {
  id: Appointment.ID
  department: Department.ID
  provider: Provider.ID
  patient: {
    mrn: Patient.ID,
    enc: Encounter.ID
  }
  type: string
  location?: Location.ID
  status: Appointment.Status
  apptTime: string
  cc: string
  notes: string
  checkinTime?: string
  checkoutTime: any
}

export namespace Appointment {
  export type ID = Branded<UUID, 'Appointment.ID'>
  export type Fragment = Partial<Omit<Appointment, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export enum Status {
    Scheduled = 'Scheduled',
    Arrived = 'Arrived',
    RoomingInProgress = 'Rooming in Progress',
    Waiting = 'Waiting',
    VisitInProgress = 'Visit in Progress',
    VisitComplete = 'Visit Complete',
    CheckedOut = 'Checked Out',
    Signed = 'Signed',
    NoShow = 'No Show'
  }
}

export interface Patient {
  id: Patient.ID
  firstName: string
  lastName: string
  birthdate: JSONDate
  gender: Patient.Gender
  avatarUrl?: string
  address?: any
  preferredLanguage?: Patient.Language
  insurance?: {
    carrierName: string
  }
  careTeam?: CareTeam[]
  contacts?: {
    name: string
    relationship: string
    phone: string
    address: string
    emergency: boolean
    guardian: boolean
  }[]
  encounters: {
    [key: Encounter.ID]: Encounter;
  }
  smartData?: {
    stickyNotes?: {
      [key: string]: string;
    }
  }
}

export namespace Patient {
  export type ID = Branded<UUID, 'Patient.ID'>
  export type Fragment = Partial<Omit<Patient, 'id'>>
  export namespace ID {
    export const create = (): ID => Math.floor((Math.random() * 9 + 1) * (10 ** 6)).toString() as ID
  }

  export const DOE_NAMES = [
    "Hammer", "Broom", "Table", "Chair", "Mug", "Plate", "Spoon", "Fork",
    "Knife", "Towel", "Pencil", "Globe", "Cloud", "River", "Mountain", "Ocean",
    "Forest", "Desert", "Castle", "Bridge", "Mirror", "Candle", "Glove", "Button",
    "Zipper", "Basket", "Feather", "String", "Rope", "Lantern", "Telescope", "Anvil",
    "Crayon", "Window", "Curtain", "Doorknob", "Carpet", "Pillow", "Blanket", "Clock",
    "Vase", "Statue", "Scroll", "Compass", "Shovel", "Rake", "Ladder", "Bucket",
    "Wrench", "Screwdriver", "Engine", "Wheel", "Bumper", "Hose", "Valve", "Gauge",
    "Filter", "Nozzle", "Gasket", "Lever", "Pulley", "Spring", "Gear", "Spanner",
    "Trowel", "Helmet", "Jacket", "Vest", "Scarf", "Boots", "Slipper", "Lace",
    "Marble", "Cobblestone", "Pebble", "Granite", "Copper", "Bronze", "Steel", "Saddle",
    "Harness", "Reins", "Wagon", "Cart", "Ferry", "Sailboat", "Bicycle", "Skateboard",
    "Headphone", "Speaker", "Monitor", "Keyboard", "Mouse", "Router", "Battery", "Charger",
    "Wallet", "Purse", "Backpack", "Couch", "Stool", "Fountain", "Crystal", "Obsidian"
  ]

  export const RANDOM_DOE_NAME = () => DOE_NAMES[Math.floor(Math.random() * DOE_NAMES.length)]

  export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
    Unknown = 'Unknown'
  }

  export enum Language {
    English = 'English',
    Spanish = 'Spanish',
    French = 'French',
    German = 'German',
    Italian = 'Italian',
    Portuguese = 'Portuguese',
    ChineseMandarin = 'Chinese (Mandarin)',
    ChineseCantonese = 'Chinese (Cantonese)',
    Japanese = 'Japanese',
    Korean = 'Korean',
    Arabic = 'Arabic',
    Hindi = 'Hindi',
    Russian = 'Russian',
    Polish = 'Polish',
    Vietnamese = 'Vietnamese',
    Tagalog = 'Tagalog',
    Other = 'Other'
  }
}

export interface Encounter {
  id: Encounter.ID
  startDate: JSONDate
  endDate: JSONDate
  type: Encounter.VisitType
  department: Department.ID
  provider: Provider.ID
  status: Encounter.Status
  specialty?: Specialty
  concerns?: string[]
  problems?: Problem[]
  allergies?: Allergy[]
  dispenseHistory?: Medication.DispenseLog[]
  flowsheets?: Flowsheet.Entry[]
  history: History
  imaging?: Imaging[]
  immunizations: Immunization[]
  clinicalImpressions?: ClinicalImpression[]
  labs?: Lab[]
  medications?: Medication[]
  notes: Note[]
  orders: Order[]
  conditionals?: any
  smartData?: SmartData
}

export namespace Encounter {
  export type ID = Branded<UUID, 'Encounter.ID'>
  export type Fragment = Partial<Omit<Encounter, 'id'>>
  export namespace ID {
    export const create = (): ID => Math.floor((Math.random() * 9 + 1) * (10 ** 6)).toString() as ID
  }

  export enum Status {
    Planned = 'planned',
    InProgress = 'in progress',
    OnHold = 'on hold',
    Discharged = 'discharged',
    Completed = 'completed',
    Signed = 'signed',
    Cancelled = 'cancelled',
    Discontinued = 'discontinued',
    EnteredInError = 'entered in error',
    Unknown = 'unknown',
  }

  export enum Class {
    Inpatient = 'inpatient',
    Ambulatory = 'ambulatory',
    Emergency = 'emergency',
    Observation = 'observation',
    Virtual = 'virtual',
    Home = 'home',
  }

  export enum VisitType {
    Admission = "Admission",
    Inpatient = "Inpatient",
    Outpatient = "Outpatient",
    Emergency = "Emergency",
    Observation = "Observation",
    AmbulatorySurgery = "Ambulatory Surgery",
    EDVisit = "ED Visit",
    OfficeVisit = "Office Visit",
    HospitalAdmission = "Hospital Admission",
    Physical = "Physical",
    HospitalDischargeFollowup = "Hospital Discharge Followup",
    PCPOfficeVisit = "PCP Office Visit",
    EmergencyRoom = "Emergency Room"
  }
}

export interface CareTeam {
  provider: Provider.ID
  role: string
}

export interface SmartData {
  chat?: {
    custom_prompt: string
    voice: SmartData.Voice
  }
  handoff?: {
    [key: Department.ID]: {
      summary: string;
      todo: string;
    };
  }
  orderCart?: {
    [key: string]: Order[];
  }
  activeNote: {
    date: JSONDate
    editorState: string
    summary: string
    type: string | null
    service: string | null
  } | null
  activeSystems: {
    [key: string]: any
  }
}

export namespace SmartData {
  export type Voice =
    | "Achernar" | "Achird" | "Algenib" | "Algieba" | "Alnilam"
    | "Aoede" | "Autonoe" | "Callirrhoe" | "Charon" | "Despina"
    | "Enceladus" | "Erinome" | "Fenrir" | "Gacrux" | "Iapetus"
    | "Kore" | "Laomedeia" | "Leda" | "Orus" | "Puck"
    | "Pulcherrima" | "Rasalgethi" | "Sadachbia" | "Sadaltager" | "Schedar"
    | "Sulafat" | "Umbriel" | "Vindemiatrix" | "Zephyr" | "Zubenelgenubi";
}

export interface ClinicalImpression {
  id: ClinicalImpression.ID
  diagnosis: DiagnosisCode
  displayAs: string
}

export namespace ClinicalImpression {
  export type ID = Branded<UUID, 'ClinicalImpression.ID'>
  export type Fragment = Partial<Omit<ClinicalImpression, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Problem {
  id: Problem.ID
  diagnosis: DiagnosisCode
  displayAs: string
  diagnosedDate?: JSONDate
  notedDate?: JSONDate
  resolvedDate?: JSONDate
  class: string
  chronic: boolean
  priority: string
  encounterDx: boolean // if AMB visit, "Visit Dx", if INPT visit, "Hospital Problem"
}

export namespace Problem {
  export type ID = Branded<UUID, 'Problem.ID'>
  export type Fragment = Partial<Omit<Problem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Allergy {
  id: Allergy.ID
  allergen: string
  comment: string
  reaction: Allergy.Reaction[]
  reactionType: Allergy.ReactionType
  recorded: string
  recorder: string
  resolved: boolean
  severity: Allergy.Severity
  type: Allergy.Type
  verified: boolean
}

export namespace Allergy {
  export type ID = Branded<UUID, 'Allergy.ID'>
  export type Fragment = Partial<Omit<Allergy, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export enum Type {
    Drug = 'Drug',
    Ingredient = 'Drug Ingredient',
    Environmental = 'Environmental',
    Food = 'Food',
    Other = 'Other'
  }

  export enum Severity {
    Low = 'Low',
    Moderate = 'Moderate',
    High = 'High',
    NotSpecified = 'Not Specified'
  }

  export enum ReactionType {
    Immediate = 'Immediate',
    Delayed = 'Delayed',
    Unknown = 'Unknown',
    Systemic = 'Systemic',
    Topical = 'Topical',
    Intolerance = 'Intolerance',
    NotVerified = 'Not Verified'
  }

  export enum Reaction {
    Rash = 'Rash',
    Anaphylaxis = 'Anaphylaxis',
    Hives = 'Hives',
    Itching = 'Itching',
    Swelling = 'Swelling',
    Nausea = 'Nausea',
    Vomiting = 'Vomiting',
    Dyspnea = 'Dyspnea',
    Hypotension = 'Hypotension',
    Other = 'Other',
    AtopicDermatitis = 'Atopic Dermatitis',
    BloodPressureDrop = 'Blood Pressure Drop',
    ContactDermatitis = 'Contact Dermatitis',
    Cough = 'Cough',
    Diarrhea = 'Diarrhea',
    Dizzy = 'Dizzy',
    ExcessiveDrowsiness = 'Excessive drowsiness',
    GICramps = 'GI Cramps',
    GIUpset = 'GI upset',
    Hallucinations = 'Hallucinations',
    Headache = 'Headache',
    LossOfConsciousness = 'Loss of Consciousness',
    MuscleMyalgia = 'Muscle Myalgia',
    OcularItchingAndSwelling = 'Ocular Itching and/or Swelling',
    Palpitations = 'Palpitations',
    Rhinitis = 'Rhinitis',
    NauseaAndVomiting = 'Nausea & Vomiting'
  }
}

export interface Immunization {
  administeredBy?: string
  age?: string
  date?: JSONDate
  dose?: {
    value: number
    unit: {
      mass: string
      volume: string
      time: string
    }
  }
  expirationDate?: JSONDate
  id?: Immunization.ID
  lot?: any
  lotNumber?: string
  manufacturer?: any
  notes?: string
  received?: string
  recorded?: string
  recorder?: string
  route?: string
  site?: any
  status?: string
  vaccine: string
  facility?: string
}

export namespace Immunization {
  export type ID = Branded<UUID, 'Immunization.ID'>
  export type Fragment = Partial<Omit<Immunization, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export enum Route {
    IM = 'Intramuscular (IM)',
    SC = 'Subcutaneous (SC)',
    ID = 'Intradermal (ID)',
    IN = 'Intranasal (IN)',
    PO = 'Oral (PO)',
    IV = 'Intravenous (IV)'
  }

  export enum Site {
    LEFT_DELTOID = 'Left deltoid',
    RIGHT_DELTOID = 'Right deltoid',
    LEFT_THIGH = 'Left thigh',
    RIGHT_THIGH = 'Right thigh',
    LEFT_ARM = 'Left arm',
    RIGHT_ARM = 'Right arm',
    LEFT_GLUTE = 'Left gluteal',
    RIGHT_GLUTE = 'Right gluteal',
    ORAL = 'Oral',
    NASAL = 'Nasal'
  }
}

export interface Imaging {
  id?: Imaging.ID
  date: JSONDate
  abnormal?: string
  acuity?: string
  image?: string
  performedBy?: string
  provider: Provider.ID
  status: string
  statusDate: JSONDate
  test: string
  narrative?: string
  impression?: string
}

export namespace Imaging {
  export type ID = Branded<UUID, 'Imaging.ID'>
  export type Fragment = Partial<Omit<Imaging, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Lab {
  id?: Lab.ID
  date: JSONDate
  abnormal: string
  acuity?: string
  collected: string
  comment?: any
  components: Lab.Component[]
  expectedDate?: JSONDate
  expirationDate?: JSONDate
  provider?: Provider.ID
  resulted?: any
  resultingAgency: any
  status: string
  statusDate?: JSONDate
  test: string
}

export namespace Lab {
  export type ID = Branded<UUID, 'Lab.ID'>
  export type Fragment = Partial<Omit<Lab, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export interface Component {
    name: string
    value: number | string
    units?: string | null
    high?: number | null
    low?: number | null
    comment?: string | null
  }
}

export interface Medication {
  id: Medication.ID
  activePrnReasons: string[]
  dose?: number
  endDate: JSONDate
  frequency: string
  name: string
  possiblePrnReasons: string[]
  route: string
  startDate: JSONDate
  status?: string
  statusNote?: string
  unit?: string
  lastDose?: JSONDate
}

export namespace Medication {
  export type ID = Branded<UUID, 'Medication.ID'>
  export type Fragment = Partial<Omit<Medication, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export enum Route {
    Oral = 'Oral',
    Sublingual = 'Sublingual',
    Buccal = 'Buccal',
    Rectal = 'Rectal',
    Vaginal = 'Vaginal',
    Topical = 'Topical',
    Inhalation = 'Inhalation',
    Intravenous = 'Intravenous (IV)',
    Intramuscular = 'Intramuscular (IM)',
    Subcutaneous = 'Subcutaneous (SC)',
    Intradermal = 'Intradermal (ID)',
    Transdermal = 'Transdermal',
    Nasal = 'Nasal',
    Ophthalmic = 'Ophthalmic',
    Otic = 'Otic'
  }

  export const UNITS = [
    { full: 'Milligrams (mg)', abbrev: 'mg' },
    { full: 'Grams (g)', abbrev: 'g' },
    { full: 'Milliliters (mL)', abbrev: 'mL' },
    { full: 'Puffs', abbrev: 'Puffs' }
  ];

  export interface DispenseLog {
    id: DispenseLog.ID
    dispensed: string
    dosage: string
    drug: string
    route: string
    name: string
    pharmacy: string
    prescriber: string
    quantity: number
    refills: number
    supply: number
    written: any
  }

  export namespace DispenseLog {
    export type ID = Branded<UUID, 'Medication.DispenseLog.ID'>
    export type Fragment = Partial<Omit<DispenseLog, 'id'>>
    export namespace ID {
      export const create = (): ID => crypto.randomUUID() as ID
    }
  }
}

export interface Note {
  id: Note.ID
  date: JSONDate
  type: string
  author: Provider.ID
  serviceDate: JSONDate
  status: string
  summary: string
  content: string
}

export namespace Note {
  export type ID = Branded<UUID, 'Note.ID'>
  export type Fragment = Partial<Omit<Note, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export const NOTE_TYPES = [
    "ACP (Advance Care Planning)",
    "Brief Op Note",
    "Consults",
    "Discharge Summary",
    "ED Medical/PA Student Note",
    "H&P",
    "Lactation Note",
    "OB ED/Admit Note",
    "Outcome Summary",
    "Patient Care Conference",
    "Procedures",
    "Progress Notes",
    "Psych Limited Note",
    "Psych Progress",
    "Significant Event"
  ];
}

export interface Order {
  id: Order.ID
  date: JSONDate
  name: string
  dose: string
  frequency: string
  route: string
  endDate: JSONDate
}

export namespace Order {
  export type ID = Branded<UUID, 'Order.ID'>
  export type Fragment = Partial<Omit<Order, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface History {
  medical: MedicalHistoryItem[]
  surgical: SurgicalHistoryItem[]
  family: FamilyHistoryItem[]
  familyStatus: FamilyStatusItem[]
  social: SocialHistoryItem[]
}

export interface MedicalHistoryItem {
  id: MedicalHistoryItem.ID
  date?: JSONDate
  diagnosis: DiagnosisCode
  displayAs?: string
  source?: MedicalHistoryItem.Source
  comment?: string
}

export namespace MedicalHistoryItem {
  export type ID = Branded<UUID, 'MedicalHistoryItem.ID'>
  export type Fragment = Partial<Omit<MedicalHistoryItem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
  export enum Source {
    Clinician = 'Approved by Clinician',
    Patient = 'From Patient Questionnaire'
  }
}

export interface SurgicalHistoryItem {
  id: SurgicalHistoryItem.ID
  date?: JSONDate
  procedure: string
  laterality: SurgicalHistoryItem.Laterality
  source?: SurgicalHistoryItem.Source
  comment?: string
}

export namespace SurgicalHistoryItem {
  export type ID = Branded<UUID, 'SurgicalHistoryItem.ID'>
  export type Fragment = Partial<Omit<SurgicalHistoryItem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
  export enum Laterality {
    NA = 'N/A',
    Bilateral = 'Bilateral',
    Left = 'Left',
    Right = 'Right'
  }
  export enum Source {
    Clinician = 'Approved by Clinician',
    Patient = 'From Patient Questionnaire',
    SurgicalLog = 'From Surgical Log Entry'
  }
}

export interface FamilyStatusItem {
  id: FamilyStatusItem.ID
  age?: number | null
  comment?: string
  name: string
  relationship: FamilyStatusItem.Relationship
  status: FamilyStatusItem.Status
}

export namespace FamilyStatusItem {
  export type ID = Branded<UUID, 'FamilyStatusItem.ID'>
  export type Fragment = Partial<Omit<FamilyStatusItem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
  export enum Relationship {
    Mother = 'Mother',
    Father = 'Father',
    Brother = 'Brother',
    Sister = 'Sister',
    Daughter = 'Daughter',
    Son = 'Son',
    MaternalGrandmother = 'Maternal Grandmother',
    MaternalGrandfather = 'Maternal Grandfather',
    PaternalGrandmother = 'Paternal Grandmother',
    PaternalGrandfather = 'Paternal Grandfather',
    MaternalAunt = 'Maternal Aunt',
    MaternalUncle = 'Maternal Uncle',
    PaternalAunt = 'Paternal Aunt',
    PaternalUncle = 'Paternal Uncle',
    MaternalCousin = 'Maternal Cousin',
    PaternalCousin = 'Paternal Cousin',
    Other = 'Other'
  }
  export enum Status {
    Alive = 'Alive',
    Deceased = 'Deceased',
    Unknown = 'Unknown'
  }
}

export interface FamilyHistoryItem {
  id: FamilyHistoryItem.ID
  person: FamilyStatusItem.ID
  description: string
  age: string | null
}

export namespace FamilyHistoryItem {
  export type ID = Branded<UUID, 'FamilyHistoryItem.ID'>
  export type Fragment = Partial<Omit<FamilyHistoryItem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface SocialHistoryItem {
  id: SocialHistoryItem.ID
  tobacco?: {
    status?: SocialHistoryItem.SmokingStatus
    types?: SocialHistoryItem.SmokingType[]
    passiveExposure?: SocialHistoryItem.PassiveExposure
    packsPerDay?: number
    packYears?: number
    startDate?: JSONDate
    quitDate?: JSONDate
    smokeless?: SocialHistoryItem.SmokelessStatus
    comments?: string
  }
  alcohol?: {
    status?: SocialHistoryItem.AlcoholStatus
    wine?: number
    beer?: number
    liquor?: number
    mixed?: number
    standard?: number
    comments?: string
  }
  drugs?: {
    status?: SocialHistoryItem.DrugStatus
    types?: SocialHistoryItem.DrugType[]
    usage?: number
    comments?: string
  }
  sexual?: {
    status?: SocialHistoryItem.SexualStatus
    birthControl?: SocialHistoryItem.BirthControlMethod[]
    partners?: SocialHistoryItem.SexualPartner[]
    comments?: string
  }
  vaping?: {
    status?: SocialHistoryItem.VapingStatus
    startDate?: JSONDate
    quitDate?: JSONDate
    cartridgesPerDay?: number
    passiveExposure?: boolean
    counselingGiven?: boolean
    comments?: string
    substances?: (SocialHistoryItem.VapingSubstance | string)[]
    devices?: (SocialHistoryItem.VapingDevice | string)[]
  }
  occupational?: {
    //status?: SocialHistoryItem.EmploymentStatus
    employer?: string
    occupation?: string
    history?: {
      employer?: string
      occupation?: string
      comment?: string
    }[]
  }
  demographics?: {
    maritalStatus?: SocialHistoryItem.MaritalStatus
    //religion?: SocialHistoryItem.Religion
    //genderIdentity?: SocialHistoryItem.GenderIdentity
    //sexAssignedAtBirth?: SocialHistoryItem.SexAssignedAtBirth
    //sexualOrientation?: SocialHistoryItem.SexualOrientation
    //pronouns?: SocialHistoryItem.Pronouns
    spouseName?: string
    numberOfChildren?: number
    yearsOfEducation?: number
    highestEducationLevel?: SocialHistoryItem.HighestEducationLevel
    preferredLanguage?: Patient.Language | string
    ethnicGroup?: SocialHistoryItem.EthnicGroup | string
    race?: SocialHistoryItem.Race | string
  }
  birth?: {
    birthLength?: number
    birthWeight?: number
    birthHeadCirc?: number
    dischargeWeight?: number
    birthTime?: JSONDate
    gestationWeeks?: number
    gestationDays?: number
    apgar1?: number
    apgar5?: number
    apgar10?: number
    deliveryMethod?: SocialHistoryItem.DeliveryMethod
    durationOfLabor?: number
    feedingMethod?: SocialHistoryItem.FeedingMethod
    dateInHospital?: JSONDate
    hospitalName?: string
    hospitalLocation?: string
    comments?: string
  }
  obstetrics?: {
    gravida?: number
    para?: number
    term?: number
    preterm?: number
    ab?: number
    living?: number
    sab?: number
    iab?: number
    ectopic?: number
    multiple?: number
    liveBirths?: number
    currentlyPregnant?: boolean
    neverPregnant?: boolean
    comments?: string
  }
  gynecology?: {
    lastMenstrualPeriod?: JSONDate
    ageAtMenarche?: number
    ageAtFirstPregnancy?: number
    ageAtFirstLiveBirth?: number
    monthsBreastfeeding?: number
    ageAtMenopause?: number
    comments?: string
  }
  adl?: SocialHistoryItem.ADL[]
  comments?: string
}

export namespace SocialHistoryItem {
  export type ID = Branded<UUID, 'SocialHistoryItem.ID'>
  export type Fragment = Partial<Omit<SocialHistoryItem, 'id'>>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export enum ADL {
    BackCare = 'Back Care',
    BloodTransfusions = 'Blood Transfusions',
    Exercise = 'Exercise',
    Homebound = 'Homebound',
    MilitaryService = 'Military Service',
    SeatBelt = 'Seat Belt',
    SleepConcern = 'Sleep Concern',
    StressConcern = 'Stress Concern',
    BikeHelmet = 'Bike Helmet',
    CaffeineConcern = 'Caffeine Concern',
    HobbyHazards = 'Hobby Hazards',
    Homeless = 'Homeless',
    OccupationalExposure = 'Occupational Exposure',
    SelfExams = 'Self-Exams',
    SpecialDiet = 'Special Diet',
    WeightConcern = 'Weight Concern'
  }

  export enum MaritalStatus {
    Single = 'Single',
    Married = 'Married',
    Divorced = 'Divorced',
    Widowed = 'Widowed',
    Separated = 'Separated',
    DomesticPartnership = 'Domestic Partnership'
  }

  export enum Religion {
    Christianity = 'Christianity',
    Islam = 'Islam',
    Judaism = 'Judaism',
    Hinduism = 'Hinduism',
    Buddhism = 'Buddhism',
    Atheist = 'Atheist',
    Agnostic = 'Agnostic',
    Other = 'Other',
    None = 'None'
  }

  export enum EmploymentStatus {
    Unknown = 'Unknown',
    Employed = 'Employed',
    Unemployed = 'Unemployed',
    Retired = 'Retired',
    Student = 'Student',
    Disabled = 'Disabled',
    SelfEmployed = 'Self-Employed'
  }

  export enum HighestEducationLevel {
    HighSchool = 'High School',
    AssociateDegree = 'Associate Degree',
    BachelorDegree = 'Bachelor Degree',
    MasterDegree = 'Master Degree',
    DoctoralDegree = 'Doctoral Degree'
  }

  export enum EthnicGroup {
    HispanicOrLatino = 'Hispanic or Latino',
    NotHispanicOrLatino = 'Not Hispanic or Latino',
    Unknown = 'Unknown',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum Race {
    White = 'White',
    BlackOrAfricanAmerican = 'Black or African American',
    Asian = 'Asian',
    NativeAmerican = 'Native American',
    PacificIslander = 'Pacific Islander',
    Other = 'Other',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum GenderIdentity {
    Male = 'Male',
    Female = 'Female',
    NonBinary = 'Non-binary',
    Genderqueer = 'Genderqueer',
    Transgender = 'Transgender',
    Agender = 'Agender',
    Genderfluid = 'Genderfluid',
    Other = 'Other',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum SexAssignedAtBirth {
    Male = 'Male',
    Female = 'Female',
    Intersex = 'Intersex',
    Unknown = 'Unknown',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum SexualOrientation {
    Heterosexual = 'Heterosexual',
    Homosexual = 'Homosexual',
    Bisexual = 'Bisexual',
    Pansexual = 'Pansexual',
    Asexual = 'Asexual',
    Demisexual = 'Demisexual',
    Queer = 'Queer',
    Questioning = 'Questioning',
    Other = 'Other',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum Pronouns {
    HeHim = 'He/Him',
    SheHer = 'She/Her',
    TheyThem = 'They/Them',
    HeThey = 'He/They',
    SheThey = 'She/They',
    Other = 'Other',
    PreferNotToAnswer = 'Prefer not to answer'
  }

  export enum SmokingStatus {
    Never = 'Never',
    Former = 'Former',
    EveryDay = 'Every Day',
    SomeDays = 'Some Days',
    Unknown = 'Unknown'
  }

  export enum PassiveExposure {
    Never = 'Never',
    Past = 'Past',
    Current = 'Current'
  }

  export enum SmokingType {
    Cigarettes = 'Cigarettes',
    Pipe = 'Pipe',
    Cigars = 'Cigars',
    Other = 'Other'
  }

  export enum SmokelessStatus {
    Never = 'Never',
    Former = 'Former',
    Current = 'Current',
    Unknown = 'Unknown'
  }

  export enum AlcoholStatus {
    Yes = 'Yes',
    No = 'No',
    NotCurrently = 'Not Currently',
    Never = 'Never'
  }

  export enum DrugStatus {
    Yes = 'Yes',
    No = 'No',
    NotCurrently = 'Not Currently',
    Never = 'Never'
  }

  export enum DrugType {
    AnabolicSteroids = 'Anabolic Steroids',
    Barbiturates = 'Barbiturates',
    Benzodiazepines = 'Benzodiazepines',
    Cannabinoids = 'Cannabinoids - Marijuana, Hashish, Synthetics',
    Hallucinogens = 'Hallucinogens - e.g. LSD, Mushrooms',
    Inhalants = 'Inhalants - e.g. Nitrous Oxide, Amyl Nitrite',
    Opioids = 'Opioids',
    Stimulants = 'Stimulants - e.g. Amphetamines, Crack/Cocaine, Methyphenidate',
    Other = 'Other'
  }

  export enum SexualStatus {
    Yes = 'Yes',
    NotCurrently = 'Not Currently',
    Never = 'Never'
  }

  export enum BirthControlMethod {
    Abstinence = 'Abstinence',
    CoitusInterruptus = 'Coitus Interruptus',
    Condom = 'Condom',
    Diaphragm = 'Diaphragm',
    IUD = 'IUD',
    Implant = 'Implant',
    Injection = 'Injection',
    None = 'None',
    Patch = 'Patch',
    Pill = 'Pill',
    ProgesteroneOnlyPill = 'Progesterone only pill (mini-pill)',
    Rhythm = 'Rhythm',
    Ring = 'Ring',
    Spermicide = 'Spermicide',
    Sponge = 'Sponge',
    SpousePartnerWithVasectomy = 'Spouse/Partner w/vasectomy',
    Surgical = 'Surgical'
  }

  export enum SexualPartner {
    Female = 'Female',
    Male = 'Male'
  }

  export enum VapingStatus {
    CurrentEveryDayUser = 'Current Every Day User',
    CurrentSomeDayUser = 'Current Some Day User',
    FormerUser = 'Former User',
    NeverAssessed = 'Never Assessed',
    NeverUser = 'Never User',
    UserCurrentStatusUnknown = 'User - Current Status Unknown',
    UnknownIfEverUsed = 'Unknown If Ever Used'
  }

  export enum DeliveryMethod {
    Biochemical = 'Biochemical',
    CSectionLowTransverse = 'C-section, low transverse',
    CSectionLowVertical = 'C-Section, low vertical',
    CSectionClassical = 'C-Section, classical',
    CSectionUnspecified = 'C-section, unspecified',
    VaginalBreech = 'Vaginal, breech',
    VBAC = 'VBAC',
    VaginalForceps = 'Vaginal, forceps',
    VaginalSpontaneous = 'Vaginal, spontaneous',
    VaginalVacuum = 'Vaginal, vacuum'
  }

  export enum FeedingMethod {
    BreastFed = 'Breast Fed',
    BottleFedFormula = 'Bottle Fed-Formula',
    BottleFedBreastMilk = 'Bottle Fed- Breast Milk',
    BothBreastAndBottleFed = 'Both Breast and Bottle Fed',
    Unknown = 'Unknown'
  }

  export enum VapingSubstance {
    Nicotine = 'Nicotine',
    THC = 'THC',
    CBD = 'CBD',
    Flavoring = 'Flavoring'
  }

  export enum VapingDevice {
    Disposable = 'Disposable',
    PreFilledPod = 'Pre-filled Pod',
    PreFilledOrRefillableCartridge = 'Pre-filled or Refillable Cartridge',
    RefillableTank = 'Refillable Tank'
  }
}
