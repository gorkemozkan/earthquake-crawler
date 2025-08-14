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
