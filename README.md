# General Education Renaissance — toolkit site

A static site (plain HTML/CSS/JS — no build step, no `npm install` required). That's
why it looks different from your other repos: there's no `package.json`, no framework,
nothing to compile. You can open `index.html` directly in a browser right now and it
works.

```
gen-ed-renaissance/
├── index.html            landing page
├── resources.html        literature review, SACSCOC links, deck downloads
├── discuss.html           "Thoughts on..." discussion channels
├── contest.html           visual identity contest
├── css/style.css
├── js/                    app logic + Supabase config
├── sql/schema.sql          run this in Supabase once you're ready to go live
├── downloads/              the two .pptx decks
└── SETUP-INSTRUCTIONS.md  connecting Supabase for live data
```

## Push it to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit: General Education Renaissance site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

(No GitHub repo yet? Create an empty one first at github.com/new — don't initialize it
with a README, or the push above will conflict. Grab the remote URL from the green
"Code" button on the new repo's page.)

Prefer a GUI? Open **GitHub Desktop** → **Add Local Repository** → point it at this
folder → **Publish repository**. Same result, no terminal required.

## Turn it into a live website (GitHub Pages)

Because there's no build step, GitHub Pages can serve this repo as-is:

1. On GitHub, go to your repo's **Settings → Pages**.
2. Under "Build and deployment," set **Source** to **Deploy from a branch**.
3. Set **Branch** to `main` and folder to `/ (root)`. Save.
4. Wait a minute or two — GitHub will give you a URL like
   `https://<your-username>.github.io/<repo-name>/`.

That URL is live and shareable immediately, running in the same "demo mode" you've been
previewing (data saved per-browser via localStorage) until you connect Supabase.

## Connecting Supabase (for real, shared data)

Follow `SETUP-INSTRUCTIONS.md` in this folder — create a Supabase project, run
`sql/schema.sql`, create the two storage buckets, then paste your project URL and anon
key into `js/supabase-config.js`. Commit and push that one file change and the live
GitHub Pages site picks it up automatically.

## A couple of things worth knowing

- The `downloads/` folder holds two `.pptx` files (~1MB and ~360KB). Both are small
  enough to commit normally — no Git LFS needed.
- `js/supabase-config.js` holds your Supabase **anon/public** key once you add it.
  That key is meant to be public-facing (it's what browsers use), so it's fine to
  commit — it's not a secret credential like a service-role key.
- If you'd rather keep this in an existing monorepo instead of its own repo, just drop
  the whole `gen-ed-renaissance/` folder in as a subfolder — GitHub Pages can also be
  configured to serve from a `/docs` folder if you rename it.
