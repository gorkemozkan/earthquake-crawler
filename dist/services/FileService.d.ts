/**
 * File operations service
 */
import type { IFileService, FileOptions, FileInfo, ListFilesOptions } from '../types/index.js';
export declare class FileService implements IFileService {
    private defaultEncoding;
    constructor();
    /**
     * Save content to file
     * @param content - Content to save
     * @param filename - Filename
     * @param directory - Directory path (optional)
     * @param options - File options
     * @returns File path if successful, null if failed
     */
    saveFile(content: string, filename: string, directory?: string, options?: FileOptions): string | null;
    /**
     * Read file content
     * @param filepath - File path
     * @param options - Read options
     * @returns File content or null if failed
     */
    readFile(filepath: string, options?: FileOptions): string | null;
    /**
     * Delete file
     * @param filepath - File path
     * @returns True if successful
     */
    deleteFile(filepath: string): boolean;
    /**
     * Check if file exists
     * @param filepath - File path
     * @returns True if file exists
     */
    fileExists(filepath: string): boolean;
    /**
     * Get file information
     * @param filepath - File path
     * @returns File stats or null if failed
     */
    getFileInfo(filepath: string): FileInfo | null;
    /**
     * List files in directory
     * @param directory - Directory path
     * @param options - List options
     * @returns Array of file names
     */
    listFiles(directory: string, options?: ListFilesOptions): string[];
    /**
     * Create backup of file
     * @param filepath - Original file path
     * @param backupSuffix - Backup suffix
     * @returns Backup file path or null if failed
     */
    createBackup(filepath: string, backupSuffix?: string): string | null;
    /**
     * Set default encoding
     * @param encoding - Default encoding
     */
    setDefaultEncoding(encoding: BufferEncoding): void;
}
//# sourceMappingURL=FileService.d.ts.map