import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './utils/db.js';

const PORT = process.env.PORT || 4000;

await connectDB();
http.createServer(app).listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});