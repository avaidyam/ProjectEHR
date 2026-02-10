export interface Root {
  departments: Department[]
  locations: Location[]
  providers: Provider[]
  flowsheets: FlowsheetDefinition[]
  lists: PatientList[]
  schedules: Schedule[]
  patients: {
    [key: string]: Patient;
  },
  orderables?: any
}

export interface Department {
  id: number
  identityId?: number
  location?: string
  name: string
  serviceArea?: string
  specialty: string
}

export interface Location {
  departmentId: number
  id: string
  name: string
  status: string
  type: string
}

export interface Provider {
  department: number
  id: string
  name: string
  role: string
  specialty: string
}

export interface FlowsheetDefinition {
  id: string
  name?: string
  rows?: Row[]
}

export interface PatientList {
  columns: PatientListColumn[]
  id: string
  name: string
  patients: string[]
  type: string
}

export interface PatientListColumn {
  id: string
  label: string
  order: number
  selected: boolean
}

export interface Schedule {
  appointments: Appointment[]
  department: number
}

export interface Appointment {
  apptTime: string
  cc: string
  checkinTime?: string
  checkoutTime: any
  id: number
  location?: string
  notes: string
  officeStatus: string
  patient: {
    mrn: string,
    enc: string
  }
  type: string
}

export interface Patient {
  address?: any
  avatarUrl?: any
  birthdate?: string
  careTeam?: CareTeam[]
  enc?: string
  encounters?: {
    [key: string]: Encounter;
  }
  firstName?: string
  gender?: string
  id?: string
  insurance?: Insurance
  lastName?: string
  mrn?: string
  preferredLanguage?: string
}

export interface Encounter {
  allergies?: Allergy[]
  concerns?: string[]
  conditionals?: any
  department: number
  diagnoses?: string[]
  dispenseHistory?: DispenseHistory[]
  endDate: string
  flowsheets?: Flowsheet[]
  history: History
  id: string
  imaging?: Imaging[]
  immunizations?: Immunization[]
  labs?: Lab[]
  medications?: Medication[]
  notes: Note[]
  problems?: Problem[]
  provider: string
  smartData?: SmartData
  startDate: string
  status: string
  type: string
}

export interface CareTeam {
  provider: string
  role: string
}

export interface SmartData {
  chat: {
    custom_prompt: string
    patient_perspective: string
    voice: string
  }
}

export interface Allergy {
  allergen: string
  comment: any
  id: string
  reaction: any
  recorded: string
  recorder: string
  resovled: boolean
  severity: any
  type: string
  verified: boolean
}

export interface Immunization {
  administeredBy?: string
  age?: string
  date?: string
  dose?: string
  expirationDate?: string
  id?: string
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
}

export interface DispenseHistory {
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

export interface History {
  medical?: MedicalHistoryItem[]
  surgical?: SurgicalHistoryItem[]
  family?: FamilyHistoryItem[]
  SubstanceSexualHealth?: SubstanceSexualHealth
  Socioeconomic?: {
    demographics?: Demographics
    employer?: string
    occupation?: string
    occupationalHistory?: OccupationalHistory[]
  }
  ECigaretteVaping?: any
  SocialDocumentation?: {
    textbox: string
  }
  OBGynHistory?: any
  BirthHistory?: {
    birthComplications?: string
    birthWeight?: string
    deliveryMethod?: string
    gestationalAge?: string
    hospitalStay?: string
  }
}

export interface Component {
  comment?: any
  high?: number | null
  low?: number | null
  name: string
  units?: string | null
  value?: any
}

export interface Demographics {
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

export interface Flowsheet {
  bmi?: any
  date?: string
  dbp?: number
  flowsheet?: string
  height?: any
  hr?: number
  id: string
  name?: string
  rows?: Row[]
  rr?: any
  sbp?: number
  spo2?: any
  temp?: number
  weight?: any
}

export interface Imaging {
  abnormal?: string
  accessionNumber?: string
  acuity?: string
  date: string
  id?: string
  image?: string
  performedBy?: string
  provider: string
  status: string
  statusDate: string
  test: string
}

export interface Insurance {
  carrierName: any
}

export interface Lab {
  abnormal: string
  accessionNumber?: string
  acuity?: string
  collected: string
  comment?: any
  components: Component[]
  date: string
  expectedDate?: string
  expirationDate?: any
  id?: string
  provider?: string
  resulted?: any
  resultingAgency: any
  status: string
  statusDate?: string
  test: string
}

export interface MedicalHistoryItem {
  age?: string
  comment?: string
  date?: string
  diagnosis: string
  notes?: string
  problemList?: string
  src?: string
  status?: string
}

export interface Medication {
  activePrnReasons: string[]
  brandName?: string | null
  dose?: number
  endDate: any
  frequency: string
  id: string
  name: string
  possiblePrnReasons: string[]
  route: string
  startDate: any
  status?: string
  statusNote?: string
  unit?: string
}

export interface Note {
  author: string
  content: string
  date: string
  id: string
  serviceDate: string
  status: string
  summary: string
  type: string
}

export interface OccupationalHistory {
  employer: string
  occupation: string
}

export interface Order {
  date: string
  dose: string
  endDate: any
  frequency: string
  id: string
  name: string
  route: string
}

export interface Problem {
  class: string
  diagnosedDate?: any
  diagnosis: string
  display: string
  isChronicCondition: boolean
  isShareWithPatient: boolean
  notedDate?: any
  priority: string
  resolvedDate?: any
}

export interface Row {
  description?: string
  label: string
  name: string
  options?: string[]
  type: string
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
    startDate: any
    status?: string
    types?: any[] | string[]
  }
}

export interface SurgicalHistoryItem {
  age: string
  comment?: string
  date: string
  laterality: string
  notes?: string
  procedure: string
  src?: string
}
