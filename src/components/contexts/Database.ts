declare const __brand: unique symbol
type Brand<B> = { [__brand]: B }
export type Branded<T, B> = T & Brand<B>

export type UUID = string
export type JSONDate = string | Date

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
  departments: Department[]
  locations: Location[]
  providers: Provider[]
  flowsheets: Flowsheet.Definition[]
  lists: PatientList[]
  schedules: Schedule[]
  patients: {
    [key: Patient.ID]: Patient;
  },
  orderables?: any
}

export interface Department {
  id: Department.ID
  name: string
  location?: string
  specialty: string
  identityId?: number // remove
  serviceArea?: string // should be facility!
}

export namespace Department {
  export type ID = Branded<UUID, 'Department.ID'>
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
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Provider {
  department: Department.ID
  id: Provider.ID
  name: string
  role: string
  specialty: string
}

export namespace Provider {
  export type ID = Branded<UUID, 'Provider.ID'>
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
    flowsheet?: Flowsheet.Definition.ID
    date?: JSONDate
    [key: string]: any;
  }

  export namespace Entry {
    export type ID = Branded<UUID, 'Flowsheet.Entry.ID'>
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

export interface Schedule {
  department: Department.ID
  appointments: Appointment[]
}

export interface Appointment {
  id: Appointment.ID
  patient: {
    mrn: Patient.ID,
    enc: Encounter.ID
  }
  type: string
  location?: string
  apptTime: string
  cc: string
  notes: string
  checkinTime?: string
  checkoutTime: any
  officeStatus: string
}

export namespace Appointment {
  export type ID = Branded<UUID, 'Appointment.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Patient {
  id: Patient.ID
  firstName: string
  lastName: string
  birthdate: JSONDate
  gender: string
  avatarUrl?: string
  address?: any
  preferredLanguage?: string
  insurance?: {
    carrierName: string
  }
  careTeam?: CareTeam[]
  encounters: {
    [key: Encounter.ID]: Encounter;
  }
}

export namespace Patient {
  export type ID = Branded<UUID, 'Patient.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Encounter {
  allergies?: Allergy[]
  concerns?: string[]
  conditionals?: any
  department: number
  diagnoses?: string[]
  dispenseHistory?: Medication.DispenseLog[]
  endDate: JSONDate
  flowsheets?: Flowsheet.Entry[]
  history: History
  id: Encounter.ID
  imaging?: Imaging[]
  immunizations: Immunization[]
  labs?: Lab[]
  medications?: Medication[]
  notes: Note[]
  problems?: Problem[]
  orders: Order[]
  provider: string
  smartData?: SmartData
  startDate: JSONDate
  status: string
  specialty?: string
  type: string
}

export namespace Encounter {
  export type ID = Branded<UUID, 'Encounter.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface CareTeam {
  provider: Provider.ID
  role: string
}

export interface SmartData {
  chat?: {
    custom_prompt: string
    patient_perspective: string
    voice: SmartData.Voice
  }
  handoff?: {
    [key: Department.ID]: {
      summary: string;
      todo: string;
    };
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

export interface Allergy {
  id: Allergy.ID
  allergen: string
  comment: any
  reaction: any
  reactionType: Allergy.ReactionType
  recorded: string
  recorder: string
  resovled: boolean
  severity: Allergy.Severity
  type: Allergy.Type
  verified: boolean
  isNew?: boolean
}

export namespace Allergy {
  export type ID = Branded<UUID, 'Allergy.ID'>
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
  accessionNumber?: string
  acuity?: string
  image?: string
  performedBy?: string
  provider: string
  status: string
  statusDate: JSONDate
  test: string
}

export namespace Imaging {
  export type ID = Branded<UUID, 'Imaging.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface Lab {
  id?: Lab.ID
  date: JSONDate
  abnormal: string
  accessionNumber?: string
  acuity?: string
  collected: string
  comment?: any
  components: Lab.Component[]
  expectedDate?: JSONDate
  expirationDate?: JSONDate
  provider?: string
  resulted?: any
  resultingAgency: any
  status: string
  statusDate?: JSONDate
  test: string
}

export namespace Lab {
  export type ID = Branded<UUID, 'Lab.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export interface Component {
    name: string
    value?: any
    units?: string | null
    high?: number | null
    low?: number | null
    comment?: any
  }
}

export interface Medication {
  id: Medication.ID
  activePrnReasons: string[]
  brandName?: string | null
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
}

export namespace Medication {
  export type ID = Branded<UUID, 'Medication.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }

