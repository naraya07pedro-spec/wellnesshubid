/* Discipline Hub Analytics Bridge
   1) Buat GA4 Web Data Stream di Google Analytics.
   2) Copy Measurement ID yang diawali "G-".
   3) Ganti nilai GA_MEASUREMENT_ID di bawah ini.
*/
window.DH_ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // Configure your own GA4 measurement ID
  APP_NAME: "Discipline Hub",
  DEBUG: false
};

(function () {
  const cfg = window.DH_ANALYTICS_CONFIG || {};
  const id = cfg.GA_MEASUREMENT_ID || "";
  const isConfigured = /^G-[A-Z0-9]+$/i.test(id) && id !== "G-XXXXXXXXXX";
  const params = new URLSearchParams(window.location.search);
  const explicitSource = params.get("src") || params.get("utm_source") || params.get("source") || params.get("ref");
  if (explicitSource) {
    try { localStorage.setItem("dh_source", explicitSource.toLowerCase()); } catch (e) {}
  }
  const savedSource = (() => { try { return localStorage.getItem("dh_source") || "direct"; } catch (e) { return "direct"; } })();
  const sessionId = (() => {
    try {
      let sid = sessionStorage.getItem("dh_session_id");
      if (!sid) {
        sid = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem("dh_session_id", sid);
      }
      return sid;
    } catch (e) { return "no-session"; }
  })();

  window.dhTrack = function (eventName, eventParams) {
    const payload = Object.assign({
      app_name: cfg.APP_NAME || "Discipline Hub",
      page_title: document.title,
      page_path: location.pathname,
      source_platform: savedSource,
      session_id: sessionId
    }, eventParams || {});

    if (cfg.DEBUG) console.log("[DH Analytics]", eventName, payload);
    if (typeof window.gtag === "function" && isConfigured) {
      window.gtag("event", eventName, payload);
    }
  };

  window.dhSetUserGoal = function (goal) {
    try { localStorage.setItem("dh_goal", goal); } catch (e) {}
    if (typeof window.gtag === "function" && isConfigured) {
      window.gtag("set", "user_properties", { dh_goal: goal });
    }
    window.dhTrack("set_user_goal", { goal });
  };

  if (!isConfigured) {
    console.warn("[Discipline Hub] Analytics belum aktif. Ganti GA_MEASUREMENT_ID di analytics.js dengan ID GA4 lo, contoh G-ABC123XYZ.");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id, {
    send_page_view: true,
    app_name: cfg.APP_NAME || "Discipline Hub",
    source_platform: savedSource
  });

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(tag);

  document.addEventListener("click", function (event) {
    const el = event.target.closest("a, button, [role='button'], input[type='submit']");
    if (!el) return;
    const rawLabel = el.getAttribute("data-track") || el.getAttribute("aria-label") || el.name || el.value || el.innerText || el.textContent || el.href || el.id || "unknown_click";
    const label = String(rawLabel).replace(/\s+/g, " ").trim().slice(0, 90) || "unknown_click";
    const href = el.href || "";
    let clickType = "ui";
    try {
      if (href && new URL(href, location.href).origin !== location.origin) clickType = "outbound";
      else if (href) clickType = "internal_link";
    } catch (e) {}
    window.dhTrack("dh_click", {
      click_label: label,
      click_type: clickType,
      click_href: href ? href.slice(0, 180) : "",
      element_tag: el.tagName.toLowerCase()
    });
  }, true);

  window.addEventListener("beforeinstallprompt", function(){ window.dhTrack("pwa_install_prompt_shown"); });
  window.addEventListener("appinstalled", function(){ window.dhTrack("pwa_installed"); });
})();
