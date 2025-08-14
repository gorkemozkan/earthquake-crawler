export interface EarthquakeData {
  datetime: string;
  date: string;
  time: string;
  latitude: number | null;
  longitude: number | null;
  depth_km: number | null;
  md: number | null;
  ml: number | null;
  mw: number | null;
  preferred_mag: number | null;
  location: string;
  province: string | null;
  status: string | null;
  source: string;
}

export interface EarthquakeCoordinates {
  latitude: number;
  longitude: number;
}

export interface EarthquakeSummary {
  datetime: string;
  date: string;
  time: string;
  magnitude: number | null;
  depth: number | null;
  location: string;
  province: string | null;
  coordinates: EarthquakeCoordinates | null;
}

export interface ReportMetadata {
  source?: string;
  isFiltered?: boolean;
  filterType?: string;
  generatedAt?: string;
}

export interface JsonReport {
  source: string;
  count: number;
  isFiltered: boolean;
  generatedAt: string;
  items: EarthquakeData[];
}

export interface FilterCriteria {
  izmir?: { debug?: boolean };
  magnitude?: { min?: number; max?: number };
  date?: { start?: string; end?: string };
  depth?: { min?: number; max?: number };
  province?: string;
  [key: string]: any;
}

export interface FilterStatistics {
  originalCount: number;
  filteredCount: number;
  reductionPercentage: string;
}

export interface ParsingStatistics {
  parsedCount: number;
  errorCount: number;
  successRate: number;
}

export interface ConnectivityResult {
  url: string;
  accessible: boolean;
  status?: number;
  responseTime?: number;
  error?: string;
}

export interface HttpConfig {
  headers: Record<string, string>;
  timeout: number;
}

export interface TimezoneConfig {
  timeZone: string;
  year: 'numeric';
  month: '2-digit';
  day: '2-digit';
  hour: '2-digit';
  minute: '2-digit';
  second: '2-digit';
}

export interface FilePatterns {
  ALL_EARTHQUAKES: string;
  IZMIR_EARTHQUAKES: string;
}

export interface DebugConfig {
  showFirstItems: number;
  showSampleItems: number;
}


export interface AppConstants {
  EARTHQUAKE_SOURCES: string[];
  TIMEZONE_CONFIG: TimezoneConfig;
  FILE_PATTERNS: FilePatterns;
  HTTP_CONFIG: HttpConfig;
  DEBUG_CONFIG: DebugConfig;
}

export interface AppOptions {
  filterByIzmir?: boolean;
  generateJson?: boolean;
  generateMarkdown?: boolean;
  debug?: boolean;
  testConnectivity?: boolean;
}

export interface ProcessingResults {
  source: string;
  totalCount: number;
  filteredCount: number;
  filterStats: FilterStatistics | null;
  filterCriteria?: FilterCriteria;
  reports: {
    json?: JsonReport;
    markdown?: {
      content: string;
      filename: string;
      savedPath: string | null;
    };
  };
}

export interface FileOptions {
  encoding?: BufferEncoding;
  overwrite?: boolean;
}

export interface FileInfo {
  size: number;
  created: Date;
  modified: Date;
  isFile: boolean;
  isDirectory: boolean;
}

export interface ListFilesOptions {
  pattern?: string;
  recursive?: boolean;
}

export interface IDataFetcherService {
  fetchHtml(): Promise<{ url: string; html: string }>;
  setSources(sources: string[]): void;
  setHttpConfig(config: Partial<HttpConfig>): void;
  testConnectivity(): Promise<ConnectivityResult[]>;
  clearCache(): void;
  setCacheTimeout(timeout: number): void;
  abortAllConnections(): void;
}

export interface IEarthquakeParserService {
  parseFromHtml(html: string): EarthquakeData[];
  parseFromPreContent(preContent: string): EarthquakeData[];
  parseLine(line: string): EarthquakeData | null;
  getStatistics(): ParsingStatistics;
  resetStatistics(): void;
  clearCache(): void;
  setBatchSize(size: number): void;
  getCacheSize(): number;
}

export interface IEarthquakeFilterService {
  filter(earthquakes: EarthquakeData[], criteria?: FilterCriteria): EarthquakeData[];
  registerFilter(name: string, filterFunction: (earthquakes: EarthquakeData[], criteria: any) => EarthquakeData[]): void;
  getAvailableFilters(): string[];
  getFilterStatistics(original: EarthquakeData[], filtered: EarthquakeData[]): FilterStatistics;
  clearCache(): void;
  setBatchSize(size: number): void;
  getCacheSize(): number;
}

export interface IReportGeneratorService {
  generateJsonReport(earthquakes: EarthquakeData[], metadata?: ReportMetadata): JsonReport;
  generateMarkdownReport(earthquakes: EarthquakeData[], metadata?: ReportMetadata): string;
  generateFilename(isFiltered?: boolean): string;
  setTimezoneConfig(config: Partial<TimezoneConfig>): void;
  clearCache(): void;
  setBatchSize(size: number): void;
  getCacheSize(): number;
}

export interface IFileService {
  saveFile(content: string, filename: string, directory?: string, options?: FileOptions): string | null;
  saveFileAsync(content: string, filename: string, directory?: string, options?: FileOptions): Promise<string | null>;
  readFile(filepath: string, options?: FileOptions): string | null;
  readFileAsync(filepath: string, options?: FileOptions): Promise<string | null>;
  deleteFile(filepath: string): boolean;
  deleteFileAsync(filepath: string): Promise<boolean>;
  fileExists(filepath: string): boolean;
  fileExistsAsync(filepath: string): Promise<boolean>;
  getFileInfo(filepath: string): FileInfo | null;
  getFileInfoAsync(filepath: string): Promise<FileInfo | null>;
  listFiles(directory: string, options?: ListFilesOptions): string[];
  listFilesAsync(directory: string, options?: ListFilesOptions): Promise<string[]>;
  createBackup(filepath: string, backupSuffix?: string): string | null;
  createBackupAsync(filepath: string, backupSuffix?: string): Promise<string | null>;
  setDefaultEncoding(encoding: string): void;
  clearCache(): void;
  setCacheTimeout(timeout: number): void;
  getCacheSize(): number;
}

export interface ServiceContainer {
  dataFetcher: IDataFetcherService;
  parser: IEarthquakeParserService;
  filter: IEarthquakeFilterService;
  reportGenerator: IReportGeneratorService;
  fileService: IFileService;
}

export interface StatusInfo {
  status: string | null;
  remainingDetails: string;
}
