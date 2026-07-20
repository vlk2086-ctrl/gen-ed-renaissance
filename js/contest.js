(function () {
  const gallery = document.getElementById("gallery");
  const form = document.getElementById("contestForm");
  const banner = document.getElementById("statusBanner");
  const modeFlag = document.getElementById("modeFlag");

  function esc(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function showBanner(msg, ok) {
    banner.textContent = msg;
    banner.className = "status-banner show " + (ok ? "ok" : "err");
    setTimeout(() => banner.classList.remove("show"), 4000);
  }

  function renderGallery(entries) {
    if (!entries.length) {
      gallery.innerHTML = '<p class="empty-state">No entries yet &mdash; be the first to submit above.</p>';
      return;
    }
    gallery.innerHTML = entries.map((e) => `
      <div class="entry">
        <img src="${e.image_url}" alt="${esc(e.title)}" />
        <div class="info">
          <h4>${esc(e.title)}</h4>
          <p>by ${esc(e.artist_name || "Anonymous")}</p>
          ${e.description ? `<p style="margin-top:4px;">${esc(e.description)}</p>` : ""}
        </div>
      </div>
    `).join("");
  }

  async function load() {
    try {
      const entries = await window.GER.contest.list();
      renderGallery(entries);
    } catch (e) {
      gallery.innerHTML = '<p class="empty-state">Could not load entries right now.</p>';
      console.error(e);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = document.getElementById("cFile").files[0];
    if (!file) {
      showBanner("Please attach an image to submit.", false);
      return;
    }
    if (file.size > window.GER.MAX_FILE_BYTES) {
      showBanner("That file is over the 5MB limit. Please choose a smaller file.", false);
      return;
    }
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    try {
      await window.GER.contest.add({
        title: document.getElementById("cTitle").value.trim(),
        artist_name: document.getElementById("cName").value.trim(),
        artist_email: document.getElementById("cEmail").value.trim(),
        description: document.getElementById("cDesc").value.trim(),
      }, file);
      form.reset();
      showBanner("Entry submitted. Thank you!", true);
      load();
    } catch (err) {
      showBanner(err.message || "Something went wrong.", false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit entry";
    }
  });

  modeFlag.textContent = window.GER_MODE === "demo"
    ? "Demo mode — entries saved on this device only until Supabase is connected"
    : "Live";
  if (window.GER_MODE !== "demo") modeFlag.style.display = "none";

  load();
})();
