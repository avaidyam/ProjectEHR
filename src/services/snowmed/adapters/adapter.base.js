

export class BaseAdapter {
    constructor(config) {
        if (this.constructor === BaseAdapter) {
            throw new Error("BaseAdapter cannot be instantiated directly.");
        }
        this.config = config;
    }

    /**
     * Private helper method for HTTP requests with proper error handling
     * @param {string} url - The URL to fetch
     * @returns {Promise<Object>} Parsed JSON response
     */
    async _fetchData(url) {
        console.log(`🔍 Request URL (${this.config.name}):`, url);

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP ${response.status} for ${url}:`, errorText);
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Response received (${this.config.name}):`, {
                url,
                dataSize: JSON.stringify(data).length,
                hasData: !!data
            });

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.error(`Request timeout (30s) for ${url}`);
                throw new Error(`Request timeout after 30 seconds for URL: ${url}`);
            }

            console.error(`Fetch error for ${url}:`, error);
            throw error;
        }
    }

    /**
     * Common concept URL builder that works for most SNOMED servers
     * Can be overridden if server has different URL structure
     */
    buildConceptUrl(conceptId) {
        return `${this.config.baseURL}${this.config.edition}/concepts/${conceptId}`;
    }

    /**
     * Public search method - uses template method pattern
     * @param {string} term - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Normalized search results
     */
    async search(term, options = {}) {
        const url = this.buildSearchUrl(term, options);
        const data = await this._fetchData(url);
        return this.normalizeSearchResponse(data);
    }

    /**
     * Public concept method - uses template method pattern
     * @param {string} conceptId - SNOMED concept ID
     * @returns {Promise<Object>} Normalized concept data
     */
    async getConcept(conceptId) {
        const url = this.buildConceptUrl(conceptId);
        const data = await this._fetchData(url);
        return this.normalizeConceptResponse(data);
    }

    /**
     * Public children method - uses template method pattern
     * @param {string} conceptId - SNOMED concept ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Normalized children data
     */
    async getChildren(conceptId, options = {}) {
        const url = this.buildChildrenUrl(conceptId, options);
        const data = await this._fetchData(url);
        return this.normalizeChildrenResponse(data);
    }

    /**
     * Get server information
     * @returns {Object} Server configuration details
     */
    getServerInfo() {
        return {
            name: this.config.name,
            type: this.config.type,
            baseURL: this.config.baseURL,
            edition: this.config.edition
        };
    }

    /**
     * Build search URL for this server type
     * @param {string} term - Search term
     * @param {Object} options - Search options
     * @returns {string} Complete search URL
     */
    buildSearchUrl(term, options) {
        throw new Error("buildSearchUrl() must be implemented by subclass.");
    }

    /**
     * Build children URL for this server type
     * @param {string} conceptId - SNOMED concept ID
     * @param {Object} options - Query options
     * @returns {string} Complete children URL
     */
    buildChildrenUrl(conceptId, options) {
        throw new Error("buildChildrenUrl() must be implemented by subclass.");
    }

    /**
     * Normalize search response to standard format
     * @param {Object} response - Raw API response
     * @returns {Object} Normalized response
     */
    normalizeSearchResponse(response) {
        throw new Error("normalizeSearchResponse() must be implemented by subclass.");
    }

    /**
     * Normalize concept response to standard format
     * @param {Object} response - Raw API response
     * @returns {Object} Normalized response
     */
    normalizeConceptResponse(response) {
        throw new Error("normalizeConceptResponse() must be implemented by subclass.");
    }

    /**
     * Normalize children response to standard format
     * @param {Object} response - Raw API response
     * @returns {Object} Normalized response
     */
    normalizeChildrenResponse(response) {
        throw new Error("normalizeChildrenResponse() must be implemented by subclass.");
    }
} 