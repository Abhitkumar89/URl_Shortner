import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';
import Link from '../models/Link.js';

// URL-safe, unambiguous alphabet for generated codes.
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(ALPHABET, 7);

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;
const RESERVED = new Set(['api', 'auth', 'links', 'shorten', 'analytics', 'health']);

function baseUrl() {
  return (process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
}

function shortUrlFor(code) {
  return `${baseUrl()}/${code}`;
}

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Serialize a link document for API responses. */
function serialize(link) {
  return {
    id: link._id,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    customAlias: link.customAlias,
    shortUrl: shortUrlFor(link.shortCode),
    totalClicks: link.totalClicks,
    lastClickedAt: link.lastClickedAt,
    expiresAt: link.expiresAt,
    status: link.status,
    createdAt: link.createdAt,
  };
}

/**
 * POST /shorten
 * Body: { originalUrl, customAlias?, expiresAt? }
 */
export async function createLink(req, res, next) {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl || !isValidHttpUrl(originalUrl)) {
      return res.status(400).json({ message: 'A valid http(s) URL is required' });
    }

    let expiry = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (Number.isNaN(expiry.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date' });
      }
      if (expiry.getTime() <= Date.now()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
    }

    let shortCode;
    if (customAlias) {
      const alias = customAlias.trim();
      if (!ALIAS_PATTERN.test(alias)) {
        return res.status(400).json({
          message: 'Alias must be 3-32 chars (letters, numbers, - or _)',
        });
      }
      if (RESERVED.has(alias.toLowerCase())) {
        return res.status(400).json({ message: 'That alias is reserved' });
      }
      const exists = await Link.findOne({ shortCode: alias });
      if (exists) {
        return res.status(409).json({ message: 'That custom alias is already taken' });
      }
      shortCode = alias;
    } else {
      // Retry a few times in the unlikely event of a collision.
      for (let i = 0; i < 5; i += 1) {
        const candidate = nanoid();
        // eslint-disable-next-line no-await-in-loop
        const exists = await Link.findOne({ shortCode: candidate });
        if (!exists) {
          shortCode = candidate;
          break;
        }
      }
      if (!shortCode) {
        return res.status(500).json({ message: 'Could not generate a unique code, try again' });
      }
    }

    const link = await Link.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim() : null,
      expiresAt: expiry,
    });

    res.status(201).json({ link: serialize(link) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /links?search=&status=active|expired|all&page=&limit=
 * Returns the authenticated user's links plus aggregate stats.
 */
export async function getLinks(req, res, next) {
  try {
    const { search = '', status = 'all' } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const query = { userId: req.user._id };

    if (search.trim()) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ originalUrl: rx }, { shortCode: rx }, { customAlias: rx }];
    }

    const now = new Date();
    if (status === 'active') {
      query.$and = [
        ...(query.$and || []),
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      ];
    } else if (status === 'expired') {
      query.expiresAt = { $ne: null, $lte: now };
    }

    const [docs, total] = await Promise.all([
      Link.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Link.countDocuments(query),
    ]);

    // Aggregate stats across ALL of the user's links (not just this page/filter).
    const allLinks = await Link.find({ userId: req.user._id }).select('totalClicks expiresAt');
    const totalClicks = allLinks.reduce((sum, l) => sum + l.totalClicks, 0);
    const activeLinks = allLinks.filter(
      (l) => !l.expiresAt || l.expiresAt.getTime() > Date.now()
    ).length;

    res.json({
      links: docs.map(serialize),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      stats: {
        totalLinks: allLinks.length,
        totalClicks,
        activeLinks,
        expiredLinks: allLinks.length - activeLinks,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /analytics/:id — detailed stats for a single link.
 */
export async function getAnalytics(req, res, next) {
  try {
    const link = await Link.findOne({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const qrDataUrl = await QRCode.toDataURL(shortUrlFor(link.shortCode), {
      width: 320,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.json({
      analytics: {
        ...serialize(link),
        qrCode: qrDataUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /links/:id/qr — QR code (PNG data URL) for a link.
 */
export async function getQrCode(req, res, next) {
  try {
    const link = await Link.findOne({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    const qrDataUrl = await QRCode.toDataURL(shortUrlFor(link.shortCode), {
      width: 512,
      margin: 1,
    });
    res.json({ qrCode: qrDataUrl, shortUrl: shortUrlFor(link.shortCode) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /links/:id
 */
export async function deleteLink(req, res, next) {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json({ message: 'Link deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /:code — public redirect. Increments click counter and enforces expiry.
 * Not mounted under /api so short URLs stay clean.
 */
export async function redirect(req, res, next) {
  try {
    const link = await Link.findOne({ shortCode: req.params.code });
    if (!link) {
      return res.status(404).json({ message: 'Short link not found' });
    }
    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      return res.status(410).json({ message: 'This link has expired' });
    }

    link.totalClicks += 1;
    link.lastClickedAt = new Date();
    await link.save();

    return res.redirect(302, link.originalUrl);
  } catch (err) {
    next(err);
  }
}
