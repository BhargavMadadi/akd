async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function formatISODate(iso) {
  // "2026-01-25" -> "Jan 25, 2026"
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatEventStart(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderItineraryPreview(itinerary) {
  const elUpdated = document.getElementById("itinerary-last-updated");
  if (elUpdated) elUpdated.textContent = `Last updated: ${formatISODate(itinerary.lastUpdated)}`;

  // Flatten blocks into one list
  const allBlocks = [];
  itinerary.days.forEach(day => {
    day.blocks.forEach(block => {
      allBlocks.push({
        date: day.date,
        dayTitle: day.title,
        ...block
      });
    });
  });

  // Just show first 6 blocks (simple preview)
  const preview = allBlocks.slice(0, 6);
  const wrap = document.getElementById("itinerary-preview");
  if (!wrap) return;

  wrap.innerHTML = preview.map(b => `
    <div class="it-preview-card">
      <div class="it-preview-top">
        <span class="it-time">${b.time}</span>
        <span class="it-day">${b.dayTitle}</span>
      </div>
      <div class="it-title">${b.title}</div>
      <div class="it-meta muted">${b.location || ""}${b.notes ? ` • ${b.notes}` : ""}</div>
    </div>
  `).join("");
}

function buildResourceCategoryOptions(resources) {
  const select = document.getElementById("resource-category");
  if (!select) return;

  const options = resources.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
  select.insertAdjacentHTML("beforeend", options);
}

function renderResources(resources, query = "", category = "all") {
  const q = query.trim().toLowerCase();
  const grid = document.getElementById("resources-grid");
  if (!grid) return;

  const cards = [];

  resources.categories.forEach(cat => {
    if (category !== "all" && cat.name !== category) return;

    cat.items.forEach(item => {
      const hay = `${cat.name} ${item.title} ${item.where} ${item.details}`.toLowerCase();
      if (q && !hay.includes(q)) return;

      cards.push(`
        <div class="resource-card">
          <div class="resource-head">
            <span class="pill">${cat.name}</span>
          </div>
          <div class="resource-title">${item.title}</div>
          <div class="resource-where muted">${item.where}</div>
          <div class="resource-details muted">${item.details}</div>
        </div>
      `);
    });
  });

  grid.innerHTML = cards.length ? cards.join("") : `<p class="muted">No matches. Try a different search.</p>`;
}

function renderFood(food) {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  grid.innerHTML = food.groups.map(group => `
    <div class="food-group">
      <div class="food-group-title">${group.title}</div>
      <div class="food-cards">
        ${group.items.map(p => `
          <a class="food-card" href="${p.maps}" target="_blank" rel="noreferrer">
            <div class="food-name">${p.name}</div>
            <div class="food-type muted">${p.type}</div>
            <div class="food-note muted">${p.note}</div>
            <div class="food-link">Open in Maps →</div>
          </a>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function renderSuperstores(data) {
  const grid = document.getElementById("superstore-grid");
  if (!grid) return;

  grid.innerHTML = data.stores.map(s => `
    <a class="superstore-card" href="${s.maps}" target="_blank" rel="noreferrer">
      <div class="superstore-name">${s.name}</div>
      <div class="muted">${s.address}</div>
      <div class="muted">${s.why}</div>
      <div class="food-link">Open in Maps →</div>
    </a>
  `).join("");
}

function renderContacts(data) {
  const grid = document.getElementById("contacts-grid");
  if (!grid) return;

  grid.innerHTML = data.contacts.map(c => `
    <div class="contact-card">
      <div class="contact-role">${c.role}</div>
      <div class="contact-name">${c.name}</div>
      <div class="muted">${c.contact}</div>
      <div class="muted"><span class="pill">Best for</span> ${c.bestFor}</div>
    </div>
  `).join("");
}

(async function initVisitor() {
  try {
    const [itinerary, resources, food, superstores, contacts] = await Promise.all([
      loadJSON("itinerary.json"),
      loadJSON("resources.json"),
      loadJSON("food.json"),
      loadJSON("superstores.json"),
      loadJSON("contacts.json")
    ]);

    renderItineraryPreview(itinerary);

    buildResourceCategoryOptions(resources);
    renderResources(resources);

    const search = document.getElementById("resource-search");
    const category = document.getElementById("resource-category");

    const rerender = () => renderResources(resources, search?.value || "", category?.value || "all");

    if (search) search.addEventListener("input", rerender);
    if (category) category.addEventListener("change", rerender);

    renderFood(food);
    renderSuperstores(superstores);
    renderContacts(contacts);
  } catch (err) {
    console.error(err);
    const fallback = document.getElementById("itinerary-preview");
    if (fallback) fallback.innerHTML = `<p class="muted">Could not load visitor data. Check your /data paths.</p>`;
  }
})();
