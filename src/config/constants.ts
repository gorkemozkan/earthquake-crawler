import type { AppConstants } from '../types/index.js';

export const EARTHQUAKE_SOURCES: string[] = [
  "https://www.koeri.boun.edu.tr/scripts/lst0.asp",
  "http://www.koeri.boun.edu.tr/scripts/lst0.asp",
  "https://www.koeri.boun.edu.tr/scripts/lst1.asp",
];

export const TIMEZONE_CONFIG = {
  timeZone: 'Europe/Istanbul' as const,
  year: 'numeric' as const,
  month: '2-digit' as const,
  day: '2-digit' as const,
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  second: '2-digit' as const
};

export const FILE_PATTERNS = {
  ALL_EARTHQUAKES: 'README',
  IZMIR_EARTHQUAKES: 'README'
} as const;

export const HTTP_CONFIG = {
  headers: { 
    accept: "text/html" 
  },
  timeout: 10000
} as const;

export const DEBUG_CONFIG = {
  showFirstItems: 3,
  showSampleItems: 5
} as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Cache settings
  DEFAULT_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  
  // Batch processing settings
  DEFAULT_PARSER_BATCH_SIZE: 1000,
  DEFAULT_FILTER_BATCH_SIZE: 1000,
  DEFAULT_REPORT_BATCH_SIZE: 500,
  
  // Memory management
  ENABLE_MEMORY_MONITORING: true,
  MEMORY_WARNING_THRESHOLD: 80, // percentage
  
  // Connection settings
  MAX_CONCURRENT_CONNECTIONS: 5,
  CONNECTION_RETRY_ATTEMPTS: 3,
  
  // File I/O settings
  ENABLE_ASYNC_FILE_OPERATIONS: true,
  FILE_WRITE_QUEUE_SIZE: 10,
  
  // Processing settings
  ENABLE_PARALLEL_PROCESSING: true,
  MAX_WORKER_THREADS: 4
} as const;

export const CONSTANTS: AppConstants = {
  EARTHQUAKE_SOURCES,
  TIMEZONE_CONFIG,
  FILE_PATTERNS,
  HTTP_CONFIG,
  DEBUG_CONFIG
};

export const IZMIR_SPECIFIC_KEYWORDS = [
  'çeşme',
  'cesme',
  'foça',
  'foca',
  'karaburun',
  'urla',
  'seferihisar',
  'dikili',
  'bornova',
  'karşıyaka',
  'karsiyaka',
  'konak',
  'buca',
  'gaziemir',
  'karabağlar',
  'karabaglar',
  'alsancak',
  'göztepe',
  'goztepe',
  'bostanlı',
  'bostanli',
  'çiğli',
  'cigli',
  'çeşmealtı', 
  'cesmealti',
  'sığacık',
  'sigacik',
  'gümüldür',
  'gumuldur',
  'zeytinler'
];