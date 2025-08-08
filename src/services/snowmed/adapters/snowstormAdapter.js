import { BaseAdapter } from './adapter.base.js';

export class SnowstormAdapter extends BaseAdapter {
    constructor(config) {
        super(config); // Call the parent constructor
    }

    /**
     * Build search URL for Snowstorm API
     * Uses Snowstorm-specific parameters and endpoint structure
     */
    buildSearchUrl(term, options = {}) {
        // Merge with server defaults
        const defaults = this.config.defaults || {};
        const {
            limit = defaults.limit || 100,
            offset = defaults.offset || 0,
            active = defaults.active || 'true',
            conceptActive = defaults.conceptActive || 'true',
            lang = defaults.lang || 'english',
            semanticTags = defaults.semanticTags || 'disorder',
            groupByConcept = defaults.groupByConcept || 'true',
            ...customParams
        } = options;

        const params = new URLSearchParams({
            term: term,
            limit: limit.toString(),
            offset: offset.toString(),
            active,
            conceptActive,
            lang,
            semanticTags,
            groupByConcept,
            ...customParams,
        });

        return `${this.config.baseURL}/${this.config.edition}/descriptions?${params}`;
    }

    // Note: buildConceptUrl inherited from BaseAdapter works for Snowstorm

    /**
     * Build children URL for Snowstorm API
     * Uses Snowstorm-specific children endpoint parameters
     */
    buildChildrenUrl(conceptId, options = {}) {
        // Merge with server defaults
        const defaults = this.config.defaults || {};
        const {
            limit = defaults.limit || 50,
            offset = defaults.offset || 0,
            form = defaults.form || 'inferred',
            semanticTags = defaults.semanticTags || 'disorder',
            active = defaults.active || 'true'
        } = options;

        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            form: form,
            semanticTags: semanticTags,
            active: active,
        });

        return `${this.config.baseURL}/${this.config.edition}/concepts/${conceptId}/children?${params}`;
    }

    /**
     * Normalize search response to standard format
     */
    normalizeSearchResponse(response) {
        // Snowstorm format is already our standard, so minimal transformation
        return {
            items: (response.items || []).map(item => ({
                concept: {
                    conceptId: item.concept?.conceptId,
                    fsn: { term: item.concept?.fsn?.term },
                    pt: { term: item.concept?.pt?.term }
                },
                term: item.term,
                conceptId: item.concept?.conceptId
            })),
            total: response.total || response.totalElements || 0,
            totalElements: response.total || response.totalElements || 0
        };
    }

    /**
     * Normalize concept response to standard format
     */
    normalizeConceptResponse(response) {
        return {
            conceptId: response.conceptId,
            fsn: { term: response.fsn?.term },
            pt: { term: response.pt?.term },
            active: response.active,
            definitionStatus: response.definitionStatus
        };
    }

    /**
     * Normalize children response to standard format
     */
    normalizeChildrenResponse(response) {
        return {
            items: (response.items || []).map(item => ({
                conceptId: item.conceptId,
                fsn: { term: item.fsn?.term },
                pt: { term: item.pt?.term },
                active: item.active,
                // Preserve all original properties for backward compatibility
                descendantCount: item.descendantCount,
                isLeafInferred: item.isLeafInferred,
                isLeafStated: item.isLeafStated,
                module: item.module,
                definitionStatus: item.definitionStatus
            })),
            total: response.total || response.items?.length || 0
        };
    }
} 