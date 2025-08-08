import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { snowmedClient } from './snowmedClient';

// Query keys for caching
export const SNOWMED_QUERY_KEYS = {
    concept: (conceptId) => ['snowmed', 'concept', conceptId],
    children: (conceptId, options) => ['snowmed', 'children', conceptId, options],
    search: (term, options) => ['snowmed', 'search', term, options],
    infiniteSearch: (term, options) => ['snowmed', 'infiniteSearch', term, options],
};

/**
 * Hook to fetch a SNOWMED concept by ID
 * @param {string} conceptId - The SNOWMED concept ID
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export const useSnowmedConcept = (conceptId, options = {}) => {
    return useQuery({
        queryKey: SNOWMED_QUERY_KEYS.concept(conceptId),
        queryFn: () => snowmedClient.getConcept(conceptId),
        enabled: !!conceptId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

/**
 * Hook to fetch children of a SNOWMED concept
 * @param {string} conceptId - The SNOWMED concept ID
 * @param {Object} queryOptions - Query options for pagination
 * @param {Object} options - TanStack Query options
 * @returns {Object} Query result
 */
export const useSnowmedChildren = (conceptId, queryOptions = {}, options = {}) => {
    return useQuery({
        queryKey: SNOWMED_QUERY_KEYS.children(conceptId, queryOptions),
        queryFn: () => snowmedClient.getChildren(conceptId, queryOptions),
        enabled: !!conceptId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
};

/**
 * Hook to search SNOWMED concepts by term
 * @param {string} term - Search term
 * @param {Object} queryOptions - Query options for pagination
 * @param {Object} options - TanStack Query options
 * @returns {Object} Query result
 */
export const useSnowmedSearch = (term, queryOptions = {}, options = {}) => {
    const { enabled, ...restOptions } = options;

    return useQuery({
        queryKey: SNOWMED_QUERY_KEYS.search(term, queryOptions),
        queryFn: () => snowmedClient.searchConcepts(term, queryOptions),
        enabled: enabled !== undefined ? enabled : (!!term && term.length >= 2),
        staleTime: 2 * 60 * 1000, // 2 minutes for search results
        gcTime: 5 * 60 * 1000, // 5 minutes
        ...restOptions,
    });
};

/**
 * Hook to search SNOWMED concepts by term with infinite query (pagination)
 * @param {string} term - Search term
 * @param {Object} queryOptions - Query options (limit, etc.)
 * @param {Object} options - TanStack Query options
 * @returns {Object} Infinite query result
 */
export const useSnowmedInfiniteSearch = (term, queryOptions = {}, options = {}) => {
    const { enabled, ...restOptions } = options;
    const { limit = 100, ...otherQueryOptions } = queryOptions;

    return useInfiniteQuery({
        queryKey: SNOWMED_QUERY_KEYS.infiniteSearch(term, otherQueryOptions),
        queryFn: ({ pageParam = 0 }) =>
            snowmedClient.searchConcepts(term, {
                ...otherQueryOptions,
                limit,
                offset: pageParam
            }),
        enabled: enabled !== undefined ? enabled : (!!term && term.length >= 3),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // Calculate total items loaded so far
            const totalLoaded = allPages.reduce((acc, page) => acc + (page.items?.length || 0), 0);

            // If we have more items available, return next offset
            if (totalLoaded < (lastPage.totalElements || 0)) {
                return totalLoaded;
            }

            // No more pages
            return undefined;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for search results
        gcTime: 5 * 60 * 1000, // 5 minutes
        ...restOptions,
    });
}; 