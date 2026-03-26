import { useOfficial, useOfficialConnections } from "@/hooks/use-api";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui";
import { RiskGauge } from "@/components/risk-gauge";
import { getRiskColorClass } from "@/lib/utils";
import { Building2, FileText, Users2, MapPin, AlertTriangle, Network, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

type GraphNode = { id: string; label: string; type: string; value?: string | null };
type GraphEdge = { source: string; target: string; label: string; suspicious: boolean };

function ConnectionMap({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 700, H = 400;

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const center = nodes.find(n => n.type === "official");
    const others = nodes.filter(n => n.type !== "official");
    if (center) pos[center.id] = { x: W / 2, y: H / 2 };
    others.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
      const radius = Math.min(W, H) * 0.35;
      pos[n.id] = {
        x: W / 2 + radius * Math.cos(angle),
        y: H / 2 + radius * Math.sin(angle),
      };
    });
    return pos;
  }, [nodes]);

  const nodeColor: Record<string, string> = {
    official: "#ef4444",
    company: "#a855f7",
    relative: "#0ea5e9",
    contract: "#f59e0b",
    district: "#22c55e",
    party: "#64748b",
  };

  return (
    <div className="w-full bg-[#050a0f] rounded-xl border border-white/5 overflow-hidden">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-[380px]">
        <defs>
          <marker id="arrow-susp" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(239,68,68,0.8)" />
          </marker>
          <marker id="arrow-norm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.2)" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const s = positions[e.source];
          const t = positions[e.target];
          if (!s || !t) return null;
          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2;
          return (
            <g key={i}>
              <line
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={e.suspicious ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}
                strokeWidth={e.suspicious ? 2 : 1}
                strokeDasharray={e.suspicious ? "none" : "4 3"}
                markerEnd={e.suspicious ? "url(#arrow-susp)" : "url(#arrow-norm)"}
              />
              <text x={mx} y={my - 5} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
                {e.label}
              </text>
            </g>
          );
        })}
        {nodes.map(n => {
          const p = positions[n.id];
          if (!p) return null;
          const color = nodeColor[n.type] || "#64748b";
          const isCenter = n.type === "official";
          const r = isCenter ? 28 : 20;
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={r + 4} fill={color} opacity={0.1} />
              <circle cx={p.x} cy={p.y} r={r} fill={color} opacity={0.85} />
              <text x={p.x} y={p.y + r + 13} textAnchor="middle" fontSize={isCenter ? "10" : "9"} fill="rgba(255,255,255,0.75)" fontFamily="sans-serif" fontWeight={isCenter ? "bold" : "normal"}>
                {n.label.length > 16 ? n.label.substring(0, 14) + "…" : n.label}
              </text>
              {n.value && (
                <text x={p.x} y={p.y + r + 24} textAnchor="middle" fontSize="8" fill="rgba(255,200,0,0.7)" fontFamily="monospace">
                  {n.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 px-4 pb-3 text-[10px] font-mono border-t border-white/5 pt-2">
        {Object.entries(nodeColor).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5 text-muted-foreground capitalize">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {type}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-risk-critical ml-auto">
          <span className="w-5 h-0.5 inline-block bg-risk-critical/70" /> Suspicious link
        </span>
      </div>
    </div>
  );
}

export default function OfficialDetail() {
  const [, params] = useRoute("/officials/:id");
  const id = parseInt(params?.id || "0");

  const { data: official, isLoading } = useOfficial(id);
  const { data: connections, isLoading: connectionsLoading } = useOfficialConnections(id);

  if (isLoading || !official) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const riskColor =
    official.riskScore >= 80 ? "text-risk-critical border-risk-critical/30 bg-risk-critical/5" :
    official.riskScore >= 60 ? "text-risk-high border-risk-high/30 bg-risk-high/5" :
    official.riskScore >= 30 ? "text-risk-medium border-risk-medium/30 bg-risk-medium/5" :
    "text-risk-low border-risk-low/30 bg-risk-low/5";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <Link href="/officials" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Officials
      </Link>

      {/* Header */}
      <div className={`p-6 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ${riskColor}`}>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{official.name}</h1>
            <Badge variant="outline" className="font-mono text-xs border-white/20">{official.cnicPartial}</Badge>
            <Badge variant="outline" className="text-xs border-white/20">{official.party}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {official.position} &nbsp;·&nbsp; {official.province}
            {official.constituency ? ` · ${official.constituency}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-6 bg-black/30 p-4 rounded-xl border border-white/10 text-sm shrink-0">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Assets Declared</div>
            <div className="font-mono font-semibold">{official.assetsDeclared}</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Flags Found</div>
            <div className="font-mono font-semibold flex items-center gap-1 text-risk-high">
              <AlertTriangle className="w-3.5 h-3.5" /> {official.flagCount}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Trend</div>
            <div className={`font-mono font-semibold text-xs ${official.riskTrend === "rising" ? "text-risk-critical" : official.riskTrend === "falling" ? "text-risk-low" : "text-muted-foreground"}`}>
              {official.riskTrend === "rising" ? "↑ Rising" : official.riskTrend === "falling" ? "↓ Falling" : "→ Stable"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Risk gauge + factors */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Composite Risk Index</CardTitle></CardHeader>
            <CardContent>
              <RiskGauge score={official.riskScore} />
              <div className="mt-5 space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Factor Breakdown</h4>
                {official.riskFactors.map((f, i) => (
                  <div key={i} className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-medium text-xs text-foreground">{f.factor}</span>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${f.evidenceLevel === "high" ? "border-risk-critical/40 text-risk-critical" : f.evidenceLevel === "medium" ? "border-risk-medium/40 text-risk-medium" : "border-white/10 text-muted-foreground"}`}>
                        {f.evidenceLevel}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{f.description}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-black/40 overflow-hidden">
                      <div className="h-full rounded-full bg-risk-high" style={{ width: `${Math.min(f.weight * 2, 100)}%` }} />
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 text-right font-mono">weight: {f.weight.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relatives */}
          {official.relatives && official.relatives.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-primary" /> Relative Network
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {official.relatives.map((rel, i) => (
                  <div key={i} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                    <div className="font-semibold text-foreground">{rel.name}</div>
                    <div className="text-muted-foreground mt-0.5">{rel.relationship} · {rel.contracts} contract(s)</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {rel.companies.map((c: string, j: number) => (
                        <span key={j} className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] border border-white/5 font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Funding Allocations */}
          {official.fundingAllocations && official.fundingAllocations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Fund Allocations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {official.fundingAllocations.map((fa, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border text-xs ${fa.suspiciousLinks ? "border-risk-critical/20 bg-risk-critical/5" : "border-white/5 bg-white/[0.02]"}`}>
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">{fa.district}</span>
                      <span className="font-mono text-primary">{fa.amount}</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">{fa.year} · {fa.contractsBack} contracts back</div>
                    {fa.suspiciousLinks && <div className="text-risk-critical text-[10px] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Suspicious links found</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Graph + tables */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Network className="w-4 h-4 text-primary" /> Entity Relationship Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectionsLoading ? (
                <Skeleton className="w-full h-[380px] rounded-xl" />
              ) : connections && connections.nodes.length > 0 ? (
                <ConnectionMap nodes={connections.nodes as GraphNode[]} edges={(connections.edges || []) as GraphEdge[]} />
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No connection data available</div>
              )}
            </CardContent>
          </Card>

          {/* Companies + Contracts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Corporate Links (SECP)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {official.companies && official.companies.length > 0 ? official.companies.map((co, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                    <div className="font-semibold text-foreground flex justify-between gap-2 flex-wrap">
                      <span>{co.companyName}</span>
                      <span className="font-mono text-muted-foreground text-[10px]">{co.secp_number}</span>
                    </div>
                    <div className="text-muted-foreground mt-1">Role: <span className="text-foreground">{co.relationship}</span>{co.directorship ? " (Director)" : ""}</div>
                    {co.contractsValue && co.contractsValue !== "PKR 0" && (
                      <div className="font-mono text-risk-medium mt-1">Contracts: {co.contractsValue}</div>
                    )}
                  </div>
                )) : <p className="text-xs text-muted-foreground">No direct corporate links found in SECP.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Public Contracts (PPRA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {official.contracts && official.contracts.length > 0 ? official.contracts.map((ct, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                    <div className="font-semibold text-foreground line-clamp-2">{ct.projectName}</div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="font-mono text-primary font-semibold">{ct.amount}</span>
                      <span className="text-muted-foreground">{ct.year} · {ct.source}</span>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-white/5 text-muted-foreground">
                      → <span className="text-foreground">{ct.awardedTo}</span>
                    </div>
                    <div className="text-risk-critical flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3 shrink-0" />{ct.connection}</div>
                  </div>
                )) : <p className="text-xs text-muted-foreground">No associated public contracts found.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
