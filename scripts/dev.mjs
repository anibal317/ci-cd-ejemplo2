#!/usr/bin/env node
/**
 * Levanta el backend (NestJS) y el frontend (Next.js) a la vez.
 *
 * Uso:
 *   npm run dev          # desde la raíz
 *   node scripts/dev.mjs # equivalente
 *
 * - Prefija cada línea con [back] o [front] para distinguir la salida.
 * - Si uno de los dos procesos termina o falla, detiene el otro.
 * - Ctrl+C detiene ambos (incluidos los procesos hijos en Windows).
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const RESET = '\x1b[0m';

const services = [
  {
    name: 'back ',
    color: '\x1b[36m', // cian
    cwd: join(root, 'backend'),
    args: ['run', 'start:dev'],
    url: 'http://localhost:3001/tasks',
    extra: 'Swagger: http://localhost:3001/docs',
  },
  {
    name: 'front',
    color: '\x1b[35m', // magenta
    cwd: join(root, 'frontend'),
    args: ['run', 'dev'],
    url: 'http://localhost:3000',
    extra: null,
  },
];

// ── Comprobaciones previas ───────────────────────────────────────────────────
const missingDeps = services.filter((service) => !existsSync(join(service.cwd, 'node_modules')));

if (missingDeps.length > 0) {
  console.error('[x] Faltan dependencias en:');
  for (const service of missingDeps) {
    console.error(`    - ${service.cwd}`);
  }
  console.error('\nEjecuta primero: npm run install:all');
  process.exit(1);
}

console.log('Iniciando servidores de desarrollo...\n');
for (const service of services) {
  console.log(`  ${service.name.trim().padEnd(5)} -> ${service.url}`);
  if (service.extra) console.log(`         ${service.extra}`);
}
console.log('\nCtrl+C para detener ambos.\n');

// ── Utilidades ───────────────────────────────────────────────────────────────
const children = new Set();
let shuttingDown = false;

function prefixOutput(stream, service) {
  let buffer = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const tag = useColor
        ? `${service.color}[${service.name.trim()}]${RESET}`
        : `[${service.name.trim()}]`;
      process.stdout.write(`${tag} ${line}\n`);
    }
  });
}

function killTree(child) {
  if (!child.pid) return;

  if (isWindows) {
    // npm.cmd lanza un árbol de procesos (cmd -> node); /T lo mata completo.
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    return;
  }

  try {
    process.kill(-child.pid, 'SIGTERM'); // grupo de procesos creado con detached
  } catch {
    child.kill('SIGTERM');
  }
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\nDeteniendo servidores...');
  for (const child of children) {
    killTree(child);
  }

  // Espera a que taskkill/SIGTERM hagan efecto y sale con el código correcto.
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// ── Arranque ─────────────────────────────────────────────────────────────────
for (const service of services) {
  // En Windows, npm es un script .cmd y hay que lanzarlo a través de cmd.exe.
  // Se evita `shell: true` porque concatena argumentos sin escaparlos (DEP0190).
  const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : npm;
  const args = isWindows
    ? ['/d', '/s', '/c', `npm ${service.args.join(' ')}`]
    : service.args;

  const child = spawn(command, args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    detached: !isWindows, // permite matar el grupo completo en Linux/macOS
  });

  children.add(child);
  prefixOutput(child.stdout, service);
  prefixOutput(child.stderr, service);

  child.on('error', (error) => {
    console.error(`[x] No se pudo iniciar ${service.name.trim()}: ${error.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;

    const reason = signal ? `señal ${signal}` : `código ${code ?? 0}`;
    const failed = code !== 0;
    console.error(`\n[${failed ? 'x' : 'i'}] ${service.name.trim()} terminó (${reason}).`);

    // Si un servidor se cae, no dejamos el otro huérfano.
    shutdown(code ?? (failed ? 1 : 0));
  });
}
