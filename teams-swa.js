/* ====== 1) DATA (replace with your real teams/liaisons) ====== */
const TEAM_DATA = {
  fusion: [
    {
      team: "Texas Mohini",
      liaisons: [
        { name: "Keya Mahajan", role: "Liaison", img: "images/liaisons/keya.jpg", phone: "+17324275238" },
        { name: "Liaison Two", role: "Liaison", img: "images/liaisons/liaison2.jpg", phone: "+17324275238" },
        { name: "Liaison Three", role: "Liaison", img: "images/liaisons/liaison3.jpg", phone: "+1XXXXXXXXXX" },
      ]
    },
  ],
  bhangra: [
    {
      team: "Broad Street Baadshahz",
      liaisons: [
        { name: "Liaison One", role: "Liaison", img: "images/liaisons/b1.jpg", phone: "+1XXXXXXXXXX" },
        { name: "Liaison Two", role: "Liaison", img: "images/liaisons/b2.jpg", phone: "+1XXXXXXXXXX" },
        { name: "Liaison Three", role: "Liaison", img: "images/liaisons/b3.jpg", phone: "+1XXXXXXXXXX" },
      ]
    },
  ]
};

function toTelHref(phone) {
  const cleaned = phone.trim().replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function createLiaison(l) {
  const wrap = el("div", "swa-liaison");

  const img = document.createElement("img");
  img.loading = "lazy";
  img.decoding = "async";
  img.src = l.img || "images/placeholder.jpg";
  img.alt = `${l.name} headshot`;

  const name = el("div", "name", l.name);
  const role = el("div", "role", l.role || "Liaison");

  const actions = el("div", "swa-actions");

  const callBtn = el("button", "swa-reveal", "Call");
  callBtn.type = "button";

  callBtn.addEventListener("click", () => {
    if (!l.phone || l.phone.includes("X")) {
      callBtn.textContent = "Contact not set";
      callBtn.disabled = true;
      callBtn.style.opacity = "0.7";
      return;
    }
    // Open dialer without ever rendering the number as text
    window.location.href = toTelHref(l.phone);
  });

  actions.appendChild(callBtn);

  wrap.appendChild(img);
  wrap.appendChild(name);
  wrap.appendChild(role);
  wrap.appendChild(actions);

  return wrap;
}

function createTeamCard(teamObj) {
  const card = el("div", "swa-card");

  const title = el("h3", "", teamObj.team);
  const meta = el("div", "swa-meta", `${teamObj.liaisons.length} liaisons`);

  const grid = el("div", "swa-liaisons");
  teamObj.liaisons.forEach(l => grid.appendChild(createLiaison(l)));

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(grid);
  return card;
}

function renderTeams() {
  const fusionEl = document.getElementById("fusionCards");
  const bhangraEl = document.getElementById("bhangraCards");

  TEAM_DATA.fusion.forEach(t => fusionEl.appendChild(createTeamCard(t)));
  TEAM_DATA.bhangra.forEach(t => bhangraEl.appendChild(createTeamCard(t)));
}

/* ====== 2) SIDEBAR (mobile drawer controls) ====== */
function setupSidebar() {
  const sidebar = document.getElementById("swSidebar");
  const toggle = document.getElementById("swToggle");
  const close = document.getElementById("swClose");
  const overlay = document.getElementById("swOverlay");

  function open() {
    sidebar.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function shut() {
    sidebar.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.dataset.open === "true";
    isOpen ? shut() : open();
  });

  close.addEventListener("click", shut);
  overlay.addEventListener("click", shut);

  // Esc to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.dataset.open === "true") shut();
  });

  // Start closed on mobile
  sidebar.dataset.open = "false";
  overlay.hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
  renderTeams();
  setupSidebar();
});