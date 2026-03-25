import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Database, GitBranch, FolderOpen,
  FileText, Code2, Shield, ChevronLeft, ChevronRight, AlertTriangle, ListChecks, Search,
  Network, Grid3X3, Share2, ShieldAlert, BookTemplate,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import GlobalSearch from "@/components/GlobalSearch";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/master-register", label: "Master Register", icon: Database },
  { path: "/menu-tree", label: "Menu Tree", icon: GitBranch },
  { path: "/modules", label: "Modules", icon: FolderOpen },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/issues-requirements", label: "Issues & Reqs", icon: AlertTriangle },
  { path: "/tasks", label: "Tasks", icon: ListChecks },
  { path: "/technical-mapping", label: "Technical Mapping", icon: Code2 },
  { divider: true, label: "Intelligence" },
  { path: "/digital-twin", label: "Digital Twin", icon: Network },
  { path: "/heatmap", label: "Completeness Map", icon: Grid3X3 },
  { path: "/knowledge-graph", label: "Knowledge Graph", icon: Share2 },
  { path: "/consistency-checker", label: "Consistency Check", icon: ShieldAlert },
  { path: "/templates", label: "Template Library", icon: BookTemplate },
  { divider: true, label: "System" },
  { path: "/settings", label: "Settings & RBAC", icon: Shield },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-50 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border shrink-0">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-primary">GoERP.ai</span>
              <span className="text-[10px] text-sidebar-foreground/60">ERP Intelligence Platform</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Global Search Button */}
        <div className="px-2 pt-2 pb-1">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "flex items-center gap-2 w-full rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
              collapsed ? "justify-center p-2" : "px-3 py-1.5"
            )}
            title="Search (⌘K)"
          >
            <Search size={15} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-xs">Search...</span>
                <kbd className="text-[9px] bg-sidebar-accent/50 px-1.5 py-0.5 rounded">⌘K</kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 py-1 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ('divider' in item && item.divider) {
              return !collapsed ? (
                <div key={idx} className="pt-3 pb-1 px-3">
                  <span className="text-[9px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">{item.label}</span>
                </div>
              ) : <div key={idx} className="pt-2 pb-1 mx-3 border-t border-sidebar-border" />;
            }
            const { path, label, icon: Icon } = item as { path: string; label: string; icon: typeof LayoutDashboard };
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-sidebar-border">
          {!collapsed && <div className="text-[9px] text-sidebar-foreground/40">v3.0.0 · ERP Intelligence Platform</div>}
        </div>
      </aside>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
