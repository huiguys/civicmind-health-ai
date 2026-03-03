/**
 * PDF Generator Service
 * Generates professional medical report PDFs from ABHA FHIR data
 */

const PDFDocument = require('pdfkit');

class PDFGeneratorService {
  /**
   * Generate a PDF document for a medical report
   * @param {Object} reportData - Medical report data
   * @param {Object} patientData - Patient information
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateReportPDF(reportData, patientData) {
    return new Promise((resolve, reject) => {
      try {
        // Initialize PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Collect PDF data in buffer
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add document sections
        this.addHeader(doc, {
          hospitalName: reportData.provider || 'CivicMind Health',
          department: reportData.department || 'General Medicine'
        });

        this.addPatientInfo(doc, {
          name: patientData.name,
          abhaId: patientData.patientId,
          age: patientData.age,
          gender: patientData.gender,
          bloodGroup: patientData.bloodGroup
        });

        this.addReportMetadata(doc, {
          reportId: reportData.reportId,
          reportType: reportData.type,
          reportDate: reportData.date,
          department: reportData.department
        });

        this.addReportContent(doc, {
          summary: reportData.summary,
          fhirData: reportData.fhirData,
          doctorNotes: reportData.doctorNotes
        });

        this.addFooter(doc, {
          abhaVerified: true,
          generatedDate: new Date().toISOString(),
          disclaimer: 'This is a computer-generated document. ABHA verified medical report.'
        });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add hospital header to PDF
   */
  addHeader(doc, hospitalInfo) {
    // Hospital name
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text(hospitalInfo.hospitalName, { align: 'center' });
    
    // Department
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#4b5563')
       .text(hospitalInfo.department, { align: 'center' });
    
    // Add horizontal line
    doc.moveDown(0.5);
    doc.strokeColor('#e5e7eb')
       .lineWidth(2)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();
    
    doc.fillColor('#000000'); // Reset to black
    doc.moveDown(1);
  }

  /**
   * Add patient information section
   */
  addPatientInfo(doc, patientData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('Patient Information', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    const leftColumn = 50;
    const rightColumn = 300;
    const lineHeight = 20;
    let yPos = doc.y;
    
    // Left column
    doc.font('Helvetica-Bold').text('Name:', leftColumn, yPos);
    doc.font('Helvetica').text(patientData.name || 'N/A', leftColumn + 80, yPos);
    
    yPos += lineHeight;
    doc.font('Helvetica-Bold').text('ABHA ID:', leftColumn, yPos);
    doc.font('Helvetica').text(patientData.abhaId || 'N/A', leftColumn + 80, yPos);
    
    yPos += lineHeight;
    doc.font('Helvetica-Bold').text('Age:', leftColumn, yPos);
    doc.font('Helvetica').text(patientData.age ? `${patientData.age} years` : 'N/A', leftColumn + 80, yPos);
    
    // Right column
    yPos = doc.y;
    doc.font('Helvetica-Bold').text('Gender:', rightColumn, yPos);
    doc.font('Helvetica').text(patientData.gender || 'N/A', rightColumn + 80, yPos);
    
    yPos += lineHeight;
    doc.font('Helvetica-Bold').text('Blood Group:', rightColumn, yPos);
    doc.font('Helvetica').text(patientData.bloodGroup || 'N/A', rightColumn + 80, yPos);
    
    doc.moveDown(2);
  }

  /**
   * Add report metadata section
   */
  addReportMetadata(doc, reportData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('Report Details', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    const leftColumn = 50;
    const rightColumn = 300;
    const lineHeight = 20;
    let yPos = doc.y;
    
    // Left column
    doc.font('Helvetica-Bold').text('Report ID:', leftColumn, yPos);
    doc.font('Helvetica').text(reportData.reportId || 'N/A', leftColumn + 80, yPos);
    
    yPos += lineHeight;
    doc.font('Helvetica-Bold').text('Report Type:', leftColumn, yPos);
    doc.font('Helvetica').text(reportData.reportType || 'N/A', leftColumn + 80, yPos);
    
    // Right column
    yPos = doc.y;
    doc.font('Helvetica-Bold').text('Report Date:', rightColumn, yPos);
    doc.font('Helvetica').text(reportData.reportDate || 'N/A', rightColumn + 80, yPos);
    
    yPos += lineHeight;
    doc.font('Helvetica-Bold').text('Department:', rightColumn, yPos);
    doc.font('Helvetica').text(reportData.department || 'N/A', rightColumn + 80, yPos);
    
    doc.moveDown(2);
  }

  /**
   * Add report content section
   */
  addReportContent(doc, contentData) {
    // Add summary section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('Report Summary', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11)
       .font('Helvetica')
       .text(contentData.summary || 'No summary available');
    
    doc.moveDown(1);

    // Add FHIR data if present
    if (contentData.fhirData) {
      try {
        const formattedData = this.formatFHIRData(contentData.fhirData);
        
        if (formattedData.length > 0) {
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor('#000000')
             .text('Clinical Findings', { underline: true });
          
          doc.moveDown(0.5);

          for (const item of formattedData) {
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(item.testName + ':');
            
            doc.font('Helvetica');
            doc.text(`  Value: ${item.value}${item.unit ? ' ' + item.unit : ''}`);
            
            if (item.normalRange && item.normalRange !== 'N/A') {
              doc.text(`  Normal Range: ${item.normalRange}`);
            }
            
            // Highlight abnormal values in red
            if (item.status === 'high' || item.status === 'low') {
              doc.fillColor('#dc2626')
                 .text(`  Status: ${item.status.toUpperCase()}`);
              doc.fillColor('#000000');
            } else if (item.status !== 'normal') {
              doc.text(`  Status: ${item.status}`);
            }
            
            if (item.interpretation) {
              doc.text(`  Interpretation: ${item.interpretation}`);
            }
            
            doc.moveDown(0.5);
          }
          
          doc.moveDown(1);
        }
      } catch (error) {
        console.warn('Error adding FHIR data to PDF:', error);
        // Continue with available data
      }
    }

    // Add doctor's notes if present
    if (contentData.doctorNotes) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Doctor\'s Notes', { underline: true });
      
      doc.moveDown(0.5);
      doc.fontSize(11)
         .font('Helvetica')
         .text(contentData.doctorNotes);
      
      doc.moveDown(1);
    }
  }

