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