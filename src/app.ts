import type { ServiceContainer, AppOptions, FilterCriteria } from './types/index.js';
import { DataFetcherService } from './services/DataFetcherService.js';
import { EarthquakeParserService } from './services/EarthquakeParserService.js';
import { EarthquakeFilterService } from './services/EarthquakeFilterService.js';
import { ReportGeneratorService } from './services/ReportGeneratorService.js';
import { FileService } from './services/FileService.js';
import { EarthquakeController } from './controllers/EarthquakeController.js';


export class EarthquakeApp {
  private services!: ServiceContainer;
  private controller!: EarthquakeController;

  constructor() {
    this.initializeServices();
    this.controller = new EarthquakeController(this.services);
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


  public async run(options: AppOptions = {}): Promise<void> {
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


      if (testConnectivity) {
        await this.controller.testConnectivity();
        return;
      }


      await this.controller.processEarthquakeData({
        filterByIzmir,
        generateJson,
        generateMarkdown,
        debug
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Uygulama hatası:", errorMessage);
      throw error;
    }
  }


  public async runWithCustomFilters(filterCriteria: FilterCriteria, options: AppOptions = {}): Promise<void> {
    await this.controller.processWithCustomFilters(filterCriteria, options);
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
}


export function createApp(): EarthquakeApp {
  return new EarthquakeApp();
}


function parseCommandLineArgs(): AppOptions {
  const args = process.argv.slice(2);
  
  return {
    filterByIzmir: !args.includes('--no-filter'),
    generateJson: !args.includes('--no-json'),
    generateMarkdown: !args.includes('--no-markdown'),
    debug: args.includes('--debug'),
    testConnectivity: args.includes('--test-connectivity')
  };
}


async function main(): Promise<void> {
  const app = createApp();
  
  try {
    const options = parseCommandLineArgs();
    await app.run(options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Uygulama çalıştırma hatası:", errorMessage);
    process.exit(1);
  }
}


if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
