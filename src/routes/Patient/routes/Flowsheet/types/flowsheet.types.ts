export interface FlowsheetEntry {
  id: string;
  columnId: string; // Changed from timestamp to columnId
  rowId: string; // e.g., "BP", "Pulse"
  value: string | number;
  unit?: string;
  status: "draft" | "final" | "saved";
}

export interface FlowsheetRow {
  id?: string; // Legacy support
  name: string;
  label: string;
  type: string;
  options?: string[];
  unit?: string;
  group?: string; // Legacy support
  order?: number; // Legacy support
}

export interface FlowsheetGroup {
  id: string;
  name: string;
  rows: FlowsheetRow[];
}

export interface TimeColumn {
  id: string; // Unique ID for the column
  timestamp: string; // ISO 8601 - for display purposes
  displayTime: string; // Military time format
  isCurrentTime: boolean;
  index: number;
}

export interface FlowsheetState {
  entries: FlowsheetEntry[];
  visibleRows: string[];
  startTime: string; // HH:mm format
  interval: '15m' | '30m' | '1h' | '4h';
  selectedDate: string; // YYYY-MM-DD format
  saveStatus: 'saved' | 'saving' | 'error';
  selectedColumnIndex: number;
  rowOrder: string[];
  timeColumns: TimeColumn[]; // Changed from string[] to TimeColumn[]
}

export interface FlowsheetActions {
  addEntry: (entry: Omit<FlowsheetEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<FlowsheetEntry>) => void;
  deleteEntry: (id: string) => void;
  addTimeColumn: (column: TimeColumn) => void;
  setVisibleRows: (rows: string[]) => void;
  setStartTime: (time: string) => void;
  setInterval: (interval: FlowsheetState['interval']) => void;
  setSelectedDate: (date: string) => void;
  setSaveStatus: (status: FlowsheetState['saveStatus']) => void;
  setSelectedColumnIndex: (index: number) => void;
  setRowOrder: (order: string[]) => void;
  resetToDefaults: () => void;
}

export type FlowsheetStore = FlowsheetState & FlowsheetActions;

// Default vital signs rows
export const DEFAULT_ROWS: FlowsheetRow[] = [
  { name: 'BP', label: 'BP', unit: 'mmHg', type: 'string', group: 'Enc Vitals', order: 1 },
  { name: 'Pulse', label: 'Pulse', unit: 'bpm', type: 'number', group: 'Enc Vitals', order: 2 },
  { name: 'Resp', label: 'Resp', unit: '/min', type: 'number', group: 'Enc Vitals', order: 3 },
  { name: 'Temp', label: 'Temp', unit: '°F', type: 'number', group: 'Enc Vitals', order: 4 },
  { name: 'Temp_src', label: 'Temp src', type: 'string', group: 'Enc Vitals', order: 5 },
  { name: 'SpO2', label: 'SpO2', unit: '%', type: 'number', group: 'Enc Vitals', order: 6 },
  { name: 'Weight', label: 'Weight', unit: 'lbs', type: 'number', group: 'Enc Vitals', order: 7 },
  { name: 'Height', label: 'Height', unit: 'in', type: 'number', group: 'Enc Vitals', order: 8 },
  { name: 'Head_Circumference', label: 'Head Circumference', unit: 'cm', type: 'number', group: 'Enc Vitals', order: 9 },
  { name: 'Pain_Score', label: 'Pain Score', type: 'number', group: 'Enc Vitals', order: 10 },
  { name: 'Pain_Loc', label: 'Pain Loc', type: 'string', group: 'Enc Vitals', order: 11 },
  { name: 'Pain_Education', label: 'Pain Education', type: 'string', group: 'Enc Vitals', order: 12 },
];

export const INTERVAL_OPTIONS = [
  { value: '15m' as const, label: '15 min' },
  { value: '30m' as const, label: '30 min' },
  { value: '1h' as const, label: '1 hour' },
  { value: '4h' as const, label: '4 hours' },
];

export const MODE_OPTIONS = [
  { value: 'View All', label: 'View All' },
  { value: 'Filed Only', label: 'Filed Only' },
  { value: 'Abnormals', label: 'Abnormals' },
];
