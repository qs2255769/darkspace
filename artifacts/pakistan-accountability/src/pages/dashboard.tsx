import { useStats, useOfficials, useAlerts } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui";
import { formatCurrency, getRiskColorClass } from "@/lib/utils";
import { motion } from "framer-motion";
import { Users, Database, AlertOctagon, TrendingUp, ArrowRight, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: officials, isLoading: officialsLoading } = useOfficials({ minRisk: 70 });
  const { data: alerts, isLoading: alertsLoading } = useAlerts({ status: "new" });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Intelligence Overview</h1>
        <p className="text-muted-foreground mt-2">Cross-referencing Pakistani public data for accountability patterns.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Tracked Officials", value: stats?.totalOfficials.toLocaleString(), icon: Users, color: "text-blue-400" },
          { title: "Connected Databases", value: stats?.databasesConnected, icon: Database, color: "text-purple-400" },
          { title: "Active Alerts", value: stats?.alertsGenerated, icon: AlertOctagon, color: "text-risk-high" },
          { title: "Funds at Risk", value: formatCurrency(stats?.estimatedFundsAtRisk || 0), icon: TrendingUp, color: "text-risk-critical" },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className={`w-16 h-16 ${stat.color}`} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold tracking-tight">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Targets */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top High-Risk Profiles</CardTitle>
              <Link href="/officials" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {officialsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {officials?.slice(0, 5).map((official) => (
                    <Link key={official.id} href={`/officials/${official.id}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <div>
                          <div className="font-semibold text-foreground">{official.name}</div>
                          <div className="text-xs text-muted-foreground">{official.position} • {official.province}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getRiskColorClass(official.riskScore)}>
                            {official.riskScore.toFixed(1)}% Risk
                          </Badge>
                          <div className="text-xs text-muted-foreground font-mono">{official.flagCount} Flags</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div variants={item}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Latest Intelligence Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {alertsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-3 pl-4 space-y-6">
                  {alerts?.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="relative">
                      <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-background ${
                        alert.severity === 'critical' ? 'bg-risk-critical' : 
                        alert.severity === 'high' ? 'bg-risk-high' : 'bg-risk-medium'
                      }`} />
                      <div className="text-sm font-semibold mb-1">{alert.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{alert.description}</div>
                      <div className="text-[10px] uppercase font-mono text-muted-foreground/60">
                        {new Date(alert.detectedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Methodology Disclaimer */}
      <motion.div variants={item} className="p-4 border border-risk-low/30 bg-risk-low/5 rounded-xl">
        <h4 className="text-sm font-semibold text-risk-low flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4" /> System Methodology & Disclaimer
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          PAIS algorithmically cross-references public procurement records (PPRA), asset declarations (ECP), corporate registries (SECP), and open tax data to identify statistical anomalies. <strong className="text-foreground">Risk scores represent the mathematical probability of network conflicts of interest, not definitive legal conclusions.</strong> All data is sourced from public endpoints and should be verified independently.
        </p>
      </motion.div>
    </motion.div>
  );
}
