# Store listing copy (English) — paste into Edge / Firefox / Chrome

## Name

**Heblish**

## Short description (132 chars max for Chrome)

Fix text typed with the wrong Hebrew/English keyboard. Alt+; or Alt+` in any text field. Tracks time saved. Free.

## Full description

**Typed on the wrong keyboard? Fix it in one shortcut.**

Heblish converts text you typed with the wrong layout (Hebrew ↔ English) inside any web text field — Gmail, WhatsApp Web, Google, chat apps, forms, and more.

**How to use**
1. Click in a text field
2. Press **Alt + ;** (when your keyboard is on Hebrew) **or** **Alt + `** (when on English)
3. Wrong text becomes what you meant — whole field converts, line breaks preserved

**Examples**
- `akuo eurtho kh turh` → `שלום קוראים לי אורי`
- Hebrew gibberish meant as English → readable English
- Mixed fields: correct lines stay, wrong lines fix

**Features**
- Works on `<input>`, `<textarea>`, and simple rich-text fields
- Selection → converts only the selection
- No account, no cloud — everything runs locally in your browser
- Popup shows **your stats**: uses, letters not retyped, estimated time saved (stored only on your device)

**After fixing text:** if your keyboard language is still wrong, press **Alt+Shift** or **Win+Space** once (Windows).

**Privacy:** We do not collect, store, or transmit your text. See privacy policy.

---

☕ **Support development (optional):**  
https://buymeacoffee.com/YOUR_USERNAME

If this extension saves you time every day, a coffee helps keep it maintained and updated.

---

Made for Hebrew/English bilingual typing on Windows. Feedback welcome via store reviews.

## Category

Productivity / Utilities

## Keywords (where supported)

hebrew, english, keyboard, layout, RTL, bilingual, typo, fix, QWERTY, Hebrew keyboard

## Single purpose (Chrome)

This extension has a single purpose: convert text in web input fields that was typed with the wrong Hebrew or English keyboard layout when the user invokes a keyboard shortcut.

## Permission justifications (Chrome)

| Permission | Why |
|---|---|
| host_permissions http/https | Inject converter only when user uses shortcut in a page text field |
| scripting | Re-inject content script if tab loaded before install |
| storage | Local usage stats only (uses, letters saved, time estimate) |
| nativeMessaging | Optional Windows keyboard helper (advanced, separate setup) |

## Screenshot ideas

1. Popup showing shortcuts + support link
2. Google search box: before `akuo` / after Hebrew
3. Textarea with two lines: English line kept, second line fixed
