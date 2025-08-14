/**
 * Application constants and configuration
 */
import type { AppConstants } from '../types/index.js';
export declare const EARTHQUAKE_SOURCES: string[];
export declare const TIMEZONE_CONFIG: {
    timeZone: "Europe/Istanbul";
    year: "numeric";
    month: "2-digit";
    day: "2-digit";
    hour: "2-digit";
    minute: "2-digit";
    second: "2-digit";
};
export declare const FILE_PATTERNS: {
    readonly ALL_EARTHQUAKES: "README";
    readonly IZMIR_EARTHQUAKES: "README";
};
export declare const HTTP_CONFIG: {
    readonly headers: {
        readonly accept: "text/html";
    };
    readonly timeout: 10000;
};
export declare const DEBUG_CONFIG: {
    readonly showFirstItems: 3;
    readonly showSampleItems: 5;
};
export declare const CONSTANTS: AppConstants;
//# sourceMappingURL=constants.d.ts.map