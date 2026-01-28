const express = require('express');
const router = express.Router();
const Paste = require('../models/Paste');
const {
  generatePasteId,
  getCurrentTimeMs,
  validatePasteRequest,
  calculateExpiryTime
} = require('../utils/helpers');

/**
 * GET /api/healthz
 * Health check endpoint with MongoDB connectivity confirmation
 */
router.get('/healthz', async (req, res) => {
  try {
    // Check MongoDB connection
    const isConnected = require('mongoose').connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({
        ok: false,
        error: 'MongoDB connection unavailable'
      });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * POST /api/pastes
 * Create a new paste
 * 
 * Request body:
 * {
 *   "content": "string",
 *   "ttl_seconds": number (optional),
 *   "max_views": number (optional)
 * }
 * 
 * Response:
 * {
 *   "id": "string",
 *   "url": "https://domain/p/id"
 * }
 */
router.post('/pastes', async (req, res) => {
  try {
    // Validate request
    const validation = validatePasteRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const currentTimeMs = getCurrentTimeMs(req.headers['x-test-now-ms']);
    const pasteId = generatePasteId();
    
    const ttlSeconds = req.body.ttl_seconds ? parseInt(req.body.ttl_seconds, 10) : null;
    const maxViews = req.body.max_views ? parseInt(req.body.max_views, 10) : null;

    const expiresAt = calculateExpiryTime(ttlSeconds, currentTimeMs);

    // Create paste document
    const paste = new Paste({
      _id: pasteId,
      content: req.body.content,
      created_at: currentTimeMs,
      expires_at: expiresAt,
      remaining_views: maxViews
    });

    await paste.save();

    // Generate shareable URL
    const domain = process.env.DOMAIN || `${req.protocol}://${req.get('host')}`;
    const url = `${domain}/p/${pasteId}`;

    res.status(201).json({
      id: pasteId,
      url: url
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create paste',
      details: error.message
    });
  }
});

/**
 * GET /api/pastes/:id
 * Fetch paste content via API
 * Each request counts as one view
 * 
 * Response:
 * {
 *   "content": "string",
 *   "remaining_views": number or null,
 *   "expires_at": "ISO string" or null
 * }
 */
router.get('/pastes/:id', async (req, res) => {
  try {
    const pasteId = req.params.id;
    const currentTimeMs = getCurrentTimeMs(req.headers['x-test-now-ms']);

    // Fetch paste
    let paste = await Paste.findById(pasteId);

    if (!paste) {
      return res.status(404).json({
        error: 'Paste not found'
      });
    }

    // Check if expired
    if (paste.isExpired(currentTimeMs)) {
      return res.status(404).json({
        error: 'Paste has expired'
      });
    }

    // Check remaining views before decrementing
    if (paste.remaining_views !== null && paste.remaining_views <= 0) {
      return res.status(404).json({
        error: 'Paste has reached view limit'
      });
    }

    // Decrement views if view limit exists
    if (paste.remaining_views !== null) {
      paste = await Paste.decrementViews(pasteId);
      if (!paste) {
        return res.status(404).json({
          error: 'Paste has reached view limit'
        });
      }
    }

    // Prepare response
    const response = {
      content: paste.content,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch paste',
      details: error.message
    });
  }
});

module.exports = router;
