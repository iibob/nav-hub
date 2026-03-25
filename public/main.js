(function () {
  const DEFAULT_ICON = "icon.svg";
  let siteData = {};
  let navKeys = [];
  let currentKey = "";
  let dragSrcEl = null;
  let cachedColors = null;

  const tileColors = new WeakMap();

  // 状态管理
  let isEditMode = false;
  let isModified = false;

  // DOM 元素
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalCat = document.getElementById("modal-cat");
  const modalSite = document.getElementById("modal-site");
  const saveReminder = document.getElementById("save-reminder");
  const editBanner = document.getElementById("edit-banner");

  async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const remoteUrl = params.get("data");
    const url = remoteUrl || "links.json";
    const paramTitle = params.get("title");
    const height = params.get("height");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`加载 JSON 失败: ${res.status}`);
      siteData = await res.json();
      navKeys = Object.keys(siteData);

      if (!navKeys.length) throw new Error("JSON 文件中没有内容");

      if (paramTitle?.trim()) document.title = paramTitle.trim();
      if (height?.trim()) document.documentElement.style.setProperty('--content-height', height.trim());

      initNav();
      render(navKeys[0]);
    } catch (err) {
      console.error(err);
      siteData = { "默认分类": [] };
      navKeys = ["默认分类"];
      initNav();
      render(navKeys[0]);
    }
  }

  function initNav() {
    const navEl = document.querySelector(".nav");
    navEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    navKeys.forEach((label, idx) => {
      const item = document.createElement("div");
      item.className = "nav-item" + (label === currentKey || (idx === 0 && !currentKey) ? " active" : "");
      item.textContent = label.split("").join(" ");
      item.addEventListener("click", () => {
        if (item.classList.contains("active")) return;
        document.querySelector(".nav-item.active")?.classList.remove("active");
        item.classList.add("active");
        render(label);
      });
      fragment.appendChild(item);
    });

    navEl.appendChild(fragment);
  }

  function getColor(site) {
    if (!tileColors.has(site)) {
      if (!cachedColors) {
        cachedColors = getComputedStyle(document.documentElement)
          .getPropertyValue('--icon-bg').split(',').map(c => c.trim());
      }
      tileColors.set(site, cachedColors[Math.floor(Math.random() * cachedColors.length)]);
    }
    return tileColors.get(site);
  }

  function render(key) {
    currentKey = key;
    document.getElementById("content-title").textContent = key;
    const gridEl = document.getElementById("grid");
    gridEl.innerHTML = "";

    const list = siteData[key] || [];
    const fragment = document.createDocumentFragment();

    list.forEach((site, idx) => {
      const tile = document.createElement("a");
      tile.className = "tile" + (isEditMode ? " edit-mode-tile" : "");
      tile.href = site.url;
      tile.dataset.idx = idx;

      const iconSrc = site.icon?.trim()
        ? (site.icon.startsWith("http") ? site.icon : `images/${site.icon}`)
        : DEFAULT_ICON;

      const color = getColor(site);

      const iconDiv = document.createElement('div');
      iconDiv.className = 'icon';
      iconDiv.style.backgroundColor = color;

      const img = document.createElement('img');
      img.alt = site.name || 'icon';
      img.src = iconSrc;
      img.onerror = function () { this.src = DEFAULT_ICON; };

      const titleDiv = document.createElement('div');
      titleDiv.className = 'title';
      titleDiv.textContent = site.name;

      iconDiv.appendChild(img);
      tile.appendChild(iconDiv);
      tile.appendChild(titleDiv);

      tile.draggable = true;
      tile.addEventListener("dragstart", handleDragStart);
      tile.addEventListener("dragover", handleDragOver);
      tile.addEventListener("drop", handleDrop);
      tile.addEventListener("dragend", handleDragEnd);

      tile.addEventListener("click", (e) => {
        if (isEditMode) {
          e.preventDefault();
          openEditSiteModal(key, idx);
        }
      });

      fragment.appendChild(tile);
    });

    gridEl.appendChild(fragment);
  }

  // ========== 拖拽逻辑 ==========
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

  function handleDragEnd() {
    this.classList.remove('dragging');
    const grid = this.parentNode;
    const tiles = Array.from(grid.children);

    const newArray = [];

    tiles.forEach((tile, newIndex) => {
      const oldIdx = parseInt(tile.dataset.idx, 10);
      if (oldIdx >= 0 && oldIdx < siteData[currentKey].length) {
        newArray.push(siteData[currentKey][oldIdx]);
      }

      tile.dataset.idx = newIndex;
    });

    const hasChanged = newArray.some((item, index) => item !== siteData[currentKey][index]);

    if (hasChanged) {
      siteData[currentKey] = newArray;
      markModified();
      render(currentKey);
    }
  }

  // ========== 核心操作逻辑 ==========

  function markModified() {
    isModified = true;
    saveReminder.classList.remove("hidden");
  }

  // 下载 JSON
  document.getElementById("btn-download").addEventListener("click", () => {
    const exportData = {};
    navKeys.forEach(key => {
      exportData[key] = (siteData[key] || []).map(({ _color, ...rest }) => rest);
    });

    const finalJsonStr = JSON.stringify(exportData, null, 2);

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(finalJsonStr);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "links.json");
    dlAnchorElem.click();
    dlAnchorElem.remove();

    isModified = false;
    saveReminder.classList.add("hidden");
  });

  // ========== 设置与菜单逻辑 ==========

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    settingsMenu.classList.add("hidden");
  });

  document.getElementById("btn-close-reminder").addEventListener("click", () => {
    saveReminder.classList.add("hidden");
  });

  document.getElementById("btn-exit-edit").addEventListener("click", () => {
    isEditMode = false;
    editBanner.classList.add("hidden");
    render(currentKey);
  });

  // ========== 弹窗公用逻辑 ==========

  function openModal(modalEl) {
    modalOverlay.classList.remove("hidden");
    document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
    modalEl.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", closeModal);
  });

  let confirmCallback = null;
  let previousModal = null;

  function showConfirm(msg, callback, isAlert = false) {
    const activeModals = Array.from(document.querySelectorAll(".modal")).filter(m => !m.classList.contains("hidden"));
    previousModal = activeModals.length > 0 ? activeModals[0] : null;

    document.getElementById("confirm-msg").textContent = msg;
    confirmCallback = callback;

    const cancelBtn = document.getElementById("btn-confirm-cancel");
    cancelBtn.style.display = isAlert ? "none" : "inline-block";

    openModal(document.getElementById("modal-confirm"));
  }

  document.getElementById("btn-confirm-cancel").addEventListener("click", () => {
    if (previousModal) {
      openModal(previousModal);
    } else {
      closeModal();
    }
  });

  document.getElementById("btn-confirm-ok").addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
  });

  // ========== 分类管理 ==========

  document.getElementById("menu-cat-mgr").addEventListener("click", () => {
    renderCatManager();
    openModal(modalCat);
  });

  function renderCatManager() {
    const listEl = document.getElementById("cat-list");
    listEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    navKeys.forEach((cat, idx) => {
      const li = document.createElement("li");

      const nameSpan = document.createElement("span");
      nameSpan.className = "cat-name";
      nameSpan.textContent = cat;

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "cat-actions";

      const btnUp = document.createElement("button");
      btnUp.textContent = "↑";
      btnUp.disabled = idx === 0;
      btnUp.addEventListener("click", () => moveCat(idx, -1));

      const btnDown = document.createElement("button");
      btnDown.textContent = "↓";
      btnDown.disabled = idx === navKeys.length - 1;
      btnDown.addEventListener("click", () => moveCat(idx, 1));

      const btnDel = document.createElement("button");
      btnDel.textContent = "删";
      btnDel.className = "danger";
      btnDel.addEventListener("click", () => deleteCat(cat));

      actionsDiv.appendChild(btnUp);
      actionsDiv.appendChild(btnDown);
      actionsDiv.appendChild(btnDel);

      li.appendChild(nameSpan);
      li.appendChild(actionsDiv);
      fragment.appendChild(li);
    });

    listEl.appendChild(fragment);
  }

  document.getElementById("btn-clear-all").addEventListener("click", () => {
    showConfirm("确定清空所有分类和网站数据吗？此操作不可恢复！", () => {
      navKeys = [];
      siteData = {};
      currentKey = "";
      markModified();
      renderCatManager();
      initNav();
      document.getElementById("content-title").textContent = "";
      document.getElementById("grid").innerHTML = "";
      openModal(document.getElementById("modal-cat"));
    });
  });

  function moveCat(idx, dir) {
    if (idx + dir < 0 || idx + dir >= navKeys.length) return;
    [navKeys[idx], navKeys[idx + dir]] = [navKeys[idx + dir], navKeys[idx]];
    markModified();
    renderCatManager();
    initNav();
  }

  function deleteCat(cat) {
    showConfirm(`确定删除分类 "${cat}" 及其包含的所有网站吗？`, () => {
      navKeys = navKeys.filter(k => k !== cat);
      delete siteData[cat];
      if (currentKey === cat) currentKey = navKeys[0] || "";
      markModified();
      renderCatManager();
      initNav();
      if (currentKey) {
        render(currentKey);
      } else {
        document.getElementById("content-title").textContent = "";
        document.getElementById("grid").innerHTML = "";
      }
      openModal(document.getElementById("modal-cat"));
    });
  }

  document.getElementById("btn-add-cat").addEventListener("click", () => {
    const input = document.getElementById("new-cat-name");
    const val = input.value.trim();
    if (!val) return;
    if (navKeys.includes(val)) {
      showConfirm("分类已存在！", () => openModal(modalCat), true);
      return;
    }

    navKeys.push(val);
    siteData[val] = [];
    input.value = "";
    markModified();
    renderCatManager();
    initNav();
  });

  // ========== 添加/编辑网站 ==========

  function populateCatSelect(activeCat) {
    const select = document.getElementById("site-cat");
    select.innerHTML = "";
    navKeys.forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      if (k === activeCat) opt.selected = true;
      select.appendChild(opt);
    });
  }

  document.getElementById("menu-add-site").addEventListener("click", () => {
    if (!navKeys.length) {
      showConfirm("请先添加分类！", () => {
        renderCatManager();
        openModal(modalCat);
      }, true);
      return;
    }
    document.getElementById("site-modal-title").textContent = "添加网站";
    populateCatSelect(currentKey);
    document.getElementById("site-name").value = "";
    document.getElementById("site-url").value = "";
    document.getElementById("site-icon").value = "";
    document.getElementById("site-edit-idx").value = "";
    document.getElementById("site-edit-old-cat").value = "";
    document.getElementById("btn-delete-site").classList.add("hidden");
    openModal(modalSite);
  });

  document.getElementById("menu-edit-site").addEventListener("click", () => {
    isEditMode = true;
    editBanner.classList.remove("hidden");
    render(currentKey);
  });

  function openEditSiteModal(cat, idx) {
    const site = siteData[cat][idx];
    document.getElementById("site-modal-title").textContent = "编辑网站";
    populateCatSelect(cat);
    document.getElementById("site-name").value = site.name;
    document.getElementById("site-url").value = site.url;
    document.getElementById("site-icon").value = site.icon || "";
    document.getElementById("site-edit-idx").value = idx;
    document.getElementById("site-edit-old-cat").value = cat;
    document.getElementById("btn-delete-site").classList.remove("hidden");
    openModal(modalSite);
  }

  document.getElementById("btn-save-site").addEventListener("click", () => {
    const cat = document.getElementById("site-cat").value;
    const name = document.getElementById("site-name").value.trim();
    const url = document.getElementById("site-url").value.trim();
    const icon = document.getElementById("site-icon").value.trim();
    const editIdxRaw = document.getElementById("site-edit-idx").value;
    const oldCat = document.getElementById("site-edit-old-cat").value;

    if (!name || !url) {
      showConfirm("名称和网址不能为空！", () => openModal(modalSite), true);
      return;
    }

    const newSite = { name, url, icon };

    if (editIdxRaw !== "") {
      const editIdx = parseInt(editIdxRaw, 10);
      if (oldCat === cat) {
        siteData[cat][editIdx] = newSite;
      } else {
        siteData[oldCat].splice(editIdx, 1);
        siteData[cat].push(newSite);
      }
    } else {
      siteData[cat].push(newSite);
    }

    markModified();
    closeModal();

    if (currentKey !== cat) {
      currentKey = cat;
      document.querySelectorAll(".nav-item").forEach((item, i) => {
        item.classList.toggle("active", navKeys[i] === cat);
      });
    }

    render(currentKey);
  });

  document.getElementById("btn-delete-site").addEventListener("click", () => {
    showConfirm("确定删除该网站吗？", () => {
      const oldCat = document.getElementById("site-edit-old-cat").value;
      const editIdx = parseInt(document.getElementById("site-edit-idx").value, 10);
      siteData[oldCat].splice(editIdx, 1);
      markModified();
      closeModal();
      render(currentKey);
    });
  });

  document.getElementById("menu-about").addEventListener("click", () => {
    openModal(document.getElementById("modal-about"));
  });

  loadData();

})();