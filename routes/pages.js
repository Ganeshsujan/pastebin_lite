const express = require('express');
const router = express.Router();
const Paste = require('../models/Paste');
const { getCurrentTimeMs, escapeHtml } = require('../utils/helpers');

/**
 * GET /
 * Homepage with paste creation form
 */
router.get('/', (req, res) => {
  res.render('index', { error: null, success: null });
});

/**
 * POST /create
 * Handle paste creation from form
 */
router.post('/create', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.render('index', {
        error: 'Content is required and cannot be empty',
        success: null
      });
    }

    // Validate ttl_seconds
    let ttlSeconds = null;
    if (ttl_seconds && ttl_seconds.trim() !== '') {
      ttlSeconds = parseInt(ttl_seconds, 10);
      if (isNaN(ttlSeconds) || ttlSeconds < 1) {
        return res.render('index', {
          error: 'TTL must be a number greater than 0 (in seconds)',
          success: null
        });
      }
    }

    // Validate max_views
    let maxViews = null;
    if (max_views && max_views.trim() !== '') {
      maxViews = parseInt(max_views, 10);
      if (isNaN(maxViews) || maxViews < 1) {
        return res.render('index', {
          error: 'Max views must be a number greater than 0',
          success: null
        });
      }
    }

    const currentTimeMs = getCurrentTimeMs(req.headers['x-test-now-ms']);
    const expiresAt = ttlSeconds ? currentTimeMs + (ttlSeconds * 1000) : null;

    // Create paste - generate ID from module import
    const { generatePasteId } = require('../utils/helpers');
    const pasteId = generatePasteId();

    const paste = new Paste({
      _id: pasteId,
      content: content,
      created_at: currentTimeMs,
      expires_at: expiresAt,
      remaining_views: maxViews
    });

    await paste.save();

    // Redirect to view page
    res.redirect(`/p/${pasteId}`);
  } catch (error) {
    res.render('index', {
      error: `Error creating paste: ${error.message}`,
      success: null
    });
  }
});

/**
 * GET /p/:id
 * View paste as HTML page
 */
router.get('/p/:id', async (req, res) => {
  try {
    const pasteId = req.params.id;
    const currentTimeMs = getCurrentTimeMs(req.headers['x-test-now-ms']);

    // Fetch paste
    let paste = await Paste.findById(pasteId);

    if (!paste) {
      return res.status(404).render('error', {
        error: 'Paste not found'
      });
    }

    // Check if expired
    if (paste.isExpired(currentTimeMs)) {
      return res.status(404).render('error', {
        error: 'Paste has expired'
      });
    }

    // Check remaining views before decrementing
    if (paste.remaining_views !== null && paste.remaining_views <= 0) {
      return res.status(404).render('error', {
        error: 'Paste has reached view limit'
      });
    }

    // Decrement views if view limit exists
    if (paste.remaining_views !== null) {
      paste = await Paste.decrementViews(pasteId);
      if (!paste) {
        return res.status(404).render('error', {
          error: 'Paste has reached view limit'
        });
      }
    }

    // Escape content for safe rendering
    const escapedContent = escapeHtml(paste.content);

    res.render('paste', {
      id: pasteId,
      content: escapedContent,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
    });
  } catch (error) {
    res.status(500).render('error', {
      error: `Error fetching paste: ${error.message}`
    });
  }
});

module.exports = router;
