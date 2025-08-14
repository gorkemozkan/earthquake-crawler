import type { 
  EarthquakeData, 
  EarthquakeCoordinates, 
  EarthquakeSummary 
} from '../types/index.js';

export class Earthquake implements EarthquakeData {
  public readonly datetime: string;
  public readonly date: string;
  public readonly time: string;
  public readonly latitude: number | null;
  public readonly longitude: number | null;
  public readonly depth_km: number | null;
  public readonly md: number | null;
  public readonly ml: number | null;
  public readonly mw: number | null;
  public readonly preferred_mag: number | null;
  public readonly location: string;
  public readonly province: string | null;
  public readonly status: string | null;
  public readonly source: string;

  constructor(data: EarthquakeData) {
    this.datetime = data.datetime;
    this.date = data.date;
    this.time = data.time;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.depth_km = data.depth_km;
    this.md = data.md;
    this.ml = data.ml;
    this.mw = data.mw;
    this.preferred_mag = data.preferred_mag;
    this.location = data.location;
    this.province = data.province;
    this.status = data.status;
    this.source = data.source;
  }

  public getPreferredMagnitude(): number | null {
    return this.preferred_mag;
  }

  public hasValidCoordinates(): boolean {
    return this.latitude != null && this.longitude != null;
  }

  public getLocationString(): string {
    if (this.province) {
      return `${this.location} (${this.province})`;
    }
    return this.location;
  }

  public getDateTimeString(): string {
    return `${this.date} ${this.time}`;
  }

  public isInProvince(provinceName: string): boolean {
    if (!provinceName) return false;
    const province = (this.province || '').toLowerCase();
    const location = (this.location || '').toLowerCase();
    const searchTerm = provinceName.toLowerCase();
    
    return province.includes(searchTerm) || location.includes(searchTerm);
  }

  public getSummary(): EarthquakeSummary {
    return {
      datetime: this.datetime,
      date: this.date,
      time: this.time,
      magnitude: this.preferred_mag,
      depth: this.depth_km,
      location: this.location,
      province: this.province,
      coordinates: this.hasValidCoordinates() ? {
        latitude: this.latitude!,
        longitude: this.longitude!
      } : null
    };
  }

  public static fromParsedRow(rowData: EarthquakeData): Earthquake {
    return new Earthquake(rowData);
  }

  public isValid(): boolean {
    return Boolean(this.datetime && this.date && this.time && this.hasValidCoordinates());
  }

  public toObject(): EarthquakeData {
    return {
      datetime: this.datetime,
      date: this.date,
      time: this.time,
      latitude: this.latitude,
      longitude: this.longitude,
      depth_km: this.depth_km,
      md: this.md,
      ml: this.ml,
      mw: this.mw,
      preferred_mag: this.preferred_mag,
      location: this.location,
      province: this.province,
      status: this.status,
      source: this.source
    };
  }
}
