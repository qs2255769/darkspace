import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Cpu, Play, CheckCircle, Clock, XCircle, ChevronRight, Shield, Search, Link2, Sword, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const STAGES = [
  {
    id: "alpha", label: "Agent Alpha", subtitle: "The Ingestor",
    description: "Scrapes all 6 assemblies + imports officials into raw_members table",
    icon: Search, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/5",
    targets: ["National Assembly", "Senate", "Punjab Assembly", "Sindh Assembly", "KPK Assembly", "Balochistan Assembly"],
  },
  {
    id: "beta", label: "Agent Beta", subtitle: "The Linker",
    description: "Cross-references names against Toshakhana · SECP · ICIJ Offshore · PPRA",
    icon: Link2, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5",
    targets: ["Toshakhana Registry", "SECP Director DB", "ICIJ Panama Papers", "ICIJ Pandora Papers", "PPRA Contracts"],
  },
  {
    id: "gamma", label: "Agent Gamma", subtitle: "Samurai Auditor",
    description: "Gemini AI compares declarations vs discoveries → writes forensic profiles to audited_profiles",
    icon: Sword, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/5",
    targets: ["Declaration Mismatch Analysis", "Corporate Conflict Detection", "Offshore Exposure Mapping", "Risk Score Calculation"],
  },
];

