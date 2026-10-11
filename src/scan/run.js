import { PROVIDERS } from './providers.js';
import { buildFilter } from './filter.js';

const USER_AGENT = 'cognifillz-scan/0.1 (personal job search; public board APIs only)';

async function fetchJson(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Run `worker` over `items` with at most `limit` in flight.
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(lanes);
  return results;
}

const WHERE_NOTES = { local: 'commute area', 'remote-us': 'US remote', relocate: 'entry-level; would need to relocate' };

export const jobKey = (ats, slug, externalId) => `${ats}:${slug}:${externalId}`;

// Scan every enabled portal, record kept postings as "found", and close ones that vanished.
// One failing board never stops the others; it is reported and its jobs are left untouched.
export async function scan(config, tracker, { fetchImpl = fetch, only, dryRun = false, timeoutMs = 15000, concurrency = 4 } = {}) {
  const judge = buildFilter(config.filters);
  const portals = config.portals.filter(p => p.enabled !== false && (!only || p.slug === only || p.company.toLowerCase() === only.toLowerCase()));
  if (only && !portals.length) throw new Error(`No enabled portal matches "${only}"`);

  return pool(portals, concurrency, async portal => {
    const provider = PROVIDERS[portal.ats];
    const report = { company: portal.company, ats: portal.ats, slug: portal.slug, fetched: 0, kept: 0, added: 0, reopened: 0, closed: 0, error: null, jobs: [] };
    if (!provider) return { ...report, error: `unsupported ATS "${portal.ats}"` };
    let postings;
    try {
      postings = provider.parse(await fetchJson(provider.url(portal.slug), fetchImpl, timeoutMs));
    } catch (error) {
      return { ...report, error: error.name === 'AbortError' ? 'timed out' : error.message };
    }
    report.fetched = postings.length;
    const portalId = `${portal.ats}:${portal.slug}`;
    const seen = [];
    for (const posting of postings) {
      const verdict = judge(posting);
      if (!verdict.keep) continue;
      report.kept++;
      const key = jobKey(portal.ats, portal.slug, posting.externalId);
      report.jobs.push({ key, title: posting.title, location: posting.location, level: verdict.level, where: verdict.where, url: posting.url });
      if (dryRun) continue;
      const before = tracker.get(key);
      const result = tracker.upsert({
        key, company: portal.company, title: posting.title, url: posting.url, location: posting.location,
        level: verdict.level, source: 'scan', ats: portal.ats, portal: portalId, externalId: posting.externalId,
        postedAt: posting.postedAt, notes: WHERE_NOTES[verdict.where],
      });
      seen.push(result.key);
      if (result.created) report.added++;
      if (before?.status === 'closed') {
        tracker.setStatus(result.key, 'found', 'listed again on the job board');
        report.reopened++;
      }
    }
    if (!dryRun) report.closed = tracker.closeMissing(portalId, seen).length;
    return report;
  });
}
