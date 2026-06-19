import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/features/auth/AuthProvider";
import { UseFinLogo } from "./UseFinLogo";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const email = user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Esquerda — menu mobile + logo + marca */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md text-[#4b5563] hover:bg-[#f3f4f6] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <UseFinLogo className="h-[26px] w-auto text-[#1a6e5f]" />
            <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#111827]">
              UseFin
            </span>
          </Link>
        </div>

        {/* Centro — navegação (desktop) */}
        <nav className="hidden h-full items-center gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-full items-center border-b-2 text-sm transition-colors",
                  isActive
                    ? "border-[#1a6e5f] font-medium text-[#111827]"
                    : "border-transparent text-[#4b5563] hover:text-[#111827]",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Direita — sino + divisor + usuário */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Notificações"
            className="text-[#9ca3af] transition-colors hover:text-[#6b7280]"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="h-6 w-px bg-[#e5e7eb]" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((v) => !v)}
              className="flex max-w-[180px] items-center gap-1 text-sm text-[#6b7280] hover:text-[#374151]"
            >
              <span className="truncate">{email || "Conta"}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            {userOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-sm">
                  <p className="truncate px-3 py-2 text-xs text-[#6b7280]">
                    {email}
                  </p>
                  <div className="border-t border-[#e5e7eb]" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f3f4f6]"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegação mobile (drawer abaixo da barra) */}
      {mobileOpen && (
        <nav className="border-t border-[#e5e7eb] bg-white px-2 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-[#f3f4f6] font-medium text-[#111827]"
                    : "text-[#4b5563] hover:bg-[#f3f4f6]",
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0 text-[#9ca3af]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
