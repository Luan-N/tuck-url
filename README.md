# Tuck URL

A Chrome extension for shortening URLs with custom handles, expiration dates, and smart caching. Powered by Cloudflare Workers + D1.

Published Chrome Extension: https://chromewebstore.google.com/detail/tuck-url/dnjdbbpkjlnnpbkhhgkpgkdnkbgfhlbo

Privacy Policy: https://luan-n.github.io//tuck-url/privacy.html
## Features

✨ Auto-loads current tab URL  
🔗 Optional custom short links  
⏰ Expiration options (1h to 1y)  
💾 Smart session caching  
📋 One-click copy  

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3), Tailwind CSS
- **Backend**: TypeScript, Cloudflare Workers, D1 SQLite
- **Error Handling**: Duplicate prevention, expiration validation

## Deploy

```bash
cd backend
npm run deploy
```

## Load Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Update `API_BASE_URL` in `popup.js` to your Cloudflare Workers URL

