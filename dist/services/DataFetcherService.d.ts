/**
 * Data fetching service for earthquake data
 */
import type { IDataFetcherService, HttpConfig, ConnectivityResult } from '../types/index.js';
export declare class DataFetcherService implements IDataFetcherService {
    private sources;
    private config;
    constructor();
    /**
     * Fetch HTML content from the first available source
     * @returns Object containing URL and HTML content
     * @throws Error - If no source is accessible
     */
    fetchHtml(): Promise<{
        url: string;
        html: string;
    }>;
    /**
     * Set custom sources for data fetching
     * @param sources - Array of URLs
     */
    setSources(sources: string[]): void;
    /**
     * Set custom HTTP configuration
     * @param config - HTTP configuration object
     */
    setHttpConfig(config: Partial<HttpConfig>): void;
    /**
     * Test connectivity to all sources
     * @returns Array of test results
     */
    testConnectivity(): Promise<ConnectivityResult[]>;
    /**
     * Get current sources
     * @returns Current data sources
     */
    getSources(): string[];
    /**
     * Get current HTTP configuration
     * @returns Current HTTP configuration
     */
    getHttpConfig(): HttpConfig;
}
//# sourceMappingURL=DataFetcherService.d.ts.map