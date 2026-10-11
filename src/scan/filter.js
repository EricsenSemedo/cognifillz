// Decide whether a scanned posting is worth tracking: a software role, not senior, and either
// in your commute area (localPlaces), remote in the US, or entry-level anywhere in the US (marked "relocate").

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word, case-insensitive match for any phrase in the list.
export function phraseMatcher(phrases) {
  if (!phrases?.length) return () => false;
  const pattern = new RegExp(`(?:^|[^a-z0-9])(?:${phrases.map(p => escape(p.toLowerCase())).join('|')})(?=$|[^a-z0-9])`, 'i');
  return text => pattern.test(String(text ?? '').toLowerCase());
}

export function buildFilter(filters) {
  const isSoftware = phraseMatcher(filters.titleInclude);
  const isExcludedTitle = phraseMatcher(filters.titleExclude);
  const isEntry = phraseMatcher(filters.entrySignals);
  const isLocal = phraseMatcher(filters.localPlaces);
  const isUsRemote = phraseMatcher(filters.usRemotePlaces);
  const isAbroad = phraseMatcher(filters.abroadPlaces);
  const usTerms = new RegExp(`(?:${filters.usRemotePlaces.map(escape).join('|')})`, 'ig');

  return function judge(posting) {
    const title = posting.title ?? '';
    if (!isSoftware(title)) return { keep: false, reason: 'not a software role' };
    if (isExcludedTitle(title)) return { keep: false, reason: 'senior or non-entry title' };

    const location = posting.location ?? '';
    const level = isEntry(title) ? 'entry' : 'unspecified';
    const remote = posting.remote || /remote/i.test(location);
    // A bare country ("United States", "USA") usually means US-wide remote.
    const onlyCountry = isUsRemote(location) && !location.replace(usTerms, '').replace(/[^a-z]/gi, '');
    let where = null;
    if (isLocal(location)) where = 'local';
    else if (isAbroad(location)) where = null;
    else if ((remote && (isUsRemote(location) || !location.replace(/remote/ig, '').trim())) || onlyCountry) where = 'remote-us';
    else if (level === 'entry') where = 'relocate';   // entry-level roles are worth seeing even if you'd have to move
    if (!where) return { keep: false, reason: 'not local, not US remote, and not entry-level' };

    return { keep: true, where, level };
  };
}
