export interface FlowsheetEntry {
  id: string;
  columnId: string; // Changed from timestamp to columnId
  rowId: string; // e.g., "BP", "Pulse"
  value: string | number;
  unit?: string;
  status: "draft" | "final";
}

export interface FlowsheetRow {
  id: string;
  label: string;
  unit?: string;
  group: string;
  order: number;
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
  { id: 'BP', label: 'BP', unit: 'mmHg', group: 'Enc Vitals', order: 1 },
  { id: 'Pulse', label: 'Pulse', unit: 'bpm', group: 'Enc Vitals', order: 2 },
  { id: 'Resp', label: 'Resp', unit: '/min', group: 'Enc Vitals', order: 3 },
  { id: 'Temp', label: 'Temp', unit: '°F', group: 'Enc Vitals', order: 4 },
  { id: 'Temp_src', label: 'Temp src', group: 'Enc Vitals', order: 5 },
  { id: 'SpO2', label: 'SpO2', unit: '%', group: 'Enc Vitals', order: 6 },
  { id: 'Weight', label: 'Weight', unit: 'lbs', group: 'Enc Vitals', order: 7 },
  { id: 'Height', label: 'Height', unit: 'in', group: 'Enc Vitals', order: 8 },
  { id: 'Head_Circumference', label: 'Head Circumference', unit: 'cm', group: 'Enc Vitals', order: 9 },
  { id: 'Pain_Score', label: 'Pain Score', group: 'Enc Vitals', order: 10 },
  { id: 'Pain_Loc', label: 'Pain Loc', group: 'Enc Vitals', order: 11 },
  { id: 'Pain_Education', label: 'Pain Education', group: 'Enc Vitals', order: 12 },
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
