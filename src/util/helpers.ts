import 'temporal-polyfill/global';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { Database } from 'components/contexts/PatientContext';
import icd10Data from '../util/data/icd10cm.json';

// Activate Temporal polyfill
if (typeof Temporal === "undefined") {
  await import("temporal-polyfill/global");
}

// ICD-10 Chapter structure based on standard classification
export const ICD10_CHAPTERS = [
  {
    id: 'infectious',
    name: 'Certain infectious and parasitic diseases',
    codeRange: 'A00-B99',
    startCode: 'A00',
    endCode: 'B99'
  },
  {
    id: 'neoplasms',
    name: 'Neoplasms',
    codeRange: 'C00-D48',
    startCode: 'C00',
    endCode: 'D48'
  },
  {
    id: 'blood',
    name: 'Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism',
    codeRange: 'D50-D89',
    startCode: 'D50',
    endCode: 'D89'
  },
  {
    id: 'endocrine',
    name: 'Endocrine, nutritional and metabolic diseases',
    codeRange: 'E00-E90',
    startCode: 'E00',
    endCode: 'E90'
  },
  {
    id: 'mental',
    name: 'Mental and behavioral disorders',
    codeRange: 'F00-F99',
    startCode: 'F00',
    endCode: 'F99'
  },
  {
    id: 'nervous',
    name: 'Diseases of the nervous system',
    codeRange: 'G00-G99',
    startCode: 'G00',
    endCode: 'G99'
  },
  {
    id: 'eye',
    name: 'Diseases of the eye and adnexa',
    codeRange: 'H00-H59',
    startCode: 'H00',
    endCode: 'H59'
  },
  {
    id: 'ear',
    name: 'Diseases of the ear and mastoid process',
    codeRange: 'H60-H95',
    startCode: 'H60',
    endCode: 'H95'
  },
  {
    id: 'circulatory',
    name: 'Diseases of the circulatory system',
    codeRange: 'I00-I99',
    startCode: 'I00',
    endCode: 'I99'
  },
  {
    id: 'respiratory',
    name: 'Diseases of the respiratory system',
    codeRange: 'J00-J99',
    startCode: 'J00',
    endCode: 'J99'
  },
  {
    id: 'digestive',
    name: 'Diseases of the digestive system',
    codeRange: 'K00-K93',
    startCode: 'K00',
    endCode: 'K93'
  },
  {
    id: 'skin',
    name: 'Diseases of the skin and subcutaneous tissue',
    codeRange: 'L00-L99',
    startCode: 'L00',
    endCode: 'L99'
  },
  {
    id: 'musculoskeletal',
    name: 'Diseases of the musculoskeletal system and connective tissue',
    codeRange: 'M00-M99',
    startCode: 'M00',
    endCode: 'M99'
  },
  {
    id: 'genitourinary',
    name: 'Diseases of the genitourinary system',
    codeRange: 'N00-N99',
    startCode: 'N00',
    endCode: 'N99'
  },
  {
    id: 'pregnancy',
    name: 'Pregnancy, childbirth and the puerperium',
    codeRange: 'O00-O99',
    startCode: 'O00',
    endCode: 'O99'
  },
  {
    id: 'perinatal',
    name: 'Certain conditions originating in the perinatal period',
    codeRange: 'P00-P96',
    startCode: 'P00',
    endCode: 'P96'
  },
  {
    id: 'congenital',
    name: 'Congenital malformations, deformations, and chromosomal abnormalities',
    codeRange: 'Q00-Q99',
    startCode: 'Q00',
    endCode: 'Q99'
  },
  {
    id: 'symptoms',
    name: 'Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified',
    codeRange: 'R00-R99',
    startCode: 'R00',
    endCode: 'R99'
  }
];

/**
 * hook to set new root routes within app, ie /#/schedule or /#/notes, etc
 * usage: `const onSetNewRouter = useRouter({onAfterRoute: thisFunctionExecutesAfterRouting });`
 * *must* be used from within a functional component
 */
export const useRouter = ({ onAfterRoute = null, preserveQueryParams = true } = {}) => {
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  return (route: any) => {
    const update = { pathname: `/${route}` } as any;
    if (preserveQueryParams) {
      update.search = searchParams.toString();
    }
    navigator(update);
    if (onAfterRoute) {
      (onAfterRoute as any)();
    }
  };
};

/**
 * Filters the documents based on whether their conditional orders are fully
 * satisfied by the available orders, accounting for multiplicity.
 * @param {Array} documents The list of documents to filter. A document must have a top-level id string.
 * @param {Object} conditionals Map of document IDs to required order name arrays.
 * @param {Array} orders The list of available orders.
 * @returns {Array} The filtered list of documents.
 */
