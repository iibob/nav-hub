const DEFAULT_ICON = "icon.svg";
let dataset = {};
let navKeys = [];
let currentKey = "";
let dragSrcEl = null;

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const remoteUrl = params.get("data");
  const url = remoteUrl || "links.json";
  const paramTitle = params.get("title");
  const height = params.get("height");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`加载 JSON 失败: ${res.status}`);
    dataset = await res.json();
    navKeys = Object.keys(dataset);

    if (!navKeys.length) throw new Error("JSON 文件中没有内容");

    if (paramTitle?.trim()) {
    document.title = paramTitle.trim();
    }

    if (height?.trim()) {
    document.documentElement.style.setProperty('--content-height', height.trim());
    }

    initNav();
    render(navKeys[0]);
  } catch (err) {
    console.error(err);
    alert("数据加载失败，请检查 JSON 文件路径或网络连接。");
  }
}

function initNav() {
  const navEl = document.querySelector(".nav");
  navEl.innerHTML = "";

  navKeys.forEach((label, idx) => {
    const item = document.createElement("div");
    item.className = "nav-item" + (idx === 0 ? " active" : "");
    item.textContent = label.split("").join(" ");
    item.addEventListener("click", () => {
      if (item.classList.contains("active")) return;
      document.querySelector(".nav-item.active")?.classList.remove("active");
      item.classList.add("active");
      render(label);
    });
    navEl.appendChild(item);
  });
}

function render(key) {
  currentKey = key;
  document.getElementById("content-title").textContent = key;
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  const list = dataset[key] || [];

  list.forEach((site) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = site.url;

    const iconSrc = site.icon?.trim()
      ? (site.icon.startsWith("http") ? site.icon : `images/${site.icon}`)
      : DEFAULT_ICON;

    const colors = getComputedStyle(document.documentElement)
      .getPropertyValue('--icon-bg').split(',').map(c => c.trim());
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    tile.innerHTML = `
      <div class="icon" style="background:${randomColor};">
        <img src="${iconSrc}" alt="icon">
      </div>
      <div class="title">${site.name}</div>
    `;

    tile.draggable = true;
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("drop", handleDrop);
    tile.addEventListener("dragend", handleDragEnd);

    gridEl.appendChild(tile);
  });
}

function handleDragStart(e) {
  dragSrcEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  if (this === dragSrcEl) return;
  const grid = this.parentNode;
  const tiles = Array.from(grid.children);
  const dragIdx = tiles.indexOf(dragSrcEl);
  const targetIdx = tiles.indexOf(this);

  if (dragIdx < targetIdx) {
    grid.insertBefore(dragSrcEl, this.nextSibling);
  } else {
    grid.insertBefore(dragSrcEl, this);
  }
}

function handleDrop(e) { e.stopPropagation(); }
function handleDragEnd() { this.classList.remove('dragging'); }

loadData();