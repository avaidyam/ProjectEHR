/* eslint-disable no-use-before-define */

// #region Unit Types

/**
 * Represents a UUID.
 */
type UUID = string;

/**
 * The base object from which other resource types inherit.
 */
export interface Object {

  /** A UUID representing the object. */
  id: UUID;

  /** The type of this object. (Set automatically by subclasses.) */
  type: string;
}

/**
 * Contact information.
 */
export interface Contact {

  /** */
  phone: string;

  /** */
  address: string;

  /** */
  email: string;
}

/**
 * For example, a quantity with only a mass unit might be a dosage, a quantity with mass and volume units would be a concentration, and a quantity with volume and time units would be a rate (i.e. for IV infusion).
 */
export interface Unit {

  /** The mass units of this quantity (i.e. `mg`, `mg/ml`, or `mg/kg`), if applicable. */
  mass: string | null;

  /** The volume units of this quantity (i.e. `ml`), if applicable. */
  volume: string | null;

  /** The time units of this quantity (i.e. `ml/min`), if applicable. */
  time: string | null;
}

/**
 * Denotes a numeric value with units (i.e. dosage).
 */
export interface Quantity {

  /** The amount of this quantity. */
  value: number;

  /** The units of this quantity. */
  unit: Unit;
}

/**
 * Defines a recurring period with optional limits.
 */
export interface Period {

  /** */
  start: Date;

  /** */
  end: Date;

  /** */
  limit: number;

  /** */
  limit_unit: 'doses' | 'days' | 'weeks' | string;

  /** */
  every: number;

  /** */
  every_unit: 'hours' | 'months' | 'weeks' | string;
}

/**
 * Represents the "sig" of a medication (dosage instructions).
 */
export interface MedSig {

  /** */
  dose: Quantity;

  /** */
  frequency: Period;

  /** */
  site: string;

  /** */
  route: string;

  /** */
  duration: number;

  /** */
  prn: boolean;

  /** */
  prn_comment: string;

  /** */
  comment: string;
}

// #endregion Unit Types

// #region Resource Types

/**
 * A place that medical care takes place (i.e. `My Cool Hospital`).
 */
export interface Facility extends Object {

  /** The name of the facility. */
  name: string;

  /** */
  departments: Department[];

  /** */
  contact: Contact;
}

/**
 * A subunit of a facility.
 */
export interface Department extends Object {

  /** */
  facility: UUID;

  /** */
  name: string;

  /** */
  locations: Location[];

  /** */
  contact: Contact;
}

/**
 * A location within the department (i.e. a room `12` or bed `6210A`).
 */
export interface Location extends Object {

  /** */
  department: UUID;

  /** */
  name: string;

  /** */
  schedules: Schedule[];

  /** */
  contact: Contact;
}

/**
 * An individual providing care to patients in the facility.
 */
export interface Practitioner extends Object {

  /** */
  facility: UUID;

  /** */
  name: string;

  /** The NPI or other license number. */
  license: string;

  /** */
  schedules: Schedule[];

  /** */
  specialty: UUID;

  /** */
  lists: List[];

  /** */
  contact: Contact;
}

/**
 * A patient within the system. The `id` also serves as their Medical Records Number (MRN).
 */
export interface Patient extends Object {

  /** Note: this `id` field is the same as one inherited from `Object`, and also serves as the patient's `mrn` (medical records number). */
  id: UUID;

  /** */
  name: string;

  /** */
  birthdate: Date;

  /** */
  sex: 'male' | 'female' | string | null;

  /** The patient's government ID number (i.e. SSN). */
  tax_id: string;

  /** */
  language: string;

  /** */
  contact: Contact;

  /** */
  insurance: string;
}

/**
 * A schedule.
 */
export interface Schedule {

  /** */
  department: string;

  /** TODO. */
  period: Date;

  /** */
  comment: string;
}

/**
 * An appointment.
 */
export interface Appointment {

  /** */
  patient: Patient;

  /** */
  practitioner: Practitioner;

  /** */
  location: Location;

  /** */
  date: Date;

  /** */
  duration: number;

  /** */
  status: string;

  /** */
  flag: string;

  /** The reason-for-visit (RFV) or chief-complaint (CC) for the appointment. */
  concern: string;

  /** Any miscellaneous notes for this appointment. */
  comment: string;
}

/**
 * A list.
 */
export interface List {

  /** */
  name: string;

  /** */
  parent: List;

  /** The owner of the list, or `null` if this is a system-wide accessible list. */
  owner: Practitioner | null;

  /** A set of Practitioners that have read-write access, or `null` if not shared. */
  shared: Practitioner[] | null;

  /** */
  patients: Patient[];
}

/**
 * Represents the status of an Encounter or other resource.
 */