export const filterDocuments = (documents: any[], conditionals: any[], orders: any[]) => {

  // 1. Pre-process available orders into a frequency map (Count of available items)
  // This is necessary to verify required multiplicity (e.g., needing 2 'xyz')
  const availableCounts = (orders ?? []).reduce((acc, order) => {
    acc[order.code] = (acc[order.code] || 0) + 1;
    return acc;
  }, {});

  // 2. Use the Array.filter method to check each document's validity
  return (documents ?? []).filter(doc => {
    if (!doc) return false;
    const requiredOrders = conditionals?.[doc.id];

    // If the document ID has no entry in the conditionals, it passes the filter by default.
    if (!requiredOrders) {
      return true;
    }

    // 3. For the current document, calculate the frequency map of *required* orders
    const requiredCounts = requiredOrders.reduce((acc: any, name: any) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    // 4. Check if *all* required counts are met by the available counts
    // Object.keys gets the names of required orders, and .every checks them all.
    return Object.keys(requiredCounts).every(orderName => {
      const required = requiredCounts[orderName];
      const available = availableCounts[orderName] || 0; // Default to 0 if the order is not available

      // The condition is met only if the available count is greater than or equal to the required count
      return available >= required;
    });
  });
};

/**
 * HIGHLY INSECURE! DO NOT USE! 
 *  
 * Usage:
 * const encrypted = XORcrypt(data, password);
 * const decrypted = XORcrypt(encrypted, password);
 */
export const XORcrypt = (text: string, key: string) =>
  [...text].map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) { // eslint-disable-line no-extend-native, func-names
  return Math.min(Math.max(this as number, min), max)
}



/**
 * Update an element of the array if it exists, matching by `key`, or, if it 
 * does not exist, add it to the array, then return the array itself.
 */
Array.prototype.upsert = function <T>(element: T, key: string) {
  const result: Array<T> = [...this];
  const _upsert = (obj: T) => {
    const index = result.findIndex(item => (item as any)[key] === (obj as any)[key]);
    if (index > -1) {
      result[index] = obj;
    } else {
      result.push(obj);
    }
  };
  if (Array.isArray(element)) {
    element.forEach(e => _upsert(e));
  } else {
    _upsert(element);
  }
  return result;
};

declare global {
  interface Array<T> {
    upsert(element: T, key: string): Array<T>;
  }
}

/**
 * Generates a mapping of component names to their values across both
 * the current encounter and the entire chart.
 * 
 * @param {Array} encounterLabs - Labs from the current encounter
 * @returns {Object} - Map of component name to { encounter: [], chart: [] }
 */
export function getComponentHistory(encounterLabs: Database.Lab[]) {
  const componentMap: any = {};

  // Helper to add a component value to the map
  const addComponent = (componentName: string, value: string | number, date: string | number | Date, source: string) => {
    if (!componentMap[componentName]) {
      componentMap[componentName] = { encounter: [], chart: [] };
    }
    componentMap[componentName][source].push({
      value,
      date,
      timestamp: Temporal.Instant.from(date as string).epochMilliseconds,
    });
  };

  // Process encounter labs
  (encounterLabs || []).forEach(lab => {
    const labDate = lab.date;
    (lab.components || []).forEach(component => {
      addComponent(component.name, component.value, labDate, 'encounter');
    });
  });

  // Sort each component's values by date descending (newest first)
  Object.keys(componentMap).forEach(componentName => {
    componentMap[componentName].encounter.sort((a: { timestamp: number; }, b: { timestamp: number; }) => b.timestamp - a.timestamp);
    componentMap[componentName].chart.sort((a: { timestamp: number; }, b: { timestamp: number; }) => b.timestamp - a.timestamp);
  });

  return componentMap;
}

/**
 * Generates a mapping of flowsheet row names to their values across both
 * the current encounter and the entire chart.
 * 
 * @param {Array} encounterFlowsheets - Flowsheets from the current encounter
 * @param {Array} flowsheetDefs - Flowsheet definitions for row label lookup
 * @returns {Object} - Map of row name to { encounter: [], chart: [] }
 */
export function getFlowsheetHistory(encounterFlowsheets: any, flowsheetDefs: any) {
  const flowsheetMap: any = {};

  // Helper to get row label from definitions
  const getRowLabel = (flowsheetId: any, rowName: string) => {
    const groupDef = (flowsheetDefs || []).find((g: { id: any; }) => g.id === flowsheetId);
    if (groupDef && groupDef.rows) {
      const rowDef = groupDef.rows.find((r: { name: any; }) => r.name === rowName);
      if (rowDef) return rowDef.label;
    }
    return rowName;
  };

  // Helper to add a flowsheet value to the map
  const addFlowsheetValue = (rowLabel: string | number, value: any, date: string | number | Date, source: string) => {
    if (!flowsheetMap[rowLabel]) {
      flowsheetMap[rowLabel] = { encounter: [], chart: [] };
    }
    flowsheetMap[rowLabel][source].push({
      value,
      date,
      timestamp: Temporal.Instant.from(date as string).epochMilliseconds,
    });
  };

  // Process encounter flowsheets
  (encounterFlowsheets || []).forEach((item: { [x: string]: any; date?: any; flowsheet?: any; }) => {
    const itemDate = item.date;
    Object.keys(item).forEach(key => {
      if (['id', 'date', 'flowsheet'].includes(key)) return;
      const rowLabel = getRowLabel(item.flowsheet, key);
      addFlowsheetValue(rowLabel, item[key], itemDate, 'encounter');
    });
  });

  // Sort each row's values by date descending (newest first)
  Object.keys(flowsheetMap).forEach(rowName => {
    flowsheetMap[rowName].encounter.sort((a: { timestamp: number; }, b: { timestamp: number; }) => b.timestamp - a.timestamp);
    flowsheetMap[rowName].chart.sort((a: { timestamp: number; }, b: { timestamp: number; }) => b.timestamp - a.timestamp);
  });

  return flowsheetMap;
}

