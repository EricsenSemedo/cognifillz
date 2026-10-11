import { describe, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importAppliedJobs, importJobReview, importRatedRoles, parseLongDate } from '../src/importers.js';
import { openTracker } from '../src/tracker.js';

// Synthetic copies of each source format; no real job-search data is read.
function makeJobReview() {
  const dir = mkdtempSync(join(tmpdir(), 'cogni-job-review-'));
  mkdirSync(join(dir, 'data'));
  mkdirSync(join(dir, 'state'));
  writeFileSync(join(dir, 'data', 'jobs.json'), JSON.stringify([
    { id: 'studio', company: 'Studio', title: 'Associate Engineer', location: 'Remote', workMode: 'Remote', recommendation: 'Strong fit',
      evidenceSources: [{ url: 'https://jobs.lever.co/studio/abc/' }], application: { status: 'Submitted · September 11, 2026' } },
    { id: 'bank', company: 'Bank', title: 'Developer', recommendation: 'Stretch', evidenceSources: [{ url: 'https://example.com/bank/1' }] },
    { id: 'shop', company: 'Shop', title: 'Engineer', recommendation: 'Maybe', evidenceSources: [{ url: 'https://example.com/shop/1' }] },
  ]));
  const db = new Database(join(dir, 'state', 'selections.sqlite'), { create: true });
  db.exec(`CREATE TABLE selections (job_id TEXT PRIMARY KEY, decision TEXT NOT NULL, updated_at TEXT NOT NULL, version INTEGER NOT NULL);
    INSERT INTO selections VALUES ('studio', 'apply', '2026-09-11', 1), ('bank', 'skip', '2026-09-12', 1), ('shop', 'unreviewed', '2026-09-13', 2);`);
  db.close();
  return dir;
}

describe('importers', () => {
  test('parseLongDate', () => {
    expect(parseLongDate('Submitted · September 11, 2026')).toBe('2026-09-11T12:00:00.000Z');
    expect(parseLongDate('Date unconfirmed')).toBeNull();
  });

  test('job-review: submitted, passed and unchosen cards get matching statuses', () => {
    const tracker = openTracker(':memory:');
    importJobReview(tracker, makeJobReview());
    expect(tracker.get('job-review:studio')).toMatchObject({ status: 'submitted', choice: 'apply', status_at: '2026-09-11T12:00:00.000Z' });
    expect(tracker.get('job-review:bank')).toMatchObject({ status: 'passed', choice: 'pass' });
    expect(tracker.get('job-review:shop')).toMatchObject({ status: 'rated', choice: null, fit_verdict: 'Maybe' });
  });

  test('applied jobs table, matched to job-review by posting URL, and re-import is a no-op', () => {
    const tracker = openTracker(':memory:');
    importJobReview(tracker, makeJobReview());
    const file = join(mkdtempSync(join(tmpdir(), 'cogni-applied-')), 'Applied_Jobs.md');
    writeFileSync(file, `# Applied jobs

| Applied | Company | Title | Location | Advertised base/year | Hourly equivalent | Status |
| --- | --- | --- | --- | --- | --- | --- |
| September 11, 2026 | Studio | Associate Engineer | Remote | $80,000 | $38.46 | Submitted; awaiting response |
| Date unconfirmed (previously applied) | Agency | Junior Engineer | Boston | Not stated | Unknown | Submitted; user confirmed |
| September 12, 2026 | Bank Corp | Developer | Boston | Not stated | Unknown | Submitted; user confirmed |

## Studio — Associate Engineer

- **Posting:** https://jobs.lever.co/studio/abc/
`);
    const first = importAppliedJobs(tracker, file);
    expect(first.map(r => r.key)).toEqual(['job-review:studio', 'applied:agency:junior-engineer', 'job-review:bank']);
    expect(tracker.get('job-review:bank').status).toBe('passed');
    expect(tracker.get('applied:agency:junior-engineer').status).toBe('submitted');
    expect(importAppliedJobs(tracker, file).every(r => !r.created && !r.advanced)).toBe(true);
    expect(tracker.list()).toHaveLength(4);
  });

  test('rated roles: excluded roles are passed, the rest rated with their score', () => {
    const tracker = openTracker(':memory:');
    const file = join(mkdtempSync(join(tmpdir(), 'cogni-roles-')), 'roles.json');
    writeFileSync(file, JSON.stringify([
      { employer: 'Initech', req: '8643', title: 'Entry level Software Engineer', url: 'https://careers.initech.example/jobs/8643?lang=en-us', score: 8, kind: 'direct', verdict: 'Investigate' },
      { employer: 'Initech', req: '8092', title: 'Junior System Administrator', url: 'https://careers.initech.example/jobs/8092', score: 1, kind: 'excluded', verdict: 'Excluded', exclusion_reason: 'Infrastructure' },
    ]));
    importRatedRoles(tracker, file);
    expect(tracker.get('roles:initech:8643')).toMatchObject({ status: 'rated', fit_score: 8, url: 'https://careers.initech.example/jobs/8643' });
    expect(tracker.get('roles:initech:8092').status).toBe('passed');
  });
});
