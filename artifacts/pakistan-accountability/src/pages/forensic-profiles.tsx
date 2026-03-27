import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  Shield, ArrowLeft, AlertTriangle, CheckCircle, Building2, Globe,
  FileText, TrendingUp, Users, ChevronRight, Search, Filter
} from "lucide-react";
import { Input } from "@/components/ui";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function riskColor(score: number) {
  if (score >= 70) return "text-risk-critical";
  if (score >= 50) return "text-risk-high";
  if (score >= 30) return "text-risk-medium";
  return "text-risk-low";
}
function riskBg(score: number) {
  if (score >= 70) return "bg-risk-critical/10 border-risk-critical/30";
  if (score >= 50) return "bg-risk-high/10 border-risk-high/30";
  if (score >= 30) return "bg-risk-medium/10 border-risk-medium/30";
  return "bg-risk-low/10 border-risk-low/30";
}

function RiskMeter({ score }: { score: number }) {
  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="60" cy="60" r="50" fill="none"
          stroke={score >= 70 ? "#ef4444" : score >= 50 ? "#f97316" : score >= 30 ? "#eab308" : "#22c55e"}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 314} 314`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold font-mono ${riskColor(score)}`}>{Math.round(score)}%</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Risk</span>
      </div>
    </div>
  );
}

