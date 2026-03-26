import { useRiskScores } from "@/hooks/use-api";
import { Card, Badge, Progress, Skeleton } from "@/components/ui";
import { getRiskColorClass, getRiskColorHex } from "@/lib/utils";
import { ArrowUpDown, Search } from "lucide-react";

export default function RiskScores() {
  const { data, isLoading } = useRiskScores();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Risk Leaderboard</h1>
          <p className="text-muted-foreground">Officials ranked by AI-generated probability of conflicts of interest.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium w-16 text-center">Rank</th>
                <th className="px-6 py-4 font-medium">Target Identity</th>
                <th className="px-6 py-4 font-medium w-64">Risk Index <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Top Flags Identified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-8 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32 mb-2"></div><div className="h-3 bg-white/5 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-2 bg-white/5 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-48"></div></td>
                  </tr>
                ))
              ) : (
                data?.map((score, index) => (
                  <tr key={score.officialId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-center font-mono font-medium text-muted-foreground">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{score.officialName}</div>
                      <div className="text-xs text-muted-foreground mt-1">{score.position} • {score.province}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold w-12 text-right">{score.score.toFixed(1)}%</span>
                        <Progress 
                          value={score.score} 
                          className="h-2 bg-black/50" 
                          indicatorClassName={
                            score.score >= 80 ? "bg-risk-critical" : 
                            score.score >= 60 ? "bg-risk-high" : 
                            score.score >= 30 ? "bg-risk-medium" : "bg-risk-low"
                          } 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase">
                      <Badge variant="outline" className={getRiskColorClass(score.score)}>
                        {score.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {score.topFlags.map(flag => (
                          <span key={flag} className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-muted-foreground border border-white/5">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
