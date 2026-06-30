import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGODB_URI);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🚀 ShortLink API running on port ${PORT}`);
    console.log(`   Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