// Helper function to check if a code falls within a range
const isCodeInRange = (code: string | number, startCode: string | number, endCode: string | number) => {
  return code >= startCode && code <= endCode;
};

// Helper function to get chapter for a specific code
export const getChapterForCode = (code: string) => {
  return ICD10_CHAPTERS.find(chapter =>
    isCodeInRange(code, chapter.startCode, chapter.endCode)
  );
};

// Cache for randomized chapter data to prevent re-randomization
const chapterCache = new Map();

// Get a random sample of codes for a specific chapter (15-30 codes)
export const getCodesForChapter = (chapterId: string) => {
  // Return cached data if available
  if (chapterCache.has(chapterId)) {
    return chapterCache.get(chapterId);
  }

  const chapter = ICD10_CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) {
    return [];
  }

  // Get all codes for this chapter
  const allCodes = Object.entries(icd10Data)
    .filter(([code]) => isCodeInRange(code, chapter.startCode, chapter.endCode))
    .map(([code, name]) => ({
      conceptId: code,
      name: name,
      term: name,
      source: 'ICD10'
    }));

  // Randomly select 15-30 codes (more efficient random selection)
  const minCount = 15;
  const maxCount = 30;
  const targetCount = Math.min(
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount,
    allCodes.length
  );

  // Use Fisher-Yates shuffle for better performance
  const shuffled = [...allCodes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const result = shuffled.slice(0, targetCount);

  // Cache the result
  chapterCache.set(chapterId, result);

  return result;
};

// Function to clear cache if needed (for development/testing)
export const clearChapterCache = () => {
  chapterCache.clear();
};

// Get all categories with their codes
export const getAllCategories = () => {
  return ICD10_CHAPTERS.map(chapter => ({
    categoryName: chapter.name,
    conceptId: chapter.id,
    codeRange: chapter.codeRange,
    source: 'ICD10'
  }));
};

// Search across all ICD10 codes
export const searchICD10Codes = (searchTerm: string, limit = 100) => {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();
  const results = [];

  // More efficient search - check code first, then name
  for (const [code, name] of Object.entries(icd10Data)) {
    if (results.length >= limit) break;

    // Check code first (faster)
    if (code.toLowerCase().includes(term)) {
      results.push({
        conceptId: code,
        name: name,
        term: name,
        source: 'ICD10'
      });
      continue;
    }

    // Then check name
    if (name.toLowerCase().includes(term)) {
      results.push({
        conceptId: code,
        name: name,
        term: name,
        source: 'ICD10'
      });
    }
  }

  return results.sort((a, b) => a.conceptId.localeCompare(b.conceptId));
};

// Custom hooks to maintain compatibility with existing components
export const useICD10Concept = (chapterId: string) => {
  const codes = getCodesForChapter(chapterId);
  return {
    data: codes,
    isLoading: false,
    isSuccess: true,
    error: null
  };
};

export const useICD10Children = (chapterId: string, options: { limit?: number } = {}) => {
  const codes = getCodesForChapter(chapterId);
  const { limit = 100 } = options;

  return {
    data: codes,
    isLoading: false,
    isSuccess: true,
    error: null,
    totalElements: codes.length
  };
};

export const useICD10InfiniteSearch = (searchTerm: string, options: { limit?: number } = {}) => {
  const { limit = 100 } = options;
  const results = searchICD10Codes(searchTerm, limit);

  return {
    data: {
      pages: [{
        items: results,
        totalElements: results.length
      }]
    },
    isLoading: false,
    isSuccess: true,
    error: null,
    hasNextPage: false,
    fetchNextPage: () => { },
    isFetchingNextPage: false
  };
};

/**
 * Groups an array of objects by a key or function.
 * 
 * @param array The array to group
 * @param key The key to group by, or a function that returns the group key
 * @returns A record where keys are the group names and values are arrays of items in that group
 */
export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  const getKey = typeof key === 'function' ? key : (item: any) => item[key];
  return array.reduce((result, currentItem) => {
    const groupKey = String(getKey(currentItem));
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentItem);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Creates a debounced function that delays invoking the func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
