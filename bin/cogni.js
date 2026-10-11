#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { openTracker } from '../src/tracker.js';
import { scan } from '../src/scan/run.js';
import { importAppliedJobs, importJobReview, importRatedRoles } from '../src/importers.js';
import { STATUSES } from '../src/statuses.js';

const ROOT = resolve(import.meta.dir, '..');
const DB_PATH = process.env.COGNI_DB ?? join(ROOT, 'state', 'tracker.sqlite');
const JOB_SEARCH = join(homedir(), 'job_search');
const CONFIG_PATH = process.env.COGNI_CONFIG ?? join(ROOT, 'config', 'portals.json');

const USAGE = `cogni: one tracker for every job, from found to offer.

  cogni list [--status S] [--entry] [--limit N]   jobs, newest change first
  cogni summary                                   count per status
  cogni show KEY                                  one job with its status history
  cogni scan [--company NAME|SLUG] [--dry-run]    scan public job boards in your portals config
  cogni choose KEY apply|maybe|pass [--note TEXT]
  cogni set KEY STATUS [--note TEXT]              statuses: ${STATUSES.join(', ')}
  cogni import job-review [--dir PATH]            default ~/job_search/job-review
  cogni import applied [--file PATH]              default ~/job_search/applications/Applied_Jobs.md
  cogni import roles FILE [--source NAME]         a rated roles.json

Database: ${DB_PATH} (override with COGNI_DB)
Portals:  ${CONFIG_PATH} (override with COGNI_CONFIG; start from config/portals.example.json)`;

const { values: flags, positionals } = parseArgs({
  args: Bun.argv.slice(2), allowPositionals: true,
  options: {
    status: { type: 'string' }, entry: { type: 'boolean' }, limit: { type: 'string' },
    company: { type: 'string' }, 'dry-run': { type: 'boolean' }, note: { type: 'string' },
    dir: { type: 'string' }, file: { type: 'string' }, source: { type: 'string' }, help: { type: 'boolean', short: 'h' },
  },
});

const pad = (text, width) => String(text ?? '').slice(0, width).padEnd(width);
const day = iso => (iso ?? '').slice(0, 10);

function printJobs(jobs) {
  if (!jobs.length) return console.log('No jobs match.');
  console.log(`${pad('STATUS', 10)} ${pad('CHANGED', 10)} ${pad('LEVEL', 5)} ${pad('COMPANY', 18)} ${pad('TITLE', 44)} ${pad('LOCATION', 24)} KEY`);
  for (const job of jobs) {
    const level = job.level === 'entry' ? 'entry' : '';
    console.log(`${pad(job.status, 10)} ${pad(day(job.status_at), 10)} ${pad(level, 5)} ${pad(job.company, 18)} ${pad(job.title, 44)} ${pad(job.location, 24)} ${job.key}`);
  }
}

function summarizeImport(label, results) {
  const created = results.filter(r => r.created).length;
  const advanced = results.filter(r => r.advanced).length;
  console.log(`${label}: ${results.length} read, ${created} new, ${advanced} moved forward, ${results.length - created - advanced} unchanged`);
}

async function main() {
  const [command, ...rest] = positionals;
  if (!command || flags.help) return console.log(USAGE);
  const tracker = openTracker(DB_PATH);
  try {
    switch (command) {
      case 'list':
        return printJobs(tracker.list({ status: flags.status, entryOnly: flags.entry, limit: Number(flags.limit ?? 50) }));
      case 'summary': {
        const counts = tracker.counts();
        for (const status of STATUSES) if (counts[status]) console.log(`${pad(status, 13)} ${counts[status]}`);
        return;
      }
      case 'show': {
        const job = tracker.get(rest[0]);
        if (!job) throw new Error(`No job with key "${rest[0]}"`);
        console.log(JSON.stringify({ ...job, history: tracker.history(job.key) }, null, 2));
        return;
      }
      case 'choose':
        return printJobs([tracker.choose(rest[0], rest[1], flags.note)]);
      case 'set':
        return printJobs([tracker.setStatus(rest[0], rest[1], flags.note)]);
      case 'import': {
        const kind = rest[0];
        if (kind === 'job-review') return summarizeImport('job-review', importJobReview(tracker, flags.dir ?? join(JOB_SEARCH, 'job-review')));
        if (kind === 'applied') return summarizeImport('applied jobs', importAppliedJobs(tracker, flags.file ?? join(JOB_SEARCH, 'applications', 'Applied_Jobs.md')));
        if (kind === 'roles' && rest[1]) return summarizeImport(flags.source ?? 'roles', importRatedRoles(tracker, rest[1], flags.source));
        throw new Error('Usage: cogni import job-review|applied|roles FILE');
      }
      case 'scan': {
        if (!existsSync(CONFIG_PATH)) throw new Error(`No portals config at ${CONFIG_PATH}. Copy config/portals.example.json there and add your places and companies.`);
        const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
        const reports = await scan(config, tracker, { only: flags.company, dryRun: flags['dry-run'] });
        for (const r of reports) {
          const line = r.error ? `failed: ${r.error}` : `${r.fetched} listed, ${r.kept} match, ${r.added} new, ${r.closed} closed${r.reopened ? `, ${r.reopened} reopened` : ''}`;
          console.log(`${pad(r.company, 18)} ${pad(r.ats, 10)} ${line}`);
          if (flags['dry-run']) for (const job of r.jobs) console.log(`    ${job.level === 'entry' ? '[entry] ' : ''}${job.title} · ${job.location}`);
        }
        const failed = reports.filter(r => r.error).length;
        if (failed) console.log(`${failed} board(s) failed; their jobs were left as they were.`);
        return;
      }
      default:
        throw new Error(`Unknown command "${command}".\n\n${USAGE}`);
    }
  } finally {
    tracker.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
