import type { 
  ServiceContainer, 
  ProcessingResults, 
  FilterCriteria, 
  AppOptions 
} from '../types/index.js';

export class EarthquakeController {
  private dataFetcher: ServiceContainer['dataFetcher'];
  private parser: ServiceContainer['parser'];
  private filter: ServiceContainer['filter'];
  private reportGenerator: ServiceContainer['reportGenerator'];
  private fileService: ServiceContainer['fileService'];

  constructor(services: ServiceContainer) {
    this.dataFetcher = services.dataFetcher;
    this.parser = services.parser;
    this.filter = services.filter;
    this.reportGenerator = services.reportGenerator;
    this.fileService = services.fileService;
  }

  public async processEarthquakeData(options: AppOptions = {}): Promise<ProcessingResults> {
    const {
      filterByIzmir = true,
      generateJson = true,
      generateMarkdown = true,
      debug = false
    } = options;

    try {
      console.log("Deprem verisi işleme başlatılıyor...");

      console.log("Veri alınıyor...");

      const { url, html } = await this.dataFetcher.fetchHtml();

      console.log("🔍 Veri parse ediliyor...");

      const allEarthquakes = this.parser.parseFromHtml(html);

      console.log(`${allEarthquakes.length} deprem verisi parse edildi`);

      let filteredEarthquakes = allEarthquakes;
      let filterStats = null;

      if (filterByIzmir) {
        console.log("İzmir depremleri filtreleniyor...");

        filteredEarthquakes = this.filter.filter(allEarthquakes, {
          izmir: { debug }
        });

        filterStats = this.filter.getFilterStatistics(allEarthquakes, filteredEarthquakes);

        console.log(`${filteredEarthquakes.length} İzmir depremi bulundu`);
      }

      const results: ProcessingResults = {
        source: url,
        totalCount: allEarthquakes.length,
        filteredCount: filteredEarthquakes.length,
        filterStats,
        reports: {}
      };

      if (generateJson) {
        console.log("JSON raporu oluşturuluyor...");
        const jsonReport = this.reportGenerator.generateJsonReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        results.reports.json = jsonReport;
        console.log(JSON.stringify(jsonReport, null, 2));
      }

      if (generateMarkdown) {
        console.log("Markdown raporu oluşturuluyor...");
        const markdownContent = this.reportGenerator.generateMarkdownReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        
        const filename = this.reportGenerator.generateFilename(filterByIzmir);
        const savedPath = this.fileService.saveFile(markdownContent, filename);
        
        results.reports.markdown = {
          content: markdownContent,
          filename,
          savedPath
        };
      }

      this.printSummary(results);

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ İşlem hatası:", errorMessage);
      throw error;
    }
  }


  private printSummary(results: ProcessingResults): void {
    console.log("\n" + "=".repeat(50));
    console.log("İŞLEM ÖZETİ");
    console.log("=".repeat(50));
    console.log(`Veri Kaynağı: ${results.source}`);
    console.log(`Toplam Deprem: ${results.totalCount}`);
    console.log(`Filtrelenmiş: ${results.filteredCount}`);
    
    if (results.filterStats) {
      console.log(`Azalma Oranı: %${results.filterStats.reductionPercentage}`);
    }
    
    if (results.reports.markdown?.savedPath) {
      console.log(`Rapor Dosyası: ${results.reports.markdown.filename}`);
    }
    
    console.log("=".repeat(50));
  }


  public async testConnectivity(): Promise<void> {
    console.log("Bağlantı testi yapılıyor...");
    const results = await this.dataFetcher.testConnectivity();
    
    console.log("\nBAĞLANTI TEST SONUÇLARI:");
    results.forEach(result => {
      const status = result.accessible ? "✅" : "❌";
      const time = result.responseTime ? `${result.responseTime}ms` : "N/A";
      console.log(`${status} ${result.url} - ${time}`);
    });
  }


  public getParsingStats() {
    return this.parser.getStatistics();
  }


  public getAvailableFilters(): string[] {
    return this.filter.getAvailableFilters();
  }


  public async processWithCustomFilters(filterCriteria: FilterCriteria, options: AppOptions = {}): Promise<ProcessingResults> {
    const {
      generateJson = true,
      generateMarkdown = true
    } = options;

    try {
      console.log("Özel filtrelerle işlem başlatılıyor...");

      const { url, html } = await this.dataFetcher.fetchHtml();
      const allEarthquakes = this.parser.parseFromHtml(html);

      const filteredEarthquakes = this.filter.filter(allEarthquakes, filterCriteria);
      const filterStats = this.filter.getFilterStatistics(allEarthquakes, filteredEarthquakes);

      const results: ProcessingResults = {
        source: url,
        totalCount: allEarthquakes.length,
        filteredCount: filteredEarthquakes.length,
        filterStats,
        filterCriteria,
        reports: {}
      };

      if (generateJson) {
        const jsonReport = this.reportGenerator.generateJsonReport(
          filteredEarthquakes,
          { source: url, isFiltered: true }
        );
        results.reports.json = jsonReport;
        console.log(JSON.stringify(jsonReport, null, 2));
      }

      if (generateMarkdown) {
        const markdownContent = this.reportGenerator.generateMarkdownReport(
          filteredEarthquakes,
          { source: url, isFiltered: true }
        );
        
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Özel filtre işlemi hatası:", errorMessage);
      throw error;
    }
  }
}
