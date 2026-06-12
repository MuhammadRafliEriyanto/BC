"use client";

type OwnerDashboardShellProps = {
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
};

export function OwnerDashboardShell({
  sidebar,
  children,
}: OwnerDashboardShellProps) {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#fff7ed_30%,#f8fafc_100%)]">
      <div className="flex min-h-screen bg-transparent">
        {sidebar ? sidebar : null}

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-orange-200/35 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,250,252,0.96))]" />
          </div>

          <div className="relative flex min-h-screen flex-col">{children}</div>
        </div>
      </div>
    </section>
  );
}
