/**
 * Earthquake data model
 */
import { parseNumber } from '../utils/helpers.js';
export class Earthquake {
    datetime;
    date;
    time;
    latitude;
    longitude;
    depth_km;
    md;
    ml;
    mw;
    preferred_mag;
    location;
    province;
    status;
    source;
    constructor(data) {
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
    /**
     * Get the preferred magnitude (ML -> MD -> MW priority)
     * @returns Preferred magnitude value
     */
    getPreferredMagnitude() {
        return this.preferred_mag;
    }
    /**
     * Check if earthquake has valid coordinates
     * @returns True if coordinates are valid
     */
    hasValidCoordinates() {
        return this.latitude != null && this.longitude != null;
    }
    /**
     * Get earthquake location as string
     * @returns Formatted location string
     */
    getLocationString() {
        if (this.province) {
            return `${this.location} (${this.province})`;
        }
        return this.location;
    }
    /**
     * Get formatted date and time
     * @returns Formatted date and time
     */
    getDateTimeString() {
        return `${this.date} ${this.time}`;
    }
    /**
     * Check if earthquake is in a specific province
     * @param provinceName - Province name to check
     * @returns True if earthquake is in the specified province
     */
    isInProvince(provinceName) {
        if (!provinceName)
            return false;
        const province = (this.province || '').toLowerCase();
        const location = (this.location || '').toLowerCase();
        const searchTerm = provinceName.toLowerCase();
        return province.includes(searchTerm) || location.includes(searchTerm);
    }
    /**
     * Get earthquake summary as object
     * @returns Summary object
     */
    getSummary() {
        return {
            datetime: this.datetime,
            date: this.date,
            time: this.time,
            magnitude: this.preferred_mag,
            depth: this.depth_km,
            location: this.location,
            province: this.province,
            coordinates: this.hasValidCoordinates() ? {
                latitude: this.latitude,
                longitude: this.longitude
            } : null
        };
    }
    /**
     * Create Earthquake instance from parsed row data
     * @param rowData - Parsed row data
     * @returns New Earthquake instance
     */
    static fromParsedRow(rowData) {
        return new Earthquake(rowData);
    }
    /**
     * Validate earthquake data
     * @returns True if data is valid
     */
    isValid() {
        return Boolean(this.datetime && this.date && this.time && this.hasValidCoordinates());
    }
    /**
     * Convert to plain object
     * @returns Plain object representation
     */
    toObject() {
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
//# sourceMappingURL=Earthquake.js.map