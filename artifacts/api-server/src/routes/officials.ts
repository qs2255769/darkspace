import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officialsTable } from "@workspace/db/schema";
import { eq, gte, ilike, and, type SQL } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

router.get("/officials", async (req, res) => {
  const { province, party, minRisk, search } = req.query;
  const conditions: SQL[] = [];
  if (province) conditions.push(eq(officialsTable.province, province as string));
  if (party) conditions.push(eq(officialsTable.party, party as string));
  if (minRisk) conditions.push(gte(officialsTable.riskScore, parseFloat(minRisk as string)));
  if (search) conditions.push(ilike(officialsTable.name, `%${search}%`));

  const rows = conditions.length
    ? await db.select().from(officialsTable).where(and(...conditions))
    : await db.select().from(officialsTable);

  const result = rows.map((r) => ({
    id: r.id,
    name: r.name,
    cnicPartial: r.cnicPartial,
    position: r.position,
    party: r.party,
    province: r.province,
    constituency: r.constituency,
    riskScore: r.riskScore,
    riskTrend: r.riskTrend,
    flagCount: r.flagCount,
    assetsDeclared: r.assetsDeclared,
    lastUpdated: r.lastUpdated,
  }));

  result.sort((a, b) => b.riskScore - a.riskScore);
  res.json(result);
});

router.get("/officials/parties", async (_req, res) => {
  const rows = await db.select().from(officialsTable);
  const partyMap: Record<string, { count: number; avgRisk: number; maxRisk: number; officials: any[] }> = {};

  for (const r of rows) {
    if (!partyMap[r.party]) {
      partyMap[r.party] = { count: 0, avgRisk: 0, maxRisk: 0, officials: [] };
    }
    partyMap[r.party].count++;
    partyMap[r.party].avgRisk += r.riskScore;
    partyMap[r.party].maxRisk = Math.max(partyMap[r.party].maxRisk, r.riskScore);
    partyMap[r.party].officials.push({
      id: r.id,
      name: r.name,
      position: r.position,
      province: r.province,
      riskScore: r.riskScore,
      riskTrend: r.riskTrend,
      flagCount: r.flagCount,
      assetsDeclared: r.assetsDeclared,
    });
  }

  const result = Object.entries(partyMap).map(([party, data]) => ({
    party,
    count: data.count,
    avgRisk: data.avgRisk / data.count,
    maxRisk: data.maxRisk,
    officials: data.officials.sort((a, b) => b.riskScore - a.riskScore),
  }));

  result.sort((a, b) => b.avgRisk - a.avgRisk);
  res.json(result);
});

router.get("/officials/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(officialsTable).where(eq(officialsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const r = rows[0];
  res.json({
    id: r.id,
    name: r.name,
    cnicPartial: r.cnicPartial,
    position: r.position,
    party: r.party,
    province: r.province,
    constituency: r.constituency,
    riskScore: r.riskScore,
    riskTrend: r.riskTrend,
    flagCount: r.flagCount,
    assetsDeclared: r.assetsDeclared,
    lastUpdated: r.lastUpdated,
    companies: JSON.parse(r.companiesJson),
    contracts: JSON.parse(r.contractsJson),
    relatives: JSON.parse(r.relativesJson),
    fundingAllocations: JSON.parse(r.fundingJson),
    riskFactors: JSON.parse(r.riskFactorsJson),
  });
});

router.get("/officials/:id/connections", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(officialsTable).where(eq(officialsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(JSON.parse(rows[0].connectionsJson));
});

router.get("/officials/:id/summary", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(officialsTable).where(eq(officialsTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const r = rows[0];
  const riskFactors = JSON.parse(r.riskFactorsJson);
  const contracts = JSON.parse(r.contractsJson);
  const companies = JSON.parse(r.companiesJson);
  const relatives = JSON.parse(r.relativesJson);

  const apiKey = process.env.GOOGLE_API || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI summary unavailable: API key not configured." });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an investigative intelligence analyst for Pakistan Accountability Intelligence System (PAIS). Write a concise, factual risk intelligence brief for the following official. Use professional, neutral language. Do NOT use the word "corrupt" or make legal conclusions. Only describe patterns detected through cross-referencing public Pakistani government databases.

OFFICIAL: ${r.name}
POSITION: ${r.position}
PARTY: ${r.party}
PROVINCE: ${r.province}
CONSTITUENCY: ${r.constituency || "N/A"}
DECLARED ASSETS: ${r.assetsDeclared}
COMPOSITE RISK INDEX: ${r.riskScore.toFixed(1)}%
RISK TREND: ${r.riskTrend}
FLAGS DETECTED: ${r.flagCount}

RISK FACTORS:
${riskFactors.map((f: any) => `- ${f.factor} (weight: ${f.weight}, confidence: ${f.evidenceLevel}): ${f.description}`).join("\n")}

CORPORATE LINKS (SECP cross-reference):
${companies.length ? companies.map((c: any) => `- ${c.companyName}: ${c.relationship}, Contracts: ${c.contractsValue}`).join("\n") : "None found"}

PUBLIC CONTRACTS (PPRA cross-reference):
${contracts.length ? contracts.map((c: any) => `- ${c.projectName} (${c.amount}, ${c.year}): Awarded to ${c.awardedTo}. Flag: ${c.connection}`).join("\n") : "None found"}

RELATIVE NETWORK:
${relatives.length ? relatives.map((rel: any) => `- ${rel.name} (${rel.relationship}): ${rel.companies?.join(", ") || "No companies"}, ${rel.contracts} contract(s)`).join("\n") : "None found"}

Write a 3-paragraph intelligence brief:
1. Overview of the official's profile and risk level
2. Key patterns identified across database cross-references (be specific about which databases flagged the pattern)
3. What journalists or investigators should focus on and which public databases to file RTI requests for

Keep it under 250 words. Professional, factual, no opinions.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    res.json({ summary, generatedAt: new Date().toISOString(), model: "gemini-1.5-flash" });
  } catch (err: any) {
    console.error("Gemini error:", err?.message);
    res.status(500).json({ error: "AI summary generation failed. Please try again." });
  }
});

export default router;
