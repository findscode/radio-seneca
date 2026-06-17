import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cmsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

process.env.DATABASE_CLIENT = process.env.DATABASE_CLIENT ?? 'sqlite';

const child = spawn('npx', ['strapi', 'develop'], {
  cwd: cmsRoot,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
