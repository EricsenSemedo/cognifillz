import { describe, expect, test } from 'bun:test';
import { normalizeUrl, openTracker } from '../src/tracker.js';

const clock = () => {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 9, 11, 12, 0, tick++)).toISOString();
};
const fresh = () => openTracker(':memory:', { now: clock() });
const job = (overrides = {}) => ({ key: 'gh:acme:1', company: 'Acme', title: 'Software Engineer I', url: 'https://jobs.example.com/acme/1', source: 'scan', ...overrides });

describe('normalizeUrl', () => {
  test('drops query, fragment, trailing slash and /apply', () => {
    expect(normalizeUrl('https://Jobs.Lever.co/demo/abc/apply?lever-source=x#top')).toBe('https://jobs.lever.co/demo/abc');
    expect(normalizeUrl('https://jobs.lever.co/demo/abc/')).toBe('https://jobs.lever.co/demo/abc');
    expect(normalizeUrl('not a url')).toBeNull();
    expect(normalizeUrl(undefined)).toBeNull();
  });
});

describe('tracker', () => {
  test('a new job starts as found with one history entry', () => {
    const tracker = fresh();
    expect(tracker.upsert(job())).toEqual({ key: 'gh:acme:1', created: true, advanced: false });
    expect(tracker.get('gh:acme:1').status).toBe('found');
    expect(tracker.history('gh:acme:1')).toHaveLength(1);
  });

  test('the same posting from another source is matched by URL, not duplicated', () => {
    const tracker = fresh();
    tracker.upsert(job({ key: 'job-review:acme', source: 'job-review', url: 'https://jobs.example.com/acme/1/', status: 'rated' }));
    const result = tracker.upsert(job({ url: 'https://jobs.example.com/acme/1?ref=board', location: 'Boston, MA' }));
    expect(result).toEqual({ key: 'job-review:acme', created: false, advanced: false });
    expect(tracker.list()).toHaveLength(1);
    expect(tracker.get('job-review:acme').location).toBe('Boston, MA');
  });

  test('company + title matching is opt-in and tolerates a longer company name', () => {
    const tracker = fresh();
    tracker.upsert(job({ key: 'job-review:voltus', company: 'Voltus (posted via MeeBoss)', title: 'Software Engineer', url: null }));
    expect(tracker.upsert(job({ key: 'gh:voltus:9', company: 'Voltus', title: 'Software Engineer', url: 'https://example.com/9' })).created).toBe(true);
    const imported = tracker.upsert(job({ key: 'applied:voltus', company: 'Voltus', title: 'Software engineer', url: null, matchByTitle: true, status: 'submitted' }));
    expect(imported).toMatchObject({ created: false, advanced: true });
  });

  test('upserts only move status forward and never out of a settled status', () => {
    const tracker = fresh();
    tracker.upsert(job({ status: 'submitted' }));
    expect(tracker.upsert(job({ status: 'found' })).advanced).toBe(false);
    expect(tracker.upsert(job({ status: 'interviewing' })).advanced).toBe(false);
    expect(tracker.get('gh:acme:1').status).toBe('submitted');

    tracker.upsert(job({ key: 'gh:acme:2', url: 'https://jobs.example.com/acme/2' }));
    expect(tracker.upsert(job({ key: 'gh:acme:2', url: 'https://jobs.example.com/acme/2', status: 'rated' })).advanced).toBe(true);
    expect(tracker.get('gh:acme:2').status).toBe('rated');
  });

  test('existing values are kept; empty ones are filled in', () => {
    const tracker = fresh();
    tracker.upsert(job({ location: 'Remote' }));
    tracker.upsert(job({ location: 'Boston, MA', fitScore: 8 }));
    const stored = tracker.get('gh:acme:1');
    expect(stored.location).toBe('Remote');
    expect(stored.fit_score).toBe(8);
  });

  test('choosing apply or pass moves status; maybe does not', () => {
    const tracker = fresh();
    tracker.upsert(job());
    expect(tracker.choose('gh:acme:1', 'maybe').status).toBe('found');
    expect(tracker.choose('gh:acme:1', 'apply').status).toBe('picked');
    tracker.setStatus('gh:acme:1', 'submitted');
    expect(tracker.choose('gh:acme:1', 'pass').status).toBe('submitted');
    expect(() => tracker.choose('gh:acme:1', 'later')).toThrow('Unknown choice');
  });

  test('manual set accepts any status, logs it, and rejects unknown ones', () => {
    const tracker = fresh();
    tracker.upsert(job({ status: 'submitted' }));
    tracker.setStatus('gh:acme:1', 'rejected', 'email from recruiter');
    expect(tracker.history('gh:acme:1').map(h => h.status)).toEqual(['submitted', 'rejected']);
    expect(() => tracker.setStatus('gh:acme:1', 'ghosted')).toThrow('Unknown status');
    expect(() => tracker.setStatus('missing', 'found')).toThrow('No job');
  });

  test('closeMissing closes only open jobs from that portal', () => {
    const tracker = fresh();
    tracker.upsert(job({ portal: 'greenhouse:acme' }));
    tracker.upsert(job({ key: 'gh:acme:2', url: 'https://jobs.example.com/acme/2', portal: 'greenhouse:acme' }));
    tracker.upsert(job({ key: 'gh:acme:3', url: 'https://jobs.example.com/acme/3', portal: 'greenhouse:acme', status: 'submitted' }));
    tracker.upsert(job({ key: 'lv:other:1', url: 'https://jobs.example.com/other/1', portal: 'lever:other' }));
    expect(tracker.closeMissing('greenhouse:acme', ['gh:acme:1'])).toEqual(['gh:acme:2']);
    expect(tracker.get('gh:acme:3').status).toBe('submitted');
    expect(tracker.get('lv:other:1').status).toBe('found');
  });

  test('list filters by status and entry level; counts groups by status', () => {
    const tracker = fresh();
    tracker.upsert(job({ level: 'entry' }));
    tracker.upsert(job({ key: 'gh:acme:2', url: 'https://jobs.example.com/acme/2', level: 'unspecified', status: 'rated' }));
    expect(tracker.list({ entryOnly: true }).map(j => j.key)).toEqual(['gh:acme:1']);
    expect(tracker.list({ status: 'rated' }).map(j => j.key)).toEqual(['gh:acme:2']);
    expect(tracker.counts()).toEqual({ found: 1, rated: 1 });
  });
});
