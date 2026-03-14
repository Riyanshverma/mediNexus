import app from './app.js';
import { env } from './config/env.js';
import { startSlotLockCleanupJob } from './jobs/slotLockCleanup.js';
import { startWaitlistQueueJob } from './jobs/waitlistQueue.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`\nmediNexus API server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);

  // Start background jobs
  startSlotLockCleanupJob();
  startWaitlistQueueJob();
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[server] Port ${PORT} is already in use.`);
    console.error(`   Run:  fuser -k ${PORT}/tcp   to free it, then restart.\n`);
    process.exit(1);
  }
  throw err;
});
