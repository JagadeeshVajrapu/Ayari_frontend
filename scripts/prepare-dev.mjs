import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const nextDir = path.join(root, '..', '.next');
const cleanAll = process.argv.includes('--clean');
const port = Number(process.env.PORT ?? 3001);

function removeTraceArtifacts() {
  const targets = ['trace', 'trace-build'];

  for (const name of targets) {
    const target = path.join(nextDir, name);
    if (!existsSync(target)) continue;

    try {
      rmSync(target, { force: true, recursive: true });
    } catch {
      // Windows can keep handles briefly after a crashed dev server.
    }
  }
}

function freeNodePort(targetPort) {
  if (process.platform !== 'win32') return;

  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }

    for (const pid of pids) {
      try {
        const task = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });

        if (!task.toLowerCase().includes('node.exe')) continue;

        execSync(`taskkill //F //PID ${pid}`, { stdio: 'ignore' });
        console.log(`Stopped stale Node dev server on port ${targetPort} (PID ${pid})`);
      } catch {
        // Process may already be gone.
      }
    }
  } catch {
    // Port is free.
  }
}

if (cleanAll && existsSync(nextDir)) {
  try {
    rmSync(nextDir, { force: true, recursive: true });
    console.log('Removed .next cache');
  } catch {
    console.warn('Could not fully remove .next — close other dev servers and retry.');
  }
} else {
  freeNodePort(port);
  removeTraceArtifacts();
}
