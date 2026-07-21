/**
 * QWERTY ↔ Hebrew-Standard layout mapping and auto direction detection.
 */
(function (global) {
  "use strict";

  const EN2HE = {
    q: "/",
    w: "'",
    e: "ק",
    r: "ר",
    t: "א",
    y: "ט",
    u: "ו",
    i: "ן",
    o: "ם",
    p: "פ",
    a: "ש",
    s: "ד",
    d: "ג",
    f: "כ",
    g: "ע",
    h: "י",
    j: "ח",
    k: "ל",
    l: "ך",
    ";": "ף",
    "'": ",",
    z: "ז",
    x: "ס",
    c: "ב",
    v: "ה",
    b: "נ",
    n: "מ",
    m: "צ",
    ",": "ת",
    ".": "ץ",
    "/": ".",
  };

  const HE2EN = {};
  for (const [en, he] of Object.entries(EN2HE)) {
    HE2EN[he] = en;
  }

  const FINAL_HE = new Set(["ם", "ן", "ך", "ף", "ץ"]);
  const HEBREW_RE = /[\u0590-\u05FF]/;
  const LATIN_RE = /[A-Za-z]/;

  function mapChars(text, direction) {
    const table = direction === "en2he" ? EN2HE : HE2EN;
    let out = "";
    for (const ch of text) {
      if (direction === "en2he") {
        const lower = ch.toLowerCase();
        out += Object.prototype.hasOwnProperty.call(table, lower) ? table[lower] : ch;
      } else {
        out += Object.prototype.hasOwnProperty.call(table, ch) ? table[ch] : ch;
      }
    }
    return out;
  }

  function splitKeepingSep(text) {
    return text.split(/(\s+)/);
  }

  function countScript(text) {
    let latin = 0;
    let hebrew = 0;
    for (const ch of text) {
      if (LATIN_RE.test(ch)) latin += 1;
      else if (HEBREW_RE.test(ch)) hebrew += 1;
    }
    return { latin, hebrew };
  }

  function inferDirection(before, after) {
    const b = countScript(before);
    const a = countScript(after);
    if (a.hebrew > b.hebrew && a.latin < b.latin) return "en2he";
    if (a.latin > b.latin && a.hebrew < b.hebrew) return "he2en";
    if (b.hebrew > b.latin) return "he2en";
    if (b.latin > b.hebrew) return "en2he";
    return null;
  }

  function hasFinalInMiddle(word) {
    const letters = [...word].filter((ch) => HEBREW_RE.test(ch));
    for (let i = 0; i < letters.length - 1; i++) {
      if (FINAL_HE.has(letters[i])) return true;
    }
    return false;
  }

  function hebrewLooksBroken(text) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    let broken = 0;
    for (const w of words) {
      if (hasFinalInMiddle(w)) broken += 1;
    }
    return broken / words.length >= 0.3;
  }

  function latinLooksBroken(text) {
    if (/[A-Za-z][,.;/'`][A-Za-z]|[,.;/'`][A-Za-z]|[A-Za-z][,.;/'`]/.test(text)) {
      return true;
    }
    const tokens = text.split(/\s+/).filter((t) => /[A-Za-z]{2,}/.test(t));
    if (tokens.length === 0) return false;
    const common =
      /^(the|and|for|you|are|is|to|of|in|on|it|my|me|we|he|she|ok|hi|hey|yes|no|this|that|with|from|have|has|was|were|be|not|but|or|at|as|an|if|so|do|did|can|will|just|like|what|when|how|why|who|all|one|two|get|got|out|up|new|now|if|also|understand)$/i;
    let hits = 0;
    for (const t of tokens) {
      const core = t.replace(/[^A-Za-z]/g, "");
      if (common.test(core)) hits += 1;
    }
    return hits / tokens.length < 0.35;
  }

  function fixLayout(text) {
    if (!text || !/[A-Za-z\u0590-\u05FF]/.test(text)) return null;

    const { latin, hebrew } = countScript(text);
    const en2he = mapChars(text, "en2he");
    const he2en = mapChars(text, "he2en");

    if (latin > 0 && hebrew === 0) {
      if (en2he !== text) return { text: en2he, direction: "en2he" };
      return null;
    }
    if (hebrew > 0 && latin === 0) {
      if (he2en !== text) return { text: he2en, direction: "he2en" };
      return null;
    }

    const enScore =
      (latinLooksBroken(text) ? 2 : 0) +
      (hebrewLooksBroken(en2he) ? -2 : 1) +
      (en2he !== text ? 1 : -5);
    const heScore =
      (hebrewLooksBroken(text) ? 2 : 0) +
      (latinLooksBroken(he2en) ? -2 : 1) +
      (he2en !== text ? 1 : -5);

    if (enScore >= heScore && enScore > 0 && en2he !== text) {
      return { text: en2he, direction: "en2he" };
    }
    if (heScore > 0 && he2en !== text) {
      return { text: he2en, direction: "he2en" };
    }
    return fixLayoutMixed(text);
  }

  function fixLayoutMixed(text) {
    if (!text) return null;
    const parts = splitKeepingSep(text);
    let changed = false;
    const out = parts.map((part) => {
      if (!part.trim() || /^\s+$/.test(part)) return part;
      if (/^[\d./:+\-@]+$/.test(part)) return part;

      const { latin, hebrew } = countScript(part);
      if (latin > 0 && hebrew === 0) {
        const core = part.replace(/[^A-Za-z]/g, "");
        if (
          /^(the|and|for|you|are|is|to|of|in|on|it|http|https|www|com|gmail|if|also)$/i.test(
            core
          )
        ) {
          return part;
        }
        changed = true;
        return mapChars(part, "en2he");
      }
      if (hebrew > 0 && latin === 0 && (hasFinalInMiddle(part) || part.length >= 3)) {
        changed = true;
        return mapChars(part, "he2en");
      }
      return part;
    });

    if (!changed) return null;
    const resultText = out.join("");
    const direction = inferDirection(text, resultText) || "mixed";
    return { text: resultText, direction };
  }

  /** Hebrew line that is really English typed on Hebrew layout? */
  function shouldConvertHebrewLine(line) {
    if (hebrewLooksBroken(line)) return true;
    const he2en = mapChars(line, "he2en");
    if (he2en === line) return false;
    // Valid Hebrew → Latin is gibberish; wrong layout → plausible Latin
    return !latinLooksBroken(he2en) && /[aeiouAEIOU]/.test(he2en);
  }

  /** Convert one line; skip lines that already look correct. */
  function fixSingleLine(line) {
    if (!line.trim()) return { text: line, changed: false, direction: null };

    const { latin, hebrew } = countScript(line);

    if (latin > 0 && hebrew === 0) {
      if (!latinLooksBroken(line)) return { text: line, changed: false, direction: null };
      const text = mapChars(line, "en2he");
      return {
        text,
        changed: text !== line,
        direction: "en2he",
      };
    }

    if (hebrew > 0 && latin === 0) {
      if (!shouldConvertHebrewLine(line)) {
        return { text: line, changed: false, direction: null };
      }
      const text = mapChars(line, "he2en");
      return {
        text,
        changed: text !== line,
        direction: "he2en",
      };
    }

    const mixed = fixLayoutMixed(line);
    if (mixed) {
      return { text: mixed.text, changed: true, direction: mixed.direction };
    }
    return { text: line, changed: false, direction: null };
  }

  /**
   * Convert text line-by-line, preserving \\n between lines.
   * Correct English lines stay untouched; wrong lines convert.
   */
  function fixLayoutPreserveLines(text) {
    if (!text || !/[A-Za-z\u0590-\u05FF]/.test(text)) return null;

    const lines = text.split("\n");
    let anyChanged = false;
    let lastDirection = null;

    const out = lines.map((line) => {
      const r = fixSingleLine(line);
      if (r.changed) {
        anyChanged = true;
        if (r.direction === "en2he" || r.direction === "he2en") {
          lastDirection = r.direction;
        }
      }
      return r.text;
    });

    if (!anyChanged) return null;
    return { text: out.join("\n"), direction: lastDirection };
  }

  global.LayoutMap = {
    EN2HE,
    HE2EN,
    mapChars,
    fixLayout,
    fixLayoutMixed,
    fixLayoutPreserveLines,
    fixSingleLine,
    inferDirection,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
