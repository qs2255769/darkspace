import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus, Users, ChevronUp } from "lucide-react";
import { getRiskColorClass } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const PARTY_COLORS: Record<string, string> = {
  "PML-N": "#00a550",
  "PPP": "#e63946",
  "PTI": "#DE2010",
  "MQM-P": "#2196F3",
  "JUI-F": "#795548",
  "ANP": "#c0392b",
  "BAP": "#8BC34A",
  "PML-Q": "#009688",
  "IPP": "#FF9800",
  "BNP-M": "#9C27B0",
  "AML": "#607D8B",
  "Non-party (Bureaucrat)": "#455A64",
};

function RiskBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-red-500" :
    score >= 60 ? "bg-orange-500" :
    score >= 30 ? "bg-yellow-400" :
    "bg-green-500";
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function getTrendIcon(trend: string) {
  if (trend === "rising") return <TrendingUp className="w-3 h-3 text-red-400" />;
  if (trend === "falling") return <TrendingDown className="w-3 h-3 text-green-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export default function Parties() {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["parties"],
    queryFn: () => fetch(`${BASE_URL}/api/officials/parties`).then((r) => r.json()),
  });

  const partyData = data || [];
  const selectedData = partyData.find((p: any) => p.party === selectedParty);

  const handlePartyClick = (party: string) => {
    setSelectedParty(prev => prev === party ? null : party);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-8 bg-white/5 rounded-lg w-56 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-36 bg-white/[0.03] border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Party Risk Overview</h1>
        <p className="text-muted-foreground mt-1">Select a party to view its tracked officials ranked by composite risk index.</p>
      </div>

      {/* Party Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partyData.map((p: any) => {
          const color = PARTY_COLORS[p.party] || "#64748b";
          const isSelected = selectedParty === p.party;
          return (
            <button
              key={p.party}
              onClick={() => handlePartyClick(p.party)}
              className={`text-left p-5 rounded-xl border transition-all duration-200 w-full ${
                isSelected
                  ? "border-white/25 bg-white/5 shadow-xl ring-1 ring-white/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="font-bold text-sm text-foreground leading-tight">{p.party}</span>
                </div>
                <Badge variant="outline" className={`text-xs font-mono shrink-0 ml-2 ${getRiskColorClass(p.avgRisk)}`}>
                  {p.avgRisk.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {p.count} tracked</span>
                <span>Peak: <span className={`font-mono font-bold ${getRiskColorClass(p.maxRisk)}`}>{p.maxRisk.toFixed(1)}%</span></span>
              </div>
              <RiskBar score={p.avgRisk} />
            </button>
          );
        })}
      </div>

      {/* Officials Table */}
      {selectedParty && selectedData && (
        <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: PARTY_COLORS[selectedParty] || "#64748b" }} />
              <h2 className="font-bold text-base text-foreground">{selectedParty}</h2>
              <span className="text-muted-foreground text-sm">— {selectedData.count} officials tracked</span>
              <Badge variant="outline" className={`text-xs font-mono ${getRiskColorClass(selectedData.avgRisk)}`}>
                Avg risk: {selectedData.avgRisk.toFixed(1)}%
              </Badge>
            </div>
            <button onClick={() => setSelectedParty(null)} className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors">
              Close <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-white/5 bg-black/30">
                <th className="px-6 py-3 text-left font-medium">Official</th>
                <th className="px-6 py-3 text-left font-medium hidden sm:table-cell">Position</th>
                <th className="px-6 py-3 text-left font-medium hidden md:table-cell">Assets</th>
                <th className="px-6 py-3 text-left font-medium">Risk Index</th>
                <th className="px-6 py-3 text-center font-medium">Flags</th>
                <th className="px-6 py-3 text-right font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {selectedData.officials.map((o: any) => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-foreground text-sm">{o.name}</div>
                    <div className="text-xs text-muted-foreground">{o.province}</div>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">{o.position}</td>
                  <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground hidden md:table-cell">{o.assetsDeclared}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-sm font-bold ${getRiskColorClass(o.riskScore)}`}>{o.riskScore.toFixed(1)}%</span>
                      {getTrendIcon(o.riskTrend)}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant="secondary" className="bg-white/5 text-xs">{o.flagCount}</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link href={`/officials/${o.id}`}>
                      <button className="p-1.5 rounded-lg border border-white/5 hover:border-primary/40 hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
