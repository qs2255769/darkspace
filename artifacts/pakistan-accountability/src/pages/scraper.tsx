import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { Cpu, Play, RefreshCw, CheckCircle, XCircle, Clock, Users, Globe } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const SCRAPER_TARGETS = [
  { key: "na", label: "National Assembly", url: "na.gov.pk/en/all_members.php", agent: "Agent Alpha", province: "Federal" },
  { key: "openparliament_na", label: "OpenParliament – NA", url: "openparliament.pk/mps-national/", agent: "Agent Alpha", province: "Federal" },
  { key: "sindh", label: "OpenParliament – Sindh", url: "openparliament.pk/mps-sindh/", agent: "Agent Alpha", province: "Sindh" },
  { key: "kpk", label: "OpenParliament – KPK", url: "openparliament.pk/mps-khyber-pakhtunkhwa/", agent: "Agent Alpha", province: "KPK" },
  { key: "senate", label: "OpenParliament – Senate", url: "openparliament.pk/mps-senate/", agent: "Agent Alpha", province: "Federal" },
  { key: "punjab", label: "Punjab Assembly (PAP)", url: "pap.gov.pk/members/listing/en/21/?bydistrict=XXX", agent: "Agent Alpha", province: "Punjab" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "success") return <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
  if (status === "failed") return <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-[10px]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
}

export default function ScraperAdmin() {
  const [runningTarget, setRunningTarget] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: logs = [], isLoading: logsLoading } = useQuery<any[]>({
    queryKey: ["scraper-logs"],
    queryFn: () => fetch(`${BASE_URL}/api/scraper/logs`).then(r => r.json()),
    refetchInterval: 5000,
  });

  const { data: members = [] } = useQuery<any[]>({
    queryKey: ["scraped-members"],
    queryFn: () => fetch(`${BASE_URL}/api/scraper/members`).then(r => r.json()),
  });

  const runMutation = useMutation({
    mutationFn: (target: string) =>
      fetch(`${BASE_URL}/api/scraper/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      }).then(r => r.json()),
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["scraper-logs"] });
        qc.invalidateQueries({ queryKey: ["scraped-members"] });
        setRunningTarget(null);
      }, 8000);
    },
  });

  const handleRun = (target: string) => {
    setRunningTarget(target);
    runMutation.mutate(target);
  };

  const assemblyGroups = members.reduce((acc: Record<string, number>, m: any) => {
    acc[m.assembly] = (acc[m.assembly] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Cpu className="w-7 h-7 text-primary" />
          Live Data Scrapers
        </h1>
        <p className="text-muted-foreground mt-1">
          Agent Alpha — scrapes Pakistani parliament sites for live member data. Click a source to run a scrape now.
        </p>
      </div>

      {/* Scraper cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCRAPER_TARGETS.map(target => {
          const isRunning = runningTarget === target.key;
          const lastLog = logs.find((l: any) => l.targetUrl?.includes(target.url.split("/")[0]));
          return (
            <Card key={target.key} className="hover:border-white/20 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{target.label}</CardTitle>
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary shrink-0">{target.agent}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <Globe className="w-3 h-3" /> {target.url}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-muted-foreground">{target.province}</div>
                  {lastLog ? <StatusBadge status={lastLog.status} /> : <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">Not run yet</Badge>}
                </div>
                {lastLog && (
                  <div className="text-[10px] text-muted-foreground mb-3 font-mono">
                    Last: {new Date(lastLog.runAt).toLocaleString()} · {lastLog.recordsFound} records
                    {lastLog.errorMessage && <span className="text-risk-critical block mt-0.5 truncate">{lastLog.errorMessage}</span>}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 border-white/10 hover:border-primary/40 text-xs"
                  onClick={() => handleRun(target.key)}
                  disabled={isRunning || runMutation.isPending}
                >
                  {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? "Running..." : "Run Scraper"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Run all button */}
      <Button
        className="gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
        onClick={() => handleRun("all")}
        disabled={runMutation.isPending}
      >
        {runMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Run All Scrapers (Agent Alpha Full Sweep)
      </Button>

      {/* Members summary */}
      {members.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Scraped Members ({members.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(assemblyGroups).map(([assembly, count]) => (
                <div key={assembly} className="bg-black/30 rounded-lg px-4 py-2 border border-white/5 text-center">
                  <div className="font-mono text-lg font-bold text-primary">{count as number}</div>
                  <div className="text-[10px] text-muted-foreground">{assembly}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-auto max-h-64 rounded-lg border border-white/5">
              <table className="w-full text-xs">
                <thead className="bg-black/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Assembly</th>
                    <th className="px-4 py-2 text-left">Party</th>
                    <th className="px-4 py-2 text-left">Constituency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.slice(0, 50).map((m: any) => (
                    <tr key={m.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2 font-medium text-foreground">{m.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.assembly}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.party || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.constituency || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scraper Logs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Scraper Log History</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-sm text-muted-foreground">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No scraper runs yet. Click a source above to start.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 bg-black/20 rounded-lg border border-white/5 text-xs">
                  <StatusBadge status={log.status} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{log.agentName}</div>
                    <div className="text-muted-foreground font-mono truncate">{log.targetUrl}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-foreground">{log.recordsFound} records</div>
                    <div className="text-muted-foreground">{log.durationMs}ms</div>
                  </div>
                  <div className="text-muted-foreground text-[10px] shrink-0 hidden sm:block">
                    {new Date(log.runAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
