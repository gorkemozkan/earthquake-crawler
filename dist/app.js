/**
 * Main application entry point
 */
import { DataFetcherService } from './services/DataFetcherService.js';
import { EarthquakeParserService } from './services/EarthquakeParserService.js';
import { EarthquakeFilterService } from './services/EarthquakeFilterService.js';
import { ReportGeneratorService } from './services/ReportGeneratorService.js';
import { FileService } from './services/FileService.js';
import { EarthquakeController } from './controllers/EarthquakeController.js';
/**
 * Application class that manages the entire earthquake data processing workflow
 */
export class EarthquakeApp {
    services;
    controller;
    constructor() {
        this.initializeServices();
        this.controller = new EarthquakeController(this.services);
    }
    /**
     * Initialize all services with dependency injection
     */
    initializeServices() {
        this.services = {
            dataFetcher: new DataFetcherService(),
            parser: new EarthquakeParserService(),
            filter: new EarthquakeFilterService(),
            reportGenerator: new ReportGeneratorService(),
            fileService: new FileService()
        };
    }
    /**
     * Main application method
     * @param options - Application options
     * @returns Processing results
     */
    async run(options = {}) {
        const { filterByIzmir = true, generateJson = true, generateMarkdown = true, debug = false, testConnectivity = false } = options;
        try {
            console.log("🌍 Kandilli Deprem Verisi İşleme Uygulaması");
            console.log("=".repeat(50));
            // Test connectivity if requested
            if (testConnectivity) {
                await this.controller.testConnectivity();
                return;
            }
            // Process earthquake data
            await this.controller.processEarthquakeData({
                filterByIzmir,
                generateJson,
                generateMarkdown,
                debug
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Uygulama hatası:", errorMessage);
            throw error;
        }
    }
    /**
     * Process with custom filters
     * @param filterCriteria - Custom filter criteria
     * @param options - Processing options
     * @returns Processing results
     */
    async runWithCustomFilters(filterCriteria, options = {}) {
        await this.controller.processWithCustomFilters(filterCriteria, options);
    }
    /**
     * Get available filters
     * @returns Available filter names
     */
    getAvailableFilters() {
        return this.controller.getAvailableFilters();
    }
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getParsingStats() {
        return this.controller.getParsingStats();
    }
    /**
     * Test connectivity to data sources
     * @returns Connectivity test results
     */
    async testConnectivity() {
        await this.controller.testConnectivity();
    }
}
/**
 * Create and configure the application
 * @returns Configured application instance
 */
export function createApp() {
    return new EarthquakeApp();
}
/**
 * Parse command line arguments
 * @returns Parsed options
 */
function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    return {
        filterByIzmir: !args.includes('--no-filter'),
        generateJson: !args.includes('--no-json'),
        generateMarkdown: !args.includes('--no-markdown'),
        debug: args.includes('--debug'),
        testConnectivity: args.includes('--test-connectivity')
    };
}
/**
 * Main entry point for command line usage
 */
async function main() {
    const app = createApp();
    try {
        const options = parseCommandLineArgs();
        await app.run(options);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ Uygulama çalıştırma hatası:", errorMessage);
        process.exit(1);
    }
}
// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
//# sourceMappingURL=app.js.map