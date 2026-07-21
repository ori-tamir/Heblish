# Keyboard Layout Fix (Hebrew ↔ English)

תוסף לדפדפן שממיר טקסט שנכתב במקלדת הפוכה.

**קיצורים (שניהם עושים אותו דבר):**
- **Alt+;** — נוח כשהמקלדת על **עברית**
- **Alt+`** — נוח כשהמקלדת על **אנגלית**

- אם יש טקסט מסומן — ממיר את הסימון
- **אחרת — ממיר את כל תיבת הטקסט**, שורה-שורה (שורות תקינות נשארות, עקומות מתוקנות)
- **Enter / מעבר שורה נשמר** — כל שורה מטופלת בנפרד ומחוברת מחדש עם `\n`

**דוגמה:**
```
hello my name is ori
ן שצ ש דאוגקמא
```
↓
```
hello my name is ori
i am a student
```

- אחרי המרה — מנסה להעביר את **שפת המקלדת ב־Windows** לשפה שאליה המרנו (ראה למטה)

עובד בשדות `<input>`, `<textarea>`, ו־`contenteditable` פשוטים.

## התקנה מקומית ב־Edge (לבדיקה מיידית)

1. פתח `edge://extensions`
2. הפעל **Developer mode** (מצב מפתחים)
3. לחץ **Load unpacked** / טען לא ארוז
4. בחר את התיקייה:
   `C:\Users\tamir\OneDrive\פרויקטים\HeblishFlip\keyboard-layout-fix`
5. פתח אתר כלשהו (למשל Google), לחץ בשדה טקסט
6. הקלד למשל: `akuo eurtho kh turh`
7. לחץ **Alt+;** (מקלדת עברית) או **Alt+`** (מקלדת אנגלית)

### דף בדיקה מקומי

פתח בקובץ (File → Open) את [`test-page.html`](test-page.html) אחרי טעינת התוסף, או הגש אותו דרך שרת מקומי פשוט.  
הערה: בדפים מסוג `file://` חלק מהדפדפנים דורשים הרשאה נוספת — העדף `http://localhost` או אתר רגיל.

## התקנה מקומית ב־Firefox

1. פתח `about:debugging#/runtime/this-firefox`
2. לחץ **Load Temporary Add-on…**
3. בחר את הקובץ `manifest.json` מתוך תיקיית הפרויקט
4. בדוק כמו ב־Edge (Alt+; או Alt+`)

הערה: תוסף זמני ב־Firefox נמחק אחרי סגירת הדפדפן. לשימוש קבוע — העלאה ל־AMO.

## החלפת שפת מקלדת — למה לא Alt+Shift מהתוסף?

תוסף דפדפן **לא יכול** ללחוץ Alt+Shift במקלדת של Windows — הדפדפן חוסם "לחיצות מזויפות" מסיבות אבטחה, ושפת המקלדת שייכת ל-Windows, לא לדף.

**אין דרך** ללoop Alt+Shift "עד שזה נכון" מתוך JavaScript — גם אין API לדעת באיזו שפה המקלדת עכשיו.

**הפתרון הפשוט ביותר (פעם אחת, ~30 שניות):**

1. לחץ פעמיים על **`setup-keyboard.bat`** בתיקיית הפרויקט
2. הדבק את Extension ID מ־`edge://extensions`
3. Reload לתוסף

זה מתקין רכיב זעיר שמחליף ישירות לעברית/אנגלית — בלי Alt+Shift, בלי לoop.

## מבנה

```text
manifest.json
background.js
content.js
lib/layout-map.js
icons/
native/          ← החלפת שפת מקלדת ב־Windows
privacy.md
test-page.html
```

## פרסום לחנויות (אחרי שה־MVP יציב)

ראה [`privacy.md`](privacy.md). ארוז zip של התיקייה (בלי `.git` / סקריפטים מיותרים) והעלה ל:

- **Edge Add-ons** — חינם: https://partner.microsoft.com/dashboard/microsoftedge/
- **Firefox AMO** — חינם: https://addons.mozilla.org/developers/

Chrome Web Store אפשרי מאותו קוד (~$5 חד־פעמי) — לא חובה לסיבוב הראשון.

## פתרון בעיות

| בעיה | מה לנסות |
|---|---|
| Alt+; / Alt+` לא עושים כלום | ודא שהסמן בתוך שדה טקסט; רענן את הדף אחרי Reload |
| המרה עובדת אבל המקלדת לא מתחלפת | הרץ `setup-keyboard.bat` פעם אחת |
| Enter נעלם בין שורות | עודכן ב־1.2 — שורות נשמרות; רק שורות עקומות מתוקנות |
| קיצור תפוס | `edge://extensions/shortcuts` — שייך ידנית ל־fix-layout |
| לא עובד ב־Docs/Notion | מוגבל ב־MVP; שדות רגילים נתמכים |
| Firefox | טען דרך `manifest.json`; ודא גרסת Firefox ≥ 109 |
