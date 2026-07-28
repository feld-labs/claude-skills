# Brand tokens

Fill these once per product, then find-and-replace across the templates in this folder. That is the
whole "spin up a product's email fast" trick: the markup is already email-safe, you only supply brand.

| Token | What it is | MySheetAI example |
|---|---|---|
| `{{BRAND_NAME}}` | Plain product name | `MySheetAI` |
| `{{BRAND_WORDMARK_HTML}}` | The name as styled inline HTML (accent on part of it) | `MySheet<span style="color:#15803d;">AI</span>` |
| `{{BRAND_ACCENT}}` | One hex: the CTA button + accent color | `#15803d` |
| `{{BRAND_ACCENT_BG}}` | A pale tint of the accent for header/eyebrow bars | `#f0fdf4` |
| `{{BRAND_ACCENT_BORDER}}` | A slightly deeper tint for the bar's bottom border | `#dcfce7` |
| `{{APP_URL}}` | Product URL, no trailing slash | `https://mysheetai.com` |
| `{{FOOTER_IDENTITY}}` | The human signoff / from-line | `Brian at MySheetAI` |
| `{{SENDER_TAGLINE}}` | One-line descriptor for the transactional footer | `the right answer from your spreadsheet, faster` |
| `{{PREHEADER}}` | The inbox snippet, set PER SEND | `Your one-time sign-in link, expires in about an hour` |

Notes:
- Keep the neutral palette in the templates as-is (`#0f172a` ink, `#475569`/`#94a3b8` muted, `#f6f8f7`
  page, `#e9edeb`/`#eef2f0` hairlines). It reads clean under almost any accent. Only swap the accent
  trio (`ACCENT`, `ACCENT_BG`, `ACCENT_BORDER`) unless the brand demands a different neutral.
- The font stack is fixed on purpose (system stack, no web font). Do not tokenize it.
- For a two-tone accent brand, `BRAND_WORDMARK_HTML` is where that lives; the button stays one color.

## Preheader (do not skip)

Every template has a hidden preheader span right after `<body>`/the first wrapper. It is the text the
inbox shows next to the subject line. Set `{{PREHEADER}}` per send to something that earns the open;
never leave it empty (the client will grab a raw URL or "View in browser" instead).

The hidden-preheader pattern (already in the templates):

```html
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{{PREHEADER}}</span>
```
