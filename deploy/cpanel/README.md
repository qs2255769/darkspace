# PAIS - cPanel Deployment Guide

## Method 1: cPanel Node.js Selector (Recommended)

Most modern cPanel hosts (Hostinger, SiteGround, NameCheap, A2 Hosting) support Node.js via "Setup Node.js App" in cPanel.

### Step 1: Build the App
Run this on your local machine or Replit:
```bash
pnpm run build:cpanel
```
This creates a `dist-cpanel/` folder with everything needed.

### Step 2: Upload to cPanel
1. Open File Manager → `/home/yourusername/pais/`
2. Upload the contents of `dist-cpanel/`
3. Your structure should be:
```
/home/user/pais/
  server.js          ← Express backend
  package.json       ← Dependencies
  public/            ← Built React frontend (static files)
  .env               ← Your environment variables
```

### Step 3: Create Node.js App in cPanel
1. Go to **Setup Node.js App** in cPanel
2. Click **+ Create Application**
3. Settings:
   - **Node.js version**: 18.x or 20.x
   - **Application mode**: Production
   - **Application root**: `/home/user/pais`
   - **Application URL**: `yourdomain.com` (or a subdomain)
   - **Application startup file**: `server.js`
4. Click **Create**
5. Click **Run NPM Install** to install dependencies

### Step 4: Set Environment Variables
In the Node.js App settings, add these variables:
```
DATABASE_URL=mysql://user:password@localhost/pais_db
GOOGLE_API=your_gemini_api_key_here
NODE_ENV=production
PORT=3000
```

### Step 5: MySQL Database
Since cPanel uses MySQL (not PostgreSQL), create a database:
1. Go to **MySQL Databases** in cPanel
2. Create database: `pais_db`
3. Create user and assign all privileges
4. Run the SQL in `deploy/cpanel/schema.sql`
5. Run the seed data in `deploy/cpanel/seed.sql`

### Step 6: SSL + .htaccess
Upload `deploy/cpanel/.htaccess` to your public_html or app root.

---

## Method 2: PHP Proxy (Shared Hosting without Node.js)

If your cPanel host does NOT support Node.js, use the PHP reverse proxy approach:

1. Upload `deploy/cpanel/proxy.php` to `/public_html/`
2. Set up a VPS/cloud server (DigitalOcean $6/mo droplet) running the Node.js app
3. The PHP file proxies requests to your VPS
4. This way the frontend appears on your shared host, backend runs on VPS

---

## Method 3: Static Export Only (Cheapest)

If you only want the frontend on cPanel and use Replit for the API:

1. Build the React app: `pnpm --filter @workspace/pakistan-accountability run build`
2. Upload `artifacts/pakistan-accountability/dist/` to `public_html/`
3. Set `VITE_API_URL=https://your-replit-app.replit.app` in the frontend build

---

## Cron Jobs for Automated Scraping

In cPanel → Cron Jobs, add:
```bash
# Run scrapers every day at 2 AM
0 2 * * * cd /home/user/pais && node cron-scraper.js >> /home/user/logs/scraper.log 2>&1
```

## API Key Rotation (Multiple Keys)

Edit `server.js` to use key rotation:
```javascript
const API_KEYS = [
  process.env.GOOGLE_API,
  process.env.GOOGLE_API_2,
  process.env.GOOGLE_API_3,
];
let keyIndex = 0;
function getNextKey() {
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return API_KEYS[keyIndex];
}
```
