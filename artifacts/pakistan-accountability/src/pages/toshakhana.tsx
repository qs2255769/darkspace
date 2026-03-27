import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Input } from "@/components/ui";
import { Gift, TrendingUp, Search, Filter, AlertTriangle, Archive } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function formatPKR(v: number) {
  if (v >= 10000000) return `PKR ${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000) return `PKR ${(v / 100000).toFixed(1)} Lac`;
  return `PKR ${v.toLocaleString()}`;
}

const partyColors: Record<string, string> = {
  "PML-N": "border-green-500/30 text-green-400",
  "PPP": "border-red-500/30 text-red-400",
  "PTI": "border-orange-500/30 text-orange-400",
  "PML-Q": "border-teal-500/30 text-teal-400",
};

export default function Toshakhana() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { data: records = [], isLoading } = useQuery<any[]>({
    queryKey: ["toshakhana", search, yearFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("name", search);
      if (yearFilter) params.set("year", yearFilter);
      return fetch(`${BASE_URL}/api/toshakhana?${params}`).then(r => r.json());
    },
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["toshakhana-stats"],
    queryFn: () => fetch(`${BASE_URL}/api/toshakhana/stats`).then(r => r.json()),
  });

  const years = Array.from({ length: 22 }, (_, i) => 2002 + i);

  const topGifts = [...records].sort((a, b) => b.estimatedValuePkr - a.estimatedValuePkr).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Archive className="w-7 h-7 text-primary" />
          Toshakhana Registry
        </h1>
        <p className="text-muted-foreground mt-1">
          Historical record of state gifts received by Pakistani officials (2002–2023). Source: Cabinet Division + Kaggle Dataset.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Records</div>
            <div className="text-2xl font-bold font-mono text-foreground">{stats.total}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Total Value</div>
            <div className="text-xl font-bold font-mono text-risk-high">{formatPKR(stats.totalValue)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Retained by Officials</div>
            <div className="text-2xl font-bold font-mono text-risk-critical">{stats.retained}</div>
            <div className="text-xs text-muted-foreground">{stats.total ? Math.round((stats.retained / stats.total) * 100) : 0}% retention rate</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Recipient</div>
            <div className="text-sm font-bold text-foreground line-clamp-1">{stats.topRecipients?.[0]?.name}</div>
            <div className="text-xs text-risk-high font-mono">{stats.topRecipients?.[0] ? formatPKR(stats.topRecipients[0].totalValue) : ""}</div>
          </Card>
        </div>
      )}

      {/* Top 5 most expensive gifts */}
      {topGifts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-risk-critical" />
              Highest Value Gifts on Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topGifts.map((g, i) => (
                <div key={g.id} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-risk-critical/10 border border-risk-critical/30 flex items-center justify-center text-risk-critical text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{g.giftDescription}</div>
                    <div className="text-xs text-muted-foreground">{g.recipientName} · {g.year} · From: {g.giftFrom}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-risk-critical text-sm">{formatPKR(g.estimatedValuePkr)}</div>
                    <Badge variant="outline" className={`text-[10px] ${g.retained === "Yes" ? "text-risk-medium border-risk-medium/30" : "text-risk-low border-risk-low/30"}`}>
                      {g.retained === "Yes" ? "Retained" : "Returned"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filter */}
      <Card className="p-4 border-white/5 bg-black/20">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-white/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="bg-background/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Records Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-5 py-3 font-medium">Year</th>
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Gift Description</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">From</th>
                <th className="px-5 py-3 font-medium">Est. Value</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No records found.</td>
                </tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.year}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-sm text-foreground">{r.recipientName}</div>
                      <div className="text-xs text-muted-foreground">{r.designation}</div>
                      {r.party && (
                        <Badge variant="outline" className={`text-[9px] mt-1 ${partyColors[r.party] || "border-white/10 text-muted-foreground"}`}>
                          {r.party}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-foreground hidden md:table-cell max-w-xs">
                      <div className="line-clamp-2">{r.giftDescription}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground hidden sm:table-cell">{r.giftFrom}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-sm font-bold ${r.estimatedValuePkr > 10000000 ? "text-risk-critical" : r.estimatedValuePkr > 1000000 ? "text-risk-high" : "text-risk-medium"}`}>
                        {formatPKR(r.estimatedValuePkr)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant="outline" className={r.retained === "Yes" ? "border-risk-high/30 text-risk-high text-[10px]" : "border-risk-low/30 text-risk-low text-[10px]"}>
                        {r.retained === "Yes" ? "Retained" : "Returned"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Data source: Cabinet Division Pakistan, Kaggle Dataset "Tosha Khana Record Pakistan 2002-2023" by mesumraza. 
        Values are estimated based on available public disclosures.
      </p>
    </div>
  );
}
