import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/features/auth/AuthProvider";
import { Brand } from "./Brand";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-3">
        {user?.email && (
          <p className="truncate px-2 text-xs text-sidebar-muted" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
        <p className="px-2 text-[11px] text-sidebar-muted">
          Sprint de Canais · 16/jun–24/ago
        </p>
      </div>
    </div>
  );
}
