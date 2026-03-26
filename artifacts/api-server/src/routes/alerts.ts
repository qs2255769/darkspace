import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db/schema";
import { eq, and, type SQL } from "drizzle-orm";

const router: IRouter = Router();

router.get("/alerts", async (req, res) => {
  const { severity, status } = req.query;
  const conditions: SQL[] = [];
  if (severity) conditions.push(eq(alertsTable.severity, severity as string));
  if (status) conditions.push(eq(alertsTable.status, status as string));

  const rows = conditions.length
    ? await db.select().from(alertsTable).where(and(...conditions))
    : await db.select().from(alertsTable);

  const result = rows.map((r) => ({
    ...r,
    dataSources: JSON.parse(r.dataSourcesJson),
  }));
  result.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  res.json(result);
});

export default router;
