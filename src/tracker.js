import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { assertChoice, assertStatus, isForward } from './statuses.js';

// One table of public job data and where each job is in the pipeline.
// Never store contact details, resumes or form answers here.

const slugify = text => String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function normalizeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/(apply)?\/?$/, '')}`;
  } catch {
    return null;
  }
}

const SCHEMA = `PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS jobs (
    key TEXT PRIMARY KEY,
    company TEXT NOT NULL, title TEXT NOT NULL, url TEXT, location TEXT,
    level TEXT, source TEXT NOT NULL, ats TEXT, portal TEXT, external_id TEXT, posted_at TEXT,
    fit_score REAL, fit_verdict TEXT, choice TEXT,
    status TEXT NOT NULL, status_at TEXT NOT NULL,
    first_seen TEXT NOT NULL, last_seen TEXT NOT NULL, notes TEXT
  );
  CREATE UNIQUE INDEX IF NOT EXISTS jobs_url ON jobs(url) WHERE url IS NOT NULL;
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY, job_key TEXT NOT NULL, status TEXT NOT NULL, at TEXT NOT NULL, note TEXT
  );`;

// Fields an upsert may fill in when the stored value is still empty.
const FILLABLE = ['url', 'location', 'level', 'ats', 'portal', 'external_id', 'posted_at', 'fit_score', 'fit_verdict', 'notes'];

export function openTracker(path, { now = () => new Date().toISOString() } = {}) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.exec(SCHEMA);

  const get = key => db.query('SELECT * FROM jobs WHERE key = ?').get(key) ?? null;
  const findByUrl = url => (url ? db.query('SELECT * FROM jobs WHERE url = ?').get(url) ?? null : null);
  // For imports from hand-kept lists: same title, and one company name starts with the other
  // ("Voltus" vs "Voltus (posted via MeeBoss)"). Scans never use this; one board can list the same title twice.
  const findByTitle = (company, title) => {
    const wantCompany = slugify(company);
    const wantTitle = slugify(title);
    return db.query('SELECT * FROM jobs').all().find(row => {
      const have = slugify(row.company);
      return slugify(row.title) === wantTitle && (have.startsWith(wantCompany) || wantCompany.startsWith(have));
    }) ?? null;
  };
  const logStatus = (key, status, at, note) =>
    db.query('INSERT INTO history (job_key, status, at, note) VALUES (?, ?, ?, ?)').run(key, status, at, note ?? null);

  const moveTo = (job, status, at, note) => {
    db.query('UPDATE jobs SET status = ?, status_at = ? WHERE key = ?').run(status, at, job.key);
    logStatus(job.key, status, at, note);
  };

  // Insert a job, or refresh one we already know (matched by key, then URL, then optionally company + title).
  // Returns { key, created, advanced }. A known job's status only moves forward.
  const upsert = db.transaction(job => {
    const at = job.at ?? now();
    const url = normalizeUrl(job.url);
    const existing = get(job.key) ?? findByUrl(url) ?? (job.matchByTitle ? findByTitle(job.company, job.title) : null);
    const status = assertStatus(job.status ?? 'found');
    if (!existing) {
      db.query(`INSERT INTO jobs (key, company, title, url, location, level, source, ats, portal, external_id,
          posted_at, fit_score, fit_verdict, choice, status, status_at, first_seen, last_seen, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        job.key, job.company, job.title, url, job.location ?? null, job.level ?? null, job.source,
        job.ats ?? null, job.portal ?? null, job.externalId ?? null, job.postedAt ?? null,
        job.fitScore ?? null, job.fitVerdict ?? null, job.choice ? assertChoice(job.choice) : null,
        status, at, at, at, job.notes ?? null);
      logStatus(job.key, status, at, job.note ?? `added from ${job.source}`);
      return { key: job.key, created: true, advanced: false };
    }
    const incoming = { url, location: job.location, level: job.level, ats: job.ats, portal: job.portal,
      external_id: job.externalId, posted_at: job.postedAt, fit_score: job.fitScore, fit_verdict: job.fitVerdict, notes: job.notes };
    for (const field of FILLABLE) {
      if (existing[field] == null && incoming[field] != null && !(field === 'url' && findByUrl(url))) {
        db.query(`UPDATE jobs SET ${field} = ? WHERE key = ?`).run(incoming[field], existing.key);
      }
    }
    db.query('UPDATE jobs SET last_seen = ? WHERE key = ?').run(at, existing.key);
    if (job.choice && existing.choice == null) db.query('UPDATE jobs SET choice = ? WHERE key = ?').run(assertChoice(job.choice), existing.key);
    const advanced = isForward(existing.status, status);
    if (advanced) moveTo(existing, status, at, job.note ?? `updated from ${job.source}`);
    return { key: existing.key, created: false, advanced };
  });

  // Manual status change: any status is allowed, and every change is logged.
  const setStatus = db.transaction((key, status, note) => {
    const job = get(key);
    if (!job) throw new Error(`No job with key "${key}"`);
    assertStatus(status);
    if (job.status !== status) moveTo(job, status, now(), note ?? 'set manually');
    return get(key);
  });

  // Apply / Maybe / Pass. Apply and Pass also move the status when that is forward progress.
  const choose = db.transaction((key, choice, note) => {
    const job = get(key);
    if (!job) throw new Error(`No job with key "${key}"`);
    assertChoice(choice);
    db.query('UPDATE jobs SET choice = ? WHERE key = ?').run(choice, key);
    const target = { apply: 'picked', pass: 'passed' }[choice];
    if (target && isForward(job.status, target)) moveTo(job, target, now(), note ?? `chose ${choice}`);
    return get(key);
  });

  // After a successful scan of one portal, close open jobs that disappeared from it.
  const closeMissing = db.transaction((portal, seenKeys, note = 'no longer listed on the job board') => {
    const seen = new Set(seenKeys);
    const open = db.query(`SELECT * FROM jobs WHERE portal = ? AND status IN ('found', 'rated')`).all(portal);
    const closed = open.filter(job => !seen.has(job.key));
    const at = now();
    for (const job of closed) moveTo(job, 'closed', at, note);
    return closed.map(job => job.key);
  });

  const list = ({ status, limit = 50, entryOnly = false } = {}) => {
    const where = [];
    const args = [];
    if (status) { where.push('status = ?'); args.push(assertStatus(status)); }
    if (entryOnly) where.push(`level = 'entry'`);
    const sql = `SELECT * FROM jobs ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY status_at DESC, company LIMIT ?`;
    return db.query(sql).all(...args, limit);
  };

  const history = key => db.query('SELECT status, at, note FROM history WHERE job_key = ? ORDER BY id').all(key);
  const counts = () => Object.fromEntries(db.query('SELECT status, COUNT(*) AS n FROM jobs GROUP BY status').all().map(r => [r.status, r.n]));

  return { get, upsert, setStatus, choose, closeMissing, list, history, counts, close: () => db.close() };
}
