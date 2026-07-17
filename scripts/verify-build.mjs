#!/usr/bin/env node
/**
 * Verifies a Next.js production build has static chunks before deploy.
 * Usage: node scripts/verify-build.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const nextDir = path.join(root, '.next');
const staticChunks = path.join(nextDir, 'static', 'chunks');
const buildIdPath = path.join(nextDir, 'BUILD_ID');

function fail(msg) {
  console.error(`\n❌ Deploy check failed: ${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(nextDir)) fail('Missing .next — run `npm run build` first.');
if (!fs.existsSync(buildIdPath)) fail('Missing .next/BUILD_ID');
if (!fs.existsSync(staticChunks)) fail('Missing .next/static/chunks');

const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
const files = fs.readdirSync(staticChunks, { recursive: true }).filter((f) => String(f).endsWith('.js'));

if (files.length < 20) {
  fail(`Only ${files.length} JS chunks found — build looks incomplete.`);
}

const parenPaths = files.filter((f) => String(f).includes('(') || String(f).includes(')'));
if (parenPaths.length) {
  console.warn(
    `⚠️  ${parenPaths.length} chunk path(s) still contain parentheses — Hostinger CDN may 404 these:`,
  );
  parenPaths.slice(0, 10).forEach((f) => console.warn(`   - ${f}`));
}

console.log(`✅ Build OK — BUILD_ID=${buildId}, ${files.length} JS chunks ready to deploy.`);
console.log('   Deploy the FULL frontend folder (including entire .next) then purge Hostinger CDN.');
