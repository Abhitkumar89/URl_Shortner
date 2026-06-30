import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customAlias: {
      type: String,
      default: null,
      trim: true,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    lastClickedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * A link is considered "active" when it has no expiry, or its expiry is in the future.
 * Exposed as a virtual so the client always gets a fresh, computed status.
 */
linkSchema.virtual('isExpired').get(function () {
  return Boolean(this.expiresAt && this.expiresAt.getTime() <= Date.now());
});

linkSchema.virtual('status').get(function () {
  return this.expiresAt && this.expiresAt.getTime() <= Date.now() ? 'expired' : 'active';
});

linkSchema.set('toJSON', { virtuals: true });
linkSchema.set('toObject', { virtuals: true });

export default mongoose.model('Link', linkSchema);
