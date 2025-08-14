
import type { 
  IReportGeneratorService, 
  EarthquakeData, 
  ReportMetadata, 
  JsonReport, 
  TimezoneConfig 
} from '../types/index.js';
import { formatTurkishDate } from '../utils/helpers.js';
import { TIMEZONE_CONFIG } from '../config/constants.js';

interface ReportCache {
  [key: string]: string;
}

export class ReportGeneratorService implements IReportGeneratorService {
  private timezoneConfig: TimezoneConfig;
  private reportCache: ReportCache;
  private batchSize: number;

  constructor() {
    this.timezoneConfig = TIMEZONE_CONFIG;
    this.reportCache = {};
    this.batchSize = 500; 
  }

  public generateJsonReport(earthquakes: EarthquakeData[], metadata: ReportMetadata = {}): JsonReport {
    const { source, isFiltered = false } = metadata;
    
    return {
      source: source || 'KOERI',
      count: earthquakes.length,
      isFiltered,
      generatedAt: new Date().toISOString(),
      items: earthquakes.map(earthquake => ({
        datetime: earthquake.datetime,
        date: earthquake.date,
        time: earthquake.time,
        latitude: earthquake.latitude,
        longitude: earthquake.longitude,
        depth_km: earthquake.depth_km,
        md: earthquake.md,
        ml: earthquake.ml,
        mw: earthquake.mw,
        preferred_mag: earthquake.preferred_mag,
        location: earthquake.location,
        province: earthquake.province,
        status: earthquake.status,
        source: earthquake.source,
      }))
    };
  }

  public generateMarkdownReport(earthquakes: EarthquakeData[], metadata: ReportMetadata = {}): string {
    const { source, isFiltered = false } = metadata;
    
    // Check cache first
    const cacheKey = this.generateReportCacheKey(earthquakes, metadata);
    if (this.reportCache[cacheKey]) {
      return this.reportCache[cacheKey];
    }

    const now = formatTurkishDate(new Date(), this.timezoneConfig);

    const title = isFiltered 
      ? 'Kandilli Rasathanesi İzmir Deprem Raporu' 
      : 'Kandilli Rasathanesi Deprem Raporu';
    
    const subtitle = isFiltered 
      ? '**Filtre:** Sadece İzmir ve çevresi depremleri' 
      : '';

    let markdown = `# ${title}\n\n`;
    markdown += `**Son Güncelleme:** ${now}\n\n`;
    markdown += `**Veri Kaynağı:** ${source || 'KOERI'}\n\n`;
    markdown += `**Son Veri Çekme:** ${now}\n\n`;
    if (subtitle) markdown += `${subtitle}\n\n`;
    markdown += `**Toplam Deprem Sayısı:** ${earthquakes.length}\n\n`;

    if (earthquakes.length > 0) {
      markdown += this.generateDataRangeInfo(earthquakes);
    }

    if (earthquakes.length > 0) {
      markdown += this.generateSummaryStatistics(earthquakes);
    }

    markdown += this.generateEarthquakeTable(earthquakes);

    // Only generate detailed information for smaller datasets to save memory
    if (earthquakes.length <= 100) {
      markdown += this.generateDetailedInformation(earthquakes);
    }

    // Cache the result
    this.reportCache[cacheKey] = markdown;
    this.cleanupCache();

    return markdown;
  }

  private generateReportCacheKey(earthquakes: EarthquakeData[], metadata: ReportMetadata): string {
    const metadataStr = JSON.stringify(metadata);
    const dataHash = this.hashArray(earthquakes.map(e => e.datetime + e.location));
    return `${dataHash}_${metadataStr}`;
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
    const cacheKeys = Object.keys(this.reportCache);
    if (cacheKeys.length > 20) {
      // Remove oldest entries
      const keysToRemove = cacheKeys.slice(0, 5);
      keysToRemove.forEach(key => delete this.reportCache[key]);
    }
  }

  private generateSummaryStatistics(earthquakes: EarthquakeData[]): string {
    // Use batch processing for large datasets
    if (earthquakes.length > this.batchSize) {
      return this.generateSummaryStatisticsBatch(earthquakes);
    }

    const magnitudes = earthquakes.map(item => item.preferred_mag).filter((mag): mag is number => mag != null);
    const depths = earthquakes.map(item => item.depth_km).filter((depth): depth is number => depth != null);
    
    if (magnitudes.length === 0) return '';

    const maxMag = Math.max(...magnitudes);
    const minMag = Math.min(...magnitudes);
    const avgMag = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2);
    
