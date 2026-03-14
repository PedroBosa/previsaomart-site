const tabButtons = () => Array.from(document.querySelectorAll(".tab"));
const panels = () => Array.from(document.querySelectorAll(".panel"));

export function switchTab(tabId) {
  tabButtons().forEach((btn) => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  panels().forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tabId);
  });
}

export function setupTabs() {
  const activate = (tabId) => {
    tabButtons().forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tab === tabId);
      btn.setAttribute("aria-selected", String(btn.dataset.tab === tabId));
    });

    panels().forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === tabId);
    });
  };

  tabButtons().forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tab));
  });
}
