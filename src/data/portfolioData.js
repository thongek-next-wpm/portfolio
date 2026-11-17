export const PROFILE = {
  monogram: 'TW',
  firstName: 'THONGEK',
  lastName: 'WONGPOMON',
  nickname: 'Next',
  handle: 'thongek-next-wpm',
  githubUrl: 'https://github.com/thongek-next-wpm',
  roleEyebrow: 'IT SUPPORT + FULL-STACK DEVELOPER',
  heroBio:
    'Bridging enterprise IT operations with modern full-stack engineering — crafting resilient web platforms, Supabase architectures, and AI-powered workflows from Bangkok.',
  currentRole: 'IT Support & Developer',
  company: 'Intermedical Care and Lab Hospital Public Company Limited',
  location: 'Bangkok, Thailand',
  email: 'thongek_wpm@hotmail.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/224930337?v=4',
  hireable: true,
  baselineStats: {
    repos: 8,
    followers: 83,
    stackCount: 25,
  },
};

export const NAV_LINKS = [
  { id: 'about', label: 'ABOUT' },
  { id: 'works', label: 'WORKS' },
  { id: 'stack', label: 'STACK' },
  { id: 'contact', label: 'CONTACT' },
];

export const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    handle: '@thongek-next-wpm',
    url: 'https://github.com/thongek-next-wpm',
  },
  {
    name: 'LinkedIn',
    handle: 'thongek-wongpomon',
    url: 'https://www.linkedin.com/in/thongek-wongpomon/',
  },
  {
    name: 'Facebook',
    handle: 'BreakerGEz',
    url: 'https://www.facebook.com/BreakerGEz',
  },
];

export const CERTIFICATION = {
  title: 'TH POP Firewalls Training Certificate',
  issuer: 'ADP JRP',
  summary:
    'Demonstrates practical proficiency in enterprise network architecture, perimeter defense, security rule auditing, and firewall configuration.',
  imageUrl:
    'https://github.com/user-attachments/assets/41ac8dd7-ef0a-42f2-8141-0c3a7f46c2d4',
  tags: ['Network Security', 'Firewall Config', 'Perimeter Defense'],
};

export const INTERESTS = [
  'Web Development',
  'AI Engine',
  'IoT & Network Labs',
  'Open Source',
  'FC Bayern München',
  'Football Manager · CS2 · LoL',
];

