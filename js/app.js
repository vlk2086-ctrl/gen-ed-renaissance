/* ===========================================================
   General Education Renaissance — shared data layer
   Talks to Supabase when configured; otherwise falls back to
   a localStorage-backed demo store so the site is fully
   click-through-able before the backend is connected.
   Requires: supabase-config.js loaded first, and (if using
   Supabase) the supabase-js UMD script tag on the page.
   =========================================================== */

(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const isConfigured =
    cfg.url && cfg.anonKey &&
    !/YOUR_SUPABASE/.test(cfg.url) &&
    !/YOUR_SUPABASE/.test(cfg.anonKey);

  let client = null;
  if (isConfigured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
  }

  window.GER_MODE = isConfigured ? "live" : "demo";

  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

  // ---------- localStorage demo helpers ----------
  function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }
  function lsSet(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function checkFileSize(file) {
    if (file && file.size > MAX_FILE_BYTES) {
      throw new Error("That file is over the 5MB limit. Please choose a smaller file.");
    }
  }

  // ---------- Literature resources ----------
  const literature = {
    async list() {
      if (client) {
        const { data, error } = await client
          .from("literature_resources")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      return lsGet("ger_literature").sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    async add(entry) {
      const row = {
        title: entry.title || null,
        authors: entry.authors || null,
        isbn: entry.isbn || null,
        link: entry.link || null,
        note: entry.note || null,
        submitted_by: entry.submitted_by || "Anonymous",
      };
      if (client) {
        const { data, error } = await client.from("literature_resources").insert(row).select();
        if (error) throw error;
        return data[0];
      }
      const items = lsGet("ger_literature");
      const record = { id: uid(), created_at: new Date().toISOString(), ...row };
      items.push(record);
      lsSet("ger_literature", items);
      return record;
    },
  };

  // ---------- Discussion channels ----------
  const discussion = {
    async list(channel) {
      if (client) {
        const { data, error } = await client
          .from("discussion_posts")
          .select("*")
          .eq("channel", channel)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      return lsGet("ger_discussion")
        .filter((p) => p.channel === channel)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    async add(channel, post, file) {
      let file_url = null, file_name = null, file_size = null;
      if (file) {
        checkFileSize(file);
        const uploaded = await storage.upload(cfg.buckets ? cfg.buckets.discussion : "discussion-uploads", file);
        file_url = uploaded.url;
        file_name = uploaded.name;
        file_size = uploaded.size;
      }
      const row = {
        channel,
        author_name: post.author_name || "Anonymous",
        message: post.message || "",
        link_url: post.link_url || null,
        file_url,
        file_name,
        file_size,
      };
      if (client) {
        const { data, error } = await client.from("discussion_posts").insert(row).select();
        if (error) throw error;
        return data[0];
      }
      const items = lsGet("ger_discussion");
      const record = { id: uid(), created_at: new Date().toISOString(), ...row };
      items.push(record);
      lsSet("ger_discussion", items);
      return record;
    },
  };

  // ---------- Contest submissions ----------
  const contest = {
    async list() {
      if (client) {
        const { data, error } = await client
          .from("contest_submissions")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      return lsGet("ger_contest").sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    async add(entry, file) {
      checkFileSize(file);
      const uploaded = await storage.upload(cfg.buckets ? cfg.buckets.contest : "contest-uploads", file);
      const row = {
        title: entry.title || "Untitled",
        artist_name: entry.artist_name || "Anonymous",
        artist_email: entry.artist_email || null,
        description: entry.description || null,
        image_url: uploaded.url,
      };
      if (client) {
        const { data, error } = await client.from("contest_submissions").insert(row).select();
        if (error) throw error;
        return data[0];
      }
      const items = lsGet("ger_contest");
      const record = { id: uid(), created_at: new Date().toISOString(), ...row };
      items.push(record);
      lsSet("ger_contest", items);
      return record;
    },
  };

  // ---------- Storage (file uploads) ----------
  const storage = {
    async upload(bucket, file) {
      checkFileSize(file);
      if (client) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await client.storage.from(bucket).upload(path, file);
        if (error) throw error;
        const { data } = client.storage.from(bucket).getPublicUrl(path);
        return { url: data.publicUrl, name: file.name, size: file.size };
      }
      // Demo mode: embed as a data URL in localStorage (fine for small demo files)
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, name: file.name, size: file.size };
    },
  };

  window.GER = { literature, discussion, contest, storage, MAX_FILE_BYTES };
})();
