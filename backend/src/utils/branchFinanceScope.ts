import type { UserDocument } from "../models/User";
import { Branch } from "../models/Branch";
import { AppError } from "./apiResponse";

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesBranchName(left: string, right: string) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

export type FinanceBranchScope = {
  role: "owner" | "admin";
  isScopedToManagedBranches: boolean;
  managedBranches: string[];
};

export async function resolveFinanceBranchScope(
  user: UserDocument | null | undefined,
  options: {
    requireManagedBranchesForAdmin?: boolean;
  } = {},
) {
  if (!user) {
    throw new AppError(401, "User belum terautentikasi.");
  }

  if (user.role === "owner") {
    return {
      role: "owner",
      isScopedToManagedBranches: false,
      managedBranches: [],
    } satisfies FinanceBranchScope;
  }

  if (user.role !== "admin") {
    throw new AppError(403, "Akses keuangan cabang hanya tersedia untuk admin dan owner.");
  }

  const branches = await Branch.find({
    $or: [
      { adminUserId: user._id },
      {
        adminName: new RegExp(`^${escapeRegex(normalizeText(user.nama))}$`, "i"),
      },
    ],
  })
    .select("name")
    .sort({ name: 1, createdAt: 1, _id: 1 })
    .exec();

  const managedBranches = Array.from(
    new Set(branches.map((branch) => normalizeText(branch.name)).filter(Boolean)),
  );

  if (options.requireManagedBranchesForAdmin && managedBranches.length === 0) {
    throw new AppError(
      403,
      "Akun admin ini belum terhubung ke cabang mana pun. Hubungkan dulu admin ke cabang sebelum mengelola keuangan.",
      null,
      "ADMIN_BRANCH_SCOPE_MISSING",
    );
  }

  return {
    role: "admin",
    isScopedToManagedBranches: true,
    managedBranches,
  } satisfies FinanceBranchScope;
}

export function resolveAccessibleBranchName(
  branchName: string | null | undefined,
  scope: FinanceBranchScope,
  options: {
    useFirstManagedBranchAsDefault?: boolean;
  } = {},
) {
  const normalizedBranchName = normalizeText(branchName);

  if (!scope.isScopedToManagedBranches) {
    return normalizedBranchName;
  }

  if (!scope.managedBranches.length) {
    if (options.useFirstManagedBranchAsDefault) {
      throw new AppError(
        403,
        "Akun admin ini belum terhubung ke cabang mana pun.",
        null,
        "ADMIN_BRANCH_SCOPE_MISSING",
      );
    }

    return "";
  }

  if (!normalizedBranchName) {
    return options.useFirstManagedBranchAsDefault ? scope.managedBranches[0] ?? "" : "";
  }

  const matchedBranch = scope.managedBranches.find((item) =>
    matchesBranchName(item, normalizedBranchName),
  );

  if (!matchedBranch) {
    throw new AppError(
      403,
      "Admin tidak memiliki akses ke cabang yang dipilih.",
      {
        branch: "Cabang yang dipilih berada di luar scope admin.",
      },
      "ADMIN_BRANCH_SCOPE_FORBIDDEN",
    );
  }

  return matchedBranch;
}

export function assertBranchAccess(
  branchName: string | null | undefined,
  scope: FinanceBranchScope,
) {
  if (!scope.isScopedToManagedBranches) {
    return;
  }

  const normalizedBranchName = normalizeText(branchName);

  if (
    normalizedBranchName &&
    scope.managedBranches.some((item) => matchesBranchName(item, normalizedBranchName))
  ) {
    return;
  }

  throw new AppError(
    403,
    "Admin tidak memiliki akses ke data keuangan cabang ini.",
    null,
    "ADMIN_BRANCH_SCOPE_FORBIDDEN",
  );
}

export function buildScopeBranchQuery(
  scope: FinanceBranchScope,
  branchName: string | null | undefined,
) {
  const accessibleBranchName = resolveAccessibleBranchName(branchName, scope);

  if (!scope.isScopedToManagedBranches) {
    return accessibleBranchName ? { branch: accessibleBranchName } : {};
  }

  if (!scope.managedBranches.length) {
    return {
      branch: {
        $in: [],
      },
    };
  }

  if (accessibleBranchName) {
    return {
      branch: accessibleBranchName,
    };
  }

  return {
    branch: {
      $in: scope.managedBranches,
    },
  };
}

export function toPublicFinanceScope(scope: FinanceBranchScope) {
  return {
    role: scope.role,
    isScopedToManagedBranches: scope.isScopedToManagedBranches,
    managedBranches: scope.managedBranches,
  };
}
