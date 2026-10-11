// Public job-board APIs. No login, no scraping of rendered pages, no AI calls.
// Endpoint choices follow career-ops' providers (MIT, github.com/career-ops-hq/career-ops).

const iso = value => {
  if (value == null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const joinLocations = parts => [...new Set(parts.filter(Boolean).map(part => String(part).trim()))].join('; ');

export const PROVIDERS = {
  greenhouse: {
    url: slug => `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs`,
    parse: body => (body.jobs ?? []).map(job => ({
      externalId: String(job.id),
      title: job.title,
      url: job.absolute_url,
      location: joinLocations([job.location?.name, ...(job.offices ?? []).map(office => office.location ?? office.name)]),
      remote: /remote/i.test(job.location?.name ?? ''),
      postedAt: iso(job.first_published ?? job.updated_at),
    })),
  },
  lever: {
    url: slug => `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`,
    parse: body => (Array.isArray(body) ? body : []).map(job => ({
      externalId: job.id,
      title: job.text,
      url: job.hostedUrl,
      location: joinLocations([job.categories?.location, ...(job.categories?.allLocations ?? [])]),
      remote: job.workplaceType === 'remote',
      postedAt: iso(job.createdAt),
    })),
  },
  ashby: {
    url: slug => `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`,
    parse: body => (body.jobs ?? []).filter(job => job.isListed !== false).map(job => ({
      externalId: job.id,
      title: job.title,
      url: job.jobUrl,
      location: joinLocations([job.location, ...(job.secondaryLocations ?? []).map(extra => extra.location)]),
      remote: Boolean(job.isRemote) || /remote/i.test(job.workplaceType ?? ''),
      postedAt: iso(job.publishedAt),
    })),
  },
};
