const ACRONYMS = new Set([
  'AI',
  'API',
  'CLI',
  'CSS',
  'DB',
  'DNS',
  'FDC',
  'HTML',
  'IO',
  'IOT',
  'JS',
  'JSON',
  'LLM',
  'ML',
  'OS',
  'RLS',
  'SQL',
  'TS',
  'UI',
  'URL',
  'UX',
  'VPN',
]);

const SKIP_REPOS = new Set(['portfolio']);
const CACHE_TTL_MS = 10 * 60 * 1000;

export function formatRepoTitle(name) {
  return String(name || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function formatTopicTag(topic) {
  return formatRepoTitle(topic);
}

export function inferRepoCategory(repo) {
  const haystack = [
    repo.name,
    repo.description || '',
    repo.language || '',
    ...(Array.isArray(repo.topics) ? repo.topics : []),
  ]
    .join(' ')
    .toLowerCase();

  if (/\b(ai|gemini|claude|llm|agent|ml|gpt|openai)\b/.test(haystack)) {
    return 'AI & LABS';
  }

  if (
    ['batchfile', 'powershell', 'shell', 'dockerfile'].includes(
      String(repo.language || '').toLowerCase()
    ) ||
    /\b(cli|log|script|infra|api|server|firewall|network|automation|history|monitor|tool)\b/.test(
      haystack
    )
  ) {
    return 'INFRA & API';
  }

  return 'FULL-STACK';
}

export function formatShortDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function buildAutoProject(repo) {
  const category = inferRepoCategory(repo);
  const liveUrl =
    typeof repo.homepage === 'string' && repo.homepage.trim()
      ? repo.homepage.trim()
      : null;

  const lang = repo.language || null;
  const topicTags = Array.isArray(repo.topics)
    ? repo.topics.slice(0, 6).map(formatTopicTag)
    : [];
  const stack = [...new Set([lang, ...topicTags].filter(Boolean))];
  if (stack.length === 0) {
    stack.push('GitHub', 'Open Source');
  }

  const formattedDate = formatShortDate(repo.pushed_at || repo.updated_at);
  const fallbackSummary = lang
    ? `Public ${lang} repository on GitHub (${repo.default_branch || 'main'} branch), synced automatically from @${repo.full_name?.split('/')[0] || 'thongek-next-wpm'}.`
    : `Public GitHub repository synced automatically from @${repo.full_name?.split('/')[0] || 'thongek-next-wpm'}.`;

  const description = repo.description?.trim() || fallbackSummary;
  const highlights = [
    lang ? `Primary Language: ${lang}` : 'Repository Type: Public Source Repository',
    `Default Branch: ${repo.default_branch || 'main'}`,
    formattedDate ? `Latest Push: ${formattedDate}` : null,
    liveUrl ? `Live Deployment: ${liveUrl}` : null,
    repo.stargazers_count > 0
      ? `GitHub Stars: ${repo.stargazers_count}`
      : 'Synced automatically via GitHub API + Scheduled Build',
  ].filter(Boolean);

  return {
    id: repo.name,
    category,
    status: liveUrl ? 'LIVE DEMO' : 'PUBLIC REPO',
    title: formatRepoTitle(repo.name),
    subtitle: lang ? `${lang} • Auto-Synced Repo` : 'Auto-Synced GitHub Repo',
    summary: description,
    description,
    highlights,
    stack,
    repoUrl: repo.html_url,
    liveUrl,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    pushedAt: repo.pushed_at || repo.updated_at || null,
    isAutoSynced: true,
  };
}

export function mergeProjectsWithGitHub(curatedProjects, repos, handle) {
  const normalizedHandle = String(handle || '').toLowerCase();
  const safeRepos = Array.isArray(repos) ? repos : [];

  const eligibleRepos = safeRepos.filter((repo) => {
    const repoName = String(repo?.name || '').toLowerCase();
    if (!repoName) return false;
    if (repo.fork || repo.archived) return false;
    if (repoName === normalizedHandle || SKIP_REPOS.has(repoName)) return false;
    return true;
  });

  const repoMap = new Map(
    eligibleRepos.map((repo) => [repo.name.toLowerCase(), repo])
  );

  const curatedRepoBacked = [];
  const curatedCustomOnly = [];
  const matchedRepoNames = new Set();

  for (const project of curatedProjects) {
    const key = String(project.id || '').toLowerCase();
    const matchedRepo = repoMap.get(key);

    if (matchedRepo) {
      matchedRepoNames.add(key);
      const repoLiveUrl =
        typeof matchedRepo.homepage === 'string' && matchedRepo.homepage.trim()
          ? matchedRepo.homepage.trim()
          : null;

      curatedRepoBacked.push({
        ...project,
        repoUrl: matchedRepo.html_url || project.repoUrl,
        liveUrl: project.liveUrl || repoLiveUrl,
        stars: matchedRepo.stargazers_count || 0,
        forks: matchedRepo.forks_count || 0,
        pushedAt: matchedRepo.pushed_at || matchedRepo.updated_at || null,
        isAutoSynced: false,
      });
    } else if (project.repoUrl && project.repoUrl !== `https://github.com/${handle}`) {
      curatedRepoBacked.push(project);
    } else {
      curatedCustomOnly.push(project);
    }
  }

  const autoDiscovered = eligibleRepos
    .filter((repo) => !matchedRepoNames.has(repo.name.toLowerCase()))
    .sort((a, b) => {
      const timeA = new Date(a.pushed_at || a.updated_at || 0).getTime();
      const timeB = new Date(b.pushed_at || b.updated_at || 0).getTime();
      return timeB - timeA;
    })
    .map(buildAutoProject);

  const combined = [...curatedRepoBacked, ...autoDiscovered, ...curatedCustomOnly];

  return combined.map((project, idx) => ({
    ...project,
    index: String(idx + 1).padStart(2, '0'),
  }));
}

export async function fetchLiveGitHubSync(handle, signal) {
  const cacheKey = `portfolio-github-sync-v1:${handle}`;

  try {
    const cachedRaw = window.sessionStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (
        cached &&
        typeof cached.cachedAt === 'number' &&
        Date.now() - cached.cachedAt < CACHE_TTL_MS &&
        Array.isArray(cached.repos)
      ) {
        return { ...cached, source: 'live-cache' };
      }
    }
  } catch {
    // Ignore storage read errors
  }

  const headers = { Accept: 'application/vnd.github+json' };
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${handle}`, { headers, signal }),
    fetch(
      `https://api.github.com/users/${handle}/repos?per_page=100&sort=updated`,
      { headers, signal }
    ),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error('GitHub API request failed');
  }

  const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
  const payload = {
    cachedAt: Date.now(),
    syncedAt: new Date().toISOString(),
    user,
    repos: Array.isArray(repos) ? repos : [],
  };

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Ignore quota/storage errors
  }

  return { ...payload, source: 'live' };
}
