import type { ServiceContainer, AppOptions, FilterCriteria } from './types/index.js';
import { DataFetcherService } from './services/DataFetcherService.js';
import { EarthquakeParserService } from './services/EarthquakeParserService.js';
import { EarthquakeFilterService } from './services/EarthquakeFilterService.js';
import { ReportGeneratorService } from './services/ReportGeneratorService.js';
import { FileService } from './services/FileService.js';
import { EarthquakeController } from './controllers/EarthquakeController.js';
import { logMemoryUsage } from './utils/helpers.js';

interface PerformanceOptions {
  enableCaching?: boolean;
  batchSize?: {
    parser?: number;
    filter?: number;
    report?: number;
  };
  cacheTimeout?: number;
  enableAsyncProcessing?: boolean;
  enableMemoryMonitoring?: boolean;
}

export class EarthquakeApp {
  private services!: ServiceContainer;
  private controller!: EarthquakeController;
  private performanceOptions: PerformanceOptions;

  constructor(performanceOptions: PerformanceOptions = {}) {
    this.performanceOptions = {
      enableCaching: true,
      batchSize: {
        parser: 1000,
        filter: 1000,
        report: 500
      },
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      enableAsyncProcessing: true,
      enableMemoryMonitoring: true,
      ...performanceOptions
    };
    
    this.initializeServices();
    this.controller = new EarthquakeController(this.services);
    this.configurePerformance();
  }

  private initializeServices(): void {
    this.services = {
      dataFetcher: new DataFetcherService(),
      parser: new EarthquakeParserService(),
      filter: new EarthquakeFilterService(),
      reportGenerator: new ReportGeneratorService(),
      fileService: new FileService()
    };
  }

  private configurePerformance(): void {
    if (this.performanceOptions.enableCaching) {
      this.services.dataFetcher.setCacheTimeout(this.performanceOptions.cacheTimeout!);
      this.services.fileService.setCacheTimeout(this.performanceOptions.cacheTimeout!);
    }

    if (this.performanceOptions.batchSize) {
      this.controller.setBatchSizes(
        this.performanceOptions.batchSize.parser!,
        this.performanceOptions.batchSize.filter!,
        this.performanceOptions.batchSize.report!
      );
    }
  }

  public async run(options: AppOptions = {}): Promise<void> {
    if (this.performanceOptions.enableMemoryMonitoring) {
      logMemoryUsage('App Start');
    }

    const {
      filterByIzmir = true,
      generateJson = true,
      generateMarkdown = true,
      debug = false,
      testConnectivity = false
    } = options;

    try {
      console.log("Kandilli Deprem Verisi İşleme Uygulaması");
      console.log("=".repeat(50));

      if (this.performanceOptions.enableCaching) {
        console.log("🚀 Performance optimizasyonları aktif");
      }

      if (testConnectivity) {
        await this.controller.testConnectivity();
        return;
      }

      if (this.performanceOptions.enableAsyncProcessing) {
        await this.controller.processEarthquakeDataAsync({
          filterByIzmir,
          generateJson,
          generateMarkdown,
          debug
        });
      } else {
        await this.controller.processEarthquakeData({
          filterByIzmir,
          generateJson,
          generateMarkdown,
          debug
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Uygulama hatası:", errorMessage);
      throw error;
    } finally {
      if (this.performanceOptions.enableMemoryMonitoring) {
        logMemoryUsage('App End');
      }
    }
  }

  public async runWithCustomFilters(filterCriteria: FilterCriteria, options: AppOptions = {}): Promise<void> {
    if (this.performanceOptions.enableAsyncProcessing) {
      await this.controller.processWithCustomFilters(filterCriteria, options);
    } else {
      await this.controller.processWithCustomFilters(filterCriteria, options);
    }
  }

  public getAvailableFilters(): string[] {
    return this.controller.getAvailableFilters();
  }

  public getParsingStats() {
    return this.controller.getParsingStats();
  }

  public async testConnectivity(): Promise<void> {
    await this.controller.testConnectivity();
  }

  // Performance management methods
  public clearAllCaches(): void {
    this.controller.clearAllCaches();
  }

  public getCacheSizes(): { [key: string]: number } {
    return this.controller.getCacheSizes();
  }

  public setPerformanceOptions(options: Partial<PerformanceOptions>): void {
    this.performanceOptions = { ...this.performanceOptions, ...options };
    this.configurePerformance();
  }

  public getPerformanceOptions(): PerformanceOptions {
    return { ...this.performanceOptions };
  }

  public async runPerformanceTest(): Promise<void> {
    console.log("🚀 Performance test başlatılıyor...");
    
    const testOptions = {
      filterByIzmir: true,
      generateJson: true,
      generateMarkdown: true,
      debug: false
    };

    // Test with caching enabled
    console.log("\n1. Cache ile test:");
    this.setPerformanceOptions({ enableCaching: true });
    await this.run(testOptions);

    // Test with caching disabled
    console.log("\n2. Cache olmadan test:");
    this.clearAllCaches();
    this.setPerformanceOptions({ enableCaching: false });
    await this.run(testOptions);

    // Test with different batch sizes
    console.log("\n3. Küçük batch boyutları ile test:");
    this.setPerformanceOptions({
      enableCaching: true,
      batchSize: { parser: 100, filter: 100, report: 50 }
    });
    await this.run(testOptions);

    console.log("\n✅ Performance test tamamlandı!");
  }
}

export function createApp(performanceOptions?: PerformanceOptions): EarthquakeApp {
  return new EarthquakeApp(performanceOptions);
}

function parseCommandLineArgs(): AppOptions & { performance?: boolean } {
  const args = process.argv.slice(2);
  
  return {
    filterByIzmir: !args.includes('--no-filter'),
    generateJson: !args.includes('--no-json'),
    generateMarkdown: !args.includes('--no-markdown'),
    debug: args.includes('--debug'),
    testConnectivity: args.includes('--test-connectivity'),
    performance: args.includes('--performance-test')
  };
}

async function main(): Promise<void> {
  const args = parseCommandLineArgs();
  
  // Configure performance options based on environment
  const performanceOptions: PerformanceOptions = {
    enableCaching: !process.env.DISABLE_CACHE,
    enableAsyncProcessing: !process.env.DISABLE_ASYNC,
    enableMemoryMonitoring: process.env.ENABLE_MEMORY_MONITORING === 'true',
    batchSize: {
      parser: parseInt(process.env.PARSER_BATCH_SIZE || '1000'),
      filter: parseInt(process.env.FILTER_BATCH_SIZE || '1000'),
      report: parseInt(process.env.REPORT_BATCH_SIZE || '500')
    },
    cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '300000') // 5 minutes
  };

  const app = createApp(performanceOptions);
  
  try {
    if (args.performance) {
      await app.runPerformanceTest();
    } else {
      await app.run(args);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Uygulama çalıştırma hatası:", errorMessage);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
