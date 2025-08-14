import type { 
  ServiceContainer, 
  ProcessingResults, 
  FilterCriteria, 
  AppOptions 
} from '../types/index.js';
import { PerformanceMonitor, logMemoryUsage } from '../utils/helpers.js';

export class EarthquakeController {
  private dataFetcher: ServiceContainer['dataFetcher'];
  private parser: ServiceContainer['parser'];
  private filter: ServiceContainer['filter'];
  private reportGenerator: ServiceContainer['reportGenerator'];
  private fileService: ServiceContainer['fileService'];
  private performanceMonitor: PerformanceMonitor;

  constructor(services: ServiceContainer) {
    this.dataFetcher = services.dataFetcher;
    this.parser = services.parser;
    this.filter = services.filter;
    this.reportGenerator = services.reportGenerator;
    this.fileService = services.fileService;
    this.performanceMonitor = new PerformanceMonitor();
  }

  public async processEarthquakeData(options: AppOptions = {}): Promise<ProcessingResults> {
    const {
      filterByIzmir = true,
      generateJson = true,
      generateMarkdown = true,
      debug = false
    } = options;

    this.performanceMonitor.start();
    logMemoryUsage('Start');

    try {
      console.log("Deprem verisi işleme başlatılıyor...");

      console.log("Veri alınıyor...");
      this.performanceMonitor.checkpoint('Data Fetch Start');

      const { url, html } = await this.dataFetcher.fetchHtml();
      this.performanceMonitor.checkpoint('Data Fetch Complete');
      logMemoryUsage('After Data Fetch');

      console.log("🔍 Veri parse ediliyor...");
      this.performanceMonitor.checkpoint('Parsing Start');

      const allEarthquakes = this.parser.parseFromHtml(html);
      this.performanceMonitor.checkpoint('Parsing Complete');
      logMemoryUsage('After Parsing');

      console.log(`${allEarthquakes.length} deprem verisi parse edildi`);

      let filteredEarthquakes = allEarthquakes;
      let filterStats = null;

      if (filterByIzmir) {
        console.log("İzmir depremleri filtreleniyor...");
        this.performanceMonitor.checkpoint('Filtering Start');

        filteredEarthquakes = this.filter.filter(allEarthquakes, {
          izmir: { debug }
        });
        this.performanceMonitor.checkpoint('Filtering Complete');
        logMemoryUsage('After Filtering');

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
        this.performanceMonitor.checkpoint('JSON Report Start');
        
        const jsonReport = this.reportGenerator.generateJsonReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        results.reports.json = jsonReport;
        this.performanceMonitor.checkpoint('JSON Report Complete');
        
        console.log(JSON.stringify(jsonReport, null, 2));
      }

      if (generateMarkdown) {
        console.log("Markdown raporu oluşturuluyor...");
        this.performanceMonitor.checkpoint('Markdown Report Start');
        
        const markdownContent = this.reportGenerator.generateMarkdownReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        this.performanceMonitor.checkpoint('Markdown Report Complete');
        
        const filename = this.reportGenerator.generateFilename(filterByIzmir);
        this.performanceMonitor.checkpoint('File Save Start');
        
        const savedPath = this.fileService.saveFile(markdownContent, filename);
        this.performanceMonitor.checkpoint('File Save Complete');
        
        results.reports.markdown = {
          content: markdownContent,
          filename,
          savedPath
        };
      }

      this.performanceMonitor.checkpoint('Complete');
      logMemoryUsage('End');

      this.printSummary(results);
      this.performanceMonitor.printSummary();

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("İşlem hatası:", errorMessage);
      this.performanceMonitor.printSummary();
      throw error;
    }
  }

