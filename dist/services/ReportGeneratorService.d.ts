/**
 * Report generation service
 */
import type { IReportGeneratorService, EarthquakeData, ReportMetadata, JsonReport, TimezoneConfig } from '../types/index.js';
export declare class ReportGeneratorService implements IReportGeneratorService {
    private timezoneConfig;
    constructor();
    /**
     * Generate JSON report
     * @param earthquakes - Array of earthquakes
     * @param metadata - Report metadata
     * @returns JSON report object
     */
    generateJsonReport(earthquakes: EarthquakeData[], metadata?: ReportMetadata): JsonReport;
    /**
     * Generate Markdown report
     * @param earthquakes - Array of earthquakes
     * @param metadata - Report metadata
     * @returns Markdown report string
     */
    generateMarkdownReport(earthquakes: EarthquakeData[], metadata?: ReportMetadata): string;
    /**
     * Generate summary statistics section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown statistics section
     */
    private generateSummaryStatistics;
    /**
     * Generate data range information section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown data range section
     */
    private generateDataRangeInfo;
    /**
     * Generate earthquake table section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown table section
     */
    private generateEarthquakeTable;
    /**
     * Generate detailed information section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown detailed section
     */
    private generateDetailedInformation;
    /**
     * Generate filename for report
     * @param isFiltered - Whether the report is filtered
     * @returns Generated filename
     */
    generateFilename(isFiltered?: boolean): string;
    /**
     * Set timezone configuration
     * @param config - Timezone configuration
     */
    setTimezoneConfig(config: Partial<TimezoneConfig>): void;
}
//# sourceMappingURL=ReportGeneratorService.d.ts.map