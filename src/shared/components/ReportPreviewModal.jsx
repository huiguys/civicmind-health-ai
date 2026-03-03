import React, { useEffect } from 'react';

/**
 * Report Preview Modal Component
 * Displays medical report in formatted HTML (no PDF, no download)
 */
const ReportPreviewModal = ({ 
  isOpen, 
  onClose, 
  report,
  patientData
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !report || !patientData) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{report.type}</h2>
            <p className="text-sm text-gray-600">{report.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {/* Hospital Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {report.provider || 'CivicMind Health'}
            </h1>
            <p className="text-lg text-gray-600">{report.department || 'General Medicine'}</p>
          </div>

          {/* Patient Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{patientData.name}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Gender:</span>
                <span className="ml-2 text-gray-900">{patientData.gender}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">ABHA ID:</span>
                <span className="ml-2 text-gray-900 text-sm">{patientData.patientId}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Blood Group:</span>
                <span className="ml-2 text-gray-900">{patientData.bloodGroup}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Age:</span>
                <span className="ml-2 text-gray-900">{patientData.age} years</span>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              Report Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Report ID:</span>
                <span className="ml-2 text-gray-900">{report.reportId}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Report Date:</span>
                <span className="ml-2 text-gray-900">{report.date}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Report Type:</span>
                <span className="ml-2 text-gray-900">{report.type}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Department:</span>
                <span className="ml-2 text-gray-900">{report.department}</span>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              Report Summary
            </h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report.summary}
            </p>
          </div>

          {/* Clinical Findings (FHIR Data) */}
          {report.fhirData && report.fhirData.result && report.fhirData.result.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
                Clinical Findings
              </h3>
              <div className="space-y-4">
                {report.fhirData.result.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-bold text-gray-900 mb-2">{item.testName}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Value:</span>
                        <span className="ml-2 font-semibold">{item.value} {item.unit}</span>
                      </div>
                      {item.normalRange && item.normalRange !== 'N/A' && (
                        <div>
                          <span className="text-gray-600">Normal Range:</span>
                          <span className="ml-2">{item.normalRange}</span>
                        </div>
                      )}
                      {item.status && item.status !== 'normal' && (
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 font-bold ${
                            item.status === 'high' || item.status === 'low' 
                              ? 'text-red-600' 
                              : 'text-gray-900'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {item.interpretation && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Interpretation:</span>
                          <span className="ml-2">{item.interpretation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor's Notes */}
          {report.doctorNotes && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
                Doctor's Notes
              </h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {report.doctorNotes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-bold">ABHA Verified Document</span>
            </div>
            <p className="text-sm text-gray-600">
              Generated on: {new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This is a computer-generated document. ABHA verified medical report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
