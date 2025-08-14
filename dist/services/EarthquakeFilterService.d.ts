/**
 * Earthquake filtering service
 */
import type { IEarthquakeFilterService, EarthquakeData, FilterCriteria, FilterStatistics } from '../types/index.js';
type FilterFunction = (earthquakes: EarthquakeData[], criteria: any) => EarthquakeData[];
export declare class EarthquakeFilterService implements IEarthquakeFilterService {
    private filters;
    constructor();
    /**
     * Register default filtering strategies
     */
    private registerDefaultFilters;
    /**
     * Register a custom filter
     * @param name - Filter name
     * @param filterFunction - Filter function
     */
    registerFilter(name: string, filterFunction: FilterFunction): void;
    /**
     * Filter earthquakes using specified criteria
     * @param earthquakes - Array of earthquakes to filter
     * @param criteria - Filtering criteria
     * @returns Filtered earthquakes
     */
    filter(earthquakes: EarthquakeData[], criteria?: FilterCriteria): EarthquakeData[];
    /**
     * Filter earthquakes by Izmir location
     * @param earthquakes - Array of earthquakes
     * @param options - Filter options
     * @returns Filtered earthquakes
     */
    private filterByIzmir;
    /**
     * Filter earthquakes by magnitude range
     * @param earthquakes - Array of earthquakes
     * @param range - Magnitude range {min, max}
     * @returns Filtered earthquakes
     */
    private filterByMagnitude;
    /**
     * Filter earthquakes by date range
     * @param earthquakes - Array of earthquakes
     * @param range - Date range {start, end}
     * @returns Filtered earthquakes
     */
    private filterByDate;
    /**
     * Filter earthquakes by depth range
     * @param earthquakes - Array of earthquakes
     * @param range - Depth range {min, max}
     * @returns Filtered earthquakes
     */
    private filterByDepth;
    /**
     * Filter earthquakes by province
     * @param earthquakes - Array of earthquakes
     * @param provinceName - Province name to filter by
     * @returns Filtered earthquakes
     */
    private filterByProvince;
    /**
     * Get available filter names
     * @returns Array of filter names
     */
    getAvailableFilters(): string[];
    /**
     * Get filter statistics
     * @param original - Original earthquake array
     * @param filtered - Filtered earthquake array
     * @returns Filter statistics
     */
    getFilterStatistics(original: EarthquakeData[], filtered: EarthquakeData[]): FilterStatistics;
}
export {};
//# sourceMappingURL=EarthquakeFilterService.d.ts.map