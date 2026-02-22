let TABS = [];
let CACHE = {};
let cur = 0;

fetch("assets/tabs.json")
  .then((r) => r.json())
  .then((data) => {
    TABS = data;
    loadTab(cur);
  });

document.getElementById("btn-prev").onclick = () => go(cur - 1);
document.getElementById("btn-next").onclick = () => go(cur + 1);

function go(idx) {
  cur = (idx + TABS.length) % TABS.length;
  loadTab(cur);
}

async function loadTab(idx) {
  if (!CACHE[idx]) {
    const r = await fetch(TABS[idx].link);
    const entries = await r.json();
    CACHE[idx] = entries.map((e) => ({
      ...e,
      _original: e.value,
      _imgSrc: "",
    }));
  }
  render();
}

function render() {
  const entries = CACHE[cur];
  if (!entries) return;

  document.getElementById("tab-name").textContent = TABS[cur].name;

  const dotsEl = document.getElementById("tab-dots");
  dotsEl.innerHTML = "";
  TABS.forEach((t, i) => {
    const dot = document.createElement("div");
    dot.className = `w-[60px] h-1.5 cursor-pointer rounded-sm transition-colors ${i === cur ? "bg-white" : "bg-white/20 hover:bg-white/40"}`;
    dot.onclick = () => go(i);
    dotsEl.appendChild(dot);
  });

  const grid = document.getElementById("cards-grid");
  const template = document.getElementById("card-template");
  grid.innerHTML = "";

  const sorted = [...entries].sort((a, b) => a.title.localeCompare(b.title));

  sorted.forEach((e) => {
    const origIdx = entries.indexOf(e);
    const card = template.content.cloneNode(true);
    const root = card.querySelector("div");

    const color = e.color || "#333";
    root.style.borderColor = color;
    root.style.boxShadow = `0 0 12px ${color}66, inset 0 0 6px ${color}33`;
    root.querySelector(".card-title").style.color = color;

    root.addEventListener("mouseenter", () => {
      root.style.boxShadow = `0 0 22px ${color}cc, inset 0 0 8px ${color}55`;
    });
    root.addEventListener("mouseleave", () => {
      root.style.boxShadow = `0 0 12px ${color}66, inset 0 0 6px ${color}33`;
    });

    card.querySelector(".card-title").textContent = e.title;

    const imgEl = card.querySelector(".card-img");
    imgEl.style.filter = `drop-shadow(0 0 8px ${color})`;

    const imgSrc = e._imgSrc || (e.image ? `assets/mira/${e.image}` : null);
    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "w-full h-full object-contain";
      imgEl.innerHTML = "";
      imgEl.appendChild(img);
    }
    imgEl.onclick = () => pickImg(origIdx);

    const input = card.querySelector(".card-input");
    input.value = e.value;
    input.oninput = () => {
      CACHE[cur][origIdx].value = input.value;
      buildXML();
    };

    grid.appendChild(card);
  });

  buildXML();
}

function buildXML() {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<resources>"];
  Object.values(CACHE).forEach((entries) => {
    entries.forEach((e) => {
      if (e.xml && e.value !== e._original)
        lines.push("  " + e.xml.replace("%s", e.value));
    });
  });
  lines.push("</resources>");
  document.getElementById("xml-out").textContent = lines.join("\n");
}

document.getElementById("btn-export").onclick = () => {
  const xml = document.getElementById("xml-out").textContent;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
  link.download = "language.xml";
  link.click();
};
