# Publishing HeblishFlip (Edge, Firefox, Chrome)

## Before you upload

1. Replace `YOUR_USERNAME` in `popup.js` with your Buy Me a Coffee URL.
2. Create a **zip** of the extension folder **without**:
   - `native/` (optional helper — host separately on GitHub later)
   - `setup-keyboard.bat`
   - `scripts/`
   - `.git/`
   - `PUBLISHING.md`, `STORE_LISTING.md`, `test-page.html`
3. Include: `manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, `lib/`, `icons/`, `privacy.md`, `README.md`

Or zip everything except `.git` — stores allow extra files; they are ignored at runtime.

## Edge Add-ons (free)

1. Register: https://partner.microsoft.com/dashboard/microsoftedge/
2. **New extension** → upload zip
3. Copy text from `STORE_LISTING.md`
4. Add screenshots (1280×800 or 640×400): popup, before/after fix in a text field
5. Privacy policy URL: host `privacy.md` on GitHub Pages or paste into store form
6. Submit for review (usually a few days)

**Updates:** upload new zip with higher `version` in manifest.json → users auto-update.

## Firefox AMO (free)

1. Register: https://addons.mozilla.org/developers/
2. **Submit a New Add-on** → upload zip (select `manifest.json`)
3. Same listing text; note shortcuts Alt+; and Alt+`
4. Review can take 1–7 days

**Note:** `browser_specific_settings.gecko.id` is already in manifest.

## Chrome Web Store (~$5 one-time)

1. Pay developer fee: https://chrome.google.com/webstore/devconsole
2. **New item** → upload same zip
3. Same listing + privacy justification for `host_permissions` and `scripting`:
   - "Required to read and replace text in the focused input field when the user presses the keyboard shortcut."
4. Review ~1–3 days

## Buy Me a Coffee on store pages

Add to **detailed description** (all stores):

```
☕ Enjoying HeblishFlip? Support development (optional):
https://buymeacoffee.com/YOUR_USERNAME
```

The extension popup also links to the same URL.

## Optional keyboard helper (later)

Do **not** block store approval on this. After launch, if `setup-keyboard.bat` is simple enough:

- Upload zip to GitHub Releases
- Add link in store description: "Optional Windows keyboard auto-switch"

## Version bumps

Every release: increment `"version"` in `manifest.json` (e.g. 1.3.0 → 1.3.1).
