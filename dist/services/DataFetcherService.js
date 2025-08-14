/**
 * Data fetching service for earthquake data
 */
import { EARTHQUAKE_SOURCES, HTTP_CONFIG } from '../config/constants.js';
export class DataFetcherService {
    sources;
    config;
    constructor() {
        this.sources = EARTHQUAKE_SOURCES;
        this.config = HTTP_CONFIG;
    }
    /**
     * Fetch HTML content from the first available source
     * @returns Object containing URL and HTML content
     * @throws Error - If no source is accessible
     */
    async fetchHtml() {
        for (const url of this.sources) {
            try {
                console.log(`🔍 Veri kaynağı deneniyor: ${url}`);
                const response = await fetch(url, this.config);
                if (!response.ok) {
                    console.log(`❌ ${url} erişilemedi (HTTP ${response.status})`);
                    continue;
                }
                const html = await response.text();
                console.log(`✅ Veri başarıyla alındı: ${url}`);
                return { url, html };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(`❌ ${url} hatası: ${errorMessage}`);
                continue;
            }
        }
        throw new Error("Hiçbir kaynağa erişilemedi. Lütfen internet bağlantınızı kontrol edin.");
    }
    /**
     * Set custom sources for data fetching
     * @param sources - Array of URLs
     */
    setSources(sources) {
        this.sources = sources;
    }
    /**
     * Set custom HTTP configuration
     * @param config - HTTP configuration object
     */
    setHttpConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Test connectivity to all sources
     * @returns Array of test results
     */
    async testConnectivity() {
        const results = [];
        for (const url of this.sources) {
            try {
                const startTime = Date.now();
                const response = await fetch(url, { ...this.config, method: 'HEAD' });
                const endTime = Date.now();
                results.push({
                    url,
                    accessible: response.ok,
                    status: response.status,
                    responseTime: endTime - startTime
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    url,
                    accessible: false,
                    error: errorMessage
                });
            }
        }
        return results;
    }
    /**
     * Get current sources
     * @returns Current data sources
     */
    getSources() {
        return [...this.sources];
    }
    /**
     * Get current HTTP configuration
     * @returns Current HTTP configuration
     */
    getHttpConfig() {
        return { ...this.config };
    }
}
//# sourceMappingURL=DataFetcherService.js.map