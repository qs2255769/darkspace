import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Database, Users, Activity, AlertTriangle,
  Menu, X, Search, Shield, Flag, Archive, Cpu, Sword, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input } from "./ui";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, group: "Overview" },
  { name: "By Party", href: "/parties", icon: Flag, group: "Overview" },
  { name: "All Officials", href: "/officials", icon: Users, group: "Overview" },
  { name: "Risk Scores", href: "/risk-scores", icon: Activity, group: "Overview" },
  { name: "Active Alerts", href: "/alerts", icon: AlertTriangle, group: "Overview" },
  { name: "Forensic Pipeline", href: "/pipeline", icon: Sword, group: "Intelligence", highlight: true },
  { name: "Forensic Profiles", href: "/forensic-profiles", icon: Shield, group: "Intelligence" },
  { name: "Toshakhana", href: "/toshakhana", icon: Archive, group: "Data Sources" },
  { name: "Live Scrapers", href: "/scrapers", icon: Cpu, group: "Data Sources" },
  { name: "Data Sources", href: "/databases", icon: Database, group: "Data Sources" },
];

const groups = ["Overview", "Intelligence", "Data Sources"];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const NavLink = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
    return (
      <Link href={item.href} onClick={onClick} className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group relative",
        item.highlight && !isActive
          ? "text-risk-critical border border-risk-critical/20 bg-risk-critical/5 hover:bg-risk-critical/10"
          : isActive
            ? "bg-primary/15 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
      )}>
        {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-r-full" />}
        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : item.highlight && !isActive ? "text-risk-critical" : "group-hover:text-foreground")} />
        <span>{item.name}</span>
        {item.highlight && !isActive && <span className="ml-auto text-[8px] font-mono bg-risk-critical/20 text-risk-critical px-1 py-0.5 rounded">AI</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background scanline">
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 glass-panel border-y-0 border-l-0 rounded-none p-5 shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
              <Shield className="h-5 w-5" /> PAIS
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {navigation.map(item => (
              <NavLink key={item.name} item={item} onClick={() => setMobileMenuOpen(false)} />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:flex-col glass-panel border-y-0 border-l-0 rounded-none z-10 shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-6 group px-1">
            <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-primary font-bold text-base tracking-tighter leading-none">PAIS</div>
              <div className="text-[9px] font-mono text-muted-foreground leading-none mt-0.5">Accountability Intelligence</div>
            </div>
          </Link>

          {/* Grouped Nav */}
          <nav className="flex-1 flex flex-col gap-4">
            {groups.map(group => {
              const items = navigation.filter(n => n.group === group);
              return (
                <div key={group}>
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">{group}</div>
                  <div className="flex flex-col gap-0.5">
                    {items.map(item => <NavLink key={item.name} item={item} />)}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Status */}
          <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">System Status</div>
            <div className="flex items-center gap-2 text-[11px]">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-foreground">All agents operational</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">Samurai AI: Ready</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        {/* Topbar */}
        <header className="h-13 flex items-center justify-between px-4 sm:px-5 border-b border-white/5 bg-background/50 backdrop-blur-md z-20 shrink-0 py-2.5">
          <Button variant="ghost" size="icon" className="lg:hidden -ml-2 h-8 w-8" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center justify-between lg:justify-end gap-3">
            <div className="relative w-full max-w-sm hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search officials, contracts, gifts..."
                className="pl-9 h-8 bg-black/20 border-white/10 rounded-full text-xs focus-visible:ring-primary/40"
              />
            </div>
            <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none text-foreground">Analyst Alpha</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Clearance: HIGH</p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-[10px] font-bold">AA</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
