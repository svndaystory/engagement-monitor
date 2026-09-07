"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import {
  BarChart3,
  Clapperboard,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import { MonitorUIProvider, useMonitorUI } from "@/components/MonitorUIProvider";
import { TrackModal } from "@/components/TrackModal";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const NAV: Array<{
  href: string;
  label: string;
  icon: IconComponent;
  match: (path: string) => boolean;
}> = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (path) => path === "/",
  },
  {
    href: "/content",
    label: "Content",
    icon: Clapperboard,
    match: (path) => path === "/content" || path.startsWith("/content/"),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    match: (path) => path.startsWith("/reports"),
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: IconComponent;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        active
          ? "bg-bg text-text"
          : "text-muted hover:bg-bg/70 hover:text-text",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useMonitorUI();

  useEffect(() => {
    if (pathname === "/content") {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [pathname, searchParams, setSearchQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/content?${qs}` : "/content");
  }

  return (
    <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor="global-search">
        Cari konten
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        id="global-search"
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Cari konten..."
        className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      />
    </form>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openTrack } = useMonitorUI();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
          <div className="px-3 pb-6">
            <p className="text-sm font-semibold tracking-tight text-text">
              Engagement Monitor
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.match(pathname)}
              />
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
            <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5">
              <button
                type="button"
                className="rounded-md border border-border p-2 text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" aria-hidden />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden />
                )}
              </button>

              <Suspense
                fallback={
                  <div className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-muted">
                    Cari konten...
                  </div>
                }
              >
                <SearchBar />
              </Suspense>

              <button
                type="button"
                onClick={openTrack}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber px-3 py-2 text-sm font-medium text-bg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Track
              </button>
            </div>

            {mobileOpen ? (
              <nav
                id="mobile-nav"
                className="border-t border-border px-3 py-2 md:hidden"
                aria-label="Mobile"
              >
                {NAV.map((item) => (
                  <NavLink
                    key={`m-${item.label}`}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={item.match(pathname)}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </nav>
            ) : null}
          </header>

          <main className="flex-1 px-3 py-5 sm:px-5 sm:py-6">{children}</main>

          <nav
            className="sticky bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface md:hidden"
            aria-label="Bottom"
          >
            {NAV.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={`b-${item.label}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber",
                    active ? "text-amber" : "text-muted",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <TrackModal />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MonitorUIProvider>
      <ShellInner>{children}</ShellInner>
    </MonitorUIProvider>
  );
}
