import type { 
  IEarthquakeParserService, 
  EarthquakeData, 
  ParsingStatistics,
  StatusInfo 
} from '../types/index.js';
import { parseNumber, extractPreBlock, isValidEarthquakeLine } from '../utils/helpers.js';
import { Earthquake } from '../models/Earthquake.js';

interface ParsingCache {
  [key: string]: EarthquakeData;
}

export class EarthquakeParserService implements IEarthquakeParserService {
  private parsedCount: number;
  private errorCount: number;
  private parsingCache: ParsingCache;
  private batchSize: number;
  private regexCache: Map<string, RegExp>;

  constructor() {
    this.parsedCount = 0;
    this.errorCount = 0;
    this.parsingCache = {};
    this.batchSize = 1000; // Process in batches of 1000
    this.regexCache = new Map();
  }

  public parseFromHtml(html: string): EarthquakeData[] {
    try {
      const preContent = extractPreBlock(html);
      return this.parseFromPreContent(preContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`HTML parsing hatası: ${errorMessage}`);
    }
  }

  public parseFromPreContent(preContent: string): EarthquakeData[] {
    const lines = preContent.split('\n');
    const earthquakes: EarthquakeData[] = [];
    
    this.parsedCount = 0;
    this.errorCount = 0;

    // Process lines in batches for better memory management
    for (let i = 0; i < lines.length; i += this.batchSize) {
      const batch = lines.slice(i, i + this.batchSize);
      const batchResults = this.processBatch(batch);
      earthquakes.push(...batchResults);
    }
    
    console.log(`Parse sonucu: ${this.parsedCount} başarılı, ${this.errorCount} hatalı`);
    return earthquakes;
  }

  private processBatch(lines: string[]): EarthquakeData[] {
    const batchResults: EarthquakeData[] = [];
    
    for (const line of lines) {
      try {
        const earthquake = this.parseLine(line);
        if (earthquake && earthquake.isValid()) {
          batchResults.push(earthquake.toObject());
          this.parsedCount++;
        }
      } catch (error) {
        this.errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Satır parse hatası: ${errorMessage}`);
      }
    }
    
    return batchResults;
  }

  public parseLine(line: string): Earthquake | null {
    if (!isValidEarthquakeLine(line)) {
      return null;
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(line);
    if (this.parsingCache[cacheKey]) {
      return Earthquake.fromParsedRow(this.parsingCache[cacheKey]);
    }

    const parts = line.trim().split(/\s+/);
    if (parts.length < 8) {
      throw new Error(`Yetersiz veri: ${parts.length} parça`);
    }

    const [date, time, lat, lon, depth, md, ml, mw, ...rest] = parts;
    let details = rest.join(" ").trim();

    if (!date || !time) {
      throw new Error("Tarih veya saat bilgisi eksik");
    }

    const statusInfo = this.extractStatus(details);
    details = statusInfo.remainingDetails;

    const province = this.extractProvince(details);

    const isoDate = date.replaceAll(".", "-");
    const when = new Date(`${isoDate}T${time}+03:00`);

    const mdNum = parseNumber(md);
    const mlNum = parseNumber(ml);
    const mwNum = parseNumber(mw);

    const earthquakeData: EarthquakeData = {
      datetime: when.toISOString(),
      date,
      time,
      latitude: parseNumber(lat),
      longitude: parseNumber(lon),
      depth_km: parseNumber(depth),
      md: mdNum,
      ml: mlNum,
      mw: mwNum,
      preferred_mag: mlNum ?? mdNum ?? mwNum,
      location: details,
      province,
      status: statusInfo.status,
      source: "KOERI",
    };

    // Cache the result
    this.parsingCache[cacheKey] = earthquakeData;

    return Earthquake.fromParsedRow(earthquakeData);
  }

  private generateCacheKey(line: string): string {
    // Use a simple hash for caching
    let hash = 0;
    for (let i = 0; i < line.length; i++) {
      const char = line.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private extractStatus(details: string): StatusInfo {
    // Use cached regex for better performance
    const statusRegex = this.getCachedRegex('status', /\b(İlksel|ILKSEL|İLKSEL|REVIZE\d*|REVIZE)\b/i);
    const statusMatch = details.match(statusRegex);
    
    if (statusMatch) {
      return {
        status: statusMatch[0],
        remainingDetails: details.replace(statusMatch[0], "").trim()
      };
    }
    return {
      status: null,
      remainingDetails: details
    };
  }

  private extractProvince(details: string): string | null {
    // Use cached regex for better performance
    const provinceRegex = this.getCachedRegex('province', /\(([^)]+)\)\s*$/);
    const provinceMatch = details.match(provinceRegex);
    return provinceMatch && provinceMatch[1] ? provinceMatch[1] : null;
  }

  private getCachedRegex(name: string, regex: RegExp): RegExp {
    if (!this.regexCache.has(name)) {
      this.regexCache.set(name, regex);
    }
    return this.regexCache.get(name)!;
  }

  public getStatistics(): ParsingStatistics {
    const total = this.parsedCount + this.errorCount;
    return {
      parsedCount: this.parsedCount,
      errorCount: this.errorCount,
      successRate: total > 0 ? this.parsedCount / total : 0
    };
  }

  public resetStatistics(): void {
    this.parsedCount = 0;
    this.errorCount = 0;
  }

  public clearCache(): void {
    this.parsingCache = {};
  }

  public setBatchSize(size: number): void {
    this.batchSize = size;
  }

  public getCacheSize(): number {
    return Object.keys(this.parsingCache).length;
  }
}
