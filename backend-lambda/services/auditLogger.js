/**
 * Audit Logger Service
 * Logs PDF generation events for ABHA compliance
 */

const fs = require('fs');
const path = require('path');

class AuditLogger {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/pdf-audit.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Log PDF generation event
   */
  logPDFGeneration(eventData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'PDF_GENERATION',
      userId: eventData.userId,
      userRole: eventData.userRole,
      reportId: eventData.reportId,
      patientId: eventData.patientId,
      success: eventData.success,
      error: eventData.error || null,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}

module.exports = new AuditLogger();
