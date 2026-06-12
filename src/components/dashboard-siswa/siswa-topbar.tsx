"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { SiswaUserProfileDialog } from "@/components/dashboard-siswa/SiswaUserProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  getRedirectPathForRole,
  persistAuthUser,
  readPersistedAuthUser,
  type AuthUser,
} from "@/lib/auth";
import {
  MembershipRequestError,
  membershipService,
  type MembershipStatusData,
} from "@/lib/subscription";

const menus = [
  {
    name: "Beranda",
    path: "/dashboard-siswa",
    exact: true,
  },
  {
    name: "Tagihan",
    path: "/dashboard-siswa/",
    exact: true,
  },
] as const;

type SiswaTopbarProfile = {
  nama: string;
  role: string;
  initials: string;
};

type MembershipStudentProfile = NonNullable<MembershipStatusData["student"]>;

const fallbackProfile: SiswaTopbarProfile = {
  nama: "Siswa",
  role: "Memuat profil...",
  initials: "SI",
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SI"
  );
}

function formatRoleLabel(role: AuthUser["role"]) {
  switch (role) {
    case "siswa":
      return "Siswa";
    case "guru":
      return "Guru";
    case "admin":
      return "Admin";
    case "owner":
      return "Owner";
    default:
      return "Siswa";
  }
}

function buildProfileFromAuthUser(user: AuthUser): SiswaTopbarProfile {
  return {
    nama: user.nama,
    role: formatRoleLabel(user.role),
    initials: getInitials(user.nama),
  };
}

function buildRoleFromStudentProfile(student: MembershipStudentProfile) {
  const className = student.className?.trim();
  const program = student.program?.trim();

  if (className) {
    return className;
  }

  if (program) {
    return `Siswa ${program}`;
  }

  return "Siswa";
}

function buildProfileFromMembershipData(data?: MembershipStatusData | null) {
  const student = data?.student;
  const user = data?.user;
  const resolvedName = student?.name?.trim() || user?.nama?.trim();

  if (!resolvedName) {
    return null;
  }

  return {
    nama: resolvedName,
    role: student ? buildRoleFromStudentProfile(student) : "Siswa",
    initials: getInitials(resolvedName),
  } satisfies SiswaTopbarProfile;
}

function mergeProfileWithAuthUser(
  currentProfile: SiswaTopbarProfile,
  user: AuthUser,
): SiswaTopbarProfile {
  const authRole = formatRoleLabel(user.role);
  const shouldPreserveCurrentRole =
    currentProfile.role &&
    currentProfile.role !== fallbackProfile.role &&
    currentProfile.role !== authRole;

  return {
    nama: user.nama,
    initials: getInitials(user.nama),
    role: shouldPreserveCurrentRole ? currentProfile.role : authRole,
  };
}

export default function SiswaTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<SiswaTopbarProfile>(fallbackProfile);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const redirectToLogin = useEffectEvent(() => {
    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  });

  const loadCurrentUser = useEffectEvent(async () => {
    try {
      const response = await authService.me();
      const user = response.data?.user;

      if (user) {
        persistAuthUser(user);
        setCurrentUser(user);
        setProfile((currentProfile) =>
          mergeProfileWithAuthUser(currentProfile, user),
        );

        if (user.role !== "siswa") {
          startTransition(() => {
            router.replace(getRedirectPathForRole(user.role));
            router.refresh();
          });
        }
      }
    } catch (error) {
      if (
        error instanceof AuthRequestError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthClientState();
        setCurrentUser(null);
        setProfile(fallbackProfile);
        redirectToLogin();
        return;
      }

      console.error("[siswa-topbar] load_auth_profile_failed", error);
    } finally {
      setIsUserLoading(false);
    }
  });

  const loadStudentProfile = useEffectEvent(async () => {
    try {
      const response = await membershipService.getMySubscription();
      const studentProfile = buildProfileFromMembershipData(response.data);

      if (studentProfile) {
        setProfile(studentProfile);
      }
    } catch (error) {
      if (
        error instanceof MembershipRequestError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthClientState();
        setCurrentUser(null);
        setProfile(fallbackProfile);
        redirectToLogin();
        return;
      }

      console.error("[siswa-topbar] load_membership_profile_failed", error);
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      const persistedUser = readPersistedAuthUser();

      if (persistedUser) {
        setCurrentUser(persistedUser);
        setProfile(buildProfileFromAuthUser(persistedUser));
      }

      void loadCurrentUser();
      void loadStudentProfile();
    });
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("[siswa-topbar] logout_failed", error);
    } finally {
      clearAuthClientState();
      setCurrentUser(null);
      setProfile(fallbackProfile);
      setIsProfileOpen(false);

      startTransition(() => {
        router.replace("/login");
        router.refresh();
      });
    }
  }

  const displayName = currentUser?.nama ?? profile.nama;
  const displayRole = profile.role;
  const avatarFallback = getInitials(displayName || "Siswa");
  const avatarSrc = currentUser?.avatar ?? null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-red-800/95 via-orange-600/95 to-amber-500/95 shadow-[0_6px_30px_rgba(255,140,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-10">
            <Link
              href="/dashboard-siswa"
              className="group flex items-center gap-3"
            >
              <Image
                src="/logobc.png"
                alt="Logo Bina Cendekia"
                width={40}
                height={40}
                className="transition group-hover:scale-105"
                priority
              />

              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-bold text-yellow-300">Bina</p>
                <p className="-mt-1 text-xs text-yellow-200">Cendekia</p>
              </div>
            </Link>

            <nav className="hidden items-center space-x-3 md:flex">
              {menus.map((menu) => {
                const isActive = menu.exact
                  ? pathname === menu.path
                  : pathname.startsWith(menu.path);

                return (
                  <Link
                    key={menu.path}
                    href={menu.path}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:scale-[1.05] hover:bg-white/10 hover:text-yellow-300 ${
                      isActive ? "bg-white/10 text-yellow-300" : "text-white/80"
                    }`}
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              className="relative text-white/80 transition hover:text-yellow-300"
              aria-label="Notifikasi siswa"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-300" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 text-white transition-all duration-200 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/15"
                >
                  <Avatar className="size-9 border border-white/25 bg-white/10">
                    {avatarSrc ? (
                      <AvatarImage
                        src={avatarSrc}
                        alt={`Foto profil ${displayName}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-white text-sm font-bold text-orange-700">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden min-w-0 text-left md:block">
                    <p className="truncate text-sm font-medium text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-[11px] text-white/70">
                      {displayRole}
                    </p>
                  </div>

                  <ChevronDown className="hidden size-4 text-white/70 transition-transform duration-200 md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Akun siswa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                  <UserRound className="size-4" />
                  Profil Siswa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void handleLogout();
                  }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isLoggingOut ? "Memproses logout..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              className="text-white md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu siswa"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-2 px-6 pb-4 md:hidden">
            {menus.map((menu) => {
              const isActive = menu.exact
                ? pathname === menu.path
                : pathname.startsWith(menu.path);

              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-white/10 text-yellow-300"
                      : "text-white/80 hover:bg-white/10 hover:text-yellow-300"
                  }`}
                >
                  {menu.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <SiswaUserProfileDialog
        key={currentUser?._id ?? "anonymous-siswa"}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={currentUser}
        isUserLoading={isUserLoading}
        profileLabel={displayRole}
        onProfileUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          setProfile((currentProfile) =>
            mergeProfileWithAuthUser(currentProfile, updatedUser),
          );
        }}
      />
    </>
  );
}
