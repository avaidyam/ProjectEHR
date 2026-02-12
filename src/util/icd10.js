import icd10Data from '../util/data/icd10cm.json';

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

// Helper function to check if a code falls within a range
const isCodeInRange = (code, startCode, endCode) => {
  return code >= startCode && code <= endCode;
};

// Helper function to get chapter for a specific code
export const getChapterForCode = (code) => {
  return ICD10_CHAPTERS.find(chapter =>
    isCodeInRange(code, chapter.startCode, chapter.endCode)
  );
};

// Cache for randomized chapter data to prevent re-randomization
const chapterCache = new Map();

// Get a random sample of codes for a specific chapter (15-30 codes)
export const getCodesForChapter = (chapterId) => {
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
export const searchICD10Codes = (searchTerm, limit = 100) => {
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
export const useICD10Concept = (chapterId) => {
  const codes = getCodesForChapter(chapterId);
  return {
    data: codes,
    isLoading: false,
    isSuccess: true,
    error: null
  };
};

export const useICD10Children = (chapterId, options = {}) => {
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

export const useICD10InfiniteSearch = (searchTerm, options = {}) => {
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
