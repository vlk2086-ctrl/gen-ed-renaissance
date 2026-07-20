# Connecting the site to Supabase

Right now the site runs in **demo mode**: everything (literature entries, discussion
posts, contest submissions, uploaded files) is saved to your own browser's storage so you
can click through the whole site immediately. Nothing is shared between visitors yet.
Follow the steps below to make it live for the whole university community.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**. Choose an organization, name it (e.g. `gen-ed-renaissance`),
   set a database password (save it somewhere safe), and pick a region close to campus.
3. Wait a minute or two for the project to finish provisioning.

## 2. Run the database schema

1. In your new project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `sql/schema.sql` (included with this site), copy the entire contents, and paste
   it into the editor.
4. Click **Run**. You should see "Success. No rows returned."

This creates three tables (`literature_resources`, `discussion_posts`,
`contest_submissions`) with row-level security policies that allow anyone to read and add
entries — no login required, matching how the site works today.

## 3. Create the two storage buckets

1. Open **Storage** in the left sidebar.
2. Click **New bucket**, name it exactly `discussion-uploads`, toggle **Public bucket**
   to ON, and under file size limit enter `5` MB. Click **Create bucket**.
3. Repeat for a second bucket named exactly `contest-uploads`, also public, also 5MB
   limit.

(The upload policies for these buckets were already created for you at the bottom of
`sql/schema.sql` — you don't need to add them again.)

## 4. Copy your API keys into the site

1. In Supabase, open **Settings > API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/supabase-config.js` in this site folder and replace the two placeholder
   strings:

   ```js
   window.SUPABASE_CONFIG = {
     url: "https://your-project-ref.supabase.co",
     anonKey: "your-long-anon-key",
     ...
   };
   ```

4. Save the file and re-upload/re-deploy the site. The little "Demo mode" flag on the
   Resources, Discussion, and Contest pages will disappear once it detects a real
   connection — that's how you'll know it's live.

## 5. Where to host the site

This is a static site (HTML/CSS/JS only) — no server required. Any of these work well:

- **Netlify** or **Vercel**: drag-and-drop the whole folder, done in minutes.
- **GitHub Pages**: push the folder to a repo and enable Pages.
- SCAD's own web hosting, if IT can host static files for you.

## A note on moderation

Because posting doesn't require login (to keep friction low for faculty), anyone with the
link can add a post, resource, or contest entry. If you'd like to add basic moderation
later (e.g. a simple password gate, or a "hide post" admin view), that's a straightforward
follow-on enhancement — just let your developer or Claude know when you're ready.

## Questions

Reach out to curriculum@scad.edu with any setup questions.
