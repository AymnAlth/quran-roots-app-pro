import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { createRequire } from "module";

// Initialize Environment
dotenv.config();

// ESM Compatibility Helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url); // Enable CommonJS imports

// Import Legacy Routes (Bridging Logic)
// We use direct relative paths for Vercel compatibility
// Note: We will ensure 'backend' folder is included in Vercel build
const searchRoutes = require("../backend/src/routes/searchRoutes");
const ayahRoutes = require("../backend/src/routes/ayahRoutes");
const surahRoutes = require("../backend/src/routes/surahRoutes");
const statisticsRoutes = require("../backend/src/routes/statisticsRoutes");

const app = express();

// --- 1. Security Middleware ---
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://localhost:3002',
      process.env.FRONTEND_URL || '' // Allow Production URL
    ];
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: false, 
}));

// --- 2. Custom Security Gate ---
const verifySource = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === '/health' || 
    req.path === '/api/health' || 
    req.path.startsWith('/assets') || 
    req.method === 'OPTIONS'
  ) return next();

  if (!req.path.startsWith('/api')) return next();

  const appSource = req.headers['x-app-source'];
  const expectedSource = 'quran-roots-client-v1';

  if (appSource !== expectedSource) {
    console.warn(`Unauthorized access attempt from IP: ${req.ip} - Path: ${req.path}`);
    return res.status(403).json({ error: 'Access Denied: Unauthorized Source' });
  }
  next();
};

app.use(verifySource);

// --- 3. Standard Middleware ---
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. API Routes ---
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', version: '2.0.0 (Unified)' });
});

app.get('/api/resources/word-index', (_req, res) => {
  const filePath = path.join(__dirname, '../backend/data/word_index.json');
  res.sendFile(filePath, (err) => {
    if (err) res.status(500).json({ error: 'Failed to load resource' });
  });
});

app.use('/api/search', searchRoutes);
app.use('/api/ayah', ayahRoutes);
app.use('/api/surahs', surahRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api', (_req, res) => {
  res.json({ message: 'Quran Roots API is running (Unified Mode)' });
});

// --- 5. Frontend Serving & Export ---

// In Vercel, static files are handled by the Output API, 
// so we don't strictly need express.static for production there, 
// but we keep it for local dev consistency.
const frontendPath = path.join(__dirname, "../dist");
app.use(express.static(frontendPath));

// Fallback for SPA
app.get("*", (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err && !process.env.VERCEL) {
       res.status(404).send("Frontend build not found. Please run build script.");
    }
  });
});

// Handling Errors
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: { message: err.message || 'Server Error' } });
});

// EXPORT APP FOR VERCEL (Crucial Step)
export default app;

// Start Server LOCALLY only (Not in Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`🚀 Unified Server running on port ${PORT}`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  });
}