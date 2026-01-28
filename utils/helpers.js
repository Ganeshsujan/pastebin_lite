/**
 * Utility functions for paste generation and validation
 */

/**
 * Generate a short unique ID for pastes
 * Uses base36 encoding for shorter URLs
 */
function generatePasteId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return (timestamp + randomPart).substring(0, 10);
}

/**
 * Get current time in milliseconds
 * Respects TEST_MODE and x-test-now-ms header for deterministic testing
 */
function getCurrentTimeMs(testHeader) {
  if (process.env.TEST_MODE === '1' && testHeader) {
    const testTime = parseInt(testHeader, 10);
    if (!isNaN(testTime)) {
      return testTime;
    }
  }
  return Date.now();
}

/**
 * Validate paste creation request
 */
function validatePasteRequest(body) {
  const errors = [];

  // Validate content
  if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
    errors.push('content is required and must be a non-empty string');
  }

  // Validate ttl_seconds
  if (body.ttl_seconds !== undefined) {
    const ttl = parseInt(body.ttl_seconds, 10);
    if (isNaN(ttl) || ttl < 1) {
      errors.push('ttl_seconds must be an integer >= 1');
    }
  }

  // Validate max_views
  if (body.max_views !== undefined) {
    const views = parseInt(body.max_views, 10);
    if (isNaN(views) || views < 1) {
      errors.push('max_views must be an integer >= 1');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate expiry timestamp
 */
function calculateExpiryTime(ttlSeconds, currentTimeMs) {
  if (!ttlSeconds || ttlSeconds < 1) {
    return null;
  }
  return currentTimeMs + (ttlSeconds * 1000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

module.exports = {
  generatePasteId,
  getCurrentTimeMs,
  validatePasteRequest,
  calculateExpiryTime,
  escapeHtml
};