function AgentCard({ stage, status, count }: { stage: typeof STAGES[0]; status: string; count?: number }) {
  const Icon = stage.icon;
  const isRunning = status === "running";
  const isDone = status === "completed";
  const isFailed = status === "failed";
  return (
    <div className={`rounded-xl border ${stage.border} ${stage.bg} p-5 transition-all ${isRunning ? "ring-1 ring-white/10 shadow-lg" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/30 border ${stage.border}`}>
            <Icon className={`w-5 h-5 ${stage.color} ${isRunning ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">{stage.label}</div>
            <div className={`text-xs font-mono ${stage.color}`}>{stage.subtitle}</div>
          </div>
        </div>
        <div>
          {isDone && <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Done</Badge>}
          {isRunning && <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-[10px] animate-pulse"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Running</Badge>}
          {isFailed && <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>}
          {status === "pending" && <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {stage.targets.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 border border-white/5 text-muted-foreground font-mono">{t}</span>
        ))}
      </div>
      {isDone && count !== undefined && (
        <div className={`mt-3 text-sm font-mono font-bold ${stage.color}`}>
          {stage.id === "alpha" && `${count} members ingested`}
          {stage.id === "beta" && `${count} discoveries found`}
          {stage.id === "gamma" && `${count} profiles audited`}
        </div>
      )}
    </div>
  );
}

export default function Pipeline() {
  const [runId, setRunId] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const { data: runs = [] } = useQuery<any[]>({
    queryKey: ["pipeline-runs"],
    queryFn: () => fetch(`${BASE_URL}/api/pipeline/runs`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const { data: status, refetch: refetchStatus } = useQuery<any>({
    queryKey: ["pipeline-status", runId],
    queryFn: () => fetch(`${BASE_URL}/api/pipeline/status/${runId}`).then(r => r.json()),
    enabled: !!runId,
    refetchInterval: 3000,
  });

  const { data: profiles = [] } = useQuery<any[]>({
    queryKey: ["audited-profiles"],
    queryFn: () => fetch(`${BASE_URL}/api/audited-profiles`).then(r => r.json()),
    refetchInterval: 10000,
  });

  const runMutation = useMutation({
    mutationFn: () => fetch(`${BASE_URL}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "officials" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setRunId(data.runId);
      setLogLines([`[System] Pipeline started: ${data.runId}`, `[System] Scope: Officials + Live Scrape`]);
    },
  });

  // Simulate live logs while pipeline runs
  useEffect(() => {
    if (!status) return;
    const msgs: string[] = [];
    if (status.agentAlphaStatus === "running") msgs.push("[Alpha] Scraping parliament databases...");
    if (status.agentAlphaStatus === "completed") msgs.push(`[Alpha] ✅ Ingested ${status.alphaRecordsFound} members`);
    if (status.agentBetaStatus === "running") msgs.push("[Beta] Cross-referencing Toshakhana, SECP, ICIJ...");
    if (status.agentBetaStatus === "completed") msgs.push(`[Beta] ✅ Found ${status.betaDiscoveriesFound} discoveries`);
    if (status.agentGammaStatus === "running") msgs.push("[Gamma] Samurai AI generating forensic profiles...");
    if (status.agentGammaStatus === "completed") msgs.push(`[Gamma] ✅ Audited ${status.gammaProfilesAudited} profiles`);
    if (status.status === "completed") msgs.push("[System] 🎯 Pipeline complete. Forensic profiles ready.");
    setLogLines(prev => {
      const newLines = msgs.filter(m => !prev.includes(m));
      return newLines.length > 0 ? [...prev, ...newLines] : prev;
    });
  }, [status]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const currentStages = {
    alpha: status?.agentAlphaStatus || "pending",
    beta: status?.agentBetaStatus || "pending",
    gamma: status?.agentGammaStatus || "pending",
  };

  const isRunning = status?.status === "running";
  const riskColor = (score: number) => score >= 70 ? "text-risk-critical" : score >= 50 ? "text-risk-high" : score >= 30 ? "text-risk-medium" : "text-risk-low";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Sword className="w-7 h-7 text-risk-critical" />
            Forensic Intelligence Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            3-Agent system: Alpha (Ingest) → Beta (Link) → Gamma (Samurai AI Audit)
          </p>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={isRunning || runMutation.isPending}
          className="shrink-0 gap-2 bg-risk-critical/10 hover:bg-risk-critical/20 border border-risk-critical/40 text-risk-critical"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pipeline Running..." : "Run Full Pipeline"}
        </Button>
      </div>

      {/* Pipeline flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="flex items-start gap-3">
            <AgentCard
              stage={stage}
              status={currentStages[stage.id as keyof typeof currentStages]}
              count={stage.id === "alpha" ? status?.alphaRecordsFound : stage.id === "beta" ? status?.betaDiscoveriesFound : status?.gammaProfilesAudited}
            />
            {i < STAGES.length - 1 && (
              <div className="hidden lg:flex items-center justify-center mt-8 shrink-0">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live log terminal */}
      {logLines.length > 0 && (
        <Card className="border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Pipeline Console
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={logRef} className="bg-black/60 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 max-h-48 overflow-auto border border-white/5">
              {logLines.map((line, i) => (
                <div key={i} className={`${line.includes("❌") ? "text-red-400" : line.includes("✅") ? "text-green-400" : line.includes("⚠️") ? "text-yellow-400" : line.includes("🚨") ? "text-risk-critical" : line.includes("[Gamma]") ? "text-red-300" : line.includes("[Beta]") ? "text-amber-300" : "text-green-400"}`}>
                  &gt; {line}
                </div>
              ))}
              {isRunning && <div className="text-green-400 animate-pulse">&gt; _</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audited Profiles Preview */}
      {profiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-risk-critical" />
              Forensic Profiles — Verified by Samurai AI
              <Badge variant="outline" className="border-risk-critical/30 text-risk-critical text-xs ml-2">{profiles.length} profiles</Badge>
            </h2>
            <Link href="/forensic-profiles">
              <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-xs">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.slice(0, 6).map((p: any) => (
              <Link key={p.id} href={`/forensic-profiles/${p.id}`}>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 hover:border-white/20 hover:bg-black/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{p.memberName}</div>
                      <div className="text-[11px] text-muted-foreground">{p.party} · {p.assembly}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono text-lg font-bold ${riskColor(p.riskScore)}`}>{Math.round(p.riskScore)}%</div>
                      <Badge variant="outline" className={`text-[9px] ${p.riskScore >= 70 ? "border-risk-critical/30 text-risk-critical" : p.riskScore >= 50 ? "border-risk-high/30 text-risk-high" : "border-risk-medium/30 text-risk-medium"}`}>{p.riskCategory}</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{p.samuraiSummary}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.toshakhanaMismatches > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">🎁 {p.toshakhanaMismatches} Toshakhana</span>}
                    {p.secpCompaniesFound > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">🏢 {p.secpCompaniesFound} SECP</span>}
                    {p.offshoreEntitiesFound > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">🌍 ICIJ</span>}
                  </div>
                  <div className="text-[9px] font-mono text-primary mt-2 flex items-center gap-1 opacity-70">
                    <Shield className="w-2.5 h-2.5" /> Verified by Samurai AI
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past runs */}
      {runs.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Pipeline Runs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runs.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-2.5 bg-black/20 rounded-lg border border-white/5 text-xs">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === "completed" ? "bg-green-400" : r.status === "running" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`} />
                  <div className="font-mono text-muted-foreground flex-1 truncate">{r.runId}</div>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Alpha: {r.alphaRecordsFound}</span>
                    <span className="text-muted-foreground">Beta: {r.betaDiscoveriesFound}</span>
                    <span className="text-muted-foreground">Profiles: {r.gammaProfilesAudited}</span>
                  </div>
                  <span className="text-muted-foreground">{new Date(r.startedAt).toLocaleString()}</span>
                  {r.runId !== runId && (
                    <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2" onClick={() => setRunId(r.runId)}>
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
