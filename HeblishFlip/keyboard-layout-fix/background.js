/**
 * Service worker: commands, stats, optional Windows keyboard switch.
 */
"use strict";

const api = typeof browser !== "undefined" ? browser : chrome;
const NATIVE_HOST = "com.heblish.layout";
const MS_PER_LETTER = 250;

api.commands.onCommand.addListener(async (command) => {
  if (command !== "fix-layout") return;

  try {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || tab.id == null) return;

    const url = tab.url || "";
    if (/^(chrome|edge|about|devtools|view-source|extension):/i.test(url)) {
      return;
    }

    try {
      await api.tabs.sendMessage(tab.id, { type: "fix-layout" });
    } catch (err) {
      try {
        await api.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: ["lib/layout-map.js", "content.js"],
        });
        await api.tabs.sendMessage(tab.id, { type: "fix-layout" });
      } catch (_) {
        /* ignore */
      }
    }
  } catch (_) {
    /* ignore */
  }
});

function recordUsage(letters) {
  const n = Math.max(0, Number(letters) || 0);
  api.storage.local.get(["usageCount", "lettersSaved", "timeSavedMs"], (data) => {
    api.storage.local.set({
      usageCount: (data.usageCount || 0) + 1,
      lettersSaved: (data.lettersSaved || 0) + n,
      timeSavedMs: (data.timeSavedMs || 0) + n * MS_PER_LETTER,
    });
  });
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return;

  if (message.type === "record-usage") {
    recordUsage(message.letters);
    sendResponse({ ok: true });
    return;
  }

  if (message.type === "switch-layout") {
    const direction = message.direction;
    if (direction !== "en2he" && direction !== "he2en") {
      sendResponse({ ok: false });
      return;
    }

    api.runtime.sendNativeMessage(NATIVE_HOST, { direction }, (response) => {
      const err = api.runtime.lastError;
      sendResponse({ ok: !err, response, error: err && err.message });
    });
    return true;
  }
});
