/**
 * Earthquake data parsing service
 */
import type { IEarthquakeParserService, EarthquakeData, ParsingStatistics } from '../types/index.js';
import { Earthquake } from '../models/Earthquake.js';
export declare class EarthquakeParserService implements IEarthquakeParserService {
    private parsedCount;
    private errorCount;
    constructor();
    /**
     * Parse earthquake data from HTML content
     * @param html - HTML content containing earthquake data
     * @returns Array of Earthquake instances
     */
    parseFromHtml(html: string): EarthquakeData[];
    /**
     * Parse earthquake data from pre-formatted content
     * @param preContent - Pre-formatted content
     * @returns Array of Earthquake instances
     */
    parseFromPreContent(preContent: string): EarthquakeData[];
    /**
     * Parse a single line of earthquake data
     * @param line - Single line of earthquake data
     * @returns Parsed Earthquake instance or null
     */
    parseLine(line: string): Earthquake | null;
    /**
     * Extract status information from location details
     * @param details - Location details string
     * @returns Object containing status and remaining details
     */
    private extractStatus;
    /**
     * Extract province information from location details
     * @param details - Location details string
     * @returns Province name or null
     */
    private extractProvince;
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getStatistics(): ParsingStatistics;
    /**
     * Reset parsing statistics
     */
    resetStatistics(): void;
}
//# sourceMappingURL=EarthquakeParserService.d.ts.map