import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFilter } from '../src/scan/filter.js';
import { PROVIDERS } from '../src/scan/providers.js';
import { scan } from '../src/scan/run.js';
import { openTracker } from '../src/tracker.js';

const { filters } = JSON.parse(readFileSync(join(import.meta.dir, '..', 'config', 'portals.example.json'), 'utf8'));
const judge = buildFilter(filters);

describe('filter', () => {
  test.each([
    ['Software Engineer I', 'Boston, MA', true, 'entry'],
    ['Associate Software Engineer', 'Remote - US', true, 'entry'],
    ['Software Engineer, New Grad 2026', 'San Francisco, CA; Remote, United States', true, 'entry'],
    ['Gameplay Programmer', 'Springfield', true, 'unspecified'],
    ['Software Engineer', 'Remote', true, 'unspecified'],
    ['Senior Software Engineer', 'Boston, MA', false, null],
    ['Software Engineer II', 'Boston, MA', false, null],
    ['Staff Engineer, Platform', 'Remote - US', false, null],
    ['Software Engineering Intern', 'Boston, MA', false, null],
    ['Engineering Manager', 'Boston, MA', false, null],
    ['Recruiter', 'Boston, MA', false, null],
    ['Software Engineer', 'San Francisco, CA', false, null],
    ['Software Engineer, Engine Systems', 'San Mateo, CA, United States', false, null],
    ['[2027] Software Engineer, Early Career', 'San Mateo, CA, United States', true, 'entry'],
    ['Software Engineer', 'United States', true, 'unspecified'],
    ['Developer Advocate', 'Remote - US', false, null],
    ['Developer Relations Engineer', 'Remote, New York, US', false, null],
    ['Software Engineer', 'Remote - Canada', false, null],
    ['Software Engineer', 'London, UK', false, null],
  ])('%s · %s', (title, location, keep, level) => {
    const verdict = judge({ title, location });
    expect(verdict.keep).toBe(keep);
    if (keep) expect(verdict.level).toBe(level);
  });

  test('entry-level roles outside the commute area are kept as relocate', () => {
    expect(judge({ title: 'Associate Software Engineer', location: 'Austin, TX' })).toMatchObject({ keep: true, where: 'relocate' });
    expect(judge({ title: 'Associate Software Engineer', location: 'Toronto, Canada' }).keep).toBe(false);
  });

  test('a remote flag with an empty location counts as US remote', () => {
    expect(judge({ title: 'Frontend Engineer', location: '', remote: true })).toMatchObject({ keep: true, where: 'remote-us' });
  });
});

describe('providers', () => {
  test('greenhouse', () => {
    const [job] = PROVIDERS.greenhouse.parse({ jobs: [{ id: 42, title: 'Software Engineer I', absolute_url: 'https://boards.greenhouse.io/acme/jobs/42', location: { name: 'Boston, MA' }, first_published: '2026-10-01T00:00:00Z' }] });
    expect(job).toEqual({ externalId: '42', title: 'Software Engineer I', url: 'https://boards.greenhouse.io/acme/jobs/42', location: 'Boston, MA', remote: false, postedAt: '2026-10-01T00:00:00.000Z' });
  });

  test('lever', () => {
    const [job] = PROVIDERS.lever.parse([{ id: 'abc', text: 'Associate Engineer', hostedUrl: 'https://jobs.lever.co/acme/abc', workplaceType: 'remote', createdAt: 1790000000000, categories: { location: 'Remote', allLocations: ['Remote', 'Boston, MA'] } }]);
    expect(job).toMatchObject({ externalId: 'abc', location: 'Remote; Boston, MA', remote: true });
    expect(PROVIDERS.lever.parse({ ok: false })).toEqual([]);
  });

  test('ashby skips unlisted jobs', () => {
    const jobs = PROVIDERS.ashby.parse({ jobs: [
      { id: '1', title: 'Product Engineer', jobUrl: 'https://jobs.ashbyhq.com/acme/1', location: 'Remote', isRemote: true, secondaryLocations: [{ location: 'New York' }], publishedAt: '2026-10-02' },
      { id: '2', title: 'Hidden', jobUrl: 'https://jobs.ashbyhq.com/acme/2', isListed: false },
    ] });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ location: 'Remote; New York', remote: true });
  });
});

const respond = body => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

describe('scan', () => {
  const config = {
    filters,
    portals: [
      { company: 'Acme', ats: 'greenhouse', slug: 'acme' },
      { company: 'Broken', ats: 'lever', slug: 'broken' },
      { company: 'Paused', ats: 'ashby', slug: 'paused', enabled: false },
    ],
  };
  let board;
  const fetchImpl = url => {
    if (url.includes('broken')) return Promise.resolve(new Response('nope', { status: 500 }));
    if (url.includes('paused')) throw new Error('disabled portals must not be fetched');
    return respond({ jobs: board });
  };
  const posting = (id, title, location = 'Boston, MA') => ({ id, title, absolute_url: `https://boards.greenhouse.io/acme/jobs/${id}`, location: { name: location } });

  test('records matches, reports failures per board, then closes and reopens postings', async () => {
    const tracker = openTracker(':memory:');
    board = [posting(1, 'Software Engineer I'), posting(2, 'Senior Software Engineer'), posting(3, 'Frontend Engineer', 'Remote - US')];
    const [acme, broken] = await scan(config, tracker, { fetchImpl });
    expect(acme).toMatchObject({ fetched: 3, kept: 2, added: 2, closed: 0, error: null });
    expect(broken.error).toBe('HTTP 500');
    expect(tracker.get('greenhouse:acme:1')).toMatchObject({ status: 'found', level: 'entry', portal: 'greenhouse:acme' });

    board = [posting(1, 'Software Engineer I')];
    const [second] = await scan(config, tracker, { fetchImpl });
    expect(second).toMatchObject({ added: 0, closed: 1 });
    expect(tracker.get('greenhouse:acme:3').status).toBe('closed');

    board = [posting(1, 'Software Engineer I'), posting(3, 'Frontend Engineer', 'Remote - US')];
    const [third] = await scan(config, tracker, { fetchImpl });
    expect(third).toMatchObject({ reopened: 1, closed: 0 });
    expect(tracker.get('greenhouse:acme:3').status).toBe('found');
  });

  test('a failed board leaves its existing jobs alone', async () => {
    const tracker = openTracker(':memory:');
    tracker.upsert({ key: 'lever:broken:x', company: 'Broken', title: 'Software Engineer', source: 'scan', portal: 'lever:broken' });
    board = [];
    await scan(config, tracker, { fetchImpl });
    expect(tracker.get('lever:broken:x').status).toBe('found');
  });

  test('dry run lists matches without writing', async () => {
    const tracker = openTracker(':memory:');
    board = [posting(1, 'Software Engineer I')];
    const [acme] = await scan(config, tracker, { fetchImpl, only: 'acme', dryRun: true });
    expect(acme.jobs.map(j => j.title)).toEqual(['Software Engineer I']);
    expect(tracker.list()).toHaveLength(0);
    await expect(scan(config, tracker, { fetchImpl, only: 'nobody' })).rejects.toThrow('No enabled portal');
  });
});
