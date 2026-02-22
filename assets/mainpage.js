let TABS = [];
let cur = 0;

fetch("assets/layout.json")
  .then((r) => r.json())
  .then((data) => {
    TABS = data.tabs.map((t) => ({
      ...t,
      entries: t.entries.map((e) => ({
        ...e,
        _original: e.value,
        _imgSrc: "",
      })),
    }));
    render();
  });

document.getElementById("btn-prev").onclick = () => go(cur - 1);
document.getElementById("btn-next").onclick = () => go(cur + 1);

function go(idx) {
  cur = (idx + TABS.length) % TABS.length;
  render();
}

function render() {
  const tab = TABS[cur];

  document.getElementById("tab-name").textContent = tab.name;

  // Dots
  const dotsEl = document.getElementById("tab-dots");
  dotsEl.innerHTML = "";
  TABS.forEach((t, i) => {
    const dot = document.createElement("div");
    dot.className = `w-[60px] h-1.5 cursor-pointer rounded-sm transition-colors ${i === cur ? "bg-white" : "bg-white/20 hover:bg-white/40"}`;
    dot.onclick = () => go(i);
    dotsEl.appendChild(dot);
  });

  // Cards
  const grid = document.getElementById("cards-grid");
  const template = document.getElementById("card-template");
  grid.innerHTML = "";

  const sorted = [...tab.entries].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  sorted.forEach((e, i) => {
    const origIdx = tab.entries.indexOf(e);
    const card = template.content.cloneNode(true);
    const root = card.querySelector("div");

    // Apply color from layout.json as border + glow
    const color = e.color || "#333";
    root.style.borderColor = color;
    root.style.boxShadow = `0 0 12px ${color}66, inset 0 0 6px ${color}33`;

    root.addEventListener("mouseenter", () => {
      root.style.boxShadow = `0 0 22px ${color}cc, inset 0 0 8px ${color}55`;
    });
    root.addEventListener("mouseleave", () => {
      root.style.boxShadow = `0 0 12px ${color}66, inset 0 0 6px ${color}33`;
    });

    card.querySelector(".card-title").textContent = e.title;

    const imgEl = card.querySelector(".card-img");
    imgEl.style.filter = `drop-shadow(0 0 8px ${color})`;

    // _imgSrc is a user upload override; otherwise use the path from layout.json
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
      TABS[cur].entries[origIdx].value = input.value;
      buildXML();
    };

    grid.appendChild(card);
  });

  buildXML();
}

function pickImg(idx) {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "assets/mira/*";
  inp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      TABS[cur].entries[idx]._imgSrc = ev.target.result;
      TABS[cur].entries[idx].image = file.name;
      render();
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function buildXML() {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<resources>"];
  TABS.forEach((t) => {
    t.entries.forEach((e) => {
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
