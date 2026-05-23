(function () {
  const storageKey = "smartPawsTheme";
  const darkClass = "dark-mode";

  function prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function getSavedTheme() {
    return localStorage.getItem(storageKey);
  }

  function shouldUseDark() {
    const saved = getSavedTheme();
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return prefersDark();
  }

  function applyTheme(isDark) {
    document.body.classList.toggle(darkClass, isDark);
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    toggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    toggle.setAttribute("title", isDark ? "Modo claro" : "Modo oscuro");
    toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  function createToggle() {
    if (document.querySelector(".theme-toggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.addEventListener("click", () => {
      const nextDark = !document.body.classList.contains(darkClass);
      localStorage.setItem(storageKey, nextDark ? "dark" : "light");
      applyTheme(nextDark);
    });

    document.body.appendChild(button);
    applyTheme(shouldUseDark());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggle);
  } else {
    createToggle();
  }
})();
