/**
 * Content script: Alt+; / Alt+` — fix layout, preserve newlines, switch keyboard.
 */
(function () {
  "use strict";

  if (window.__keyboardLayoutFixInstalled) return;
  window.__keyboardLayoutFixInstalled = true;

  const api = typeof browser !== "undefined" ? browser : chrome;

  function isEditableInput(el) {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName === "INPUT") {
      const type = (el.type || "text").toLowerCase();
      return ["text", "search", "url", "tel", "password", "email", "number"].includes(
        type
      );
    }
    return false;
  }

  function isContentEditable(el) {
    return !!(el && el.isContentEditable);
  }

  function getActiveEditable() {
    const active = document.activeElement;
    if (isEditableInput(active)) return { kind: "input", el: active };
    if (isContentEditable(active)) return { kind: "ce", el: active };

    let node = active;
    while (node && node.shadowRoot && node.shadowRoot.activeElement) {
      node = node.shadowRoot.activeElement;
      if (isEditableInput(node)) return { kind: "input", el: node };
      if (isContentEditable(node)) return { kind: "ce", el: node };
    }
    return null;
  }

  function convertSegment(segment) {
    if (!segment || !segment.trim()) return null;
    if (typeof LayoutMap === "undefined") return null;
    if (LayoutMap.fixLayoutPreserveLines) {
      return LayoutMap.fixLayoutPreserveLines(segment);
    }
    return LayoutMap.fixLayout ? LayoutMap.fixLayout(segment) : null;
  }

  function dispatchInput(el) {
    try {
      el.dispatchEvent(
        new InputEvent("input", { bubbles: true, inputType: "insertReplacementText" })
      );
    } catch (_) {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function requestKeyboardSwitch(direction) {
    if (direction !== "en2he" && direction !== "he2en") return;
    try {
      api.runtime.sendMessage({ type: "switch-layout", direction });
    } catch (_) {
      /* ignore */
    }
  }

  function recordUsage(letters) {
    try {
      api.runtime.sendMessage({ type: "record-usage", letters });
    } catch (_) {
      /* ignore */
    }
  }

  function fixInputLike(el) {
    const value = el.value;
    let start = el.selectionStart;
    let end = el.selectionEnd;
    if (start == null || end == null) return false;

    let replaceStart;
    let replaceEnd;
    let segment;

    if (start !== end) {
      replaceStart = start;
      replaceEnd = end;
      segment = value.slice(start, end);
    } else {
      replaceStart = 0;
      replaceEnd = value.length;
      segment = value;
    }

    const result = convertSegment(segment);
    if (!result || result.text === segment) return false;

    const newValue =
      value.slice(0, replaceStart) + result.text + value.slice(replaceEnd);
    const newCursor = replaceStart + result.text.length;

    const proto =
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, newValue);
    } else {
      el.value = newValue;
    }

    el.setSelectionRange(newCursor, newCursor);
    dispatchInput(el);
    recordUsage(segment.length);
    requestKeyboardSwitch(result.direction);
    return true;
  }

  function fixContentEditable() {
    const editable = getActiveEditable();
    if (!editable || editable.kind !== "ce") return false;

    const sel = window.getSelection();
    let segment;
    let replaceSelection = false;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      segment = sel.toString();
      replaceSelection = true;
    } else {
      segment = editable.el.innerText.replace(/\r\n/g, "\n");
    }

    const result = convertSegment(segment);
    if (!result || result.text === segment) return false;

    if (replaceSelection && sel) {
      sel.deleteFromDocument();
      sel.getRangeAt(0).insertNode(document.createTextNode(result.text));
    } else {
      editable.el.innerText = result.text;
    }

    editable.el.dispatchEvent(new Event("input", { bubbles: true }));
    recordUsage(segment.length);
    requestKeyboardSwitch(result.direction);
    return true;
  }

  function runFix() {
    const target = getActiveEditable();
    if (!target) return false;
    if (target.kind === "input") return fixInputLike(target.el);
    if (target.kind === "ce") return fixContentEditable();
    return false;
  }

  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== "fix-layout") return;
    sendResponse({ ok: runFix() });
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.altKey) return;
      if (event.ctrlKey || event.metaKey) return;

      const isSemicolon = event.key === ";" || event.code === "Semicolon";
      const isBacktick = event.key === "`" || event.code === "Backquote";
      if (!isSemicolon && !isBacktick) return;

      if (!getActiveEditable()) return;
      event.preventDefault();
      event.stopPropagation();
      runFix();
    },
    true
  );
})();
