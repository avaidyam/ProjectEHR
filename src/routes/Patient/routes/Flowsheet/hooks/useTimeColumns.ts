import { useMemo } from 'react';
import { TimeColumn } from '../types/flowsheet.types';

export const useTimeColumns = (timeColumns: TimeColumn[]): TimeColumn[] => {
  return useMemo(() => {
    // Return the time columns passed as parameter
    return timeColumns;
  }, [timeColumns]);
};

export const useCurrentTimeColumn = (timeColumns: TimeColumn[]): number => {
  const currentColumn = timeColumns.find(col => col.isCurrentTime);
  return currentColumn?.index ?? 0;
};

export const formatTimeForDisplay = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
};
