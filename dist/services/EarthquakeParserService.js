/**
 * Earthquake data parsing service
 */
import { parseNumber, extractPreBlock, isValidEarthquakeLine } from '../utils/helpers.js';
import { Earthquake } from '../models/Earthquake.js';
export class EarthquakeParserService {
    parsedCount;
    errorCount;
    constructor() {
        this.parsedCount = 0;
        this.errorCount = 0;
    }
    /**
     * Parse earthquake data from HTML content
     * @param html - HTML content containing earthquake data
     * @returns Array of Earthquake instances
     */
    parseFromHtml(html) {
        try {
            const preContent = extractPreBlock(html);
            return this.parseFromPreContent(preContent);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`HTML parsing hatası: ${errorMessage}`);
        }
    }
    /**
     * Parse earthquake data from pre-formatted content
     * @param preContent - Pre-formatted content
     * @returns Array of Earthquake instances
     */
    parseFromPreContent(preContent) {
        const lines = preContent.split('\n');
        const earthquakes = [];
        this.parsedCount = 0;
        this.errorCount = 0;
        for (const line of lines) {
            try {
                const earthquake = this.parseLine(line);
                if (earthquake && earthquake.isValid()) {
                    earthquakes.push(earthquake.toObject());
                    this.parsedCount++;
                }
            }
            catch (error) {
                this.errorCount++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`⚠️  Satır parse hatası: ${errorMessage}`);
            }
        }
        console.log(`📊 Parse sonucu: ${this.parsedCount} başarılı, ${this.errorCount} hatalı`);
        return earthquakes;
    }
    /**
     * Parse a single line of earthquake data
     * @param line - Single line of earthquake data
     * @returns Parsed Earthquake instance or null
     */
    parseLine(line) {
        if (!isValidEarthquakeLine(line)) {
            return null;
        }
        const parts = line.trim().split(/\s+/);
        if (parts.length < 8) {
            throw new Error(`Yetersiz veri: ${parts.length} parça`);
        }
        const [date, time, lat, lon, depth, md, ml, mw, ...rest] = parts;
        let details = rest.join(" ").trim();
        // Validate required fields
        if (!date || !time) {
            throw new Error("Tarih veya saat bilgisi eksik");
        }
        // Parse status information
        const statusInfo = this.extractStatus(details);
        details = statusInfo.remainingDetails;
        // Parse province information
        const province = this.extractProvince(details);
        // Create ISO date with Turkey timezone
        const isoDate = date.replaceAll(".", "-");
        const when = new Date(`${isoDate}T${time}+03:00`);
        // Parse magnitude values
        const mdNum = parseNumber(md);
        const mlNum = parseNumber(ml);
        const mwNum = parseNumber(mw);
        const earthquakeData = {
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
    /**
     * Extract status information from location details
     * @param details - Location details string
     * @returns Object containing status and remaining details
     */
    extractStatus(details) {
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
    /**
     * Extract province information from location details
     * @param details - Location details string
     * @returns Province name or null
     */
    extractProvince(details) {
        const provinceMatch = details.match(/\(([^)]+)\)\s*$/);
        return provinceMatch && provinceMatch[1] ? provinceMatch[1] : null;
    }
    /**
     * Get parsing statistics
     * @returns Parsing statistics
     */
    getStatistics() {
        const total = this.parsedCount + this.errorCount;
        return {
            parsedCount: this.parsedCount,
            errorCount: this.errorCount,
            successRate: total > 0 ? this.parsedCount / total : 0
        };
    }
    /**
     * Reset parsing statistics
     */
    resetStatistics() {
        this.parsedCount = 0;
        this.errorCount = 0;
    }
}
//# sourceMappingURL=EarthquakeParserService.js.map