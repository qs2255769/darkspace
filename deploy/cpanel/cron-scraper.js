#!/usr/bin/env node
// PAIS Automated Scraper Cron Script
// Place in /home/user/pais/ and run via cPanel Cron Jobs:
// 0 2 * * * node /home/user/pais/cron-scraper.js

import("node-fetch").then(async ({ default: fetch }) => {
  const BASE = process.env.APP_URL || "http://localhost:3000";
  const targets = ["openparliament_na", "sindh", "kpk", "senate", "punjab"];

  console.log(`[${new Date().toISOString()}] PAIS Cron Scraper starting...`);

  for (const target of targets) {
    try {
      const res = await fetch(`${BASE}/api/scraper/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      console.log(`[${target}] Started:`, data.message);
      await new Promise(r => setTimeout(r, 10000)); // Wait 10s between targets
    } catch (err) {
      console.error(`[${target}] Error:`, err.message);
    }
  }

  console.log(`[${new Date().toISOString()}] Cron complete.`);
}).catch(err => console.error("Fatal:", err));
