/**
 * Earthquake filtering service
 */
import { DEBUG_CONFIG } from '../config/constants.js';
export class EarthquakeFilterService {
    filters;
    constructor() {
        this.filters = new Map();
        this.registerDefaultFilters();
    }
    /**
     * Register default filtering strategies
     */
    registerDefaultFilters() {
        this.registerFilter('izmir', this.filterByIzmir.bind(this));
        this.registerFilter('magnitude', this.filterByMagnitude.bind(this));
        this.registerFilter('date', this.filterByDate.bind(this));
        this.registerFilter('depth', this.filterByDepth.bind(this));
        this.registerFilter('province', this.filterByProvince.bind(this));
    }
    /**
     * Register a custom filter
     * @param name - Filter name
     * @param filterFunction - Filter function
     */
    registerFilter(name, filterFunction) {
        this.filters.set(name, filterFunction);
    }
    /**
     * Filter earthquakes using specified criteria
     * @param earthquakes - Array of earthquakes to filter
     * @param criteria - Filtering criteria
     * @returns Filtered earthquakes
     */
    filter(earthquakes, criteria = {}) {
        let filtered = [...earthquakes];
        for (const [filterName, filterValue] of Object.entries(criteria)) {
            const filterFunction = this.filters.get(filterName);
            if (filterFunction) {
                filtered = filterFunction(filtered, filterValue);
            }
        }
        return filtered;
    }
    /**
     * Filter earthquakes by Izmir location
     * @param earthquakes - Array of earthquakes
     * @param options - Filter options
     * @returns Filtered earthquakes
     */
    filterByIzmir(earthquakes, options = {}) {
        const { debug = false } = options;
        const filtered = earthquakes.filter(earthquake => {
            const location = (earthquake.location || '').toLowerCase();
            const province = (earthquake.province || '').toLowerCase();
            // Check province information first (most reliable)
            const provinceMatch = location.match(/\(([^)]+)\)/);
            if (provinceMatch && provinceMatch[1]) {
                const provinceInLocation = provinceMatch[1].toLowerCase();
                if (provinceInLocation.includes('izmir') || provinceInLocation.includes('ızmır')) {
                    return true;
                }
                // If it's another province, definitely not Izmir
                return false;
            }
            // If no province info, check location names
            const izmirSpecificKeywords = [
                'çeşme', 'cesme',
                'foça', 'foca',
                'karaburun',
                'urla',
                'seferihisar',
                'dikili',
                'bornova',
                'karşıyaka', 'karsiyaka',
                'konak',
                'buca',
                'gaziemir',
                'karabağlar', 'karabaglar',
                'alsancak',
                'göztepe', 'goztepe',
                'bostanlı', 'bostanli',
                'çiğli', 'cigli',
                'çeşmealtı', 'cesmealti',
                'sığacık', 'sigacik',
                'gümüldür', 'gumuldur',
                'zeytinler'
            ];
            return izmirSpecificKeywords.some(keyword => location.includes(keyword));
        });
        if (debug) {
            console.log(`🔍 İzmir filtresi: ${earthquakes.length} depremden ${filtered.length} tanesi İzmir ile ilgili`);
            if (filtered.length === 0 && earthquakes.length > 0) {
                console.log("⚠️  Hiç İzmir depremi bulunamadı. İlk 5 depremin detayları:");
                earthquakes.slice(0, DEBUG_CONFIG.showSampleItems).forEach((item, index) => {
                    console.log(`${index + 1}. Location: "${item.location}", Province: "${item.province}"`);
                });
            }
        }
        return filtered;
    }
    /**
     * Filter earthquakes by magnitude range
     * @param earthquakes - Array of earthquakes
     * @param range - Magnitude range {min, max}
     * @returns Filtered earthquakes
     */
    filterByMagnitude(earthquakes, range) {
        const { min = 0, max = Infinity } = range;
        return earthquakes.filter(earthquake => {
            const magnitude = earthquake.preferred_mag;
            return magnitude != null && magnitude >= min && magnitude <= max;
        });
    }
    /**
     * Filter earthquakes by date range
     * @param earthquakes - Array of earthquakes
     * @param range - Date range {start, end}
     * @returns Filtered earthquakes
     */
    filterByDate(earthquakes, range) {
        const { start, end } = range;
        return earthquakes.filter(earthquake => {
            const earthquakeDate = new Date(earthquake.datetime);
            const startDate = start ? new Date(start) : new Date(0);
            const endDate = end ? new Date(end) : new Date();
            return earthquakeDate >= startDate && earthquakeDate <= endDate;
        });
    }
    /**
     * Filter earthquakes by depth range
     * @param earthquakes - Array of earthquakes
     * @param range - Depth range {min, max}
     * @returns Filtered earthquakes
     */
    filterByDepth(earthquakes, range) {
        const { min = 0, max = Infinity } = range;
        return earthquakes.filter(earthquake => {
            const depth = earthquake.depth_km;
            return depth != null && depth >= min && depth <= max;
        });
    }
    /**
     * Filter earthquakes by province
     * @param earthquakes - Array of earthquakes
     * @param provinceName - Province name to filter by
     * @returns Filtered earthquakes
     */
    filterByProvince(earthquakes, provinceName) {
        if (!provinceName)
            return earthquakes;
        return earthquakes.filter(earthquake => {
            const province = (earthquake.province || '').toLowerCase();
            const location = (earthquake.location || '').toLowerCase();
            const searchTerm = provinceName.toLowerCase();
            return province.includes(searchTerm) || location.includes(searchTerm);
        });
    }
    /**
     * Get available filter names
     * @returns Array of filter names
     */
    getAvailableFilters() {
        return Array.from(this.filters.keys());
    }
    /**
     * Get filter statistics
     * @param original - Original earthquake array
     * @param filtered - Filtered earthquake array
     * @returns Filter statistics
     */
    getFilterStatistics(original, filtered) {
        return {
            originalCount: original.length,
            filteredCount: filtered.length,
            reductionPercentage: ((original.length - filtered.length) / original.length * 100).toFixed(2)
        };
    }
}
//# sourceMappingURL=EarthquakeFilterService.js.map