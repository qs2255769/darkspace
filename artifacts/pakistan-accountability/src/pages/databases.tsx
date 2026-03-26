import { useDatabases } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, Badge, Input, Skeleton } from "@/components/ui";
import { Search, ExternalLink, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Databases() {
  const { data, isLoading, error } = useDatabases();
  const [search, setSearch] = useState("");

  const filteredData = data?.filter(db => 
    db.name.toLowerCase().includes(search.toLowerCase()) || 
    db.acronym.toLowerCase().includes(search.toLowerCase()) ||
    db.category.toLowerCase().includes(search.toLowerCase())
  );

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return <CheckCircle2 className="w-4 h-4 text-risk-low" />;
      case 'partial': return <Clock className="w-4 h-4 text-risk-medium" />;
      default: return <ShieldAlert className="w-4 h-4 text-risk-critical" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Sources</h1>
          <p className="text-muted-foreground mt-2">Registry of interconnected Pakistani public databases.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search databases..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="text-center p-12 glass-panel rounded-xl text-destructive border-destructive/20">
          Failed to load databases. Check connection.
        </div>
      ) : filteredData?.length === 0 ? (
        <div className="text-center p-12 glass-panel rounded-xl text-muted-foreground">
          No databases found matching your search.
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredData?.map((db) => (
            <motion.div key={db.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full flex flex-col hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(17,140,79,0.2)]">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg leading-tight">{db.name}</CardTitle>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{db.organization} • {db.acronym}</p>
                    </div>
                    {db.url && (
                      <a href={db.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="capitalize">{db.category.replace('_', ' ')}</Badge>
                    <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-white/10 bg-black/20">
                      {getAccessIcon(db.accessLevel)}
                      <span className="capitalize">{db.accessLevel}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
                    {db.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Est. Records</span>
                      <span className="font-mono">{db.recordsEstimated}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Integration</span>
                      <span className={cn(
                        "font-medium capitalize",
                        db.integrationStatus === 'integrated' ? 'text-risk-low' : 'text-risk-medium'
                      )}>{db.integrationStatus}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {db.keyFields.map(field => (
                        <span key={field} className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
