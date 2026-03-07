// teams-liaisons.js

const HEADSHOT_PLACEHOLDER = "assets/img/misc/headshot-placeholder.jpg";
const TEAM_PLACEHOLDER = "assets/img/misc/team-placeholder.jpg";

const LIAISON_IMG_OVERRIDES = {
  "Aashvi": { className: "liaison-pos-top" },
  "Rahi Patel": { className: "liaison-pos-top" },
  "Smruti Ganta": { className: "liaison-pos-top" },
  "Tasha Paul": { className: "liaison-pos-top" }
};

const TEAMS_DATA = {
  fusion: [
    {
      name: "Texas Mohini",
      image: "assets/img/teams/fusion/texas-mohini.jpg",
      liaisons: ["Keya Mahajan", "Tanuli Gunerathne", "Vivek Gottumukkala"]
    },
    {
      name: "GT Jadoo",
      image: "assets/img/teams/fusion/gt-jadoo.jpg",
      liaisons: ["Akshat Arora", "Vaishnavi Kode", "Diya Parikh"]
    },
    {
      name: "UCB Zahanat",
      image: "assets/img/teams/fusion/ucb-zahanat.jpg",
      liaisons: ["Shreya Dandu", "Neev Gupta", "Tanuj Devulapalli"]
    },
    {
      name: "Case Kismat",
      image: "assets/img/teams/fusion/case-kismat.jpg",
      liaisons: ["Manvika Mamidala", "Rathi Seenivasan", "Maya Gopakumar"]
    },
    {
      name: "UCSC Kahaani",
      image: "assets/img/teams/fusion/ucsc-kahani.jpg",
      liaisons: ["Saanvi Veeramreddy", "Rishima Mathur", "Nubah"]
    },
    {
      name: "UW Kahaani",
      image: "assets/img/teams/fusion/uw-kahani.jpg",
      liaisons: ["Nikita Chincholkar", "Smruti Ganta", "Shivani Menon"]
    },
    {
      name: "UCB Azaad",
      image: "assets/img/teams/fusion/ucb-azaad.jpg",
      liaisons: ["Tasha Paul", "Rishi Singh"]
    },
    {
      name: "Broad Street Baadshahz",
      image: "assets/img/teams/fusion/broad-city-baadshahz.jpg",
      liaisons: ["Aashvi", "Rahi Patel", "Joanna Hu"]
    }
  ],
  bhangra: [
    {
      name: "Stanford Bhangra",
      image: "assets/img/teams/bhangra/stanford-bhangra.jpg",
      liaisons: ["Anushri Ghoshal", "Keerthana Vemparala"]
    },
    {
      name: "Classic City Bhangra",
      image: "assets/img/teams/bhangra/classic-city-bhangra.jpg",
      liaisons: ["Aleynah Maxwell", "Shreeya Shabari"]
    },
    {
      name: "Birmingham Blazin' Bhangra",
      image: "assets/img/teams/bhangra/bbb.jpg",
      liaisons: ["Lita James", "Anjali Kshirsagar"]
    },
    {
      name: "MMD",
      image: "assets/img/teams/bhangra/mehfil-mitraan-di-bhangra.jpg",
      liaisons: ["Rachit Keyal", "Ilakkiya Gnanakkumaran"]
    },
    {
      name: "Lok Naach",
      image: "assets/img/teams/bhangra/lok-naach.jpg",
      liaisons: ["Sanjita Srinath", "Sharayu Talap"]
    }
  ]
};

function slugifyName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function liaisonHeadshotPath(fullName) {
  return `assets/img/liaisons/${slugifyName(fullName)}.jpg`;
}

function setupLiaisonModal() {
  const backdrop = document.getElementById("liaisonModalBackdrop");
  const modal = document.getElementById("liaisonModal");
  const closeBtn = document.getElementById("liaisonModalClose");

  const title = document.getElementById("liaisonModalTitle");
  const body = document.getElementById("liaisonModalBody");

  function close() {
    backdrop.hidden = true;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function open(teamName, liaisons) {
    title.textContent = teamName;
    body.innerHTML = "";

    (liaisons || []).forEach((person) => {
      const card = document.createElement("div");
      card.className = "liaison-modal-card";

      const img = document.createElement("img");
      img.src = liaisonHeadshotPath(person);
      img.alt = `${person} headshot`;
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => { img.src = HEADSHOT_PLACEHOLDER; };

      const ov = LIAISON_IMG_OVERRIDES[person];
      if (ov?.className) img.classList.add(ov.className);
      if (ov?.objectPosition) img.style.objectPosition = ov.objectPosition;
      if (ov?.objectFit) img.style.objectFit = ov.objectFit;

      const nm = document.createElement("div");
      nm.className = "liaison-modal-name";
      nm.textContent = person;

      card.appendChild(img);
      card.appendChild(nm);
      body.appendChild(card);
    });

    backdrop.hidden = false;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  return { open, close };
}

function createTeamCard(team, modalAPI) {
  const card = document.createElement("article");
  card.className = "team-tile team-card";

  const btn = document.createElement("button");
  btn.className = "team-card-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", `Open liaisons for ${team.name}`);

  const media = document.createElement("div");
  media.className = "team-card-media";

  const img = document.createElement("img");
  img.src = team.image;
  img.alt = team.name;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => { img.src = TEAM_PLACEHOLDER; };

  media.appendChild(img);

  const title = document.createElement("div");
  title.className = "team-card-title";
  title.textContent = team.name;

  const hint = document.createElement("div");
  hint.className = "team-card-hint";
  hint.textContent = "Tap for liaisons";

  btn.appendChild(media);
  btn.appendChild(title);
  btn.appendChild(hint);

  btn.addEventListener("click", () => {
    modalAPI.open(team.name, team.liaisons || []);
  });

  card.appendChild(btn);
  return card;
}

function renderTeams(modalAPI) {
  const fusionGrid = document.getElementById("fusionGrid");
  const bhangraGrid = document.getElementById("bhangraGrid");
  if (!fusionGrid || !bhangraGrid) return;

  fusionGrid.innerHTML = "";
  bhangraGrid.innerHTML = "";

  TEAMS_DATA.fusion.forEach(t => fusionGrid.appendChild(createTeamCard(t, modalAPI)));
  TEAMS_DATA.bhangra.forEach(t => bhangraGrid.appendChild(createTeamCard(t, modalAPI)));
}

document.addEventListener("DOMContentLoaded", () => {
  const modalAPI = setupLiaisonModal();
  renderTeams(modalAPI);
});