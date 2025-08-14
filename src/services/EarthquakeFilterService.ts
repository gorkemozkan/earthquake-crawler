import type { 
  IEarthquakeFilterService, 
  EarthquakeData, 
  FilterCriteria, 
  FilterStatistics 
} from '../types/index.js';
import { DEBUG_CONFIG, IZMIR_SPECIFIC_KEYWORDS } from '../config/constants.js';

type FilterFunction = (earthquakes: EarthquakeData[], criteria: any) => EarthquakeData[];

interface FilterCache {
  [key: string]: EarthquakeData[];
}

export class EarthquakeFilterService implements IEarthquakeFilterService {
  private filters: Map<string, FilterFunction>;
  private filterCache: FilterCache;
  private keywordSet: Set<string>;
  private batchSize: number;

  constructor() {
    this.filters = new Map();
    this.filterCache = {};
    this.keywordSet = new Set(IZMIR_SPECIFIC_KEYWORDS.map(k => k.toLowerCase()));
    this.batchSize = 1000;
    this.registerDefaultFilters();
  }

  private registerDefaultFilters(): void {
    this.registerFilter('izmir', this.filterByIzmir.bind(this));
    this.registerFilter('magnitude', this.filterByMagnitude.bind(this));
    this.registerFilter('date', this.filterByDate.bind(this));
    this.registerFilter('depth', this.filterByDepth.bind(this));
    this.registerFilter('province', this.filterByProvince.bind(this));
  }

  public registerFilter(name: string, filterFunction: FilterFunction): void {
    this.filters.set(name, filterFunction);
  }

  public filter(earthquakes: EarthquakeData[], criteria: FilterCriteria = {}): EarthquakeData[] {
    let filtered = [...earthquakes];

    // Generate cache key for the entire filter operation
    const cacheKey = this.generateFilterCacheKey(earthquakes, criteria);
    if (this.filterCache[cacheKey]) {
      return this.filterCache[cacheKey];
    }

    for (const [filterName, filterValue] of Object.entries(criteria)) {
      const filterFunction = this.filters.get(filterName);
      if (filterFunction) {
        filtered = filterFunction(filtered, filterValue);
      }
    }

    // Cache the result
    this.filterCache[cacheKey] = filtered;
    
    // Clean up cache if it gets too large
    this.cleanupCache();

    return filtered;
  }

  private generateFilterCacheKey(earthquakes: EarthquakeData[], criteria: FilterCriteria): string {
    const criteriaStr = JSON.stringify(criteria);
    const dataHash = this.hashArray(earthquakes.map(e => e.datetime + e.location));
    return `${dataHash}_${criteriaStr}`;
  }

  private hashArray(arr: string[]): string {
    let hash = 0;
    for (const str of arr) {
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
    }
    return hash.toString();
  }

  private cleanupCache(): void {
    const cacheKeys = Object.keys(this.filterCache);
    if (cacheKeys.length > 50) {
      // Remove oldest entries
      const keysToRemove = cacheKeys.slice(0, 10);
      keysToRemove.forEach(key => delete this.filterCache[key]);
    }
  }

  private filterByIzmir(earthquakes: EarthquakeData[], options: { debug?: boolean } = {}): EarthquakeData[] {
    const { debug = false } = options;
    
    // Use batch processing for large datasets
    if (earthquakes.length > this.batchSize) {
      return this.filterByIzmirBatch(earthquakes, debug);
    }
    
    const filtered = earthquakes.filter(earthquake => {
      return this.isIzmirEarthquake(earthquake);
    });

    if (debug) {
        console.log(`İzmir filtresi: ${earthquakes.length} depremden ${filtered.length} tanesi İzmir ile ilgili`);
      
      if (filtered.length === 0 && earthquakes.length > 0) {
        console.log("Hiç İzmir depremi bulunamadı. İlk 5 depremin detayları:");
        earthquakes.slice(0, DEBUG_CONFIG.showSampleItems).forEach((item, index) => {
          console.log(`${index + 1}. Location: "${item.location}", Province: "${item.province}"`);
        });
      }
    }

    return filtered;
  }

  private filterByIzmirBatch(earthquakes: EarthquakeData[], debug: boolean): EarthquakeData[] {
    const filtered: EarthquakeData[] = [];
    
    for (let i = 0; i < earthquakes.length; i += this.batchSize) {
      const batch = earthquakes.slice(i, i + this.batchSize);
      const batchFiltered = batch.filter(earthquake => this.isIzmirEarthquake(earthquake));
      filtered.push(...batchFiltered);
    }
    
    if (debug) {
      console.log(`İzmir filtresi (batch): ${earthquakes.length} depremden ${filtered.length} tanesi İzmir ile ilgili`);
    }
    
    return filtered;
  }

  private isIzmirEarthquake(earthquake: EarthquakeData): boolean {
    const location = (earthquake.location || '').toLowerCase();
    
    // Check province first (faster)
    const provinceMatch = location.match(/\(([^)]+)\)/);
    if (provinceMatch && provinceMatch[1]) {
      const provinceInLocation = provinceMatch[1].toLowerCase();
      if (provinceInLocation.includes('izmir') || provinceInLocation.includes('ızmır')) {
        return true;
      }
      return false;
    }
    
    // Use Set for faster keyword lookup
    return IZMIR_SPECIFIC_KEYWORDS.some(keyword => location.includes(keyword.toLowerCase()));
  }

  private filterByMagnitude(earthquakes: EarthquakeData[], range: { min?: number; max?: number }): EarthquakeData[] {
    const { min = 0, max = Infinity } = range;
    
    return earthquakes.filter(earthquake => {
      const magnitude = earthquake.preferred_mag;
      return magnitude != null && magnitude >= min && magnitude <= max;
    });
  }

  private filterByDate(earthquakes: EarthquakeData[], range: { start?: string; end?: string }): EarthquakeData[] {
    const { start, end } = range;
    
    // Pre-calculate date objects for better performance
    const startDate = start ? new Date(start) : new Date(0);
    const endDate = end ? new Date(end) : new Date();
    
    return earthquakes.filter(earthquake => {
      const earthquakeDate = new Date(earthquake.datetime);
      return earthquakeDate >= startDate && earthquakeDate <= endDate;
    });
  }

  private filterByDepth(earthquakes: EarthquakeData[], range: { min?: number; max?: number }): EarthquakeData[] {
    const { min = 0, max = Infinity } = range;
    
    return earthquakes.filter(earthquake => {
      const depth = earthquake.depth_km;
      return depth != null && depth >= min && depth <= max;
    });
  }

  private filterByProvince(earthquakes: EarthquakeData[], provinceName: string): EarthquakeData[] {
    if (!provinceName) return earthquakes;
    
    const searchTerm = provinceName.toLowerCase();
    
    return earthquakes.filter(earthquake => {
      const province = (earthquake.province || '').toLowerCase();
      const location = (earthquake.location || '').toLowerCase();
      
      return province.includes(searchTerm) || location.includes(searchTerm);
    });
  }

  public getAvailableFilters(): string[] {
    return Array.from(this.filters.keys());
  }

  public getFilterStatistics(original: EarthquakeData[], filtered: EarthquakeData[]): FilterStatistics {
    return {
      originalCount: original.length,
      filteredCount: filtered.length,
      reductionPercentage: ((original.length - filtered.length) / original.length * 100).toFixed(2)
    };
  }

  public clearCache(): void {
    this.filterCache = {};
  }

  public setBatchSize(size: number): void {
    this.batchSize = size;
  }

  public getCacheSize(): number {
    return Object.keys(this.filterCache).length;
  }
}
