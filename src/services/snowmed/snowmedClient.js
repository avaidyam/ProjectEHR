import { UnifiedSnomedAdapter } from './adapters/index.js';

const SNOWMED_SERVERS = {
    primary: {
        name: 'IHTSDO Snowstorm',
        baseURL: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN',
        edition: '/SNOMEDCT-US/2025-03-01',
        type: 'snowstorm',
        defaults: {
            semanticTags: 'disorder',
            lang: 'english',
            active: 'true',
            conceptActive: 'true',
            groupByConcept: 'true',
            form: 'inferred'
        }
    },
    backup: {
        name: 'NHS UK SNOMED Browser',
        baseURL: 'https://termbrowser.nhs.uk/sct-browser-api/snomed',
        edition: '/uk-edition/v20250604',
        type: 'nhs-uk',
        defaults: {
            searchMode: 'partialMatching',
            lang: 'english',
            active: 'true',
            form: 'inferred'
        }
    }
};

class SnowmedClient {
    constructor(servers = SNOWMED_SERVERS) {
        this.servers = servers;
        this.currentServer = 'backup'; // Default to primary
    }

    /**
     * Manually set which server to use
     * @param {string} serverKey - 'primary' or 'backup'
     */
    setServer(serverKey) {
        if (!this.servers[serverKey]) {
            throw new Error(`Unknown server: ${serverKey}. Available servers: ${Object.keys(this.servers).join(', ')}`);
        }
        this.currentServer = serverKey;
        console.log(`Manually switched to ${this.servers[serverKey].name}`);
    }

    /**
     * Make a request using the currently selected server
     * @param {Function} requestFn - Function that makes the API request with adapter
     * @param {string} operation - Description of the operation for logging
     * @returns {Promise<Object>} API response
     */
    async makeRequest(requestFn, operation) {
        const serverConfig = this.servers[this.currentServer];

        try {
            console.log(`Attempting ${operation} on ${serverConfig.name}...`);

            // Create adapter for current server
            const adapter = new UnifiedSnomedAdapter(serverConfig);
            const result = await requestFn(adapter);

            console.log(`${operation} successful on ${serverConfig.name}`);
            return result;
        } catch (error) {
            console.error(`${operation} failed on ${serverConfig.name}:`, error.message);
            throw error;
        }
    }

    /**
     * Get concept details by concept ID
     * @param {string} conceptId - The SNOWMED concept ID
     * @returns {Promise<Object>} Concept details
     */
    async getConcept(conceptId) {
        return this.makeRequest(async (adapter) => {
            return await adapter.getConcept(conceptId);
        }, `concept lookup for ${conceptId}`);
    }

    /**
     * Get children of a concept by concept ID
     * @param {string} conceptId - The SNOWMED concept ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Children concepts
     */
    async getChildren(conceptId, options = {}) {
        return this.makeRequest(async (adapter) => {
            return await adapter.getChildren(conceptId, options);
        }, `children lookup for concept ${conceptId}`);
    }

    /**
     * Search concepts by term using descriptions endpoint
     * @param {string} term - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    async searchConcepts(term, options = {}) {
        return this.makeRequest(async (adapter) => {
            return await adapter.search(term, options);
        }, `search for term "${term}"`);
    }

    /**
     * Get current server information
     */
    getCurrentServerInfo() {
        return {
            currentServer: this.currentServer,
            serverName: this.servers[this.currentServer]?.name || 'Unknown',
            availableServers: Object.keys(this.servers)
        };
    }
}

// Create and export a singleton instance
export const snowmedClient = new SnowmedClient();

// Export the class for testing or custom instances
export default SnowmedClient; 