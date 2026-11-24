/* COOKIE_CONSENT_LANDING_V1 - consentimiento real en la landing estática.
   Cinco segundos de espera, sin cargar servicios opcionales. La elección se
   guarda con la misma clave y forma que la app (agntia_cookie_consent_v1).
   Hoy no hay analítica ni píxeles en el sitio: guardar la elección no activa
   nada por sí solo. */
(function () {
  "use strict";
  var KEY = "agntia_cookie_consent_v1";
  var DELAY = 5000;
  var banner = null;
  var dialog = null;
  var measurement = false;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var value = JSON.parse(raw);
      if (!value || value.version !== 1 || value.necessary !== true || typeof value.measurement !== "boolean") {
        return null;
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  function save(value) {
    var consent = {
      version: 1,
      necessary: true,
      measurement: Boolean(value),
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(consent));
    } catch (error) {
      /* Sin almacenamiento la decisión vale solo para esta visita. */
    }
    window.dispatchEvent(new CustomEvent("agntia:cookie-consent", { detail: consent }));
    closeBanner();
    if (dialog && dialog.open) dialog.close();
    return consent;
  }

  function element(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "role") node.setAttribute("role", attrs[key]);
      else if (key === "aria") node.setAttribute("aria-label", attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    if (text) node.textContent = text;
    return node;
  }

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function showBanner() {
    if (banner || read()) return;
    banner = element("aside", {
      class: "ccb-banner",
      role: "dialog",
      "aria-labelledby": "ccb-title",
      "aria-describedby": "ccb-text"
    });
    banner.innerHTML =
      '<h2 id="ccb-title">Cookies, con transparencia</h2>' +
      '<p id="ccb-text">Usamos cookies necesarias para que el sitio funcione. Las de medición son opcionales y están desactivadas hasta que las aceptes.</p>' +
      '<div class="ccb-actions">' +
      '<button type="button" class="ccb-btn ccb-btn-primary" data-choice="accept">Aceptar</button>' +
      '<button type="button" class="ccb-btn" data-choice="reject">Rechazar</button>' +
      '<button type="button" class="ccb-link" data-choice="config">Configurar</button>' +
      "</div>";
    banner.addEventListener("click", function (event) {
      var choice = event.target.closest("[data-choice]");
      if (!choice) return;
      var value = choice.getAttribute("data-choice");
      if (value === "accept") save(true);
      else if (value === "reject") save(false);
      else openPreferences();
    });
    document.body.appendChild(banner);
  }

  function buildDialog() {
    if (dialog) return dialog;
    dialog = element("dialog", { class: "ccb-dialog", "aria-labelledby": "ccb-dialog-title" });
    dialog.innerHTML =
      '<div class="ccb-dialog-inner">' +
      '<h2 id="ccb-dialog-title">Preferencias de cookies</h2>' +
      '<p>Necesarias siempre activas. La medición es opcional y se guarda en este navegador; no hay ningún servicio de analítica conectado.</p>' +
      '<ul class="ccb-prefs">' +
      '<li><label class="ccb-pref"><input type="checkbox" checked disabled /><span><strong>Necesarias</strong><em>Sesión, seguridad y esta preferencia.</em></span></label></li>' +
      '<li><label class="ccb-pref"><input type="checkbox" data-measurement /><span><strong>Medición</strong><em>Saber qué páginas se leen. Sin publicidad.</em></span></label></li>' +
      "</ul>" +
      '<div class="ccb-dialog-actions">' +
      '<button type="button" class="ccb-btn" data-choice="essentials">Solo esenciales</button>' +
      '<button type="button" class="ccb-btn ccb-btn-primary" data-choice="save">Guardar elección</button>' +
      "</div></div>";
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
      var choice = event.target.closest("[data-choice]");
      if (!choice) return;
      var value = choice.getAttribute("data-choice");
      if (value === "essentials") save(false);
      else if (value === "save") {
        var checkbox = dialog.querySelector("[data-measurement]");
        save(Boolean(checkbox && checkbox.checked));
      }
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function openPreferences() {
    var node = buildDialog();
    measurement = Boolean(read() && read().measurement);
    var checkbox = node.querySelector("[data-measurement]");
    if (checkbox) checkbox.checked = measurement;
    if (typeof node.showModal === "function") node.showModal();
    else node.setAttribute("open", "");
  }

  function bindFooter() {
    var button = document.getElementById("agntia-cookie-settings");
    if (!button) return;
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openPreferences();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindFooter();
      if (!read()) setTimeout(showBanner, DELAY);
    });
  } else {
    bindFooter();
    if (!read()) setTimeout(showBanner, DELAY);
  }
})();
