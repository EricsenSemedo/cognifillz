import { Database } from 'bun:sqlite';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Bring the older, scattered trackers into one place. Every importer only reads its source.

const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
// "September 11, 2026" -> ISO date at noon UTC; anything else -> null.
export function parseLongDate(text) {
  const match = String(text).toLowerCase().match(/([a-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!match || !MONTHS.includes(match[1])) return null;
  const month = String(MONTHS.indexOf(match[1]) + 1).padStart(2, '0');
  return `${match[3]}-${month}-${match[2].padStart(2, '0')}T12:00:00.000Z`;
}

// job-review's buttons are Apply, Maybe, Pass ("skip") and Reset ("unreviewed").
const JOB_REVIEW_CHOICES = { apply: 'apply', maybe: 'maybe', skip: 'pass' };

// ~/job_search/job-review: researched job cards plus the Apply/Maybe/Pass choices made on the phone.
export function importJobReview(tracker, dir) {
  const jobs = JSON.parse(readFileSync(join(dir, 'data', 'jobs.json'), 'utf8'));
  const dbPath = join(dir, 'state', 'selections.sqlite');
  let decisions = {};
  if (existsSync(dbPath)) {
    const db = new Database(dbPath, { readonly: true });
    decisions = Object.fromEntries(db.query('SELECT job_id, decision FROM selections').all()
      .map(r => [r.job_id, JOB_REVIEW_CHOICES[r.decision]]).filter(([, choice]) => choice));
    db.close();
  }
  const results = [];
  for (const job of jobs) {
    const decision = decisions[job.id];
    const submitted = /submitted/i.test(job.application?.status ?? '');
    const status = submitted ? 'submitted' : decision === 'pass' ? 'passed' : decision === 'apply' ? 'picked' : 'rated';
    results.push(tracker.upsert({
      key: `job-review:${job.id}`,
      company: job.company, title: job.title,
      url: job.evidenceSources?.[0]?.url ?? job.application?.launchUrl,
      location: [job.location, job.workMode].filter(Boolean).join(' · '),
      source: 'job-review', matchByTitle: true, fitVerdict: job.recommendation, choice: decision ?? undefined, status,
      at: submitted ? parseLongDate(job.application.status) ?? undefined : undefined,
      note: submitted ? job.application.status : undefined,
    }));
  }
  return results;
}

// ~/job_search/applications/Applied_Jobs.md: the summary table plus each section's posting link.
export function importAppliedJobs(tracker, file) {
  const text = readFileSync(file, 'utf8');
  const postings = {};
  for (const section of text.split(/^## /m).slice(1)) {
    const heading = section.split('\n')[0].trim();
    const posting = section.match(/\*\*Posting:\*\*\s*(\S+)/);
    if (posting) postings[slug(heading)] = posting[1];
  }
  const results = [];
  for (const line of text.split('\n')) {
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells.length < 7 || cells[0] === 'Applied' || /^-+$/.test(cells[0])) continue;
    const [applied, company, title, location, , , statusText] = cells;
    results.push(tracker.upsert({
      key: `applied:${slug(company)}:${slug(title)}`,
      company, title, location, url: postings[slug(`${company} — ${title}`)],
      source: 'applied-jobs', matchByTitle: true, status: /submitted/i.test(statusText) ? 'submitted' : 'preparing',
      at: parseLongDate(applied) ?? undefined, note: `${statusText} (applied: ${applied})`,
    }));
  }
  return results;
}

// A rated role list such as a roles.json (employer, title, url, score, verdict, kind).
export function importRatedRoles(tracker, file, source = 'roles') {
  const roles = JSON.parse(readFileSync(file, 'utf8'));
  return roles.map(role => tracker.upsert({
    key: `${source}:${slug(role.employer)}:${role.req ?? slug(role.title)}`,
    company: role.employer, title: role.title, url: role.url, location: role.location,
    source, matchByTitle: true, externalId: role.req, fitScore: role.score, fitVerdict: role.verdict,
    status: role.kind === 'excluded' || role.recommended_for_application === false ? 'passed' : 'rated',
    note: role.exclusion_reason ?? undefined,
  }));
}
