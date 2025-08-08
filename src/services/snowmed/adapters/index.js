import { SnowstormAdapter } from './snowstormAdapter.js';
import { NhsUkAdapter } from './nhsUkAdapter.js';

/**
 * Factory class to create appropriate adapter based on server type
 */
export class AdapterFactory {
    static createAdapter(serverConfig) {
        switch (serverConfig.type) {
            case 'snowstorm':
                return new SnowstormAdapter(serverConfig);
            case 'nhs-uk':
                return new NhsUkAdapter(serverConfig);
            default:
                throw new Error(`Unknown server type: ${serverConfig.type}`);
        }
    }
}

/**
 * Unified API adapter that handles different server types transparently
 * Uses pure delegation pattern - all logic is handled by the specific adapters
 */
export class UnifiedSnomedAdapter {
    constructor(serverConfig) {
        this.adapter = AdapterFactory.createAdapter(serverConfig);
    }

    /**
     * Perform search - delegates entirely to the specific adapter
     */
    async search(term, options = {}) {
        return this.adapter.search(term, options);
    }

    /**
     * Get concept - delegates entirely to the specific adapter
     */
    async getConcept(conceptId) {
        return this.adapter.getConcept(conceptId);
    }

    /**
     * Get children - delegates entirely to the specific adapter
     */
    async getChildren(conceptId, options = {}) {
        return this.adapter.getChildren(conceptId, options);
    }

    /**
     * Get server information - delegates to the specific adapter
     */
    getServerInfo() {
        return this.adapter.getServerInfo();
    }
}

// Export adapters for direct use if needed
export { BaseAdapter } from './adapter.base.js';
export { SnowstormAdapter } from './snowstormAdapter.js';
export { NhsUkAdapter } from './nhsUkAdapter.js'; 