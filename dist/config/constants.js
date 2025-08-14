/**
 * Application constants and configuration
 */
// Data sources for earthquake data
export const EARTHQUAKE_SOURCES = [
    "https://www.koeri.boun.edu.tr/scripts/lst0.asp",
    "http://www.koeri.boun.edu.tr/scripts/lst0.asp",
    "https://www.koeri.boun.edu.tr/scripts/lst1.asp", // backup
];
// Timezone configuration
export const TIMEZONE_CONFIG = {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
};
// File naming patterns
export const FILE_PATTERNS = {
    ALL_EARTHQUAKES: 'README',
    IZMIR_EARTHQUAKES: 'README'
};
// HTTP request configuration
export const HTTP_CONFIG = {
    headers: {
        accept: "text/html"
    },
    timeout: 10000
};
// Debug configuration
export const DEBUG_CONFIG = {
    showFirstItems: 3,
    showSampleItems: 5
};
// Export all constants as a single object for type checking
export const CONSTANTS = {
    EARTHQUAKE_SOURCES,
    TIMEZONE_CONFIG,
    FILE_PATTERNS,
    HTTP_CONFIG,
    DEBUG_CONFIG
};
//# sourceMappingURL=constants.js.map