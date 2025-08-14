import type { 
  IDataFetcherService, 
  HttpConfig, 
  ConnectivityResult 
} from '../types/index.js';
import { EARTHQUAKE_SOURCES, HTTP_CONFIG } from '../config/constants.js';

interface CacheEntry {
  data: string;
  timestamp: number;
  url: string;
}

export class DataFetcherService implements IDataFetcherService {
  private sources: string[];
  private config: HttpConfig;
  private cache: Map<string, CacheEntry>;
  private cacheTimeout: number;
  private connectionPool: Map<string, AbortController>;

  constructor() {
    this.sources = EARTHQUAKE_SOURCES;
    this.config = HTTP_CONFIG;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.connectionPool = new Map();
  }

  public async fetchHtml(): Promise<{ url: string; html: string }> {
    const cachedResult = this.getCachedResult();

    if (cachedResult) {
      console.log(`Cache'den veri alındı: ${cachedResult.url}`);
      return cachedResult;
    }

    // Try sources in parallel for better performance
    const fetchPromises = this.sources.map(url => this.fetchFromSource(url));
    
    try {
      const results = await Promise.race(fetchPromises);
      this.cacheResult(results.url, results.html);
      return results;
    } catch (error) {
      for (const url of this.sources) {
        try {
          console.log(`Veri kaynağı deneniyor: ${url}`);
          
          const response = await this.fetchWithTimeout(url);
          
          if (!response.ok) {
            console.log(`${url} erişilemedi (HTTP ${response.status})`);
            continue;
          }
          
          const html = await response.text();
          console.log(`Veri başarıyla alındı: ${url}`);
          
          this.cacheResult(url, html);
          return { url, html };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`${url} hatası: ${errorMessage}`);
          continue;
        }
      }
      
      throw new Error("Hiçbir kaynağa erişilemedi. Lütfen internet bağlantınızı kontrol edin.");
    }
  }

  private async fetchFromSource(url: string): Promise<{ url: string; html: string }> {
    const response = await this.fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Veri başarıyla alındı: ${url}`);
    
    return { url, html };
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    this.connectionPool.set(url, controller);
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.connectionPool.delete(url);
    }, this.config.timeout);

    try {
      const response = await fetch(url, {
        ...this.config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.connectionPool.delete(url);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      this.connectionPool.delete(url);
      throw error;
    }
  }

  private getCachedResult(): { url: string; html: string } | null {
    const now = Date.now();
    
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp < this.cacheTimeout) {
        return { url: entry.url, html: entry.data };
      } else {
        this.cache.delete(url);
      }
    }
    
    return null;
  }

  private cacheResult(url: string, html: string): void {
    this.cache.set(url, {
      data: html,
      timestamp: Date.now(),
      url
    });
    
    // Clean up old cache entries
    if (this.cache.size > 10) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }

  public abortAllConnections(): void {
    for (const controller of this.connectionPool.values()) {
      controller.abort();
    }
    this.connectionPool.clear();
  }

  public setSources(sources: string[]): void {
    this.sources = sources;
  }

  public setHttpConfig(config: Partial<HttpConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public async testConnectivity(): Promise<ConnectivityResult[]> {
    const results: ConnectivityResult[] = [];
    
    // Test all sources in parallel for better performance
    const testPromises = this.sources.map(async (url) => {
      try {
        const startTime = Date.now();
        const response = await this.fetchWithTimeout(url);
        const endTime = Date.now();
        
        return {
          url,
          accessible: response.ok,
          status: response.status,
          responseTime: endTime - startTime
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          url,
          accessible: false,
          error: errorMessage
        };
      }
    });
    
    return Promise.all(testPromises);
  }

  public getSources(): string[] {
    return [...this.sources];
  }

  public getHttpConfig(): HttpConfig {
    return { ...this.config };
  }
}
