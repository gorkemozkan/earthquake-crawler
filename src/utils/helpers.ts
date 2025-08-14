import type { TimezoneConfig } from '../types/index.js';

export function parseNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function extractPreBlock(html: string): string {
  const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (!match || !match[1]) {
    throw new Error("<pre> bloğu bulunamadı; sayfa formatı değişmiş olabilir.");
  }
  return match[1];
}

export function formatTurkishDate(date: Date, config: TimezoneConfig): string {
  return date.toLocaleString('tr-TR', config);
}

export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export function isValidEarthquakeLine(line: string): boolean {
  return /^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}:\d{2}/.test(line);
}

export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number>;

  constructor() {
    this.startTime = Date.now();
    this.checkpoints = new Map();
  }

  public start(): void {
    this.startTime = Date.now();
    this.checkpoints.clear();
  }

  public checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now());
  }

  public getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  public getCheckpointTime(name: string): number | null {
    const checkpointTime = this.checkpoints.get(name);
    if (!checkpointTime) return null;
    return checkpointTime - this.startTime;
  }

  public getTimeBetweenCheckpoints(startName: string, endName: string): number | null {
    const startTime = this.checkpoints.get(startName);
    const endTime = this.checkpoints.get(endName);
    if (!startTime || !endTime) return null;
    return endTime - startTime;
  }

  public printSummary(): void {
    console.log("\n" + "=".repeat(50));
    console.log("PERFORMANCE SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total Time: ${this.getElapsedTime()}ms`);
    
    let previousTime = this.startTime;
    for (const [name, time] of this.checkpoints.entries()) {
      const duration = time - previousTime;
      console.log(`${name}: ${duration}ms`);
      previousTime = time;
    }
    console.log("=".repeat(50));
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  const memUsage = process.memoryUsage();
  const used = Math.round(memUsage.heapUsed / 1024 / 1024);
  const total = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentage = Math.round((used / total) * 100);
  
  return { used, total, percentage };
}

export function logMemoryUsage(label: string): void {
  const { used, total, percentage } = getMemoryUsage();
  console.log(`Memory Usage (${label}): ${used}MB / ${total}MB (${percentage}%)`);
}

// Batch processing utilities
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function processBatch<T, R>(
  items: T[], 
  processor: (item: T) => Promise<R> | R, 
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  const chunks = chunkArray(items, batchSize);
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
  }
  
  return results;
}

// Caching utilities
export class SimpleCache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private timeout: number;

  constructor(timeout: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.timeout = timeout;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.timeout) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  public set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Optimized string utilities
export function fastStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
