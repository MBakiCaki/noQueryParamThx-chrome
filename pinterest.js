(() => {
  "use strict";

  function getTarget(event, page = document) {
    const { hostname, pathname } = page.location;
    if (!(hostname === "pinterest.com" || hostname.endsWith(".pinterest.com")) ||
        !/^\/pin\/[^/]+\/?$/.test(pathname)) return null;

    const isVisit = event.composedPath().some(element => {
      if (!(element instanceof Element)) return false;
      const testId = element.getAttribute("data-test-id");
      if (testId === "main-pin-section-visit-button" || testId === "visit-button-mobile") return true;
      if (!element.matches('button, [role="button"]')) return false;
      const label = (element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim();
      return /^(visit(?: site)?|ziyaret et|siteyi ziyaret et)$/i.test(label);
    });
    if (!isVisit) return null;

    // Pinterest exposes the same pin's outbound URL separately from its JS
    // Visit button. Refuse ambiguity rather than choosing an unrelated pin.
    const targets = new Map();
    for (const link of page.querySelectorAll('a[data-test-id="clickthrough-link"][href]')) {
      try {
        const originalUrl = new URL(link.getAttribute("href"), link.baseURI).href;
        const url = CleanLink.cleanUrl(originalUrl);
        if (url) targets.set(originalUrl, { originalUrl, url });
      } catch { /* Ignore invalid URLs. */ }
    }
    return targets.size === 1 ? targets.values().next().value : null;
  }

  globalThis.CleanLinkPinterest = Object.freeze({ getTarget });
})();
