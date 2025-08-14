import type { 
  IFileService, 
  FileOptions, 
  FileInfo, 
  ListFilesOptions 
} from '../types/index.js';
import fs from 'fs';
import path from 'path';

export class FileService implements IFileService {
  private defaultEncoding: BufferEncoding;

  constructor() {
    this.defaultEncoding = 'utf8';
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

      fs.writeFileSync(filepath, content, { encoding });
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
    
    try {
      if (!fs.existsSync(filepath)) {
        console.error(`Dosya bulunamadı: ${filepath}`);
        return null;
      }

      const content = fs.readFileSync(filepath, { encoding });
      console.log(`Dosya okundu: ${path.basename(filepath)}`);
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya okunamadı: ${errorMessage}`);
      return null;
    }
  }

  public deleteFile(filepath: string): boolean {
    try {
      if (!fs.existsSync(filepath)) {
        console.warn(`Dosya zaten mevcut değil: ${filepath}`);
        return true;
      }

      fs.unlinkSync(filepath);
      console.log(`Dosya silindi: ${path.basename(filepath)}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Dosya silinemedi: ${errorMessage}`);
      return false;
    }
  }

  public fileExists(filepath: string): boolean {
    return fs.existsSync(filepath);
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


  public setDefaultEncoding(encoding: BufferEncoding): void {
    this.defaultEncoding = encoding;
  }
}
