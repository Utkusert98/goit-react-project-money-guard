# Dağıtım Talimatları

## Frontend (Vite) → GitHub Pages
1. `npm i -D gh-pages`
2. `package.json` içine:
   ```json
   {
     "homepage": "https://<kullanici>.github.io/<repo>",
     "scripts": {
       "predeploy": "vite build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
3. Vite `base` ayarı (gerekiyorsa): `vite.config.js` içine `base: "/<repo>/"`.
4. `npm run deploy`

## Backend (Render/alternatif)
- Bu projede backend bulunmuyor. Express tabanlı bir backend eklediğinizde:
  - `/api/docs` altında Swagger UI yayınlayın.
  - Render.com üzerinde yeni bir web service oluşturun, `npm start` ile başlatın.
  - CORS ayarlarını frontend domainine izin verecek şekilde yapın.