// ── FULL PROFILE VIEW ──────────────────────────────────────────────
function ProfileDetail({ id }: { id: string }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["audited-profile", id],
    queryFn: () => fetch(`${BASE_URL}/api/audited-profiles/${id}`).then(r => r.json()),
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />)}
    </div>
  );
  if (!data) return <div className="text-muted-foreground">Profile not found.</div>;

  const verdict = data.verdictParsed || {};
  const hiddenLinks: any[] = data.hiddenLinksParsed || [];

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/forensic-profiles">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-3.5 h-3.5" /> All Forensic Profiles
        </Button>
      </Link>

      {/* Hero */}
      <div className={`rounded-xl border p-6 ${riskBg(data.riskScore)}`}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <RiskMeter score={data.riskScore} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{data.memberName}</h1>
              <Badge variant="outline" className={`${riskBg(data.riskScore)} ${riskColor(data.riskScore)} text-xs`}>{data.riskCategory} Risk</Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-3">{data.party} · {data.assembly} · {data.constituency || data.province}</div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-primary mb-3">
              <Shield className="w-3.5 h-3.5" /> Verified by Samurai AI · {new Date(data.auditedAt).toLocaleString()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Toshakhana", value: data.toshakhanaMismatches, icon: "🎁", color: "text-amber-400" },
                { label: "SECP Links", value: data.secpCompaniesFound, icon: "🏢", color: "text-blue-400" },
                { label: "Offshore", value: data.offshoreEntitiesFound, icon: "🌍", color: "text-red-400" },
                { label: "PPRA Conflicts", value: data.ppraConflictsFound, icon: "📋", color: "text-orange-400" },
              ].map(m => (
                <div key={m.label} className="bg-black/30 rounded-lg p-2.5 border border-white/5 text-center">
                  <div className="text-base mb-0.5">{m.icon}</div>
                  <div className={`font-mono text-xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Samurai Summary */}
      <Card className="border-risk-critical/20 bg-risk-critical/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-risk-critical">
            <Shield className="w-4 h-4" /> Samurai AI Forensic Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{verdict.identitySummary || data.samuraiSummary}</p>
          {verdict.dataIntegrity && (
            <div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Data Integrity Assessment</div>
              <p className="text-xs text-foreground">{verdict.dataIntegrity}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Verified Assets */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-risk-low">
              <CheckCircle className="w-4 h-4" /> Verified Assets (ECP Source)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{verdict.verifiedAssets || data.verifiedAssets || "Not Disclosed"}</p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-risk-high">
              <AlertTriangle className="w-4 h-4" /> Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(verdict.keyFindings || []).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <ChevronRight className="w-3.5 h-3.5 text-risk-high shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Hidden Links */}
      {hiddenLinks.length > 0 && (
        <Card className="border-risk-high/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-risk-high">
              <AlertTriangle className="w-4 h-4" /> Hidden Links & Undisclosed Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hiddenLinks.map((link: any, i: number) => (
                <div key={i} className={`p-3.5 rounded-lg border ${
                  link.severity === "critical" ? "bg-risk-critical/5 border-risk-critical/30" :
                  link.severity === "high" ? "bg-risk-high/5 border-risk-high/30" :
                  "bg-risk-medium/5 border-risk-medium/30"
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {link.type?.includes("Offshore") ? <Globe className="w-3.5 h-3.5 text-risk-critical" /> :
                       link.type?.includes("Corporate") ? <Building2 className="w-3.5 h-3.5 text-blue-400" /> :
                       link.type?.includes("Contract") ? <FileText className="w-3.5 h-3.5 text-orange-400" /> :
                       <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="text-xs font-semibold text-foreground">{link.type}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] capitalize ${
                      link.severity === "critical" ? "border-risk-critical/30 text-risk-critical" :
                      link.severity === "high" ? "border-risk-high/30 text-risk-high" :
                      "border-risk-medium/30 text-risk-medium"
                    }`}>{link.severity}</Badge>
                  </div>
                  <p className="text-xs text-foreground/80">{link.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── PROFILES LIST ────────────────────────────────────────────────
function ProfilesList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const { data: profiles = [], isLoading } = useQuery<any[]>({
    queryKey: ["audited-profiles"],
    queryFn: () => fetch(`${BASE_URL}/api/audited-profiles`).then(r => r.json()),
  });

  const filtered = profiles.filter(p => {
    const matchSearch = !search || p.memberName.toLowerCase().includes(search.toLowerCase()) || p.party.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || p.riskCategory === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: profiles.length,
    critical: profiles.filter(p => p.riskCategory === "Critical").length,
    high: profiles.filter(p => p.riskCategory === "High").length,
    avgRisk: profiles.length ? Math.round(profiles.reduce((s, p) => s + p.riskScore, 0) / profiles.length) : 0,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Shield className="w-7 h-7 text-risk-critical" />
          Forensic Profiles
        </h1>
        <p className="text-muted-foreground mt-1">
          Samurai AI cross-verified profiles — declared assets vs Toshakhana · SECP · ICIJ · PPRA databases
        </p>
      </div>

      {profiles.length === 0 ? (
        <Card className="p-8 text-center border-white/5">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">No Forensic Profiles Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Run the 3-Agent Pipeline to generate AI-verified forensic profiles</p>
          <Link href="/pipeline">
            <Button className="gap-2 bg-risk-critical/10 border border-risk-critical/30 text-risk-critical hover:bg-risk-critical/20">
              <TrendingUp className="w-4 h-4" /> Go to Pipeline
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-xs text-muted-foreground uppercase">Total Profiles</div><div className="text-2xl font-bold font-mono text-foreground mt-1">{stats.total}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground uppercase">Critical Risk</div><div className="text-2xl font-bold font-mono text-risk-critical mt-1">{stats.critical}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground uppercase">High Risk</div><div className="text-2xl font-bold font-mono text-risk-high mt-1">{stats.high}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground uppercase">Avg Risk Score</div><div className={`text-2xl font-bold font-mono mt-1 ${riskColor(stats.avgRisk)}`}>{stats.avgRisk}%</div></Card>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or party..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50 border-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-background/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                <option value="">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <Link key={p.id} href={`/forensic-profiles/${p.id}`}>
                <div className="rounded-xl border border-white/10 bg-black/20 p-5 hover:border-white/25 hover:bg-black/30 transition-all cursor-pointer group h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{p.memberName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.party} · {p.assembly}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono text-xl font-bold ${riskColor(p.riskScore)}`}>{Math.round(p.riskScore)}%</div>
                      <Badge variant="outline" className={`text-[9px] ${riskBg(p.riskScore)} ${riskColor(p.riskScore)}`}>{p.riskCategory}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{p.samuraiSummary}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.toshakhanaMismatches > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">🎁 {p.toshakhanaMismatches} Toshakhana</span>}
                    {p.secpCompaniesFound > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">🏢 {p.secpCompaniesFound} SECP</span>}
                    {p.offshoreEntitiesFound > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">🌍 {p.offshoreEntitiesFound} Offshore</span>}
                    {p.ppraConflictsFound > 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">📋 {p.ppraConflictsFound} PPRA</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[9px] font-mono text-primary flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Verified by Samurai AI
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── ROUTER ENTRY ────────────────────────────────────────────────
export default function ForensicProfiles() {
  const { id } = useParams<{ id?: string }>();
  return id ? <ProfileDetail id={id} /> : <ProfilesList />;
}
