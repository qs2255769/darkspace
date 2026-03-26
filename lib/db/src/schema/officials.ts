import { pgTable, serial, text, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const officialsTable = pgTable("officials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnicPartial: text("cnic_partial").notNull(),
  position: text("position").notNull(),
  party: text("party").notNull(),
  province: text("province").notNull(),
  constituency: text("constituency").notNull().default(""),
  riskScore: real("risk_score").notNull().default(0),
  riskTrend: text("risk_trend").notNull().default("stable"),
  flagCount: integer("flag_count").notNull().default(0),
  assetsDeclared: text("assets_declared").notNull().default("Not Disclosed"),
  lastUpdated: text("last_updated").notNull(),
  companiesJson: text("companies_json").notNull().default("[]"),
  contractsJson: text("contracts_json").notNull().default("[]"),
  relativesJson: text("relatives_json").notNull().default("[]"),
  fundingJson: text("funding_json").notNull().default("[]"),
  riskFactorsJson: text("risk_factors_json").notNull().default("[]"),
  connectionsJson: text("connections_json").notNull().default("{}"),
});

export const insertOfficialSchema = createInsertSchema(officialsTable).omit({ id: true });
export type InsertOfficial = z.infer<typeof insertOfficialSchema>;
export type Official = typeof officialsTable.$inferSelect;