export interface Status {

  /** The status. */
  value: string;

  /** When this status was applied. */
  changed: Date;

  /** The Practitioner that applied this status. */
  actor: Practitioner;
}

/**
 * Represents a medical condition or diagnosis.
 */
export interface Condition {

  /** The SNOMED-CT code mapped to the condition. */
  code: string;

  /** The human-friendly renamed title of the condition. */
  title: string;

  /** */
  principal: boolean;

  /** */
  active: boolean;

  /** */
  hospital: boolean;

  /** */
  priority: number;

  /** */
  recorded: Date;

  /** */
  recorder: Practitioner;

  /** */
  comment: string;
}

/**
 * An observation, such as a vital sign.
 */
export interface Observation {

  /** The code mapped to this observation (i.e. `pulse`, `systolic-bp`, etc.). */
  code: string;

  /** The value of the observation. */
  value: string;
}

/**
 * Represents a medical result.
 */
export interface Result {

  /** The LOINC code mapped to this result. */
  code: string;

  /** */
  date: Date;

  /** */
  status: string;

  /** */
  components: Component[];

  /** A base64-encoded data-uri OR an external URL containing DICOM imaging data for this result, if applicable, otherwise `null`. */
  image: string | null;
}

/**
 * A component of a medical result, such as a specific analyte.
 */
export interface Component {

  /** The name of the sub-component of this result (i.e. `NA`, `TSH`, or `RPT`/`NARR`/`IMP` for imaging report). */
  name: string;

  /** The value of the sub-component. */
  value: string | number;

  /** The inclusive low end of the normal range for this component, or `null` if not applicable. */
  low: number | null;

  /** The inclusive high end of the normal range for this component, or `null` if not applicable. */
  high: number | null;

  /** An optional comment about the component. */
  comment: string | null;
}

/**
 * An order placed by a practitioner.
 */
export interface Order {

  /** */
  created: Date;

  /** */
  creator: Practitioner;

  /** */
  status: string;
}

/**
 * A medical note.
 */
export interface Note {

  /** */
  encounter: Encounter;

  /** */
  author: Practitioner;

  /** A set of cosigners for the note, or `null` if not applicable for co-signing. An empty set indicates this note still requires co-sign before it is approved. Co-signing the note will create an addended version. */
  cosigner: Practitioner[] | null;

  /** The date the note was actually created. */
  created_date: Date;

  /** The service date for which the note contains information (which may be earlier, but never later than the `created_date`). */
  service_date: Date;

  /** */
  type: 'hp' | 'progress' | 'discharge' | 'consult' | 'staff' | string;

  /** */
  status: 'pended' | 'signed' | 'sign-with-visit' | 'addended' | string;

  /** If this note has been `status=addended`, this **MUST** point to the replacing note, otherwise it is `null`. */
  replaced_by: Note | null;

  /** */
  content: string;
}

/**
 * A medication.
 */
export interface Medication {

  /** */
  id: string;

  /** The generic name of the medication. */
  name: string;

  /** The brand name of the medication. */
  brandName: string;

  /** The prescribed dosage. */
  dose: number;

  /** The measurement unit (e.g., mg, mL). */
  unit: string;

  /** How often the medication should be taken. */
  frequency: string;

  /** The date the medication was started. */
  startDate: Date | null;

  /** The date the medication was discontinued, or null if ongoing. */
  endDate: Date | null;

  /** The method of administration (e.g., Oral, IV). */
  route: string;

  /** List of potential reasons for taking this medication as needed. */
  possiblePrnReasons: string[];

  /** List of active reasons for PRN (as needed) use. */
  activePrnReasons: string[];
}

/**
 * Represents a laboratory test.
 */
export interface LabTest {

  /** The date and time of the test. */
  dateTime: Date;

  /** The name of the test performed. */
  test: string;

  /** The current status of the test (e.g., completed, pending). */
  status: string;

  /** Whether the test result is flagged as abnormal. */
  abnormal: boolean;

  /** The expected date for results. */
  expectedDate: Date | null;

  /** The expiration date of the test result. */
  expiration: Date | null;

  /** The provider who ordered the test. */
  encounterProvider: Practitioner;

  /** A list of results from this test. */
  labResults: LabResult[];
}

/**
 * The individual result of a lab test component.
 */
export interface LabResult {

  /** The name of the test component. */
  name: string;

  /** The lower reference range, or `null` if not applicable. */
  low: number | null;

  /** The upper reference range, or `null` if not applicable. */
  high: number | null;

  /** The unit of measurement. */
  units: string | null;

  /** The recorded value. */
  value: string | number;

  /** Additional comments on the result. */
  comment: string | null;
}

/**
 * A patient's family history.
 */
