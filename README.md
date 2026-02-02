Anupam Dental Clinic — Frontend

Files:
- `index.html` — Homepage
- `assets/css/styles.css` — Custom styling
- `assets/js/scripts.js` — Simple interactivity

Additional pages:
- `services.html` — Services detail
- `appointment.html` — Appointment booking page

Backend (optional):
- `server.js` — Simple Node/Express app to forward form requests via SMTP
- `package.json` — Node dependencies
- `.env.example` — Environment variables example

How to preview
1. Open `index.html` in a browser (double-click or use Live Server extension).
2. For best appearance, ensure internet connection for Bootstrap and images.

To run the backend (Node/Express) locally
1. Ensure Node.js (>=14) is installed.
2. In the project folder, install dependencies:

```powershell
npm install
```

3. Copy `.env.example` to `.env` and fill SMTP credentials:

```powershell
copy .env.example .env
# then edit .env with your editor
```

4. Start the server:

```powershell
npm start
```

The frontend will POST to `/api/contact`, `/api/appointment` and `/api/newsletter` on the same origin. The Express server now serves the frontend static files too, so you can open `http://localhost:3000/index.html` after starting the server.

Google Forms fallback
- If you don't want a backend, you can create a Google Form and set the contact/appointment buttons to open that form (replace form action in HTML) — let me know and I can wire that quickly.

Next steps (suggested)
- Replace placeholder images with clinic photos.
- Add real contact form backend endpoint.
- Create additional pages (Services detail, FAQ, Policies).

If you want, I can:
- Wire the contact form to a simple backend (Node/PHP/Python).
- Add a clinic logo and favicon.
- Create additional pages and a mobile navigation tweak.
If you'd like, I can now:
- Configure the SMTP details and test sending emails locally.
- Replace placeholder images with your clinic photos and logo.
- Deploy a simple static + API setup (e.g., Vercel for frontend and Render/Heroku for backend).
