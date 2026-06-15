# Awesome AI Devtools - Web Catalog

This is the interactive frontend for the `awesome-ai-devtools` repository, built with Vite, React, and TypeScript. 
It dynamically parses the YAML database (`../data/tools.yml` and `../data/categories.yml`) at build time to serve a rich, filterable storefront.

## Local Setup & Development

To run the web app locally, you need Node.js (v18+ recommended).

```bash
# 1. Navigate to the web directory
cd web

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

The application will be available at `http://localhost:5173`. Any changes to the YAML data files in the root repository will automatically trigger a hot-reload in the web UI.

## Deployment

Because this app uses `@modyfi/vite-plugin-yaml` to compile the YAML data directly into the Javascript bundle, it exports as a purely **static site**. It can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, Cloudflare Pages) at zero cost.

### Production Build

```bash
npm run build
```
This generates the optimized static files in the `web/dist/` directory.

### Deploying to Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Set the **Root Directory** to `web`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist` (or `web/dist`).

### Deploying to GitHub Pages
1. In `web/vite.config.ts`, add your repository name as the `base` path if you aren't using a custom domain:
   ```ts
   export default defineConfig({
     base: '/awesome-ai-devtools/',
     // ...
   })
   ```
2. Build the project: `npm run build`.
3. Push the `web/dist/` folder to a `gh-pages` branch, or use a GitHub Actions workflow to publish the `web/dist/` artifact automatically on commits to `main`.
