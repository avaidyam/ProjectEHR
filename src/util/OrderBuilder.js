import { getRxTerms } from './getRxTerms.js';

export class OrderBuilder {
  constructor() {
    // Initialize any properties or dependencies here
  }

  async buildOrder(searchTerm) {
    try {
      // Fetch data from APIs, format and aggregate the results here
      const apiResults = await this.fetchDataFromAPIs(searchTerm);

      return apiResults;
    } catch (error) {
      // Handle errors appropriately
      throw error;
    }
  }

  async fetchDataFromAPIs(searchTerm) {
    // Implement logic to fetch data from different APIs
    const results = [];
    const rxTerms = getRxTerms(searchTerm);

    results.push(...rxTerms);

    return results;
  }
}
