/**
 * PDF Routes
 * Routes for PDF generation endpoints
 */

const express = require('express');
const router = express.Router();
const { generateReportPDF } = require('../controllers/pdfController');
const { authenticate, authorizeReportAccess } = require('../middleware/auth');
const { pdfRateLimiter } = require('../middleware/rateLimit');

// POST /api/generate-report-pdf
// Generate PDF for a medical report
router.post(
  '/generate-report-pdf',
  authenticate,
  authorizeReportAccess,
  pdfRateLimiter,
  generateReportPDF
);

module.exports = router;
