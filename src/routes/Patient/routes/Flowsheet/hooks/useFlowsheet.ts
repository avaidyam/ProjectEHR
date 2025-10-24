import React, { useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FlowsheetState, FlowsheetEntry, DEFAULT_ROWS, TimeColumn } from '../types/flowsheet.types';

const generateId = () => uuidv4();

// Action types
type FlowsheetAction =
  | { type: 'ADD_ENTRY'; payload: Omit<FlowsheetEntry, 'id'> }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; updates: Partial<FlowsheetEntry> } }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'ADD_TIME_COLUMN'; payload: TimeColumn }
  | { type: 'SET_VISIBLE_ROWS'; payload: string[] }
  | { type: 'SET_START_TIME'; payload: string }
  | { type: 'SET_INTERVAL'; payload: FlowsheetState['interval'] }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_SAVE_STATUS'; payload: FlowsheetState['saveStatus'] }
  | { type: 'SET_SELECTED_COLUMN_INDEX'; payload: number }
  | { type: 'SET_ROW_ORDER'; payload: string[] }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'INITIALIZE_ENCOUNTER'; payload: { encounterId: string } };

// Initial state
const createInitialState = (): FlowsheetState => ({
  entries: [],
  visibleRows: DEFAULT_ROWS.map(row => row.id),
  startTime: '07:00',
  interval: '1h',
  selectedDate: '2024-01-15',
  saveStatus: 'saved',
  selectedColumnIndex: 0,
  rowOrder: DEFAULT_ROWS.map(row => row.id),
  timeColumns: [
    {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      displayTime: '2200',
      isCurrentTime: true,
      index: 0,
    }
  ],
});

// Track current encounter ID to avoid unnecessary re-initialization
let currentEncounterId: string | null = null;

// Reducer function
const flowsheetReducer = (state: FlowsheetState, action: FlowsheetAction): FlowsheetState => {
  switch (action.type) {
    case 'ADD_ENTRY':
      console.log('ADD_ENTRY action:', action.payload);
      return {
        ...state,
        entries: [...state.entries, { ...action.payload, id: generateId() }],
        saveStatus: 'saved',
      };

    case 'UPDATE_ENTRY':
      console.log('UPDATE_ENTRY action:', action.payload);
      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        ),
        saveStatus: 'saved',
      };

    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.payload.id),
        saveStatus: 'saved',
      };

    case 'ADD_TIME_COLUMN':
      return {
        ...state,
        timeColumns: [...state.timeColumns, action.payload],
        saveStatus: 'saved',
      };

    case 'SET_VISIBLE_ROWS':
      return {
        ...state,
        visibleRows: action.payload,
      };

    case 'SET_START_TIME':
      return {
        ...state,
        startTime: action.payload,
      };

    case 'SET_INTERVAL':
      return {
        ...state,
        interval: action.payload,
      };

    case 'SET_SELECTED_DATE':
      return {
        ...state,
        selectedDate: action.payload,
      };

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.payload,
      };

    case 'SET_SELECTED_COLUMN_INDEX':
      return {
        ...state,
        selectedColumnIndex: action.payload,
      };

    case 'SET_ROW_ORDER':
      return {
        ...state,
        rowOrder: action.payload,
      };

    case 'RESET_TO_DEFAULTS':
      return createInitialState();

    case 'INITIALIZE_ENCOUNTER':
      // Only initialize if this is a different encounter
      console.log('INITIALIZE_ENCOUNTER: currentEncounterId:', currentEncounterId, 'newEncounterId:', action.payload.encounterId, 'entries.length:', state.entries.length);
      if (currentEncounterId !== action.payload.encounterId) {
        currentEncounterId = action.payload.encounterId;
        console.log('INITIALIZE_ENCOUNTER: Resetting state for new encounter');
        return createInitialState();
      }
      // Same encounter, keep existing data
      console.log('INITIALIZE_ENCOUNTER: Keeping existing data for same encounter');
      return state;

    default:
      return state;
  }
};

// Custom hook
export const useFlowsheet = (encounterId: string | number | symbol) => {
  const [state, dispatch] = useReducer(flowsheetReducer, createInitialState());

  // Initialize encounter when encounterId changes
  React.useEffect(() => {
    const safeEncounterId = String(encounterId);
    console.log('useFlowsheet: encounterId changed to:', safeEncounterId, 'currentEncounterId:', currentEncounterId);
    dispatch({ type: 'INITIALIZE_ENCOUNTER', payload: { encounterId: safeEncounterId } });
  }, [encounterId]);

  // Action creators
  const addEntry = useCallback((entry: Omit<FlowsheetEntry, 'id'>) => {
    dispatch({ type: 'ADD_ENTRY', payload: entry });
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<FlowsheetEntry>) => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id, updates } });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: { id } });
  }, []);

  const addTimeColumn = useCallback((column: TimeColumn) => {
    dispatch({ type: 'ADD_TIME_COLUMN', payload: column });
  }, []);

  const setVisibleRows = useCallback((rows: string[]) => {
    dispatch({ type: 'SET_VISIBLE_ROWS', payload: rows });
  }, []);

  const setStartTime = useCallback((time: string) => {
    dispatch({ type: 'SET_START_TIME', payload: time });
  }, []);

  const setInterval = useCallback((interval: FlowsheetState['interval']) => {
    dispatch({ type: 'SET_INTERVAL', payload: interval });
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  }, []);

  const setSaveStatus = useCallback((status: FlowsheetState['saveStatus']) => {
    dispatch({ type: 'SET_SAVE_STATUS', payload: status });
  }, []);

  const setSelectedColumnIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SELECTED_COLUMN_INDEX', payload: index });
  }, []);

  const setRowOrder = useCallback((order: string[]) => {
    dispatch({ type: 'SET_ROW_ORDER', payload: order });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  return {
    // State
    ...state,
    // Actions
    addEntry,
    updateEntry,
    deleteEntry,
    addTimeColumn,
    setVisibleRows,
    setStartTime,
    setInterval,
    setSelectedDate,
    setSaveStatus,
    setSelectedColumnIndex,
    setRowOrder,
    resetToDefaults,
  };
};
