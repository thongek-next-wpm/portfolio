import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'githubSnapshot.json');
const GITHUB_USER = process.env.GITHUB_USERNAME || 'thongek-next-wpm';
const STRICT = process.argv.includes('--strict');

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${url}`);
  }
  return res.json();
}

async function main() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${GITHUB_USER}-portfolio-sync`,
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [user, repos] = await Promise.all([
      fetchJson(`https://api.github.com/users/${GITHUB_USER}`, headers),
      fetchJson(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
        headers
      ),
    ]);

    const snapshot = {
      syncedAt: new Date().toISOString(),
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        bio: user.bio,
        hireable: user.hireable,
        public_repos: user.public_repos,
        followers: user.followers,
      },
      repos: repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        fork: Boolean(repo.fork),
        archived: Boolean(repo.archived),
        language: repo.language,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        homepage: repo.homepage || '',
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        default_branch: repo.default_branch || 'main',
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
      })),
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    console.log(
      `[sync-github] Synced ${snapshot.repos.length} repos for @${GITHUB_USER} -> ${path.relative(ROOT_DIR, OUTPUT_PATH)}`
    );
  } catch (err) {
    const hasExisting = fs.existsSync(OUTPUT_PATH);
    if (STRICT || !hasExisting) {
      console.error(`[sync-github] Failed: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    console.warn(
      `[sync-github] Offline/API unavailable (${err.message}); keeping existing ${path.relative(ROOT_DIR, OUTPUT_PATH)}.`
    );
  }
}

main();
