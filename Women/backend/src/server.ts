import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import apiRouter from './routes/api';
import { socketService } from './services/socketService';
import { checkinWorker } from './services/checkinWorker';
import { apiRateLimiter, errorHandler } from './middleware/auth';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Real-time Engine
socketService.init(server, config.corsOrigin);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow map tiles and frontend websockets
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development and mobile apps
      callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
app.use('/api/', apiRateLimiter);

// API Router
app.use('/api', apiRouter);

// Safety Disclaimer Endpoint
app.get('/api/disclaimer', (req, res) => {
  res.json({
    title: 'SafeHer AI Safety Notice & Disclaimer',
    disclaimer:
      'SafeHer AI is a safety-support and navigation system. AI safety scores and location information are estimates and do not guarantee personal safety or emergency response. In an immediate emergency, contact your local emergency services (911 / 112 / 100).',
    version: '1.0.0',
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Checkin Escalation Background Worker
checkinWorker.start(20000); // checks every 20 seconds

const PORT = config.port;

server.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log(`🛡️  SafeHer AI – Backend & Emergency Dispatch Server Ready`);
  console.log(`🚀  HTTP API:        http://localhost:${PORT}/api`);
  console.log(`⚡  Socket.IO Feed:  ws://localhost:${PORT}`);
  console.log(`🌐  CORS Target:     ${config.corsOrigin}`);
  console.log(`⏱️   System Time:     ${new Date().toISOString()}`);
  console.log('=============================================================\n');
});

export default app;
