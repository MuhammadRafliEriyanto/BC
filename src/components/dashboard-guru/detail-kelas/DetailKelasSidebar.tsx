"use client";

import type { DetailKelasSidebarProps } from "./types";

function SidebarButton({
  active,
  description,
  isMobile,
  label,
  onClick,
  shortLabel,
  Icon,
}: {
  active: boolean;
  description: string;
  isMobile: boolean;
  label: string;
  onClick: () => void;
  shortLabel: string;
  Icon: DetailKelasSidebarProps["sectionItems"][number]["icon"];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative border text-left transition-all duration-200 ${
        isMobile
          ? "inline-flex min-w-max items-center gap-2 px-4 py-2.5 text-sm font-semibold"
          : "flex w-full items-start gap-3 px-4 py-3.5"
      } ${
        active
          ? "border-orange-300 bg-orange-50 text-orange-700 shadow-[0_18px_32px_-28px_rgba(249,115,22,0.45)]"
          : "border-slate-200 bg-white text-slate-600 hover:-translate-y-px hover:border-orange-200 hover:bg-orange-50/70 hover:text-orange-700"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center border transition-colors ${
          isMobile ? "h-8 w-8" : "h-9 w-9"
        } ${
          active
            ? "border-orange-200 bg-white text-orange-600"
            : "border-orange-100 bg-orange-50 text-orange-500 group-hover:border-orange-200"
        }`}
      >
        <Icon className={isMobile ? "h-4 w-4" : "h-4 w-4"} />
      </span>

      <span className={isMobile ? "whitespace-nowrap" : "min-w-0 flex-1"}>
        <span className="block text-sm font-semibold">
          {isMobile ? shortLabel : label}
        </span>
        {!isMobile ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500 group-hover:text-slate-600">
            {description}
          </span>
        ) : null}
      </span>

      {active ? (
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-400 via-orange-500 to-amber-400" />
      ) : null}
    </button>
  );
}

export default function DetailKelasSidebar({
  activeSection,
  onSectionChange,
  sectionItems,
}: DetailKelasSidebarProps) {
  return (
    <>
      <div className="flex gap-2 overflow-x-auto border border-orange-100 bg-white px-4 py-3 lg:hidden">
        {sectionItems.map((item) => (
          <SidebarButton
            key={item.key}
            active={activeSection === item.key}
            description={item.description}
            isMobile
            label={item.label}
            onClick={() => onSectionChange(item.key)}
            shortLabel={item.shortLabel}
            Icon={item.icon}
          />
        ))}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 border border-orange-100 bg-white shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)]">
          <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50/80 to-white px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
              Table of Contents
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-800">
              Navigasi Detail Kelas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pilih satu section aktif agar fokus review kelas tetap rapi dan ringan.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-3">
            {sectionItems.map((item) => (
              <SidebarButton
                key={item.key}
                active={activeSection === item.key}
                description={item.description}
                isMobile={false}
                label={item.label}
                onClick={() => onSectionChange(item.key)}
                shortLabel={item.shortLabel}
                Icon={item.icon}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

