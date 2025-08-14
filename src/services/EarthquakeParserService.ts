import type { 
  IEarthquakeParserService, 
  EarthquakeData, 
  ParsingStatistics,
  StatusInfo 
} from '../types/index.js';
import { parseNumber, extractPreBlock, isValidEarthquakeLine } from '../utils/helpers.js';
import { Earthquake } from '../models/Earthquake.js';

export class EarthquakeParserService implements IEarthquakeParserService {
  private parsedCount: number;
  private errorCount: number;

  constructor() {
    this.parsedCount = 0;
    this.errorCount = 0;
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

    for (const line of lines) {
      try {
        const earthquake = this.parseLine(line);
        if (earthquake && earthquake.isValid()) {
          earthquakes.push(earthquake.toObject());
          this.parsedCount++;
        }
      } catch (error) {
        this.errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Satır parse hatası: ${errorMessage}`);
      }
    }
    
    console.log(`Parse sonucu: ${this.parsedCount} başarılı, ${this.errorCount} hatalı`);
    return earthquakes;
  }

  public parseLine(line: string): Earthquake | null {
    if (!isValidEarthquakeLine(line)) {
      return null;
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

    return Earthquake.fromParsedRow(earthquakeData);
  }

  private extractStatus(details: string): StatusInfo {
    const statusMatch = details.match(/\b(İlksel|ILKSEL|İLKSEL|REVIZE\d*|REVIZE)\b/i);
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
    const provinceMatch = details.match(/\(([^)]+)\)\s*$/);
    return provinceMatch && provinceMatch[1] ? provinceMatch[1] : null;
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
}
