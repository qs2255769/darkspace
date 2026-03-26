import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { publicDatabasesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/databases", async (req, res) => {
  const rows = await db.select().from(publicDatabasesTable).orderBy(publicDatabasesTable.name);
  const result = rows.map((r) => ({
    ...r,
    dataTypes: JSON.parse(r.dataTypes),
    keyFields: JSON.parse(r.keyFields),
  }));
  res.json(result);
});

router.get("/databases/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(publicDatabasesTable).where(eq(publicDatabasesTable.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const r = rows[0];
  res.json({
    ...r,
    dataTypes: JSON.parse(r.dataTypes),
    keyFields: JSON.parse(r.keyFields),
  });
});

export default router;
