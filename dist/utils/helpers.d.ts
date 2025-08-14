/**
 * Utility helper functions
 */
import type { TimezoneConfig } from '../types/index.js';
/**
 * Safe number parsing that handles comma-separated decimals
 * @param value - The value to parse
 * @returns Parsed number or null if invalid
 */
export declare function parseNumber(value: string | number | null | undefined): number | null;
/**
 * Extract the first <pre> block from HTML content
 * @param html - HTML content
 * @returns Content of the first <pre> block
 * @throws Error - If no <pre> block is found
 */
export declare function extractPreBlock(html: string): string;
/**
 * Format date to Turkish locale string
 * @param date - Date to format
 * @param config - Timezone configuration
 * @returns Formatted date string
 */
export declare function formatTurkishDate(date: Date, config: TimezoneConfig): string;
/**
 * Generate timestamp for file naming
 * @returns ISO timestamp without colons and periods
 */
export declare function generateTimestamp(): string;
/**
 * Validate if a string contains valid earthquake data format
 * @param line - Line to validate
 * @returns True if valid earthquake data format
 */
export declare function isValidEarthquakeLine(line: string): boolean;
//# sourceMappingURL=helpers.d.ts.map