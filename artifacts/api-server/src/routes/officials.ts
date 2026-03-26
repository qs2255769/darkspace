import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officialsTable } from "@workspace/db/schema";
import { eq, gte, ilike, and, type SQL } from "drizzle-orm";

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
  const r = rows[0];
  const connections = JSON.parse(r.connectionsJson);
  res.json(connections);
});

export default router;
