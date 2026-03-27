import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { db } from "@workspace/db";
import { scrapedMembersTable, scraperLogsTable, toshakhanaTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router = Router();

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

async function logScrape(agent: string, url: string, records: number, status: string, error: string, ms: number) {
  try {
    await db.insert(scraperLogsTable).values({ agentName: agent, targetUrl: url, recordsFound: records, status, errorMessage: error, durationMs: ms });
  } catch {}
}

// --- AGENT ALPHA: National Assembly scraper ---
async function scrapeNationalAssembly(): Promise<any[]> {
  const url = "https://na.gov.pk/en/all_members.php";
  const start = Date.now();
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const members: any[] = [];

    $("table tbody tr, .member-row, .members-table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 3) {
        const name = $(cells[0]).text().trim() || $(cells[1]).text().trim();
        const constituency = $(cells[1]).text().trim() || $(cells[2]).text().trim();
        const party = $(cells[2]).text().trim() || $(cells[3]).text().trim();
        if (name && name.length > 3) {
          members.push({ name, constituency, party, assembly: "National Assembly", province: "Federal" });
        }
      }
    });

    // Fallback: parse any list items
    if (members.length === 0) {
      $(".member-name, .mna-name, [class*='member']").each((_, el) => {
        const name = $(el).text().trim();
        if (name && name.length > 3 && name.length < 60) {
          members.push({ name, constituency: "", party: "", assembly: "National Assembly", province: "Federal" });
        }
      });
    }

    await logScrape("Agent Alpha (NA)", url, members.length, "success", "", Date.now() - start);
    return members;
  } catch (err: any) {
    await logScrape("Agent Alpha (NA)", url, 0, "failed", err?.message || "Unknown error", Date.now() - start);
    return [];
  }
}

// --- AGENT ALPHA: Punjab Assembly (PAP) by district ---
async function scrapePunjabAssembly(districtIds: number[] = [110, 111, 122, 130]): Promise<any[]> {
  const members: any[] = [];
  for (const distId of districtIds) {
    const url = `https://www.pap.gov.pk/members/listing/en/21/?bydistrict=${distId}`;
    const start = Date.now();
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      const $ = cheerio.load(data);
      $("table tr, .member-card, .member-list li").each((_, el) => {
        const name = $(el).find("a, .name, td:first-child").first().text().trim();
        const constituency = $(el).find(".constituency, td:nth-child(2)").first().text().trim();
        const party = $(el).find(".party, td:nth-child(3)").first().text().trim();
        const profileUrl = $(el).find("a").first().attr("href") || "";
        if (name && name.length > 3 && name.length < 80) {
          members.push({ name, constituency, party, assembly: "Punjab Assembly", province: "Punjab", district: `District ${distId}`, profileUrl });
        }
      });
      await logScrape("Agent Alpha (PAP)", url, members.length, "success", "", Date.now() - start);
    } catch (err: any) {
      await logScrape("Agent Alpha (PAP)", url, 0, "failed", err?.message || "Blocked", Date.now() - start);
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return members;
}

// --- AGENT ALPHA: OpenParliament.pk ---
async function scrapeOpenParliament(path: string, assembly: string, province: string): Promise<any[]> {
  const url = `https://openparliament.pk/${path}`;
  const start = Date.now();
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const members: any[] = [];

    $("table tbody tr, .mp-card, .member-item, [class*='mp-row']").each((_, el) => {
      const name = $(el).find("a, .name, td:first-child").first().text().trim().replace(/\s+/g, " ");
      const constituency = $(el).find(".constituency, td:nth-child(2)").first().text().trim();
      const party = $(el).find(".party, td:nth-child(3), .badge").first().text().trim();
      const profileUrl = $(el).find("a").first().attr("href") || "";
      if (name && name.length > 3 && name.length < 80) {
        members.push({ name, constituency, party, assembly, province, profileUrl: profileUrl.startsWith("http") ? profileUrl : `https://openparliament.pk${profileUrl}` });
      }
    });

    await logScrape(`Agent Alpha (${assembly})`, url, members.length, "success", "", Date.now() - start);
    return members;
  } catch (err: any) {
    await logScrape(`Agent Alpha (${assembly})`, url, 0, "failed", err?.message || "Blocked", Date.now() - start);
    return [];
  }
}

