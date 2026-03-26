import { useOfficial, useOfficialConnections } from "@/hooks/use-api";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui";
import { RiskGauge } from "@/components/risk-gauge";
import { formatCurrency, getRiskColorClass } from "@/lib/utils";
import { Building2, FileText, Users2, MapPin, AlertTriangle, Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Dynamically import force graph to avoid SSR/hydration issues if any, though Vite is fine.
import ForceGraph2D from "react-force-graph-2d";

export default function OfficialDetail() {
  const [, params] = useRoute("/officials/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: official, isLoading } = useOfficial(id);
  const { data: connections, isLoading: connectionsLoading } = useOfficialConnections(id);
  
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    if (graphContainerRef.current) {
      const { clientWidth } = graphContainerRef.current;
      setGraphDimensions({ width: clientWidth, height: 400 });
    }
    const handleResize = () => {
      if (graphContainerRef.current) {
        setGraphDimensions({ width: graphContainerRef.current.clientWidth, height: 400 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [connectionsLoading]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Profile */}
      <div className="glass-panel p-6 sm:p-8 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 w-64 h-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{official.name}</h1>
            <Badge variant="outline" className="border-white/10 text-muted-foreground font-mono">
              {official.cnicPartial}
            </Badge>
          </div>
          <div className="text-lg text-muted-foreground flex items-center gap-2">
            {official.position} <span className="text-white/20">•</span> {official.province} <span className="text-white/20">•</span> {official.party}
          </div>
        </div>
        
        <div className="flex items-center gap-8 bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Declared Assets</div>
            <div className="font-mono text-lg font-medium">{official.assetsDeclared}</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flags Found</div>
            <div className="font-mono text-lg font-medium text-risk-high flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {official.flagCount}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Risk & Factors */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Composite Risk Index</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskGauge score={official.riskScore} />
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primary Risk Factors</h4>
                {official.riskFactors.map((factor, i) => (
                  <div key={i} className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-foreground">{factor.factor}</span>
                      <Badge variant="outline" className={factor.evidenceLevel === 'high' ? 'text-risk-critical border-risk-critical/30' : 'text-risk-medium border-risk-medium/30'}>
                        {factor.evidenceLevel} conf
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Networks & Graph */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Entity Connection Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={graphContainerRef} 
                className="w-full h-[400px] bg-[#050505] rounded-xl border border-white/5 overflow-hidden relative cursor-crosshair"
              >
                {!connectionsLoading && connections && (
                  <ForceGraph2D
                    width={graphDimensions.width}
                    height={graphDimensions.height}
                    graphData={connections}
                    nodeLabel={(n: any) => `${n.label} (${n.type})`}
                    nodeColor={(n: any) => {
                      switch(n.type) {
                        case 'official': return '#ef4444'; // Red for center official
                        case 'company': return '#a855f7'; // Purple
                        case 'relative': return '#0ea5e9'; // Blue
                        case 'contract': return '#f59e0b'; // Amber
                        default: return '#64748b'; // Gray
                      }
                    }}
                    linkColor={(link: any) => link.suspicious ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.1)'}
                    linkWidth={(link: any) => link.suspicious ? 2 : 1}
                    nodeRelSize={6}
                    linkDirectionalParticles={(link: any) => link.suspicious ? 2 : 0}
                    linkDirectionalParticleSpeed={0.005}
                    backgroundColor="transparent"
                  />
                )}
                {connectionsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="w-32 h-8 rounded-full" />
                  </div>
                )}
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/80 p-3 rounded-lg border border-white/10 backdrop-blur-md text-xs font-mono">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Official</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a855f7]" /> Company</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]" /> Relative</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Contract</div>
                  <div className="flex items-center gap-2 mt-1 border-t border-white/10 pt-1"><div className="w-4 h-0.5 bg-risk-critical" /> Suspicious Link</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Corporate Links (SECP)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {official.companies.map((co, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm">
                    <div className="font-semibold text-foreground flex justify-between">
                      {co.companyName}
                      <span className="font-mono text-xs text-muted-foreground">{co.secp_number}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Role: <span className="text-foreground">{co.relationship}</span> {co.directorship && '(Directorship)'}
                    </div>
                    {co.contractsValue && co.contractsValue !== 'PKR 0' && (
                      <div className="text-xs font-mono text-risk-medium mt-1">
                        Gov Contracts: {co.contractsValue}
                      </div>
                    )}
                  </div>
                ))}
                {official.companies.length === 0 && <div className="text-sm text-muted-foreground">No direct corporate links found.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Public Contracts (PPRA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {official.contracts.map((ct, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm">
                    <div className="font-semibold text-foreground line-clamp-1" title={ct.projectName}>{ct.projectName}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-mono text-primary font-medium">{ct.amount}</span>
                      <span className="text-xs text-muted-foreground">{ct.year}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-white/5">
                      Awarded to: <span className="text-foreground">{ct.awardedTo}</span>
                      <br/>
                      <span className="text-risk-critical flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3"/> Link: {ct.connection}</span>
                    </div>
                  </div>
                ))}
                {official.contracts.length === 0 && <div className="text-sm text-muted-foreground">No associated public contracts found.</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
