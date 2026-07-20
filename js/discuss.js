(function () {
  const CHANNELS = [
    { id: "critical-thinking", label: "Critical Thinking", desc: "Rated essential across every stakeholder group in the study, and the only skill every group still chose under pressure." },
    { id: "adaptability-flexibility", label: "Adaptability & Flexibility", desc: "The single highest-rated competency in the study — still top 3 even when respondents were forced to pick." },
    { id: "collaboration-teamwork", label: "Collaboration & Teamwork", desc: "The competency employers and alumni converge on most strongly." },
    { id: "verbal-communication", label: "Verbal Communication", desc: "Never drops out of the top tier, no matter how the question was asked." },
    { id: "curiosity", label: "Curiosity", desc: "Consistently valued, and holds up even under forced trade-offs." },
    { id: "leadership-professionalism", label: "Leadership & Professionalism", desc: "Undervalued in the abstract — but the first thing people reach for when it actually counts." },
  ];

  const channelListEl = document.getElementById("channelList");
  const titleEl = document.getElementById("channelTitle");
  const descEl = document.getElementById("channelDesc");
  const postListEl = document.getElementById("postList");
  const form = document.getElementById("postForm");
  const banner = document.getElementById("statusBanner");
  const modeFlag = document.getElementById("modeFlag");

  let current = CHANNELS[0].id;

  function esc(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmtSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
    catch (e) { return ""; }
  }
  function showBanner(msg, ok) {
    banner.textContent = msg;
    banner.className = "status-banner show " + (ok ? "ok" : "err");
    setTimeout(() => banner.classList.remove("show"), 4000);
  }

  function renderChannelList() {
    channelListEl.innerHTML = CHANNELS.map((c) => `
      <button type="button" class="channel-btn ${c.id === current ? "active" : ""}" data-id="${c.id}">
        <strong>Thoughts on ${esc(c.label)}</strong>
        <span>${esc(c.desc)}</span>
      </button>
    `).join("");
    channelListEl.querySelectorAll(".channel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        current = btn.dataset.id;
        renderChannelList();
        renderHeader();
        loadPosts();
      });
    });
  }

  function renderHeader() {
    const c = CHANNELS.find((x) => x.id === current);
    titleEl.textContent = `Thoughts on ${c.label}`;
    descEl.textContent = c.desc;
  }

  function renderPosts(posts) {
    if (!posts.length) {
      postListEl.innerHTML = '<p class="empty-state">No posts yet in this channel &mdash; start the conversation.</p>';
      return;
    }
    postListEl.innerHTML = posts.map((p) => `
      <div class="post">
        <div class="meta"><span class="name">${esc(p.author_name || "Anonymous")}</span> &middot; ${fmtDate(p.created_at)}</div>
        <div class="body">${esc(p.message)}</div>
        ${p.link_url ? `<div><a href="${esc(p.link_url)}" target="_blank" rel="noopener">${esc(p.link_url)}</a></div>` : ""}
        ${p.file_url ? `<a class="attachment" href="${esc(p.file_url)}" target="_blank" rel="noopener" download="${esc(p.file_name || "")}">&#128206; ${esc(p.file_name || "attachment")} ${p.file_size ? `(${fmtSize(p.file_size)})` : ""}</a>` : ""}
      </div>
    `).join("");
  }

  async function loadPosts() {
    postListEl.innerHTML = '<p class="empty-state">Loading&hellip;</p>';
    try {
      const posts = await window.GER.discussion.list(current);
      renderPosts(posts);
    } catch (e) {
      postListEl.innerHTML = '<p class="empty-state">Could not load posts right now.</p>';
      console.error(e);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = document.getElementById("postMessage").value.trim();
    const link = document.getElementById("postLink").value.trim();
    const fileInput = document.getElementById("postFile");
    const file = fileInput.files[0] || null;

    if (!message && !link && !file) {
      showBanner("Add a message, link, or file before posting.", false);
      return;
    }
    if (file && file.size > window.GER.MAX_FILE_BYTES) {
      showBanner("That file is over the 5MB limit. Please choose a smaller file.", false);
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";
    try {
      await window.GER.discussion.add(current, {
        author_name: document.getElementById("postName").value.trim(),
        message,
        link_url: link,
      }, file);
      form.reset();
      showBanner("Posted to the channel.", true);
      loadPosts();
    } catch (err) {
      showBanner(err.message || "Something went wrong.", false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post to this channel";
    }
  });

  modeFlag.textContent = window.GER_MODE === "demo"
    ? "Demo mode — posts saved on this device only until Supabase is connected"
    : "Live";
  if (window.GER_MODE !== "demo") modeFlag.style.display = "none";

  renderChannelList();
  renderHeader();
  loadPosts();
})();
