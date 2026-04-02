import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import os from 'node:os';

describe('spyder admin port occupied behavior', () => {
  let tmpDir: string;
  let origCwd: string;
  const OLD_ENV = { ...process.env };
  let server: net.Server | null = null;

  beforeEach(() => {
    origCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qflush-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    try { process.chdir(origCwd); } catch {}
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    process.env = { ...OLD_ENV };
    if (server) {
      try {
        server.close();
      } catch {}
      server = null;
    }
    vi.restoreAllMocks();
  });

  it('does not persist spyder config when admin port is already bound', async () => {
    server = net.createServer(() => {});
    const listenPort = await new Promise<number>((resolve, reject) => {
      server!.listen(0, '127.0.0.1', () => {
        const address = server!.address();
        if (!address || typeof address === 'string') {
          reject(new Error('failed to resolve reserved admin port'));
          return;
        }
        resolve(address.port);
      });
      server!.once('error', reject);
    });

    process.env.QFLUSH_SPYDER_ADMIN_PORT = String(listenPort);

    // mock startService to avoid side effects
    vi.mock('../../src/services', () => ({ startService: async () => { return; } }));

    const { runStart } = await import('../../src/commands/start');
    await runStart({ services: ['spyder'] as any, flags: {} as any } as any);

    const cfgPath = path.join(process.cwd(), '.qflush', 'spyder.config.json');
    expect(fs.existsSync(cfgPath)).toBe(false);
  });
});
