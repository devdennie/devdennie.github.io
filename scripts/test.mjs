import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const config = readFileSync(join(root, 'vite.config.js'), 'utf8');
assert(/base:\s*['"]\/['"]/.test(config), "Vite base must be '/'");

const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
assert(existsSync(viteBin), 'Vite is not installed');
if (existsSync(viteBin)) {
  execFileSync(process.execPath, [viteBin, 'build'], { cwd: root, stdio: 'inherit' });
}

const htmlPath = join(root, 'dist', 'index.html');
assert(existsSync(htmlPath), 'dist/index.html was not built');
const html = existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : '';
const collapsed = html.replace(/\s+/g, ' ');

for (const id of ['main', 'work', 'about', 'projects', 'contact']) {
  assert(html.includes(`id="${id}"`), `missing #${id}`);
}

assert(collapsed.includes('Dennis Kabaso'), 'missing the name');
assert(html.includes('BookIt Lusaka'), 'missing BookIt Lusaka');
assert(!html.includes('Bookit'), 'Bookit should be spelled BookIt');
assert(collapsed.includes('NIPA'), 'missing NIPA');
assert(collapsed.includes('ICTAZ'), 'missing ICTAZ');
assert(!html.includes('alt="Terminal prompt illustration"'), 'terminal illustration should be gone from the hero');
assert(html.includes('alt="Dennis Kabaso"'), 'portrait alt text is missing');
assert(html.includes('srcset="/assets/hero/dennis-cutout.webp"'), 'portrait webp source is missing');
assert(html.includes('src="/assets/hero/dennis-cutout.png"'), 'portrait png path is missing');
assert(
  /<svg\b[^>]*class="hero-burst"[^>]*\baria-hidden="true"/.test(html)
    || /<svg\b[^>]*\baria-hidden="true"[^>]*class="hero-burst"/.test(html),
  'burst svg should be aria-hidden',
);
assert(!/D3VCorp|founder|\bCEO\b/i.test(collapsed), 'founder, CEO, and D3VCorp wording are not allowed');
assert(collapsed.includes('Skip to content'), 'missing the skip link');
assert((html.match(/badge-demo/g) || []).length === 2, 'the two sites should be labelled Demo');

const cards = [...html.matchAll(/<article class="project-card">([\s\S]*?)<\/article>/g)].map((match) => match[1]);
assert(cards.length === 6, `expected 6 project cards, found ${cards.length}`);

for (const card of cards) {
  const title = card.match(/<h3>([^<]+)<\/h3>/)?.[1]?.trim();
  const description = card.match(/class="project-summary">([\s\S]*?)<\/p>/)?.[1]?.replace(/\s+/g, ' ').trim();
  const links = [...card.matchAll(/href="(https:\/\/[^"]+)"/g)].map((match) => match[1]);
  assert(Boolean(title), 'a project card is missing its title');
  assert(Boolean(description) && description.length > 40, `${title || 'a project'} is missing a description`);
  assert(links.length > 0, `${title || 'a project'} is missing a link`);
  for (const link of links) {
    let parsed;
    try {
      parsed = new URL(link);
    } catch {
      assert(false, `${title} has an invalid link: ${link}`);
      continue;
    }
    const allowed = parsed.hostname === 'github.com' || parsed.hostname === 'devdennie.github.io';
    assert(allowed && parsed.protocol === 'https:', `${title} links somewhere unexpected: ${link}`);
  }
}

const requiredLinks = [
  'https://devdennie.github.io/lusaka-car-rental-sales/',
  'https://devdennie.github.io/bookit-lusaka/',
  'https://github.com/devdennie/lusaka-car-rental-sales',
  'https://github.com/devdennie/bookit-lusaka',
  'https://github.com/devdennie/lusaka-road-safety-analysis',
  'https://github.com/devdennie/lusaka-food-prices-analysis',
  'https://github.com/devdennie/simple-chatroom',
  'https://github.com/devdennie/lusaka-air-quality-analysis',
  'https://github.com/devdennie',
];
for (const link of requiredLinks) {
  assert(html.includes(link), `missing link ${link}`);
}

assert(html.includes('href="mailto:Dennis.kabaso03@gmail.com"'), 'missing the email link');
assert(html.includes('href="https://wa.me/260767488673"'), 'missing the WhatsApp link');
assert(html.includes('href="https://www.instagram.com/dennienotdennis/"'), 'missing the Instagram link');
assert(html.includes('+260 767 488 673'), 'missing the displayed WhatsApp number');

const withoutAllowedEmail = html.replaceAll('mailto:Dennis.kabaso03@gmail.com', '').replaceAll('Dennis.kabaso03@gmail.com', '');
assert(!/mailto:/i.test(withoutAllowedEmail), 'an unexpected email link is not allowed');
assert(!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(withoutAllowedEmail), 'an unexpected email address is not allowed');

const withoutAllowedPhone = html
  .replaceAll('https://wa.me/260767488673', '')
  .replaceAll('+260 767 488 673', '');
assert(!/tel:/i.test(withoutAllowedPhone), 'a phone link is not allowed');
assert(!/wa\.me/i.test(withoutAllowedPhone), 'an unexpected WhatsApp link is not allowed');
assert(!/\+\d[\d\s()-]{6,}\d/.test(withoutAllowedPhone), 'an unexpected phone number is not allowed');

assert(!/linkedin/i.test(html), 'a LinkedIn link is not allowed');
assert(!/<form[\s>]/i.test(html), 'a contact form is not allowed');

const stylesheetTags = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map((match) => match[0]);
for (const tag of stylesheetTags) {
  const href = tag.match(/href=["']([^"']+)["']/)?.[1] ?? '';
  const external = /^(https?:)?\/\//i.test(href);
  assert(!external || href.startsWith('https://fonts.googleapis.com/'), `stylesheet is not local or a Google Font: ${href}`);
}

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, found);
    else found.push(path);
  }
  return found;
}

const dist = join(root, 'dist');
assert(existsSync(join(dist, 'assets', 'hero', 'dennis-cutout.webp')), 'portrait webp was not copied into dist');
assert(existsSync(join(dist, 'assets', 'hero', 'dennis-cutout.png')), 'portrait png was not copied into dist');
const cutoutPng = join(root, 'public', 'assets', 'hero', 'dennis-cutout.png');
assert(existsSync(cutoutPng) && statSync(cutoutPng).size < 409600, 'cutout png fallback must be under 400 KB');
for (const path of existsSync(dist) ? walk(dist) : []) {
  if (!['.html', '.css', '.js'].includes(extname(path))) continue;
  const text = readFileSync(path, 'utf8');
  const scriptSrcs = [...text.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const src of scriptSrcs) {
    assert(!/^(https?:)?\/\//i.test(src), `external script in ${path}: ${src}`);
  }
  assert(!/googletagmanager|google-analytics|gtag\(|plausible|hotjar|doubleclick/i.test(text), `tracker found in ${path}`);
}

assert(html.includes('href="/assets/') || html.includes("href='/assets/"), "built assets should be served from '/'");

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Portfolio checks passed.');
