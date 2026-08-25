"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import ThemeToggle from "@/components/ThemeToggle";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Package, ShoppingCart, MapPin, Users, PenSquare,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/products",       label: "Products",       icon: Package         },
  { href: "/orders",         label: "Orders",         icon: ShoppingCart    },
  { href: "/locations",      label: "Locations",      icon: MapPin          },
  { href: "/users",          label: "Customers",      icon: Users           },
  { href: "/custom-orders",  label: "Custom Requests",icon: PenSquare       },
];

// This layout is the single source of truth for "is someone allowed to see
// admin pages". A signed-in Firebase account is not enough — it must also
// carry the `admin: true` custom claim, or it gets signed out and bounced
// to /login. This mirrors the check on the login page itself, so someone
// with a lingering non-admin session can't reach a protected page by
// navigating straight to a URL like /dashboard.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [checked, setChecked]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdTokenResult(true);
        if (!token.claims.admin) {
          await signOut(auth);
          toast.error("This account does not have admin access.");
          setUser(null);
          setChecked(true);
          router.replace("/login");
          return;
        }
      }
      setUser(u);
      setChecked(true);
      if (!u) router.replace("/login");
    });
    return unsub;
  }, [router]);

  if (!checked || !user) {
    return (
      <div className="min-h-screen bg-ftm-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo.png" alt="FocusTM" width={40} height={40} className="object-contain opacity-60" />
          <div className="text-ftm-muted text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => { await signOut(auth); router.replace("/login"); };
  const activeLabel = navItems.find((n) => pathname.startsWith(n.href))?.label || "Admin";

  return (
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-ftm-deep border-r border-ftm-line flex flex-col transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center gap-3 px-7 py-7 border-b border-ftm-line">
          <Image src="/logo.png" alt="FocusTM" width={28} height={28} className="object-contain" />
          <div>
            <p className="font-heading text-[13px] tracking-[0.28em] uppercase leading-none">FocusTM</p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-ftm-dim mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
                  active ? "bg-ftm-charcoal text-ftm-white" : "text-ftm-muted hover:text-ftm-white hover:bg-ftm-charcoal"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto text-ftm-dim" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-5 border-t border-ftm-line">
          <p className="text-[10px] text-ftm-muted truncate mb-3">{user.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-ftm-dim hover:text-red-400 transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-ftm-black/90 backdrop-blur-md border-b border-ftm-line flex items-center gap-4 px-6 py-4">
          <button className="md:hidden text-ftm-muted hover:text-ftm-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-[10px] uppercase tracking-[0.25em] text-ftm-muted">{activeLabel}</span>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[9px] text-ftm-dim hidden sm:inline">Excellence Is The Standard</span>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-7 md:p-10">{children}</main>
      </div>
    </div>
  );
}
