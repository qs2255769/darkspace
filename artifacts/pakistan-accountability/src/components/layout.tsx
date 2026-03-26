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
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input } from "./ui";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data Sources", href: "/databases", icon: Database },
  { name: "Officials", href: "/officials", icon: Users },
  { name: "Risk Scores", href: "/risk-scores", icon: Activity },
  { name: "Active Alerts", href: "/alerts", icon: AlertTriangle },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background scanline">
      {/* Mobile sidebar */}
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
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href} className={cn(
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
      <div className="hidden lg:flex lg:w-72 lg:flex-col glass-panel border-y-0 border-l-0 rounded-none z-10">
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-8">
          <Link href="/" className="flex items-center gap-3 text-primary font-bold text-2xl tracking-tighter mb-10 group">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            PAIS <span className="text-xs font-mono text-muted-foreground font-normal ml-1">v0.9</span>
          </Link>
          <nav className="flex-1 flex flex-col gap-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/15 text-primary border border-primary/20 shadow-inner" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                )}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                  <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System Status</h4>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-risk-low animate-pulse" />
              <span className="text-foreground">All nodes operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-background/50 backdrop-blur-md z-20">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center justify-between lg:justify-end gap-4">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search officials, contracts, or databases..." 
                className="pl-9 bg-black/20 border-white/10 rounded-full focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">Analyst Alpha</p>
                <p className="text-xs text-muted-foreground mt-1">Clearance Level: High</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
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
