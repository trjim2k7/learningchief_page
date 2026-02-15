# learningchief_page

Local mirrored snapshot of https://learningchief.com created with `wget`.

## What was recreated
- Public HTML pages and routes
- CSS/JS assets
- Images/fonts/media files
- Linked PDFs and related resources
- Basic internal link rewriting for offline navigation

## Local preview
From this folder:

```bash
cd /home/hugo/.openclaw/workspace/learningchief_page/learningchief.com
python3 -m http.server 8080
```

Then open:
- http://localhost:8080/

## Notes
- This is a static mirror, not the WordPress backend.
- Dynamic functions (logins, checkout, forms, live APIs) won’t function fully offline.
