(function () {
  const listEl = document.getElementById("litList");
  const form = document.getElementById("litForm");
  const banner = document.getElementById("statusBanner");
  const modeFlag = document.getElementById("modeFlag");

  const SEED = [
    {
      title: "Robot-Proof: Higher Education in the Age of Artificial Intelligence",
      authors: "Joseph E. Aoun",
      isbn: "978-0262042871",
      link: "",
      note: "Foundational argument for reorienting higher ed around distinctly human capacities as AI takes on more cognitive work.",
      submitted_by: "Project Team",
    },
    {
      title: "Operationalizing Twenty-First Century Skills in Higher Education: A Systematic Review",
      authors: "Barthakur, Shrestha & Torsney-Weir (2023)",
      isbn: "",
      link: "",
      note: "Systematic review on how 21st-century / power skills are actually being taught and assessed in higher ed.",
      submitted_by: "Project Team",
    },
    {
      title: "Development and Validation of an Artificial Intelligence Anxiety Scale",
      authors: "Wang, Y.Y. & Wang, Y.S. (2019), Interactive Learning Environments",
      isbn: "",
      link: "",
      note: "Source of the validated AIAS instrument used as an optional module in this project's surveys.",
      submitted_by: "Project Team",
    },
    {
      title: "Future of Jobs Report 2025",
      authors: "World Economic Forum",
      isbn: "",
      link: "https://www.weforum.org/reports/the-future-of-jobs-report-2025/",
      note: "Global data on skills disruption and the shifting skills employers prioritize.",
      submitted_by: "Project Team",
    },
    {
      title: "2026 Global Human Capital Trends: The Worker-Employer Relationship Disrupted",
      authors: "Deloitte Insights",
      isbn: "",
      link: "",
      note: "Recent industry trends data referenced in the project's problem-of-practice framing.",
      submitted_by: "Project Team",
    },
  ];

  function esc(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderList(items) {
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-state">No resources yet &mdash; be the first to add one.</p>';
      return;
    }
    listEl.innerHTML = items.map((r) => `
      <div class="resource-item">
        <h4>${esc(r.title) || "Untitled resource"}</h4>
        <div class="meta">
          ${r.authors ? esc(r.authors) : ""}
          ${r.isbn ? ` &middot; ISBN ${esc(r.isbn)}` : ""}
          ${r.link ? ` &middot; <a href="${esc(r.link)}" target="_blank" rel="noopener">view link</a>` : ""}
        </div>
        ${r.note ? `<p style="margin:6px 0 2px; font-size:0.88rem;">${esc(r.note)}</p>` : ""}
        <div class="meta">added by ${esc(r.submitted_by || "Anonymous")}</div>
      </div>
    `).join("");
  }

  function showBanner(msg, ok) {
    banner.textContent = msg;
    banner.className = "status-banner show " + (ok ? "ok" : "err");
    setTimeout(() => banner.classList.remove("show"), 4000);
  }

  async function load() {
    try {
      let items = await window.GER.literature.list();
      if (window.GER_MODE === "demo" && items.length === 0) {
        for (const s of SEED) await window.GER.literature.add(s);
        items = await window.GER.literature.list();
      }
      renderList(items);
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">Could not load resources right now.</p>';
      console.error(e);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("litTitle").value.trim();
    const isbn = document.getElementById("litIsbn").value.trim();
    const link = document.getElementById("litLink").value.trim();
    if (!title && !isbn && !link) {
      showBanner("Add at least a title, ISBN, or link.", false);
      return;
    }
    try {
      await window.GER.literature.add({
        title,
        authors: document.getElementById("litAuthors").value.trim(),
        isbn,
        link,
        note: document.getElementById("litNote").value.trim(),
        submitted_by: document.getElementById("litSubmitter").value.trim(),
      });
      form.reset();
      showBanner("Added to the reading list. Thank you!", true);
      load();
    } catch (err) {
      showBanner(err.message || "Something went wrong.", false);
    }
  });

  modeFlag.textContent = window.GER_MODE === "demo"
    ? "Demo mode — saved on this device only until Supabase is connected"
    : "Live";
  if (window.GER_MODE !== "demo") modeFlag.style.display = "none";

  load();
})();