// --- SAVE to DB ---
async function saveMembersToDb(members: any[]) {
  if (members.length === 0) return 0;
  const rows = members.map(m => ({
    name: m.name || "Unknown",
    assembly: m.assembly || "Unknown",
    constituency: m.constituency || "",
    party: m.party || "",
    province: m.province || "",
    district: m.district || "",
    profileUrl: m.profileUrl || "",
    imageUrl: m.imageUrl || "",
    status: "Active",
    rawJson: JSON.stringify(m),
  }));
  await db.insert(scrapedMembersTable).values(rows);
  return rows.length;
}

// --- API Routes ---

// Get all scraper logs
router.get("/scraper/logs", async (_req, res) => {
  const logs = await db.select().from(scraperLogsTable).orderBy(desc(scraperLogsTable.runAt)).limit(50);
  res.json(logs);
});

// Get scraped members
router.get("/scraper/members", async (req, res) => {
  const { assembly, party, search } = req.query;
  let rows = await db.select().from(scrapedMembersTable).orderBy(desc(scrapedMembersTable.scrapedAt));
  if (assembly) rows = rows.filter(r => r.assembly === assembly);
  if (party) rows = rows.filter(r => r.party.toLowerCase().includes((party as string).toLowerCase()));
  if (search) rows = rows.filter(r => r.name.toLowerCase().includes((search as string).toLowerCase()));
  res.json(rows);
});

// Trigger scraper run
router.post("/scraper/run", async (req, res) => {
  const { target = "all" } = req.body as { target?: string };
  res.json({ message: "Scraper started", target, startedAt: new Date().toISOString() });

  // Run async after response
  (async () => {
    try {
      let allMembers: any[] = [];

      if (target === "all" || target === "na") {
        const na = await scrapeNationalAssembly();
        allMembers = [...allMembers, ...na];
      }
      if (target === "all" || target === "punjab") {
        const punjab = await scrapePunjabAssembly([110, 111, 122, 130, 100, 105, 115]);
        allMembers = [...allMembers, ...punjab];
      }
      if (target === "all" || target === "openparliament_na") {
        const opNA = await scrapeOpenParliament("mps-national/", "National Assembly", "Federal");
        allMembers = [...allMembers, ...opNA];
      }
      if (target === "all" || target === "sindh") {
        const sindh = await scrapeOpenParliament("mps-sindh/", "Sindh Assembly", "Sindh");
        allMembers = [...allMembers, ...sindh];
      }
      if (target === "all" || target === "kpk") {
        const kpk = await scrapeOpenParliament("mps-khyber-pakhtunkhwa/", "KPK Assembly", "KPK");
        allMembers = [...allMembers, ...kpk];
      }
      if (target === "all" || target === "senate") {
        const senate = await scrapeOpenParliament("mps-senate/", "Senate", "Federal");
        allMembers = [...allMembers, ...senate];
      }

      const saved = await saveMembersToDb(allMembers);
      console.log(`Scraper run complete: ${saved} records saved`);
    } catch (err) {
      console.error("Scraper error:", err);
    }
  })();
});

// Toshakhana endpoints
router.get("/toshakhana", async (req, res) => {
  const { year, name } = req.query;
  let rows = await db.select().from(toshakhanaTable).orderBy(desc(toshakhanaTable.year));
  if (year) rows = rows.filter(r => r.year === parseInt(year as string));
  if (name) rows = rows.filter(r => r.recipientName.toLowerCase().includes((name as string).toLowerCase()));
  res.json(rows);
});

router.get("/toshakhana/stats", async (_req, res) => {
  const rows = await db.select().from(toshakhanaTable);
  const total = rows.length;
  const totalValue = rows.reduce((s, r) => s + r.estimatedValuePkr, 0);
  const retained = rows.filter(r => r.retained === "Yes").length;
  const byYear = rows.reduce((acc: Record<number, number>, r) => {
    acc[r.year] = (acc[r.year] || 0) + 1;
    return acc;
  }, {});
  const topRecipients = Object.entries(
    rows.reduce((acc: Record<string, number>, r) => {
      acc[r.recipientName] = (acc[r.recipientName] || 0) + r.estimatedValuePkr;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, totalValue: value }));

  res.json({ total, totalValue, retained, byYear, topRecipients });
});

export default router;
