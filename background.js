"use strict";
importScripts("cleaner.js");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "OPEN_CLEAN_LINK") return;
  const url = CleanLink.cleanUrl(message.url);
  if (sender.id !== chrome.runtime.id || !Number.isInteger(sender.tab?.id) || !url) {
    sendResponse({ ok: false });
    return;
  }

  chrome.tabs.create({
    url,
    active: false,
    windowId: sender.tab.windowId,
    openerTabId: sender.tab.id,
    index: sender.tab.index + 1
  }).then(() => sendResponse({ ok: true }), () => sendResponse({ ok: false }));
  return true;
});
