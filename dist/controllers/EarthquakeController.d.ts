/**
 * Main earthquake controller that orchestrates all services
 */
import type { ServiceContainer, ProcessingResults, FilterCriteria, AppOptions } from '../types/index.js';
export declare class EarthquakeController {
    private dataFetcher;
    private parser;
    private filter;
    private reportGenerator;
    private fileService;
    constructor(services: ServiceContainer);
    /**
     * Main method to fetch, parse, filter and generate reports
     * @param options - Processing options
     * @returns Processing results
     */
    processEarthquakeData(options?: AppOptions): Promise<ProcessingResults>;
    /**
     * Print processing summary
     * @param results - Processing results
     */
    private printSummary;
    /**
     * Test connectivity to data sources
     * @returns Connectivity test results
     */
    testConnectivity(): Promise<void>;
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getParsingStats(): import("../types/index.js").ParsingStatistics;
    /**
     * Get available filters
     * @returns Available filter names
     */
    getAvailableFilters(): string[];
    /**
     * Process with custom filters
     * @param filterCriteria - Custom filter criteria
     * @param options - Processing options
     * @returns Processing results
     */
    processWithCustomFilters(filterCriteria: FilterCriteria, options?: AppOptions): Promise<ProcessingResults>;
}
//# sourceMappingURL=EarthquakeController.d.ts.map