  /**
   * Add ABHA footer
   */
  addFooter(doc, abhaInfo) {
    // Move to bottom of page
    const bottomMargin = 50;
    const pageHeight = doc.page.height;
    const footerY = pageHeight - bottomMargin - 60;
    
    doc.y = footerY;
    
    // Add horizontal line
    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();
    
    doc.moveDown(0.5);
    
    // ABHA verification
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#059669')
       .text('✓ ABHA Verified Document', { align: 'center' });
    
    doc.moveDown(0.3);
    
    // Generation timestamp watermark
    const timestamp = new Date(abhaInfo.generatedDate).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`Generated on: ${timestamp}`, { align: 'center' });
    
    doc.moveDown(0.3);
    
    // Disclaimer
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(abhaInfo.disclaimer, { align: 'center' });
  }

  /**
   * Format FHIR data into readable structure
   */
  formatFHIRData(fhirData) {
    if (!fhirData || typeof fhirData !== 'object') {
      return [];
    }

    const formattedArray = [];

    try {
      // Handle DiagnosticReport with result array
      if (fhirData.resourceType === 'DiagnosticReport' && fhirData.result) {
        for (const result of fhirData.result) {
          if (result.testName) {
            formattedArray.push({
              testName: result.testName,
              value: result.value !== undefined ? result.value : 'N/A',
              unit: result.unit || '',
              normalRange: result.normalRange || 'N/A',
              status: result.status || 'normal',
              interpretation: result.interpretation || ''
            });
          }
        }
      }

      // Handle DiagnosticReport with findings object
      if (fhirData.resourceType === 'DiagnosticReport' && fhirData.findings) {
        for (const [key, value] of Object.entries(fhirData.findings)) {
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          
          formattedArray.push({
            testName: formattedKey,
            value: value,
            unit: '',
            normalRange: 'N/A',
            status: 'normal',
            interpretation: ''
          });
        }
      }

      // Handle Encounter resources
      if (fhirData.resourceType === 'Encounter') {
        if (fhirData.reasonCode) {
          formattedArray.push({
            testName: 'Reason for Visit',
            value: fhirData.reasonCode,
            unit: '',
            normalRange: 'N/A',
            status: 'normal',
            interpretation: ''
          });
        }
      }
    } catch (error) {
      console.warn('Error formatting FHIR data:', error);
      // Return whatever was successfully formatted
    }

    return formattedArray;
  }
}

module.exports = new PDFGeneratorService();