    let stats = `## Özet İstatistikler\n\n`;
    stats += `- **En Yüksek Büyüklük:** ${maxMag}\n`;
    stats += `- **En Düşük Büyüklük:** ${minMag}\n`;
    stats += `- **Ortalama Büyüklük:** ${avgMag}\n`;
    
    if (depths.length > 0) {
      const maxDepth = Math.max(...depths);
      const minDepth = Math.min(...depths);
      const avgDepth = (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(2);
      
      stats += `- **En Derin:** ${maxDepth} km\n`;
      stats += `- **En Sığ:** ${minDepth} km\n`;
      stats += `- **Ortalama Derinlik:** ${avgDepth} km\n`;
    }
    stats += `\n`;

    return stats;
  }

  private generateSummaryStatisticsBatch(earthquakes: EarthquakeData[]): string {
    let maxMag = -Infinity;
    let minMag = Infinity;
    let totalMag = 0;
    let magCount = 0;
    
    let maxDepth = -Infinity;
    let minDepth = Infinity;
    let totalDepth = 0;
    let depthCount = 0;

    // Process in batches to avoid memory issues
    for (let i = 0; i < earthquakes.length; i += this.batchSize) {
      const batch = earthquakes.slice(i, i + this.batchSize);
      
      for (const item of batch) {
        if (item.preferred_mag != null) {
          maxMag = Math.max(maxMag, item.preferred_mag);
          minMag = Math.min(minMag, item.preferred_mag);
          totalMag += item.preferred_mag;
          magCount++;
        }
        
        if (item.depth_km != null) {
          maxDepth = Math.max(maxDepth, item.depth_km);
          minDepth = Math.min(minDepth, item.depth_km);
          totalDepth += item.depth_km;
          depthCount++;
        }
      }
    }
    
    if (magCount === 0) return '';

    const avgMag = (totalMag / magCount).toFixed(2);
    
    let stats = `## Özet İstatistikler\n\n`;
    stats += `- **En Yüksek Büyüklük:** ${maxMag}\n`;
    stats += `- **En Düşük Büyüklük:** ${minMag}\n`;
    stats += `- **Ortalama Büyüklük:** ${avgMag}\n`;
    
    if (depthCount > 0) {
      const avgDepth = (totalDepth / depthCount).toFixed(2);
      stats += `- **En Derin:** ${maxDepth} km\n`;
      stats += `- **En Sığ:** ${minDepth} km\n`;
      stats += `- **Ortalama Derinlik:** ${avgDepth} km\n`;
    }
    stats += `\n`;

    return stats;
  }

  private generateDataRangeInfo(earthquakes: EarthquakeData[]): string {
    // Use batch processing for large datasets
    if (earthquakes.length > this.batchSize) {
      return this.generateDataRangeInfoBatch(earthquakes);
    }

    const dates = earthquakes.map(item => new Date(item.datetime)).sort((a, b) => a.getTime() - b.getTime());
    const earliest = dates[0];
    const latest = dates[dates.length - 1];
    
    if (!earliest || !latest) {
      return '';
    }
    
    const formatDate = (date: Date) => formatTurkishDate(date, this.timezoneConfig);
    
    let rangeInfo = `## Veri Aralığı\n\n`;
    rangeInfo += `- **En Eski Deprem:** ${formatDate(earliest)}\n`;
    rangeInfo += `- **En Yeni Deprem:** ${formatDate(latest)}\n`;
    rangeInfo += `- **Veri Aralığı:** ${earliest.toLocaleDateString('tr-TR')} - ${latest.toLocaleDateString('tr-TR')}\n\n`;
    
    return rangeInfo;
  }

