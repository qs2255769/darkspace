import { pgTable, serial, text, real, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// Stage 1: Agent Alpha output — raw scraped parliament members
export const rawMembersTable = pgTable("raw_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  assembly: text("assembly").notNull(),
  constituency: text("constituency").notNull().default(""),
  party: text("party").notNull().default(""),
  province: text("province").notNull().default(""),
  district: text("district").notNull().default(""),
  profileUrl: text("profile_url").notNull().default(""),
  declaredAssetsEcp: text("declared_assets_ecp").notNull().default("Not Disclosed"),
  declaredIncomePkr: real("declared_income_pkr").notNull().default(0),
  declarationYear: integer("declaration_year").notNull().default(2024),
  businessesDeclared: text("businesses_declared").notNull().default("None"),
  rawJson: text("raw_json").notNull().default("{}"),
  agentAlphaRunId: text("agent_alpha_run_id").notNull().default(""),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// Stage 2: Agent Beta output — cross-referenced findings per member
export const relatedDiscoveryTable = pgTable("related_discovery", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(), // FK to raw_members or officials
  memberName: text("member_name").notNull(),
  sourceType: text("source_type").notNull(), // "toshakhana" | "secp" | "icij" | "ppra"
  sourceDatabase: text("source_database").notNull(),
  discoveryType: text("discovery_type").notNull(), // "undeclared_gift" | "company_link" | "offshore_entity" | "contract_conflict"
  description: text("description").notNull(),
  evidenceDetail: text("evidence_detail").notNull().default(""),
  estimatedValuePkr: real("estimated_value_pkr").notNull().default(0),
  year: integer("year").notNull().default(0),
  severity: text("severity").notNull().default("medium"), // "low" | "medium" | "high" | "critical"
  verified: boolean("verified").notNull().default(false),
  betaRunId: text("beta_run_id").notNull().default(""),
  discoveredAt: timestamp("discovered_at").defaultNow(),
});

// Stage 3: Agent Gamma (Samurai AI) output — final forensic verdicts
export const auditedProfilesTable = pgTable("audited_profiles", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull(),
  memberName: text("member_name").notNull(),
  party: text("party").notNull().default(""),
  constituency: text("constituency").notNull().default(""),
  assembly: text("assembly").notNull().default(""),
  province: text("province").notNull().default(""),
  riskScore: real("risk_score").notNull().default(0),
  riskCategory: text("risk_category").notNull().default("Low"),
  verifiedAssets: text("verified_assets").notNull().default(""), // JSON string
  hiddenLinks: text("hidden_links").notNull().default("[]"), // JSON array
  toshakhanaMismatches: integer("toshakhana_mismatches").notNull().default(0),
  secpCompaniesFound: integer("secp_companies_found").notNull().default(0),
  offshoreEntitiesFound: integer("offshore_entities_found").notNull().default(0),
  ppraConflictsFound: integer("ppra_conflicts_found").notNull().default(0),
  samuraiVerdict: text("samurai_verdict").notNull().default(""), // Full AI forensic report
  samuraiSummary: text("samurai_summary").notNull().default(""), // Short summary
  auditStatus: text("audit_status").notNull().default("pending"), // "pending" | "completed" | "failed"
  gammaRunId: text("gamma_run_id").notNull().default(""),
  auditedAt: timestamp("audited_at").defaultNow(),
});

// Pipeline run tracking
export const pipelineRunsTable = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull().unique(),
  status: text("status").notNull().default("pending"), // "pending" | "running" | "completed" | "failed"
  agentAlphaStatus: text("agent_alpha_status").notNull().default("pending"),
  agentBetaStatus: text("agent_beta_status").notNull().default("pending"),
  agentGammaStatus: text("agent_gamma_status").notNull().default("pending"),
  alphaRecordsFound: integer("alpha_records_found").notNull().default(0),
  betaDiscoveriesFound: integer("beta_discoveries_found").notNull().default(0),
  gammaProfilesAudited: integer("gamma_profiles_audited").notNull().default(0),
  errorLog: text("error_log").notNull().default(""),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});
