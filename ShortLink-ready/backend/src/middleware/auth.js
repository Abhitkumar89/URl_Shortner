import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * Protect routes by requiring a valid Bearer JWT.
 * Attaches the resolved user document to req.user.
 */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized: missing token' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized: user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized: invalid or expired token' });
  }
}