  export interface DispenseLog {
    dispensed: string
    dosage: string
    drug: string
    name: string
    pharmacy: string
    prescriber: string
    quantity: number
    refills: number
    supply: number
    written: any
  }
}

export interface Note {
  id: Note.ID
  date: JSONDate
  type: string
  author: string
  serviceDate: JSONDate
  status: string
  summary: string
  content: string
}

export namespace Note {
  export type ID = Branded<UUID, 'Note.ID'>
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
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
  export namespace ID {
    export const create = (): ID => crypto.randomUUID() as ID
  }
}

export interface History {
  medical: MedicalHistoryItem[]
  surgical: SurgicalHistoryItem[]
  family: FamilyHistoryItem[]
  SubstanceSexualHealth?: SubstanceSexualHealth
  Socioeconomic?: {
    demographics?: Demographics
    employer?: string
    occupation?: string
    occupationalHistory?: OccupationalHistory[]
  }
  SocialHistoryADL?: any
  ECigaretteVaping?: any
  SocialDocumentation?: {
    textbox: string
  }
  OBGynHistory?: any
  BirthHistory?: {
    birthComplications?: string
    birthLength?: string
    birthWeight?: string
    deliveryMethod?: string
    gestationalAge?: string
    hospitalStay?: string
    gestationWeeks?: string
    gestationDays?: string
    apgar1?: string
    apgar5?: string
    apgar10?: string
    birthTime?: string
    birthHeadCirc?: string
    dischargeWeight?: string
    durationOfLabor?: string
    feedingMethod?: string
    dateInHospital?: string
    hospitalName?: string
    hospitalLocation?: string
    comments?: string
  }
}

export interface Demographics {
  religion?: string
  ethnicGroup: string
  highestEducationLevel: any
  maritalStatus: string
  numberOfChildren: any
  preferredLanguage: string
  race: string
  spouseName: any
  spouseOccupation?: string
  yearsOfEducation: any
}

export interface FamilyHistoryItem {
  age?: number | null
  comment?: string
  name: string
  problems: {
    description: string
    ageOfOnset: string | null
  }[]
  relationship: string
  status: string
}

export interface MedicalHistoryItem {
  age?: string
  comment?: string
  date?: JSONDate
  diagnosis: string
  notes?: string
  problemList?: string
  src?: string
  status?: string
}

export interface SurgicalHistoryItem {
  age: string
  comment?: string
  date: JSONDate
  laterality: string
  notes?: string
  procedure: string
  src?: string
}

export interface OccupationalHistory {
  employer: string
  occupation: string
}

export interface Problem {
  class: string
  diagnosedDate?: JSONDate
  diagnosis: string
  display: string
  isChronicCondition: boolean
  isShareWithPatient: boolean
  notedDate?: JSONDate
  priority: string
  resolvedDate?: JSONDate
}

export interface SubstanceSexualHealth {
  alcohol?: {
    alcoholStatus?: string
    comments?: string
    drinksPerWeek: {
      beer?: number
      beerCans?: number
      drinksContainingAlcohol?: number
      liquor?: number
      liquorShots?: number
      mixedDrinks?: number
      standardDrinks: number
      wine?: number
      wineGlasses?: number
    }
    use?: string
  }
  drugs?: {
    comments: string
    drugStatus?: string
    drugTypes?: string[] | any[]
    types?: any[]
    use?: string
    usePerWeek: number | string
  }
  gynecologicalHistory?: {
    comments: string
    lastMenstrualPeriod: string
    menarche: string
    menstrualCycleDuration: string
    menstrualCycleFrequency: string
    menstrualFlow: string
    regularity: string
  }
  sexual?: {
    comments: string
    sexuallyActive: string
  }
  sexualActivity?: {
    active: string
    birthControl: any[]
    comments: string
    partners: any[]
  }
  tobacco?: {
    comments?: string
    packYears: any
    packsPerDay: any
    passiveExposure?: string
    smokeless?: string
    smokelessStatus?: {
      comments: string
      smokelessStatus: string
    }
    smokingStatus?: string
    counselingGiven?: boolean
    startDate: JSONDate
    status?: string
    types?: any[] | string[]
  }
}
