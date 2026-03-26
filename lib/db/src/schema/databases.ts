import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publicDatabasesTable = pgTable("public_databases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  acronym: text("acronym").notNull(),
  category: text("category").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  dataTypes: text("data_types").notNull(),
  accessLevel: text("access_level").notNull(),
  url: text("url"),
  recordsEstimated: text("records_estimated").notNull(),
  lastUpdated: text("last_updated").notNull(),
  integrationStatus: text("integration_status").notNull(),
  keyFields: text("key_fields").notNull(),
  notes: text("notes").notNull(),
});

export const insertPublicDatabaseSchema = createInsertSchema(publicDatabasesTable).omit({ id: true });
export type InsertPublicDatabase = z.infer<typeof insertPublicDatabaseSchema>;
export type PublicDatabase = typeof publicDatabasesTable.$inferSelect;
