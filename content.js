(() => {
  "use strict";

  if (globalThis.__cleanLinkInstalled) return;
  globalThis.__cleanLinkInstalled = true;
  let gesture = null;
  let lastAction = null;

  function getTarget(event) {
    for (const element of event.composedPath()) {
      if (!(element instanceof Element) || !element.matches("a[href], area[href]")) continue;
      const originalUrl = new URL(element.getAttribute("href"), element.baseURI).href;
      const url = CleanLink.cleanUrl(originalUrl);
      return url ? { originalUrl, url } : null;
    }
    return CleanLinkPinterest.getTarget(event);
  }

  function showNotice(text, failure = false) {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "closed" });
    const notice = document.createElement("div");
    notice.textContent = text;
    notice.setAttribute("role", failure ? "alert" : "status");
    Object.assign(host.style, {
      position: "fixed", bottom: "20px", right: "20px", zIndex: "2147483647"
    });
    Object.assign(notice.style, {
      maxWidth: "380px", padding: "14px 18px", borderRadius: "12px",
      background: failure ? "#70331e" : "#183e32", color: "#fff",
      font: "14px/1.5 system-ui", boxShadow: "0 4px 24px #0003"
    });
    shadow.append(notice);
    (document.body || document.documentElement).append(host);
    setTimeout(() => host.remove(), failure ? 7000 : 1800);
  }

  function open(target) {
    const action = { ...target, status: "opening" };
    lastAction = action;
    try {
      chrome.runtime.sendMessage({ type: "OPEN_CLEAN_LINK", url: target.url }, (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          action.status = "failed";
          showNotice("Temiz Bağlantı: sekme açılamadı. Sayfayı yenileyip tekrar deneyin.", true);
          return;
        }
        action.status = "opened";
        showNotice("Temiz Bağlantı ile açıldı · query silindi");
      });
    } catch {
      action.status = "failed";
      showNotice("Temiz Bağlantı bağlantısı kesildi. Sayfayı yenileyip tekrar deneyin.", true);
    }
  }

  function suppress(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function handle(event) {
    if (!chrome.runtime?.id || !event.isTrusted || event.button !== 1) return;
    const now = Date.now();
    // Capture the URL before page handlers can replace the anchor or its href.
    if (event.type === "pointerdown" || event.type === "mousedown") {
      if (event.type === "mousedown" && gesture?.pointer && now - gesture.time < 1000) {
        suppress(event);
        return;
      }
      gesture = null;
      if (!event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
      let target;
      try { target = getTarget(event); } catch { return; }
      if (!target) return;
      gesture = { time: now, pointer: event.type === "pointerdown" };
      suppress(event);
      open(target);
      return;
    }
    // Suppress release events even when Ctrl was released or the DOM changed.
    if (gesture && now - gesture.time < 30000) {
      suppress(event);
      if (event.type === "auxclick") gesture = null;
    }
  }

  for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "auxclick"]) {
    window.addEventListener(type, handle, { capture: true, passive: false });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "CLEAN_LINK_STATUS") return;
    sendResponse({ ready: true, version: chrome.runtime.getManifest().version, lastAction });
  });
})();
