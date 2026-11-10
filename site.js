// Shared header, footer and countdown for every page of the AKD 30.0 site.
// Each page has <header class="nav" data-page="..."> and <footer class="footer"> placeholders.
(() => {
  const D = window.AKD;
  const nav = document.querySelector("header.nav");
  const page = nav.dataset.page;
  const links = [
    ["home", "index.html", "Home"],
    ["teams", "teams.html", "Teams"],
    ["history", "history.html", "History"],
    ["gallery", "gallery.html", "Gallery"],
    ["event", "event.html", "Event"],
    ["board", "board.html", "Board"],
    ["visit", "visit.html", "Visitor info"],
    ["partners", "partners.html", "Partners"]
  ];
  nav.innerHTML = `
    <div class="wrap">
      <a class="home" href="index.html" aria-label="AKD home"><img src="assets/logo-brown.png" alt="AKD"></a>
      <nav aria-label="Main">
        <ul id="navList">
          ${links.map(([key, href, label]) => `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
        </ul>
      </nav>
      <div class="nav-right">
        <button class="menu" type="button" aria-expanded="false" aria-controls="navList">Menu</button>
        <a class="btn btn-ink" href="index.html#apply">Apply now</a>
      </div>
    </div>`;
  const menu = nav.querySelector(".menu"), list = nav.querySelector("#navList");
  menu.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
    menu.textContent = open ? "Close" : "Menu";
  });

  const footer = document.querySelector("footer.footer");
  if (footer) footer.innerHTML = `
    <div class="airmail-edge" aria-hidden="true"></div>
    <div class="wrap inner">
      <p class="big cond">Cleared for takeoff</p>
      <p>AKD 30.0, February 20, 2027<br>John H. Gattis–Wendell Tabb Theater</p>
      <div class="btns"><a class="btn btn-red" href="index.html#apply">Apply now</a><a class="btn btn-paper" href="${D.instagram}">Follow @uncakd</a></div>
      <p class="small">Aaj Ka Dhamaka at UNC Chapel Hill</p>
    </div>`;

  document.querySelectorAll("[data-days]").forEach((el) => { el.textContent = D.daysUntil(); });
})();
