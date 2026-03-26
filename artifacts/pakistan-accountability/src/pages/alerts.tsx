import { useAlerts } from "@/hooks/use-api";
import { Card, Badge, Skeleton } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, FileSearch, CheckCircle, Database } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function Alerts() {
  const { data, isLoading } = useAlerts();

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'critical': return 'border-risk-critical bg-risk-critical/10 text-risk-critical';
      case 'high': return 'border-risk-high bg-risk-high/10 text-risk-high';
      case 'medium': return 'border-risk-medium bg-risk-medium/10 text-risk-medium';
      default: return 'border-risk-low bg-risk-low/10 text-risk-low';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-risk-critical" />;
      case 'reviewing': return <FileSearch className="w-4 h-4 text-risk-medium" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-risk-low" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Alert Feed</h1>
        <p className="text-muted-foreground mt-2">Real-time anomalous patterns detected by cross-referencing public endpoints.</p>
      </div>

      <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8 py-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-muted border-4 border-background animate-pulse" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))
        ) : (
          data?.map((alert, i) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[33px] top-2 w-4 h-4 rounded-full border-4 border-background ${
                alert.severity === 'critical' ? 'bg-risk-critical' : 
                alert.severity === 'high' ? 'bg-risk-high' : 
                alert.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
              }`} />
              
              <Card className="hover:border-white/20 transition-colors">
                <div className="p-5">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        <span className="capitalize">{alert.status}</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                    {alert.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {alert.description}
                  </p>
                  
                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 flex flex-wrap gap-x-6 gap-y-3">
                    {alert.officialName && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Target Official</div>
                        <div className="text-sm font-medium">{alert.officialName}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Pattern Match</div>
                      <div className="text-sm font-medium capitalize">{alert.patternType.replace('_', ' ')}</div>
                    </div>
                    {alert.estimatedValue && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Est. Value at Risk</div>
                        <div className="text-sm font-mono font-bold text-risk-high">{formatCurrency(alert.estimatedValue)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Database className="w-3 h-3 text-muted-foreground" />
                    <div className="flex gap-1.5 flex-wrap">
                      {alert.dataSources.map(ds => (
                        <span key={ds} className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground border border-white/5">
                          {ds}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