  private generateDataRangeInfoBatch(earthquakes: EarthquakeData[]): string {
    let earliest: Date | null = null;
    let latest: Date | null = null;

    // Process in batches
    for (let i = 0; i < earthquakes.length; i += this.batchSize) {
      const batch = earthquakes.slice(i, i + this.batchSize);
      
      for (const item of batch) {
        const date = new Date(item.datetime);
        if (!earliest || date < earliest) {
          earliest = date;
        }
        if (!latest || date > latest) {
          latest = date;
        }
      }
    }
    
    if (!earliest || !latest) {
      return '';
    }
    
    const formatDate = (date: Date) => formatTurkishDate(date, this.timezoneConfig);
    
    let rangeInfo = `## Veri Aralığı\n\n`;
    rangeInfo += `- **En Eski Deprem:** ${formatDate(earliest)}\n`;
    rangeInfo += `- **En Yeni Deprem:** ${formatDate(latest)}\n`;
    rangeInfo += `- **Veri Aralığı:** ${earliest.toLocaleDateString('tr-TR')} - ${latest.toLocaleDateString('tr-TR')}\n\n`;
    
    return rangeInfo;
  }

  private generateEarthquakeTable(earthquakes: EarthquakeData[]): string {
    let table = `## Deprem Listesi\n\n`;
    table += `| Tarih | Saat | Büyüklük | Derinlik (km) | Enlem | Boylam | Konum | Durum |\n`;
    table += `|-------|------|----------|---------------|-------|--------|-------|-------|\n`;

    // Use batch processing for large datasets
    if (earthquakes.length > this.batchSize) {
      return this.generateEarthquakeTableBatch(earthquakes);
    }

    earthquakes.forEach(item => {
      const date = item.date;
      const time = item.time;
      const mag = item.preferred_mag || '-';
      const depth = item.depth_km || '-';
      const lat = item.latitude || '-';
      const lon = item.longitude || '-';
      const location = item.location || '-';
      const status = item.status || '-';

      table += `| ${date} | ${time} | ${mag} | ${depth} | ${lat} | ${lon} | ${location} | ${status} |\n`;
    });

    table += `\n`;
    return table;
  }

  private generateEarthquakeTableBatch(earthquakes: EarthquakeData[]): string {
    let table = `## Deprem Listesi\n\n`;
    table += `| Tarih | Saat | Büyüklük | Derinlik (km) | Enlem | Boylam | Konum | Durum |\n`;
    table += `|-------|------|----------|---------------|-------|--------|-------|-------|\n`;

    // Process in batches to avoid memory issues
    for (let i = 0; i < earthquakes.length; i += this.batchSize) {
      const batch = earthquakes.slice(i, i + this.batchSize);
      
      batch.forEach(item => {
        const date = item.date;
        const time = item.time;
        const mag = item.preferred_mag || '-';
        const depth = item.depth_km || '-';
        const lat = item.latitude || '-';
        const lon = item.longitude || '-';
        const location = item.location || '-';
        const status = item.status || '-';

        table += `| ${date} | ${time} | ${mag} | ${depth} | ${lat} | ${lon} | ${location} | ${status} |\n`;
      });
    }

    table += `\n`;
    return table;
  }

  private generateDetailedInformation(earthquakes: EarthquakeData[]): string {
    let details = `## Detaylı Bilgiler\n\n`;

    earthquakes.forEach((item, index) => {
      details += `### ${index + 1}. Deprem\n\n`;
      details += `- **Tarih ve Saat:** ${item.date} ${item.time}\n`;
      details += `- **ISO Zaman:** ${item.datetime}\n`;
      details += `- **Konum:** ${item.latitude}, ${item.longitude}\n`;
      details += `- **Derinlik:** ${item.depth_km || '-'} km\n`;
      details += `- **Büyüklükler:** MD: ${item.md || '-'}, ML: ${item.ml || '-'}, MW: ${item.mw || '-'}\n`;
      details += `- **Tercih Edilen Büyüklük:** ${item.preferred_mag || '-'}\n`;
      details += `- **Yer:** ${item.location}\n`;
      if (item.province) {
        details += `- **İl:** ${item.province}\n`;
      }
      details += `- **Durum:** ${item.status || '-'}\n`;
      details += `- **Kaynak:** ${item.source}\n\n`;
    });

    return details;
  }

  public generateFilename(isFiltered = false): string {
    return 'README.md';
  }

  public setTimezoneConfig(config: Partial<TimezoneConfig>): void {
    this.timezoneConfig = { ...this.timezoneConfig, ...config };
  }

  public clearCache(): void {
    this.reportCache = {};
  }

  public setBatchSize(size: number): void {
    this.batchSize = size;
  }

  public getCacheSize(): number {
    return Object.keys(this.reportCache).length;
  }
}
