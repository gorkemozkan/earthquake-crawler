/**
 * Main earthquake controller that orchestrates all services
 */
export class EarthquakeController {
    dataFetcher;
    parser;
    filter;
    reportGenerator;
    fileService;
    constructor(services) {
        this.dataFetcher = services.dataFetcher;
        this.parser = services.parser;
        this.filter = services.filter;
        this.reportGenerator = services.reportGenerator;
        this.fileService = services.fileService;
    }
    /**
     * Main method to fetch, parse, filter and generate reports
     * @param options - Processing options
     * @returns Processing results
     */
    async processEarthquakeData(options = {}) {
        const { filterByIzmir = true, generateJson = true, generateMarkdown = true, debug = false } = options;
        try {
            console.log("🚀 Deprem verisi işleme başlatılıyor...");
            // Step 1: Fetch data
            console.log("📡 Veri alınıyor...");
            const { url, html } = await this.dataFetcher.fetchHtml();
            // Step 2: Parse data
            console.log("🔍 Veri parse ediliyor...");
            const allEarthquakes = this.parser.parseFromHtml(html);
            console.log(`✅ ${allEarthquakes.length} deprem verisi parse edildi`);
            // Step 3: Filter data (if requested)
            let filteredEarthquakes = allEarthquakes;
            let filterStats = null;
            if (filterByIzmir) {
                console.log("🔍 İzmir depremleri filtreleniyor...");
                filteredEarthquakes = this.filter.filter(allEarthquakes, {
                    izmir: { debug }
                });
                filterStats = this.filter.getFilterStatistics(allEarthquakes, filteredEarthquakes);
                console.log(`📍 ${filteredEarthquakes.length} İzmir depremi bulundu`);
            }
            // Step 4: Generate reports
            const results = {
                source: url,
                totalCount: allEarthquakes.length,
                filteredCount: filteredEarthquakes.length,
                filterStats,
                reports: {}
            };
            if (generateJson) {
                console.log("📊 JSON raporu oluşturuluyor...");
                const jsonReport = this.reportGenerator.generateJsonReport(filteredEarthquakes, { source: url, isFiltered: filterByIzmir });
                results.reports.json = jsonReport;
                console.log(JSON.stringify(jsonReport, null, 2));
            }
            if (generateMarkdown) {
                console.log("📝 Markdown raporu oluşturuluyor...");
                const markdownContent = this.reportGenerator.generateMarkdownReport(filteredEarthquakes, { source: url, isFiltered: filterByIzmir });
                const filename = this.reportGenerator.generateFilename(filterByIzmir);
                const savedPath = this.fileService.saveFile(markdownContent, filename);
                results.reports.markdown = {
                    content: markdownContent,
                    filename,
                    savedPath
                };
            }
            // Step 5: Print summary
            this.printSummary(results);
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ İşlem hatası:", errorMessage);
            throw error;
        }
    }
    /**
     * Print processing summary
     * @param results - Processing results
     */
    printSummary(results) {
        console.log("\n" + "=".repeat(50));
        console.log("📊 İŞLEM ÖZETİ");
        console.log("=".repeat(50));
        console.log(`📡 Veri Kaynağı: ${results.source}`);
        console.log(`📊 Toplam Deprem: ${results.totalCount}`);
        console.log(`📍 Filtrelenmiş: ${results.filteredCount}`);
        if (results.filterStats) {
            console.log(`📉 Azalma Oranı: %${results.filterStats.reductionPercentage}`);
        }
        if (results.reports.markdown?.savedPath) {
            console.log(`📄 Rapor Dosyası: ${results.reports.markdown.filename}`);
        }
        console.log("=".repeat(50));
    }
    /**
     * Test connectivity to data sources
     * @returns Connectivity test results
     */
    async testConnectivity() {
        console.log("🔍 Bağlantı testi yapılıyor...");
        const results = await this.dataFetcher.testConnectivity();
        console.log("\n📡 BAĞLANTI TEST SONUÇLARI:");
        results.forEach(result => {
            const status = result.accessible ? "✅" : "❌";
            const time = result.responseTime ? `${result.responseTime}ms` : "N/A";
            console.log(`${status} ${result.url} - ${time}`);
        });
    }
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getParsingStats() {
        return this.parser.getStatistics();
    }
    /**
     * Get available filters
     * @returns Available filter names
     */
    getAvailableFilters() {
        return this.filter.getAvailableFilters();
    }
    /**
     * Process with custom filters
     * @param filterCriteria - Custom filter criteria
     * @param options - Processing options
     * @returns Processing results
     */
    async processWithCustomFilters(filterCriteria, options = {}) {
        const { generateJson = true, generateMarkdown = true } = options;
        try {
            console.log("🚀 Özel filtrelerle işlem başlatılıyor...");
            // Fetch and parse data
            const { url, html } = await this.dataFetcher.fetchHtml();
            const allEarthquakes = this.parser.parseFromHtml(html);
            // Apply custom filters
            const filteredEarthquakes = this.filter.filter(allEarthquakes, filterCriteria);
            const filterStats = this.filter.getFilterStatistics(allEarthquakes, filteredEarthquakes);
            // Generate reports
            const results = {
                source: url,
                totalCount: allEarthquakes.length,
                filteredCount: filteredEarthquakes.length,
                filterStats,
                filterCriteria,
                reports: {}
            };
            if (generateJson) {
                const jsonReport = this.reportGenerator.generateJsonReport(filteredEarthquakes, { source: url, isFiltered: true });
                results.reports.json = jsonReport;
                console.log(JSON.stringify(jsonReport, null, 2));
            }
            if (generateMarkdown) {
                const markdownContent = this.reportGenerator.generateMarkdownReport(filteredEarthquakes, { source: url, isFiltered: true });
                const filename = this.reportGenerator.generateFilename(true);
                const savedPath = this.fileService.saveFile(markdownContent, filename);
                results.reports.markdown = {
                    content: markdownContent,
                    filename,
                    savedPath
                };
            }
            this.printSummary(results);
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Özel filtre işlemi hatası:", errorMessage);
            throw error;
        }
    }
}
//# sourceMappingURL=EarthquakeController.js.map