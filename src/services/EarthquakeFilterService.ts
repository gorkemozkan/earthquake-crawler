import type { 
  IEarthquakeFilterService, 
  EarthquakeData, 
  FilterCriteria, 
  FilterStatistics 
} from '../types/index.js';
import { DEBUG_CONFIG, IZMIR_SPECIFIC_KEYWORDS } from '../config/constants.js';

type FilterFunction = (earthquakes: EarthquakeData[], criteria: any) => EarthquakeData[];

export class EarthquakeFilterService implements IEarthquakeFilterService {
  private filters: Map<string, FilterFunction>;

  constructor() {
    this.filters = new Map();
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

    for (const [filterName, filterValue] of Object.entries(criteria)) {
      const filterFunction = this.filters.get(filterName);
      if (filterFunction) {
        filtered = filterFunction(filtered, filterValue);
      }
    }

    return filtered;
  }

  private filterByIzmir(earthquakes: EarthquakeData[], options: { debug?: boolean } = {}): EarthquakeData[] {
    const { debug = false } = options;
    
    const filtered = earthquakes.filter(earthquake => {
      const location = (earthquake.location || '').toLowerCase();
      
      const provinceMatch = location.match(/\(([^)]+)\)/);
      if (provinceMatch && provinceMatch[1]) {
        const provinceInLocation = provinceMatch[1].toLowerCase();
        if (provinceInLocation.includes('izmir') || provinceInLocation.includes('ızmır')) {
          return true;
        }
        return false;
      }
      
      return IZMIR_SPECIFIC_KEYWORDS.some(keyword => location.includes(keyword));
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

  private filterByMagnitude(earthquakes: EarthquakeData[], range: { min?: number; max?: number }): EarthquakeData[] {
    const { min = 0, max = Infinity } = range;
    
    return earthquakes.filter(earthquake => {
      const magnitude = earthquake.preferred_mag;
      return magnitude != null && magnitude >= min && magnitude <= max;
    });
  }

  private filterByDate(earthquakes: EarthquakeData[], range: { start?: string; end?: string }): EarthquakeData[] {
    const { start, end } = range;
    
    return earthquakes.filter(earthquake => {
      const earthquakeDate = new Date(earthquake.datetime);
      const startDate = start ? new Date(start) : new Date(0);
      const endDate = end ? new Date(end) : new Date();
      
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
    
    return earthquakes.filter(earthquake => {
      const province = (earthquake.province || '').toLowerCase();
      const location = (earthquake.location || '').toLowerCase();
      const searchTerm = provinceName.toLowerCase();
      
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
}
