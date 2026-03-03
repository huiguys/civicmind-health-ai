/**
 * PDF Cache Service
 * Caches generated PDFs to avoid regenerating the same report multiple times
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PDFCacheService {
  constructor() {
    this.cacheDir = path.join(__dirname, '../cache/pdfs');
    this.memoryCache = new Map(); // In-memory cache for faster access
    this.maxMemoryCacheSize = 50; // Maximum number of PDFs to keep in memory
    
    // Create cache directory if it doesn't exist
    this.ensureCacheDirectory();
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      console.log('📁 PDF cache directory created:', this.cacheDir);
    }
  }

  /**
   * Generate cache key from report and patient data
   * @param {string} reportId - Report ID
   * @param {string} patientId - Patient ID
   * @returns {string} Cache key
   */
  generateCacheKey(reportId, patientId) {
    const data = `${reportId}-${patientId}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Get cached PDF if it exists
   * @param {string} reportId - Report ID
   * @param {string} patientId - Patient ID
   * @returns {Buffer|null} PDF buffer or null if not cached
   */
  get(reportId, patientId) {
    const cacheKey = this.generateCacheKey(reportId, patientId);
    
    // Check memory cache first (fastest)
    if (this.memoryCache.has(cacheKey)) {
      console.log('✅ PDF found in memory cache:', reportId);
      return this.memoryCache.get(cacheKey);
    }
    
    // Check disk cache
    const filePath = path.join(this.cacheDir, `${cacheKey}.pdf`);
    if (fs.existsSync(filePath)) {
      console.log('✅ PDF found in disk cache:', reportId);
      const buffer = fs.readFileSync(filePath);
      
      // Add to memory cache for faster future access
      this.addToMemoryCache(cacheKey, buffer);
      
      return buffer;
    }
    
    console.log('❌ PDF not in cache, will generate:', reportId);
    return null;
  }

  /**
   * Store PDF in cache
   * @param {string} reportId - Report ID
   * @param {string} patientId - Patient ID
   * @param {Buffer} pdfBuffer - PDF buffer to cache
   */
  set(reportId, patientId, pdfBuffer) {
    const cacheKey = this.generateCacheKey(reportId, patientId);
    
    // Store in memory cache
    this.addToMemoryCache(cacheKey, pdfBuffer);
    
    // Store in disk cache
    const filePath = path.join(this.cacheDir, `${cacheKey}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);
    
    console.log('💾 PDF cached:', reportId, `(${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
  }

  /**
   * Add PDF to memory cache with LRU eviction
   * @param {string} cacheKey - Cache key
   * @param {Buffer} pdfBuffer - PDF buffer
   */
  addToMemoryCache(cacheKey, pdfBuffer) {
    // If cache is full, remove oldest entry (LRU)
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(cacheKey, pdfBuffer);
  }

  /**
   * Clear specific PDF from cache
   * @param {string} reportId - Report ID
   * @param {string} patientId - Patient ID
   */
  clear(reportId, patientId) {
    const cacheKey = this.generateCacheKey(reportId, patientId);
    
    // Remove from memory cache
    this.memoryCache.delete(cacheKey);
    
    // Remove from disk cache
    const filePath = path.join(this.cacheDir, `${cacheKey}.pdf`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  PDF removed from cache:', reportId);
    }
  }

  /**
   * Clear all cached PDFs
   */
  clearAll() {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear disk cache
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      console.log('🗑️  All PDFs cleared from cache');
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const diskFiles = fs.existsSync(this.cacheDir) 
      ? fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.pdf')).length 
      : 0;
    
    let totalDiskSize = 0;
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const stats = fs.statSync(path.join(this.cacheDir, file));
          totalDiskSize += stats.size;
        }
      }
    }
    
    return {
      memoryCacheSize: this.memoryCache.size,
      diskCacheSize: diskFiles,
      totalDiskSizeKB: (totalDiskSize / 1024).toFixed(2),
      maxMemoryCacheSize: this.maxMemoryCacheSize
    };
  }
}

module.exports = new PDFCacheService();
