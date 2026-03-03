/**
 * PDF Controller
 * Handles PDF generation requests for medical reports
 */

const pdfGeneratorService = require('../services/pdfGenerator/PDFGeneratorService');
const pdfCache = require('../services/pdfCache');
const abhaData = require('../../src/data/abhaFhirMock.json');
const auditLogger = require('../services/auditLogger');

/**
 * Generate PDF for a medical report
 * POST /api/generate-report-pdf
 */
const generateReportPDF = async (req, res) => {
  // Set timeout for PDF generation (30 seconds)
  const timeoutMs = 30000;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('PDF generation timeout')), timeoutMs);
  });

  try {
    const { reportId, patientId } = req.body;

    // Input validation
    if (!reportId || !patientId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Both reportId and patientId are required' 
      });
    }

    // Sanitize inputs (basic sanitization)
    const sanitizedReportId = String(reportId).trim();
    const sanitizedPatientId = String(patientId).trim();

    // Fetch patient data
    const patientData = abhaData[sanitizedPatientId];
    if (!patientData) {
      return res.status(404).json({ 
        error: 'Patient not found',
        message: 'The specified patient ID does not exist' 
      });
    }

    // Find the specific report
    let report = null;
    
    // Check regular reports
    if (patientData.reports) {
      report = patientData.reports.find(r => r.reportId === sanitizedReportId);
    }
    
    // Check sensitive reports if not found
    if (!report && patientData.sensitiveReports) {
      report = patientData.sensitiveReports.find(r => r.reportId === sanitizedReportId);
    }

    if (!report) {
      return res.status(404).json({ 
        error: 'Report not found',
        message: 'The specified report ID does not exist for this patient' 
      });
    }

    // Check cache first
    let pdfBuffer = pdfCache.get(sanitizedReportId, sanitizedPatientId);
    
    if (pdfBuffer) {
      console.log('📄 Serving cached PDF for report:', sanitizedReportId);
    } else {
      console.log('🔨 Generating new PDF for report:', sanitizedReportId);
      
      // Generate PDF with timeout
      pdfBuffer = await Promise.race([
        pdfGeneratorService.generateReportPDF(report, patientData),
        timeoutPromise
      ]);
      
      // Cache the generated PDF
      pdfCache.set(sanitizedReportId, sanitizedPatientId, pdfBuffer);
    }

    // Set response headers for inline viewing only
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    res.status(200).send(pdfBuffer);

    // Audit log successful generation
    auditLogger.logPDFGeneration({
      userId: req.user?.userId || 'unknown',
      userRole: req.user?.role || 'unknown',
      reportId: sanitizedReportId,
      patientId: sanitizedPatientId,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Audit log failed generation
    auditLogger.logPDFGeneration({
      userId: req.user?.userId || 'unknown',
      userRole: req.user?.role || 'unknown',
      reportId: req.body.reportId,
      patientId: req.body.patientId,
      success: false,
      error: error.message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Handle timeout errors
    if (error.message === 'PDF generation timeout') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'PDF generation took too long. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'PDF generation failed',
      message: 'An error occurred while generating the PDF' 
    });
  }
};

/**
 * Get PDF cache statistics
 * GET /api/pdf-cache-stats
 */
const getCacheStats = async (req, res) => {
  try {
    const stats = pdfCache.getStats();
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ 
      error: 'Failed to get cache statistics',
      message: error.message 
    });
  }
};

/**
 * Clear PDF cache
 * POST /api/clear-pdf-cache
 */
const clearPDFCache = async (req, res) => {
  try {
    const { reportId, patientId, clearAll } = req.body;
    
    if (clearAll) {
      pdfCache.clearAll();
      return res.status(200).json({
        success: true,
        message: 'All PDFs cleared from cache'
      });
    }
    
    if (reportId && patientId) {
      pdfCache.clear(reportId, patientId);
      return res.status(200).json({
        success: true,
        message: 'PDF cleared from cache'
      });
    }
    
    res.status(400).json({
      error: 'Missing parameters',
      message: 'Provide either clearAll=true or both reportId and patientId'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error.message 
    });
  }
};

module.exports = {
  generateReportPDF,
  getCacheStats,
  clearPDFCache
};
