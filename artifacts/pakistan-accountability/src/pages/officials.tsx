import { useOfficials } from "@/hooks/use-api";
import { Card, Input, Badge, Button } from "@/components/ui";
import { Search, Filter, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { getRiskColorClass } from "@/lib/utils";
import { Link } from "wouter";

export default function Officials() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useOfficials({ search });

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp className="w-3 h-3 text-risk-critical" />;
    if (trend === 'falling') return <TrendingDown className="w-3 h-3 text-risk-low" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Official Profiles</h1>
          <p className="text-muted-foreground">Tracked public servants and their computed risk matrices.</p>
        </div>
      </div>

      <Card className="p-4 border-white/5 bg-black/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, CNIC or constituency..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-white/10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-white/10">
              <Filter className="w-4 h-4" /> Province
            </Button>
            <Button variant="outline" className="gap-2 border-white/10">
              <Filter className="w-4 h-4" /> Party
            </Button>
          </div>
        </div>
      </Card>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Profile</th>
                <th className="px-6 py-4 font-medium">Position / Region</th>
                <th className="px-6 py-4 font-medium">Declared Assets</th>
                <th className="px-6 py-4 font-medium">Risk Score</th>
                <th className="px-6 py-4 font-medium">Flags</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32 mb-2"></div><div className="h-3 bg-white/5 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-8"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-white/5 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No officials found matching the criteria.
                  </td>
                </tr>
              ) : (
                data?.map((official) => (
                  <tr key={official.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{official.name}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">CNIC: {official.cnicPartial}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{official.position}</div>
                      <div className="text-xs text-muted-foreground mt-1">{official.province} • {official.party}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {official.assetsDeclared}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`font-mono text-sm ${getRiskColorClass(official.riskScore)}`}>
                          {official.riskScore.toFixed(1)}%
                        </Badge>
                        {getTrendIcon(official.riskTrend)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-white/5">
                        {official.flagCount}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/officials/${official.id}`}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="w-4 h-4 text-primary" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