export const PROJECTS = [
  {
    id: 'football-data-central',
    index: '01',
    category: 'FULL-STACK',
    status: 'LIVE DEMO',
    title: 'Football Data Central',
    subtitle: 'FDC Web Platform & Supercomputer',
    summary:
      'Public European football database covering Top 5 Leagues and 3 UEFA competitions with separated React + Express services and multi-tier Redis/PostgreSQL caching.',
    description:
      'Designed as an instant-access public football analytics platform spanning Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, and Conference League. Separates a React + Vite SPA frontend from an Express backend featuring an FDC Supercomputer powered by Poisson xG + Dixon-Coles modeling and 10,000-iteration Monte Carlo season simulations.',
    highlights: [
      'Multi-tier cache pipeline: L1 Redis -> L2 PostgreSQL snapshots -> L3 local fallback seed',
      'Backend-only API proxy with sliding-window rate limiter & singleflight deduplication',
      'FDC Supercomputer: Poisson xG + Dixon-Coles match probabilities & What-If simulator',
      'Automated GitHub Actions CI/CD exporting static API snapshots to GitHub Pages',
    ],
    stack: [
      'React',
      'Vite',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Redis',
      'Docker',
    ],
    repoUrl: 'https://github.com/thongek-next-wpm/football-data-central',
    liveUrl: 'https://thongek-next-wpm.github.io/football-data-central/',
  },
  {
    id: 'workout-buddy-supabase',
    index: '02',
    category: 'FULL-STACK',
    status: 'PUBLIC REPO',
    title: 'Workout Buddy',
    subtitle: 'Supabase Edition (Auth + RLS)',
    summary:
      'Full-stack athletic workout tracker refactored from MERN to React, Express, Supabase PostgreSQL, Row Level Security, and Google OAuth (PKCE).',
    description:
      'Upgraded from a custom MongoDB/JWT backend into a relational PostgreSQL schema powered by Supabase Auth and Google OAuth (PKCE flow). Express middleware injects request-scoped Supabase clients so PostgreSQL enforces strict auth.uid() = user_id Row Level Security policies directly at the database layer.',
    highlights: [
      'Supabase Auth + Google OAuth (PKCE) with automatic JWT token refresh endpoint',
      'Database-level PostgreSQL Row Level Security (RLS) via request-scoped middleware',
      'Summary KPI telemetry: Workouts Logged, Total Volume, Total Reps & Peak Load',
      'Dark/Light theme toggle, quick exercise presets, inline edit & category filters',
    ],
    stack: [
      'React',
      'Express',
      'Supabase',
      'PostgreSQL',
      'Google OAuth',
      'RLS',
    ],
    repoUrl: 'https://github.com/thongek-next-wpm/workout-buddy-supabase',
    liveUrl: null,
  },
  {
    id: 'ai-engine-systems',
    index: '03',
    category: 'AI & LABS',
    status: 'IN DEVELOPMENT',
    title: 'AI Engine Workflows',
    subtitle: 'Smart Automation & IT Operations',
    summary:
      'Integrating Google Gemini, Claude, and AI Engine agentic workflows into full-stack web apps and everyday IT infrastructure tasks.',
    description:
      'Active R&D initiative bridging hospital IT operations experience with modern generative AI tools. Focuses on structured data processing, developer tooling automation, and intelligent workflow assistants inside full-stack systems.',
    highlights: [
      'Agentic coding & automation workflows with Google Gemini, Antigravity & Claude Code',
      'Structured prompt engineering for IT support diagnostics & log parsing',
      'Connecting LLM capabilities cleanly into React + Node.js web architectures',
    ],
    stack: [
      'Google Gemini',
      'Claude',
      'AI Engine',
      'Node.js',
      'PowerShell',
      'Automation',
    ],
    repoUrl: 'https://github.com/thongek-next-wpm',
    liveUrl: null,
  },
  {
    id: 'fm-career-tracker',
    index: '04',
    category: 'FULL-STACK',
    status: 'PRIVATE REPO',
    title: 'FM Career Tracker',
    subtitle: 'Managerial Save & Stats Dashboard',
    summary:
      'Dedicated Football Manager career logbook and analytics dashboard built to track long-term managerial saves, match logs, and season progression.',
    description:
      'A personal sports analytics dashboard designed for archiving Football Manager campaigns across multiple clubs and seasons — turning raw match logs and squad numbers into clear managerial progression metrics.',
    highlights: [
      'Structured campaign archive tracking seasons, competitions & club transitions',
      'Visual match-log statistics, win ratios & squad performance breakdowns',
      'Built around real Football Manager tactical & scouting workflows',
    ],
    stack: ['React', 'JavaScript', 'Vite', 'Analytics UI'],
    repoUrl: null,
    liveUrl: null,
  },
  {
    id: 'github-readme-stats',
    index: '05',
    category: 'INFRA & API',
    status: 'DEPLOYED',
    title: 'GitHub Metrics API',
    subtitle: 'Self-Hosted Vercel SVG Service',
    summary:
      'Personal Vercel-deployed instance of github-readme-stats serving live SVG profile analytics, language charts, and repository pin cards.',
    description:
      'Self-hosted Node.js serverless deployment on Vercel providing dedicated GitHub GraphQL/REST telemetry endpoints without relying on congested public shared instances.',
    highlights: [
      'Dedicated serverless SVG rendering hosted on Vercel edge infrastructure',
      'Real-time top language distributions & contribution telemetry cards',
      'Powers live analytics across GitHub profile documentation',
    ],
    stack: ['Node.js', 'Vercel', 'Serverless', 'GitHub API', 'SVG'],
    repoUrl: 'https://github.com/thongek-next-wpm/github-readme-stats',
    liveUrl: 'https://github-readme-stats.vercel.app',
  },
];

export const STACK_CATEGORIES = [
  {
    id: 'frontend',
    code: '01',
    title: 'Frontend & Mobile',
    description: 'Interactive interfaces, modern SPA frameworks & cross-platform UI.',
    items: [
      'React',
      'Next.js',
      'Vue.js',
      'Nuxt.js',
      'Tailwind CSS',
      'Vite',
      'JavaScript',
      'HTML5 / CSS3',
      'Flutter',
      'Dart',
    ],
  },
  {
    id: 'backend',
    code: '02',
    title: 'Backend & Databases',
    description: 'REST APIs, relational/NoSQL data modeling, auth & caching layers.',
    items: [
      'Node.js',
      'Express',
      'Supabase',
      'PostgreSQL',
      'Redis',
      'MongoDB',
      'MySQL',
      'SQLite',
      'Firebase',
    ],
  },
  {
    id: 'devops',
    code: '03',
    title: 'DevOps, OS & Network',
    description: 'Enterprise IT support, containerization, scripting & perimeter defense.',
    items: [
      'Docker',
      'Git & GitHub',
      'GitHub Actions',
      'Postman',
      'PowerShell',
      'Bash',
      'Windows IT Ops',
      'TH POP Firewalls',
    ],
  },
  {
    id: 'ai',
    code: '04',
    title: 'AI Engine & Tooling',
    description: 'AI-assisted engineering, workflow orchestration & smart automation.',
    items: [
      'Google Gemini',
      'Antigravity',
      'Claude',
      'Claude Code',
      'AI Engine',
      'Workflow Automation',
    ],
  },
];
