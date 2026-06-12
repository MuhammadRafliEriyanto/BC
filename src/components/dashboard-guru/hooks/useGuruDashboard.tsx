"use client";

import { useState } from "react";

export type GuruMenu = "beranda" | "evaluasi";

export interface GuruProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
  notificationCount: number;
}

export interface GuruTopbarMenu {
  label: string;
  value: GuruMenu;
}

const defaultGuruProfile: GuruProfile = {
  name: "",
  email: "",
  role: "",
  initials: "",
  notificationCount: 0,
};

const defaultGuruMenus: GuruTopbarMenu[] = [];

export function useGuruDashboard() {
  const [activeMenu, setActiveMenu] = useState<GuruMenu>("beranda");

  return {
    activeMenu,
    menus: defaultGuruMenus,
    profile: defaultGuruProfile,
    setActiveMenu,
  };
}
