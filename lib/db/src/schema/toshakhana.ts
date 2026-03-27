import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";

export const toshakhanaTable = pgTable("toshakhana_history", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  recipientName: text("recipient_name").notNull(),
  designation: text("designation").notNull(),
  party: text("party").notNull().default(""),
  province: text("province").notNull().default(""),
  giftDescription: text("gift_description").notNull(),
  giftFrom: text("gift_from").notNull(),
  estimatedValuePkr: real("estimated_value_pkr").notNull().default(0),
  retained: text("retained").notNull().default("Yes"),
  retentionCostPkr: real("retention_cost_pkr").notNull().default(0),
  sourceUrl: text("source_url").notNull().default(""),
  dataSource: text("data_source").notNull().default("Kaggle/Cabinet Division"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scrapedMembersTable = pgTable("scraped_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  assembly: text("assembly").notNull(),
  constituency: text("constituency").notNull().default(""),
  party: text("party").notNull().default(""),
  province: text("province").notNull().default(""),
  district: text("district").notNull().default(""),
  profileUrl: text("profile_url").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  status: text("status").notNull().default("Active"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  rawJson: text("raw_json").notNull().default("{}"),
});

export const scraperLogsTable = pgTable("scraper_logs", {
  id: serial("id").primaryKey(),
  agentName: text("agent_name").notNull(),
  targetUrl: text("target_url").notNull(),
  recordsFound: integer("records_found").notNull().default(0),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message").notNull().default(""),
  runAt: timestamp("run_at").defaultNow(),
  durationMs: integer("duration_ms").notNull().default(0),
});