  public async processEarthquakeDataAsync(options: AppOptions = {}): Promise<ProcessingResults> {
    const {
      filterByIzmir = true,
      generateJson = true,
      generateMarkdown = true,
      debug = false
    } = options;

    this.performanceMonitor.start();
    logMemoryUsage('Start');

    try {
      console.log("Deprem verisi işleme başlatılıyor (Async)...");

      console.log("Veri alınıyor...");
      this.performanceMonitor.checkpoint('Data Fetch Start');

      const { url, html } = await this.dataFetcher.fetchHtml();
      this.performanceMonitor.checkpoint('Data Fetch Complete');
      logMemoryUsage('After Data Fetch');

      console.log("🔍 Veri parse ediliyor...");
      this.performanceMonitor.checkpoint('Parsing Start');

      const allEarthquakes = this.parser.parseFromHtml(html);
      this.performanceMonitor.checkpoint('Parsing Complete');
      logMemoryUsage('After Parsing');

      console.log(`${allEarthquakes.length} deprem verisi parse edildi`);

      let filteredEarthquakes = allEarthquakes;
      let filterStats = null;

      if (filterByIzmir) {
        console.log("İzmir depremleri filtreleniyor...");
        this.performanceMonitor.checkpoint('Filtering Start');

        filteredEarthquakes = this.filter.filter(allEarthquakes, {
          izmir: { debug }
        });
        this.performanceMonitor.checkpoint('Filtering Complete');
        logMemoryUsage('After Filtering');

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

      // Process reports in parallel for better performance
      const reportPromises: Promise<void>[] = [];

      if (generateJson) {
        console.log("JSON raporu oluşturuluyor...");
        this.performanceMonitor.checkpoint('JSON Report Start');
        
        const jsonReport = this.reportGenerator.generateJsonReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        results.reports.json = jsonReport;
        this.performanceMonitor.checkpoint('JSON Report Complete');
        
        console.log(JSON.stringify(jsonReport, null, 2));
      }

      if (generateMarkdown) {
        console.log("Markdown raporu oluşturuluyor...");
        this.performanceMonitor.checkpoint('Markdown Report Start');
        
        const markdownContent = this.reportGenerator.generateMarkdownReport(
          filteredEarthquakes,
          { source: url, isFiltered: filterByIzmir }
        );
        this.performanceMonitor.checkpoint('Markdown Report Complete');
        
        const filename = this.reportGenerator.generateFilename(filterByIzmir);
        this.performanceMonitor.checkpoint('File Save Start');
        
        const savedPath = await this.fileService.saveFileAsync(markdownContent, filename);
        this.performanceMonitor.checkpoint('File Save Complete');
        
        results.reports.markdown = {
          content: markdownContent,
          filename,
          savedPath
        };
      }

      this.performanceMonitor.checkpoint('Complete');
      logMemoryUsage('End');

      this.printSummary(results);
      this.performanceMonitor.printSummary();

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("İşlem hatası:", errorMessage);
      this.performanceMonitor.printSummary();
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

    this.performanceMonitor.start();

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
        const savedPath = await this.fileService.saveFileAsync(markdownContent, filename);
        
        results.reports.markdown = {
          content: markdownContent,
          filename,
          savedPath
        };
      }

      this.printSummary(results);
      this.performanceMonitor.printSummary();
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Özel filtre işlemi hatası:", errorMessage);
      this.performanceMonitor.printSummary();
      throw error;
    }
  }

  // Performance management methods
  public clearAllCaches(): void {
    this.dataFetcher.clearCache();
    this.parser.clearCache();
    this.filter.clearCache();
    this.reportGenerator.clearCache();
    this.fileService.clearCache();
    console.log("Tüm cache'ler temizlendi");
  }

  public getCacheSizes(): { [key: string]: number } {
    return {
      dataFetcher: 0, // DataFetcher doesn't expose cache size
      parser: this.parser.getCacheSize(),
      filter: this.filter.getCacheSize(),
      reportGenerator: this.reportGenerator.getCacheSize(),
      fileService: this.fileService.getCacheSize()
    };
  }

  public setBatchSizes(parserSize: number, filterSize: number, reportSize: number): void {
    this.parser.setBatchSize(parserSize);
    this.filter.setBatchSize(filterSize);
    this.reportGenerator.setBatchSize(reportSize);
    console.log(`Batch boyutları güncellendi: Parser=${parserSize}, Filter=${filterSize}, Report=${reportSize}`);
  }
}
