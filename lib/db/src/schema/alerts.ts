import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("new"),
  officialId: integer("official_id"),
  officialName: text("official_name"),
  detectedAt: text("detected_at").notNull(),
  patternType: text("pattern_type").notNull(),
  estimatedValue: text("estimated_value"),
  dataSourcesJson: text("data_sources_json").notNull().default("[]"),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
