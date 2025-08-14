/**
 * Earthquake data model
 */
import type { EarthquakeData, EarthquakeSummary } from '../types/index.js';
export declare class Earthquake implements EarthquakeData {
    readonly datetime: string;
    readonly date: string;
    readonly time: string;
    readonly latitude: number | null;
    readonly longitude: number | null;
    readonly depth_km: number | null;
    readonly md: number | null;
    readonly ml: number | null;
    readonly mw: number | null;
    readonly preferred_mag: number | null;
    readonly location: string;
    readonly province: string | null;
    readonly status: string | null;
    readonly source: string;
    constructor(data: EarthquakeData);
    /**
     * Get the preferred magnitude (ML -> MD -> MW priority)
     * @returns Preferred magnitude value
     */
    getPreferredMagnitude(): number | null;
    /**
     * Check if earthquake has valid coordinates
     * @returns True if coordinates are valid
     */
    hasValidCoordinates(): boolean;
    /**
     * Get earthquake location as string
     * @returns Formatted location string
     */
    getLocationString(): string;
    /**
     * Get formatted date and time
     * @returns Formatted date and time
     */
    getDateTimeString(): string;
    /**
     * Check if earthquake is in a specific province
     * @param provinceName - Province name to check
     * @returns True if earthquake is in the specified province
     */
    isInProvince(provinceName: string): boolean;
    /**
     * Get earthquake summary as object
     * @returns Summary object
     */
    getSummary(): EarthquakeSummary;
    /**
     * Create Earthquake instance from parsed row data
     * @param rowData - Parsed row data
     * @returns New Earthquake instance
     */
    static fromParsedRow(rowData: EarthquakeData): Earthquake;
    /**
     * Validate earthquake data
     * @returns True if data is valid
     */
    isValid(): boolean;
    /**
     * Convert to plain object
     * @returns Plain object representation
     */
    toObject(): EarthquakeData;
}
//# sourceMappingURL=Earthquake.d.ts.map