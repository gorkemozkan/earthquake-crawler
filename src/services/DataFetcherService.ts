import type { 
  IDataFetcherService, 
  HttpConfig, 
  ConnectivityResult 
} from '../types/index.js';
import { EARTHQUAKE_SOURCES, HTTP_CONFIG } from '../config/constants.js';

export class DataFetcherService implements IDataFetcherService {
  private sources: string[];
  private config: HttpConfig;

  constructor() {
    this.sources = EARTHQUAKE_SOURCES;
    this.config = HTTP_CONFIG;
  }

  public async fetchHtml(): Promise<{ url: string; html: string }> {
    for (const url of this.sources) {
      try {
        console.log(`Veri kaynağı deneniyor: ${url}`);
        
        const response = await fetch(url, this.config);
        
        if (!response.ok) {
          console.log(`${url} erişilemedi (HTTP ${response.status})`);
          continue;
        }
        
        const html = await response.text();

        console.log(`Veri başarıyla alındı: ${url}`);

        return { url, html };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.log(`${url} hatası: ${errorMessage}`);

        continue;
      }
    }
    
    throw new Error("Hiçbir kaynağa erişilemedi. Lütfen internet bağlantınızı kontrol edin.");
  }

  public setSources(sources: string[]): void {
    this.sources = sources;
  }

  public setHttpConfig(config: Partial<HttpConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public async testConnectivity(): Promise<ConnectivityResult[]> {
    const results: ConnectivityResult[] = [];
    
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
      } catch (error) {
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

  public getSources(): string[] {
    return [...this.sources];
  }

  public getHttpConfig(): HttpConfig {
    return { ...this.config };
  }
}
