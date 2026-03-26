import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Activity, 
  AlertTriangle,
  Menu,
  X,
  Search,
  Shield,
  Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input } from "./ui";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "By Party", href: "/parties", icon: Flag },
  { name: "All Officials", href: "/officials", icon: Users },
  { name: "Risk Scores", href: "/risk-scores", icon: Activity },
  { name: "Active Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Data Sources", href: "/databases", icon: Database },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background scanline">
      {/* Mobile sidebar backdrop */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 glass-panel border-r-0 border-l-0 border-y-0 rounded-none p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Shield className="h-6 w-6" />
              PAIS
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col glass-panel border-y-0 border-l-0 rounded-none z-10">
        <div className="flex flex-col flex-1 overflow-y-auto px-5 py-7">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-primary font-bold text-lg tracking-tighter leading-none">PAIS</div>
              <div className="text-[10px] font-mono text-muted-foreground leading-none mt-0.5">Pakistan AI Intelligence</div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/15 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}>
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />}
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Status */}
          <div className="mt-6 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">System Status</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-foreground">All nodes operational</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-background/50 backdrop-blur-md z-20 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center justify-between lg:justify-end gap-4">
            <div className="relative w-full max-w-sm hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search officials, contracts, databases..." 
                className="pl-9 h-9 bg-black/20 border-white/10 rounded-full text-sm focus-visible:ring-primary/40"
              />
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none text-foreground">Analyst Alpha</p>
                <p className="text-[10px] text-muted-foreground mt-1">Clearance: High</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
                AA
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