export interface FamilyHistory {

  /** The relationship to the patient (e.g., mother, father). */
  relationship: string;

  /** The name of the family member, if recorded. */
  name: string;

  /** The family member's health status (e.g., alive, deceased). */
  status: string;

  /** The family member’s age. */
  age: number;

  /** A list of `Condition` affecting the family member. */
  problems: Condition[];
}

/**
 * This documents **historical** immunizations only (i.e. those that were not ordered and administered as part of an encounter). TODO: This needs to be merged or aligned in some capacity with `MedicationAdministration`.
 */
export interface ImmunizationHistory {

  /** The name of the immunization. This should match the `Medication` order name for the same immunization. */
  name: string;

  /** The approximate date/time that this immunization was administered to the patient. */
  date: Date;

  /** The practitioner that administered this immunization. */
  given_by: Practitioner | null;

  /** The facility that administered this immunization. */
  facility: string | null;

  /** The infusion rate (if IV GTT) or quantity (if IV push or PO, etc.) and units (i.e. `mg/ml` or `mg`). */
  dose: Quantity;

  /** The site of administration. (See `MedicationAdministration`). */
  site: string | null;

  /** The route of administration. (See `MedicationAdministration`). */
  route: string | null;

  /** The lot number for the immunization. */
  lot: string | null;

  /** The manufacturer for the immunization. */
  manufacturer: string | null;
}

/**
 * A record of a medication being administered.
 */
export interface MedicationAdministration {

  /** The original order that this medication administration entry corresponds to. */
  order: UUID;

  /** The medication that this medication administration entry corresponds to. This should be identical to `order.medication`. */
  medication: string;

  /** The date/time that this medication administration entry occurred. */
  taken: Date;

  /** The practitioner that performed this action. */
  performed_by: Practitioner;

  /** The practitioner that documented this action. */
  documented_by: Practitioner;
  action: 'Given' | 'Missed' | 'Refused' | 'Canceled Entry' | 'Held' | 'New Bag' | 'Restarted' | 'Stopped' | 'Rate Change' | 'MAR Hold' | 'MAR Unhold' | 'Bolus' | 'Push' | 'Rate Verify' | 'See Alternative' | 'Paused' | 'Prepared' | 'Pending' | 'Automatically Held' | 'Due' | string;

  /** The infusion rate (if IV GTT) or quantity (if IV push or PO, etc.) and units (i.e. `mg/ml` or `mg`). */
  dose: Quantity;

  /** See [SNOMED CT route codes](https://build.fhir.org/valueset-route-codes.html) and [method codes](https://build.fhir.org/valueset-administration-method-codes.html). */
  route: string;

  /** The site location that this medication was administered. */
  site: string;

  /** The length of time this administration took, in seconds. */
  duration: number;
}

/**
 * A member of a care team for an encounter.
 */
export interface CareTeamMember {

  /** */
  practitioner: Practitioner;

  /** */
  role: 'pcp' | 'ed' | 'hospitalist' | 'consult' | 'student' | 'nurse' | string;

  /** */
  start: Date;

  /** */
  end: Date;
}

/**
 * Represents the history of an encounter, including allergies and immunizations.
 */
export interface History {

  /** */
  allergies: Allergy[];

  /** TODO: each visit-administered immunization (MAR entry) will ALSO need a corresponding history item. */
  immunizations: ImmunizationHistory[];
}

/**
 * An allergy or intolerance.
 */
export interface Allergy {

  /** */
  substance: string;

  /** */
  reaction: string;

  /** */
  type: 'allergy' | 'intolerance' | 'side-effect' | string;

  /** */
  severity: 'low' | 'high' | 'unknown' | string;

  /** */
  verified: boolean;

  /** */
  resolved: boolean;

  /** */
  recorded: Date;

  /** */
  recorder: Practitioner;

  /** */
  comment: string;
}

/**
 * A patient encounter.
 */
export interface Encounter {

  /** The originating appointment for this encounter, if applicable (i.e. outpatient clinic setting). */
  appointment: Appointment | null;

  /** */
  start: Date;

  /** */
  end: Date;

  /** */
  type: string;

  /** */
  status: Status;

  /** */
  department: string;

  /** The care team. */
  care_team: CareTeamMember[];

  /** This condition list acts as the ED clinical impression differential diagnosis list. */
  concerns: Condition[];

  /** This condition list acts as the outpatient visit diagnoses list. */
  diagnoses: Condition[];

  /** This condition list acts as the inpatient active/resolved problem list. */
  problems: Condition[];

  /** This acts as the equivalent of recorded observations in flowsheets. */
  observations: Observation[];

  /** The history of the encounter. */
  history: History;
}

// #endregion Resource Types
