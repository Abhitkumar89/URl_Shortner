import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

/**
 * POST /auth/google
 * Body: { credential } — the Google ID token (JWT) from the frontend.
 * Verifies the token with Google, upserts the user, and returns an app JWT.
 */
export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google credential' });
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (user) {
      // Backfill googleId / avatar for users created via another path.
      let dirty = false;
      if (!user.googleId) { user.googleId = googleId; dirty = true; }
      if (picture && user.avatar !== picture) { user.avatar = picture; dirty = true; }
      if (dirty) await user.save();
    } else {
      user = await User.create({
        googleId,
        email,
        name: name || email.split('@')[0],
        avatar: picture || '',
      });
    }

    const token = signToken({ id: user._id });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me — return the currently authenticated user's profile.
 */
export async function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}

/**
 * POST /auth/logout — stateless JWT, so the client just discards the token.
 * Endpoint exists for symmetry and future token-blacklist support.
 */
export async function logout(req, res) {
  res.json({ message: 'Logged out' });
}
