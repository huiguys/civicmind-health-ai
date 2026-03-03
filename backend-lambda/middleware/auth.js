/**
 * Authentication Middleware
 * Verifies user authentication for protected routes
 */

/**
 * Simple authentication middleware
 * In production, this should verify JWT tokens or session cookies
 */
const authenticate = (req, res, next) => {
  // For MVP, we'll use a simple header-based auth
  // In production, implement proper JWT or session-based authentication
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Basic validation - in production, verify JWT token
  // For now, just check if header exists
  try {
    // Extract user info from header (simplified for MVP)
    // In production: verify JWT, check expiry, validate signature
    req.user = {
      userId: req.headers['x-user-id'] || 'unknown',
      role: req.headers['x-user-role'] || 'patient'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication credentials'
    });
  }
};

/**
 * Authorization middleware for PDF generation
 * Verifies user has permission to access the requested report
 */
const authorizeReportAccess = (req, res, next) => {
  const { patientId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Patients can only access their own reports
  if (user.role === 'patient' && user.userId !== patientId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this report'
    });
  }

  // Doctors can access their patients' reports
  // In production, verify doctor-patient relationship from database
  if (user.role === 'doctor') {
    // For MVP, allow all doctors to access reports
    // In production: check if doctor is assigned to this patient
    next();
    return;
  }

  // Admin can access all reports
  if (user.role === 'admin') {
    next();
    return;
  }

  // Default: allow if patient accessing own data
  if (user.userId === patientId) {
    next();
  } else {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this report'
    });
  }
};

module.exports = { authenticate, authorizeReportAccess };
