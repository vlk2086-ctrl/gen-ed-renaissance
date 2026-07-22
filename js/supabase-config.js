/* ===========================================================
   SUPABASE CONFIGURATION
   -----------------------------------------------------------
   1. Create a free project at https://supabase.com
   2. In your project: Settings > API — copy the "Project URL"
      and the "anon public" key.
   3. Paste them below, replacing the placeholder strings.
   4. Run /sql/schema.sql in the Supabase SQL editor (see
      SETUP-INSTRUCTIONS.md for the full walkthrough).

   Until real values are pasted in here, the site automatically
   runs in DEMO MODE: all posts, resources, and contest entries
   are stored in your browser's localStorage only, so you can
   preview and click through the full site right now. Nothing
   in demo mode is shared between visitors.
   =========================================================== */

window.SUPABASE_CONFIG = {
  url: "https://kocomvximqxtoiueyfxv.supabase.co",
  anonKey: "sb_publishable_6M0qxG8BsKAVsyp2UCdxEw_irV-Ea3b",
  buckets: {
    discussion: "discussion-uploads",
    contest: "contest-uploads"
  }
};
