/**
 * Utility helper functions
 */
/**
 * Safe number parsing that handles comma-separated decimals
 * @param value - The value to parse
 * @returns Parsed number or null if invalid
 */
export function parseNumber(value) {
    if (value == null)
        return null;
    const n = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : null;
}
/**
 * Extract the first <pre> block from HTML content
 * @param html - HTML content
 * @returns Content of the first <pre> block
 * @throws Error - If no <pre> block is found
 */
export function extractPreBlock(html) {
    const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (!match || !match[1]) {
        throw new Error("<pre> bloğu bulunamadı; sayfa formatı değişmiş olabilir.");
    }
    return match[1];
}
/**
 * Format date to Turkish locale string
 * @param date - Date to format
 * @param config - Timezone configuration
 * @returns Formatted date string
 */
export function formatTurkishDate(date, config) {
    return date.toLocaleString('tr-TR', config);
}
/**
 * Generate timestamp for file naming
 * @returns ISO timestamp without colons and periods
 */
export function generateTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
/**
 * Validate if a string contains valid earthquake data format
 * @param line - Line to validate
 * @returns True if valid earthquake data format
 */
export function isValidEarthquakeLine(line) {
    return /^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}:\d{2}/.test(line);
}
//# sourceMappingURL=helpers.js.map