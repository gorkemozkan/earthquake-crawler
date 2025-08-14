/**
 * Main application entry point
 */
import type { AppOptions, FilterCriteria } from './types/index.js';
/**
 * Application class that manages the entire earthquake data processing workflow
 */
export declare class EarthquakeApp {
    private services;
    private controller;
    constructor();
    /**
     * Initialize all services with dependency injection
     */
    private initializeServices;
    /**
     * Main application method
     * @param options - Application options
     * @returns Processing results
     */
    run(options?: AppOptions): Promise<void>;
    /**
     * Process with custom filters
     * @param filterCriteria - Custom filter criteria
     * @param options - Processing options
     * @returns Processing results
     */
    runWithCustomFilters(filterCriteria: FilterCriteria, options?: AppOptions): Promise<void>;
    /**
     * Get available filters
     * @returns Available filter names
     */
    getAvailableFilters(): string[];
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getParsingStats(): import("./types/index.js").ParsingStatistics;
    /**
     * Test connectivity to data sources
     * @returns Connectivity test results
     */
    testConnectivity(): Promise<void>;
}
/**
 * Create and configure the application
 * @returns Configured application instance
 */
export declare function createApp(): EarthquakeApp;
//# sourceMappingURL=app.d.ts.map