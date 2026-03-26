import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { officialsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/risk-scores", async (req, res) => {
  const rows = await db.select().from(officialsTable);
  const result = rows.map((r) => ({
    officialId: r.id,
    officialName: r.name,
    position: r.position,
    province: r.province,
    score: r.riskScore,
    category:
      r.riskScore >= 80
        ? "critical"
        : r.riskScore >= 60
          ? "high"
          : r.riskScore >= 30
            ? "medium"
            : "low",
    topFlags: JSON.parse(r.riskFactorsJson)
      .slice(0, 3)
      .map((f: { factor: string }) => f.factor),
    lastCalculated: r.lastUpdated,
  }));
  result.sort((a, b) => b.score - a.score);
  res.json(result);
});

export default router;
