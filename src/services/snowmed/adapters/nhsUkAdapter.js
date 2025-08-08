import { BaseAdapter } from './adapter.base.js';

export class NhsUkAdapter extends BaseAdapter {
    constructor(config) {
        super(config); // Call the parent constructor
    }

    /**
     * Build search URL for NHS UK API
     * NHS format: /descriptions?query=[TERM]&limit=50&searchMode=partialMatching&lang=english&statusFilter=activeOnly&skipTo=0&returnLimit=100
     */
    buildSearchUrl(term, options = {}) {
        // Merge with server defaults
        const defaults = this.config.defaults || {};
        const {
            limit = defaults.limit || 100,
            offset = defaults.offset || 0,
            active = defaults.active || 'true',
            lang = defaults.lang || 'english',
            semanticFilter = defaults.semanticFilter || 'disorder',
            searchMode = defaults.searchMode || 'partialMatching',
            ...customParams
        } = options;

        const params = new URLSearchParams({
            query: term, // NHS uses 'query' instead of 'term'
            limit: limit.toString(),
            searchMode: searchMode,
            lang: lang,
            statusFilter: active === 'true' ? 'activeOnly' : 'all',
            skipTo: offset.toString(),
            returnLimit: limit.toString(),
            semanticFilter: semanticFilter, // Filter to only show disorders
            normalize: 'true', // Normalize the results
            groupByConcept: 'true', // Group multiple descriptions by concept
            ...customParams,
        });

        return `${this.config.baseURL}${this.config.edition}/descriptions?${params}`;
    }

    // Note: buildConceptUrl inherited from BaseAdapter works for NHS UK

    /**
     * Build children URL for NHS UK API
     * NHS UK uses simpler children endpoint with fewer parameters
     */
    buildChildrenUrl(conceptId, options = {}) {
        // Merge with server defaults
        const defaults = this.config.defaults || {};
        const { form = defaults.form || 'inferred' } = options;

        const params = new URLSearchParams({
            form: form,
        });

        return `${this.config.baseURL}${this.config.edition}/concepts/${conceptId}/children?${params}`;
    }

    /**
     * Normalize NHS UK search response to standard format
     * NHS format: { matches: [...], details: { total, skipTo, returnLimit }, filters: {...} }
     */
    normalizeSearchResponse(response) {
        const matches = response.matches || [];

        return {
            items: matches.map(item => ({
                concept: {
                    conceptId: item.conceptId,
                    fsn: { term: item.fsn },
                    pt: { term: item.term } // NHS UK uses 'term' for the preferred term
                },
                term: item.term,
                conceptId: item.conceptId
            })),
            total: response.details?.total || matches.length,
            totalElements: response.details?.total || matches.length
        };
    }

    /**
     * Normalize NHS UK concept response to standard format
     * NHS format: { conceptId, defaultTerm, fsn, active, definitionStatus, descriptions, relationships, ... }
     */
    normalizeConceptResponse(response) {
        return {
            conceptId: response.conceptId,
            fsn: { term: response.fsn },
            pt: { term: response.defaultTerm }, // NHS UK uses 'defaultTerm' for preferred term
            active: response.active,
            definitionStatus: response.definitionStatus
        };
    }

    /**
 * Normalize NHS UK children response to standard format
 * NHS format: Array of children objects with { conceptId, defaultTerm, active, definitionStatus, ... }
 */
    normalizeChildrenResponse(response) {
        // NHS UK returns array directly, not wrapped in { items: [...] }
        const children = Array.isArray(response) ? response : [];

        return {
            items: children.map(item => ({
                conceptId: item.conceptId,
                fsn: { term: item.fsn || item.defaultTerm }, // Fallback to defaultTerm if fsn not available
                pt: { term: item.defaultTerm },
                active: item.active,
                // Preserve all original properties for backward compatibility
                descendantCount: item.descendantCount || item.statedDescendants,
                isLeafInferred: item.isLeafInferred,
                isLeafStated: item.isLeafStated,
                module: item.module,
                definitionStatus: item.definitionStatus
            })),
            total: children.length
        };
    }
} 