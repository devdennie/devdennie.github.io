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

const mainHtml = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const sectionOrder = ['projects', 'work', 'about', 'contact'].map((id) => mainHtml.indexOf(`id="${id}"`));
assert(
  sectionOrder.every((index) => index !== -1)
    && sectionOrder[0] < sectionOrder[1]
    && sectionOrder[1] < sectionOrder[2]
    && sectionOrder[2] < sectionOrder[3],
  'sections should run projects, skills, about, then contact',
);

const navHtml = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'));
const navOrder = ['#projects', '#work', '#about', '#contact'].map((href) => navHtml.indexOf(`href="${href}"`));
assert(
  navOrder.every((index) => index !== -1)
    && navOrder[0] < navOrder[1]
    && navOrder[1] < navOrder[2]
    && navOrder[2] < navOrder[3],
  'nav should run Projects, Skills, About, then Contact',
);

const skillSection = html.slice(html.indexOf('id="work"'), html.indexOf('id="about"'));
const chipBlocks = [...skillSection.matchAll(/<ul class="skill-chips">([\s\S]*?)<\/ul>/g)];
assert(chipBlocks.length === 6, `expected 6 skill groups, found ${chipBlocks.length}`);
const chipNames = chipBlocks.flatMap((block) => [...block[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((item) => item[1]
  .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim()));
assert(chipNames.length > 0, 'missing skill chips');
const chipKeys = chipNames.map((name) => name.toLowerCase());
const duplicateChips = chipKeys.filter((name, index) => chipKeys.indexOf(name) !== index);
assert(duplicateChips.length === 0, `duplicate skill chips: ${duplicateChips.join(', ')}`);
assert(!/\d+\s*%|\bexpert\b/i.test(skillSection), 'skill bars, percentages and expert labels are not allowed');

assert(collapsed.includes('Dennis Kabaso'), 'missing the name');
assert(!html.includes('See the work'), 'the See the work link should be gone');
const ledeMarkup = html.match(/<p class="lede">([\s\S]*?)<\/p>/)?.[1] ?? '';
const ledeText = ledeMarkup
  .replace(/<span class="prompt"[\s\S]*?<\/span>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();
assert(
  ledeText === 'I write web applications and Python analysis notebooks, and I lead the ICTAZ NIPA Student Chapter.',
  `the intro text should stay in the page, got ${ledeText}`,
);
const siteCss = readFileSync(join(root, 'src/styles.css'), 'utf8');
assert(
  /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/.test(siteCss),
  'missing a prefers-reduced-motion rule',
);
assert(/animation:\s*none/.test(siteCss), 'reduced motion should stop the typing animation');
assert(html.includes('href="/resume.pdf"'), 'the CV download should stay in the hero');
assert(
  collapsed.includes('Open to internships, junior roles and collaborations'),
  'missing the hero open-to-work line',
);
assert(
  collapsed.includes("I'm open to internships, junior roles, partnerships, collaborations and projects in software development, data analysis and IT."),
  'missing the contact open-to-work line',
);
assert(
  /<meta name="description" content="[^"]{80,}"/.test(html),
  'missing a meta description',
);
assert(html.includes('<link rel="canonical" href="https://devdennie.github.io/">'), 'missing the canonical URL');
assert(html.includes('property="og:type" content="website"'), 'missing og:type');
assert(html.includes('property="og:title" content="Dennis Kabaso — Computer Science student"'), 'missing og:title');
assert(html.includes('property="og:url" content="https://devdennie.github.io/"'), 'missing og:url');
assert(html.includes('property="og:image" content="https://devdennie.github.io/og-image.png"'), 'missing og:image');
assert(html.includes('name="twitter:card" content="summary_large_image"'), 'missing the Twitter card');
assert(html.includes('name="twitter:image" content="https://devdennie.github.io/og-image.png"'), 'missing twitter:image');
{
  const ogPath = join(root, 'dist', 'og-image.png');
  assert(existsSync(ogPath), 'dist/og-image.png is missing');
  const og = readFileSync(ogPath);
  assert(og.length < 300 * 1024, `og image should be under 300 KB, got ${og.length}`);
  assert(og.readUInt32BE(16) === 1200 && og.readUInt32BE(20) === 630, 'og image should be 1200x630');
}
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

const shots = [...html.matchAll(/<img\b[^>]*class="project-shot"[^>]*>/g)].map((match) => match[0]);
assert(shots.length === 3, `expected 3 project screenshots, found ${shots.length}`);
for (const shot of shots) {
  assert(/\bwidth="\d+"/.test(shot), `project screenshot is missing width: ${shot}`);
  assert(/\bheight="\d+"/.test(shot), `project screenshot is missing height: ${shot}`);
  assert(/loading="lazy"/.test(shot), `project screenshot should load lazy: ${shot}`);
}
for (const name of ['bookit-lusaka.webp', 'zeddrive.webp', 'lusaka-food-prices.webp']) {
  const shotPath = join(root, 'dist', 'assets', 'projects', name);
  assert(existsSync(shotPath), `missing project image ${name}`);
  assert(statSync(shotPath).size < 150 * 1024, `${name} should be under 150 KB`);
  assert(html.includes(`/assets/projects/${name}`), `page is missing ${name}`);
}

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

const cvLink = html.match(/<a\b[^>]*href="\/resume\.pdf"[^>]*>[\s\S]*?<\/a>/);
assert(cvLink, 'missing the CV link');
assert(cvLink && /\bdownload=/.test(cvLink[0]), 'CV link should have a download attribute');
const cvLabel = cvLink ? cvLink[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
assert(cvLabel === 'Download CV (PDF)', `CV link should be labelled Download CV (PDF), got ${cvLabel}`);
const resumePublic = join(root, 'public', 'resume.pdf');
const resumeDist = join(root, 'dist', 'resume.pdf');
assert(existsSync(resumePublic), 'public/resume.pdf is missing');
assert(existsSync(resumeDist), 'dist/resume.pdf is missing');
assert(
  existsSync(resumePublic)
    && existsSync(resumeDist)
    && readFileSync(resumePublic).equals(readFileSync(resumeDist)),
  'dist/resume.pdf should match public/resume.pdf byte for byte',
);

assert(html.includes('href="mailto:Dennis.kabaso03@gmail.com"'), 'missing the email link');
assert(html.includes('href="https://wa.me/260767488673"'), 'missing the WhatsApp link');
assert(html.includes('href="https://www.instagram.com/dennienotdennis/"'), 'missing the Instagram link');
assert(html.includes('aria-label="Email Dennis"') && html.includes('title="Email Dennis"'), 'missing the email icon name');
assert(html.includes('aria-label="WhatsApp"') && html.includes('title="WhatsApp"'), 'missing the WhatsApp icon name');
assert(html.includes('aria-label="Instagram"') && html.includes('title="Instagram"'), 'missing the Instagram icon name');
assert(html.includes('aria-label="GitHub"') && html.includes('title="GitHub"'), 'missing the GitHub icon name');
assert(!html.includes('+260 767 488 673'), 'the WhatsApp number should not be a visible label');
const iconCss = readFileSync(join(root, 'src/styles.css'), 'utf8');
assert(/\.icon-button\s*\{[\s\S]*?min-height:\s*(?:4[4-9]|[5-9]\d)px/.test(iconCss), 'icon buttons should be at least 44px');
assert(/\.icon-button:focus-visible\s*\{[\s\S]*?outline\s*:/.test(iconCss), 'icon buttons need a visible focus style');

const withoutAllowedEmail = html.replaceAll('mailto:Dennis.kabaso03@gmail.com', '').replaceAll('Dennis.kabaso03@gmail.com', '');
assert(!/mailto:/i.test(withoutAllowedEmail), 'an unexpected email link is not allowed');
assert(!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(withoutAllowedEmail), 'an unexpected email address is not allowed');

const withoutAllowedPhone = html
  .replaceAll('https://wa.me/260767488673', '')
  .replaceAll('+260 767 488 673', '');
assert(!/tel:/i.test(withoutAllowedPhone), 'a phone link is not allowed');
assert(!/wa\.me/i.test(withoutAllowedPhone), 'an unexpected WhatsApp link is not allowed');
assert(!/\+\d[\d\s()-]{6,}\d/.test(withoutAllowedPhone), 'an unexpected phone number is not allowed');

const linkedinLinks = [...html.matchAll(/<a\b[^>]*href="https:\/\/www\.linkedin\.com\/in\/dennis-kabaso-67389b3a0\/"[^>]*>/g)];
assert(linkedinLinks.length === 1, `expected exactly one LinkedIn link, found ${linkedinLinks.length}`);
const linkedinTag = linkedinLinks[0]?.[0] ?? '';
assert(/\btarget="_blank"/.test(linkedinTag), 'LinkedIn link should use target="_blank"');
assert(/\brel="noopener noreferrer"/.test(linkedinTag), 'LinkedIn link should use rel="noopener noreferrer"');
assert(linkedinTag.includes('aria-label="LinkedIn"') && linkedinTag.includes('title="LinkedIn"'), 'LinkedIn icon should be named LinkedIn');
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

const notFoundPath = join(dist, '404.html');
assert(existsSync(notFoundPath), 'dist/404.html is missing');
const notFound = existsSync(notFoundPath) ? readFileSync(notFoundPath, 'utf8') : '';
assert(notFound.includes('Page not found'), '404 page is missing its heading');
assert(notFound.includes('href="/"'), '404 page should link home');
assert(!/<form[\s>]/i.test(notFound), '404 page should not include a form');

const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
assert(robots.includes('User-agent: *'), 'robots.txt should name a user agent');
assert(robots.includes('Allow: /'), 'robots.txt should allow all');
assert(robots.includes('Sitemap: https://devdennie.github.io/sitemap.xml'), 'robots.txt should point at the sitemap');

const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
assert(sitemap.includes('https://devdennie.github.io/'), 'sitemap should list the homepage');

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Portfolio checks passed.');
