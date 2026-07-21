"use strict";

const api = typeof browser !== "undefined" ? browser : chrome;

// Replace with your Buy Me a Coffee URL:
const BMC_URL = "https://buymeacoffee.com/YOUR_USERNAME";

document.getElementById("bmc").href = BMC_URL;

function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms / 1000) || 0} sec`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec} sec`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min < 60) return rem ? `${min} min ${rem} sec` : `${min} min`;
  const hr = Math.floor(min / 60);
  const rm = min % 60;
  return rm ? `${hr} hr ${rm} min` : `${hr} hr`;
}

function formatNumber(n) {
  return n.toLocaleString();
}

api.storage.local.get(["usageCount", "lettersSaved", "timeSavedMs"], (data) => {
  const uses = data.usageCount || 0;
  const letters = data.lettersSaved || 0;
  const timeMs = data.timeSavedMs || 0;

  document.getElementById("uses").textContent = formatNumber(uses);
  document.getElementById("letters").textContent = formatNumber(letters);
  document.getElementById("time").textContent = formatTime(timeMs);

  if (uses === 0) {
    document.getElementById("stat-note").textContent =
      "Use Alt+; or Alt+` in a text field — stats appear here.";
  }
});
