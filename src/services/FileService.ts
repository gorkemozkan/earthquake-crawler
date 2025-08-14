import type { 
  IFileService, 
  FileOptions, 
  FileInfo, 
  ListFilesOptions 
} from '../types/index.js';
import fs from 'fs';
import path from 'path';

interface FileCache {
  [key: string]: { content: string; timestamp: number };
}

export class FileService implements IFileService {
  private defaultEncoding: BufferEncoding;
  private fileCache: FileCache;
  private cacheTimeout: number;
  private writeQueue: Promise<void>;

  constructor() {
    this.defaultEncoding = 'utf8';
    this.fileCache = {};
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.writeQueue = Promise.resolve();
  }

  public saveFile(content: string, filename: string, directory?: string, options: FileOptions = {}): string | null {
    const { encoding = this.defaultEncoding, overwrite = true } = options;
    
    try {
      const filepath = directory 
        ? path.join(directory, filename)
        : path.join(process.cwd(), filename);

      if (!overwrite && fs.existsSync(filepath)) {
        console.warn(`Dosya zaten mevcut: ${filename}`);
        return null;
      }

      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.writeQueue = this.writeQueue.then(async () => {
        await this.writeFileAsync(filepath, content, encoding);
      });

      console.log(`Dosya kaydedildi: ${filename}`);
      return filepath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya kaydedilemedi: ${errorMessage}`);
      return null;
    }
  }

  private async writeFileAsync(filepath: string, content: string, encoding: BufferEncoding): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, content, { encoding }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async saveFileAsync(content: string, filename: string, directory?: string, options: FileOptions = {}): Promise<string | null> {
    const { encoding = this.defaultEncoding, overwrite = true } = options;
    
    try {
      const filepath = directory 
        ? path.join(directory, filename)
        : path.join(process.cwd(), filename);

      if (!overwrite && await this.fileExistsAsync(filepath)) {
        console.warn(`Dosya zaten mevcut: ${filename}`);
        return null;
      }

      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await this.writeFileAsync(filepath, content, encoding);
      console.log(`Dosya kaydedildi: ${filename}`);
      return filepath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya kaydedilemedi: ${errorMessage}`);
      return null;
    }
  }

  public readFile(filepath: string, options: FileOptions = {}): string | null {
    const { encoding = this.defaultEncoding } = options;
    
    const cacheKey = this.generateCacheKey(filepath, encoding);

    const cached = this.fileCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Cache'den dosya okundu: ${path.basename(filepath)}`);
      return cached.content;
    }
    
    try {
      if (!fs.existsSync(filepath)) {
        console.error(`Dosya bulunamadı: ${filepath}`);
        return null;
      }

      const content = fs.readFileSync(filepath, { encoding });
      
      // Cache the result
      this.fileCache[cacheKey] = {
        content,
        timestamp: Date.now()
      };
      
      console.log(`Dosya okundu: ${path.basename(filepath)}`);
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya okunamadı: ${errorMessage}`);
      return null;
    }
  }

  public async readFileAsync(filepath: string, options: FileOptions = {}): Promise<string | null> {
    const { encoding = this.defaultEncoding } = options;
    
    // Check cache first
    const cacheKey = this.generateCacheKey(filepath, encoding);
    const cached = this.fileCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Cache'den dosya okundu: ${path.basename(filepath)}`);
      return cached.content;
    }
    
    try {
      if (!await this.fileExistsAsync(filepath)) {
        console.error(`Dosya bulunamadı: ${filepath}`);
        return null;
      }

      const content = await this.readFileAsyncInternal(filepath, encoding);
      
      // Cache the result
      this.fileCache[cacheKey] = {
        content,
        timestamp: Date.now()
      };
      
      console.log(`Dosya okundu: ${path.basename(filepath)}`);
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya okunamadı: ${errorMessage}`);
      return null;
    }
  }

  private async readFileAsyncInternal(filepath: string, encoding: BufferEncoding): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, { encoding }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private generateCacheKey(filepath: string, encoding: BufferEncoding): string {
    return `${filepath}_${encoding}`;
  }

  public deleteFile(filepath: string): boolean {
    try {
      if (!fs.existsSync(filepath)) {
        console.warn(`Dosya zaten mevcut değil: ${filepath}`);
        return true;
      }

      fs.unlinkSync(filepath);
      
      // Remove from cache
      this.removeFromCache(filepath);
      
      console.log(`Dosya silindi: ${path.basename(filepath)}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya silinemedi: ${errorMessage}`);
      return false;
    }
  }

  public async deleteFileAsync(filepath: string): Promise<boolean> {
    try {
      if (!await this.fileExistsAsync(filepath)) {
        console.warn(`Dosya zaten mevcut değil: ${filepath}`);
        return true;
      }

      await this.unlinkAsync(filepath);
      
      // Remove from cache
      this.removeFromCache(filepath);
      
      console.log(`Dosya silindi: ${path.basename(filepath)}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya silinemedi: ${errorMessage}`);
      return false;
    }
  }

  private async unlinkAsync(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private removeFromCache(filepath: string): void {
    const keysToRemove = Object.keys(this.fileCache).filter(key => key.startsWith(filepath));
    keysToRemove.forEach(key => delete this.fileCache[key]);
  }

  public fileExists(filepath: string): boolean {
    return fs.existsSync(filepath);
  }

  public async fileExistsAsync(filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filepath, fs.constants.F_OK, (err) => {
        resolve(!err);
      });
    });
  }

  public getFileInfo(filepath: string): FileInfo | null {
    try {
      if (!fs.existsSync(filepath)) {
        return null;
      }

      const stats = fs.statSync(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya bilgisi alınamadı: ${errorMessage}`);
      return null;
    }
  }

  public async getFileInfoAsync(filepath: string): Promise<FileInfo | null> {
    try {
      if (!await this.fileExistsAsync(filepath)) {
        return null;
      }

      const stats = await this.statAsync(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya bilgisi alınamadı: ${errorMessage}`);
      return null;
    }
  }

  private async statAsync(filepath: string): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
      fs.stat(filepath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      });
    });
  }

  public listFiles(directory: string, options: ListFilesOptions = {}): string[] {
    const { pattern, recursive = false } = options;
    
    try {
      if (!fs.existsSync(directory)) {
            console.warn(`Dizin bulunamadı: ${directory}`);
        return [];
      }

      const files = fs.readdirSync(directory, { recursive });
      
      if (pattern) {
        const regex = new RegExp(pattern);
        return files.filter((file): file is string => typeof file === 'string' && regex.test(file));
      }
      
      return files.filter((file): file is string => typeof file === 'string');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dizin listelenemedi: ${errorMessage}`);
      return [];
    }
  }

  public async listFilesAsync(directory: string, options: ListFilesOptions = {}): Promise<string[]> {
    const { pattern, recursive = false } = options;
    
    try {
      if (!await this.fileExistsAsync(directory)) {
        console.warn(`Dizin bulunamadı: ${directory}`);
        return [];
      }

      const files = await this.readdirAsync(directory, { recursive });
      
      if (pattern) {
        const regex = new RegExp(pattern);
        return files.filter((file): file is string => typeof file === 'string' && regex.test(file));
      }
      
      return files.filter((file): file is string => typeof file === 'string');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dizin listelenemedi: ${errorMessage}`);
      return [];
    }
  }

  private async readdirAsync(directory: string, options: { recursive?: boolean }): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, options, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files as string[]);
        }
      });
    });
  }

  public createBackup(filepath: string, backupSuffix = '.backup'): string | null {
    try {
      if (!fs.existsSync(filepath)) {
        console.warn(`Yedeklenecek dosya bulunamadı: ${filepath}`);
        return null;
      }

      const backupPath = filepath + backupSuffix;
      fs.copyFileSync(filepath, backupPath);
      console.log(`Yedek oluşturuldu: ${path.basename(backupPath)}`);
      return backupPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Yedek oluşturulamadı: ${errorMessage}`);
      return null;
    }
  }

  public async createBackupAsync(filepath: string, backupSuffix = '.backup'): Promise<string | null> {
    try {
      if (!await this.fileExistsAsync(filepath)) {
        console.warn(`Yedeklenecek dosya bulunamadı: ${filepath}`);
        return null;
      }

      const backupPath = filepath + backupSuffix;
      await this.copyFileAsync(filepath, backupPath);
      console.log(`Yedek oluşturuldu: ${path.basename(backupPath)}`);
      return backupPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Yedek oluşturulamadı: ${errorMessage}`);
      return null;
    }
  }

  private async copyFileAsync(src: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.copyFile(src, dest, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public setDefaultEncoding(encoding: BufferEncoding): void {
    this.defaultEncoding = encoding;
  }

  public clearCache(): void {
    this.fileCache = {};
  }

  public setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }

  public getCacheSize(): number {
    return Object.keys(this.fileCache).length;
  }
}
