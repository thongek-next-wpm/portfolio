# Thongek "Next" Wongpomon — Developer Portfolio

Personal portfolio website built with **React**, **Vite**, and **Three.js**, featuring an interactive 3D crimson wireframe globe, live GitHub profile telemetry, and curated engineering works from [`github.com/thongek-next-wpm`](https://github.com/thongek-next-wpm).

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages (`thongek-next-wpm`)

This repository includes `.github/workflows/deploy.yml` and relative asset paths (`base: './'` in `vite.config.js`), so it works out of the box whether deployed to:

- **`https://github.com/thongek-next-wpm/thongek-next-wpm.github.io`** (personal root site: `https://thongek-next-wpm.github.io/`)
- **`https://github.com/thongek-next-wpm/portfolio`** (project site: `https://thongek-next-wpm.github.io/portfolio/`)

### Steps to publish

1. Create a public repository on GitHub (e.g. `thongek-next-wpm.github.io` or `portfolio`).
2. Add the remote and push from `d:\src\portfolio`:
   ```bash
   git add .
   git commit -m "feat: initial personal developer portfolio"
   git remote add origin https://github.com/thongek-next-wpm/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The included workflow will build and publish `dist/` automatically on every push to `main`.
