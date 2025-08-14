/**
 * File operations service
 */
import fs from 'fs';
import path from 'path';
export class FileService {
    defaultEncoding;
    constructor() {
        this.defaultEncoding = 'utf8';
    }
    /**
     * Save content to file
     * @param content - Content to save
     * @param filename - Filename
     * @param directory - Directory path (optional)
     * @param options - File options
     * @returns File path if successful, null if failed
     */
    saveFile(content, filename, directory, options = {}) {
        const { encoding = this.defaultEncoding, overwrite = true } = options;
        try {
            const filepath = directory
                ? path.join(directory, filename)
                : path.join(process.cwd(), filename);
            // Check if file exists and overwrite is disabled
            if (!overwrite && fs.existsSync(filepath)) {
                console.warn(`⚠️  Dosya zaten mevcut: ${filename}`);
                return null;
            }
            // Ensure directory exists
            const dir = path.dirname(filepath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filepath, content, { encoding });
            console.log(`📄 Dosya kaydedildi: ${filename}`);
            return filepath;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Dosya kaydedilemedi: ${errorMessage}`);
            return null;
        }
    }
    /**
     * Read file content
     * @param filepath - File path
     * @param options - Read options
     * @returns File content or null if failed
     */
    readFile(filepath, options = {}) {
        const { encoding = this.defaultEncoding } = options;
        try {
            if (!fs.existsSync(filepath)) {
                console.error(`❌ Dosya bulunamadı: ${filepath}`);
                return null;
            }
            const content = fs.readFileSync(filepath, { encoding });
            console.log(`📖 Dosya okundu: ${path.basename(filepath)}`);
            return content;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Dosya okunamadı: ${errorMessage}`);
            return null;
        }
    }
    /**
     * Delete file
     * @param filepath - File path
     * @returns True if successful
     */
    deleteFile(filepath) {
        try {
            if (!fs.existsSync(filepath)) {
                console.warn(`⚠️  Dosya zaten mevcut değil: ${filepath}`);
                return true;
            }
            fs.unlinkSync(filepath);
            console.log(`🗑️  Dosya silindi: ${path.basename(filepath)}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Dosya silinemedi: ${errorMessage}`);
            return false;
        }
    }
    /**
     * Check if file exists
     * @param filepath - File path
     * @returns True if file exists
     */
    fileExists(filepath) {
        return fs.existsSync(filepath);
    }
    /**
     * Get file information
     * @param filepath - File path
     * @returns File stats or null if failed
     */
    getFileInfo(filepath) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Dosya bilgisi alınamadı: ${errorMessage}`);
            return null;
        }
    }
    /**
     * List files in directory
     * @param directory - Directory path
     * @param options - List options
     * @returns Array of file names
     */
    listFiles(directory, options = {}) {
        const { pattern, recursive = false } = options;
        try {
            if (!fs.existsSync(directory)) {
                console.warn(`⚠️  Dizin bulunamadı: ${directory}`);
                return [];
            }
            const files = fs.readdirSync(directory, { recursive });
            if (pattern) {
                const regex = new RegExp(pattern);
                return files.filter((file) => typeof file === 'string' && regex.test(file));
            }
            return files.filter((file) => typeof file === 'string');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Dizin listelenemedi: ${errorMessage}`);
            return [];
        }
    }
    /**
     * Create backup of file
     * @param filepath - Original file path
     * @param backupSuffix - Backup suffix
     * @returns Backup file path or null if failed
     */
    createBackup(filepath, backupSuffix = '.backup') {
        try {
            if (!fs.existsSync(filepath)) {
                console.warn(`⚠️  Yedeklenecek dosya bulunamadı: ${filepath}`);
                return null;
            }
            const backupPath = filepath + backupSuffix;
            fs.copyFileSync(filepath, backupPath);
            console.log(`💾 Yedek oluşturuldu: ${path.basename(backupPath)}`);
            return backupPath;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Yedek oluşturulamadı: ${errorMessage}`);
            return null;
        }
    }
    /**
     * Set default encoding
     * @param encoding - Default encoding
     */
    setDefaultEncoding(encoding) {
        this.defaultEncoding = encoding;
    }
}
//# sourceMappingURL=FileService.js.map