function normalizeIdentityText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function slugifyIdentityPart(value: string) {
  return normalizeIdentityText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildStableTeacherClassId(
  teacherPublicId: string,
  branch: string,
  className: string,
) {
  const teacherSlug = slugifyIdentityPart(teacherPublicId) || "guru";
  const branchSlug = slugifyIdentityPart(branch) || "cabang";
  const classSlug = slugifyIdentityPart(className) || "kelas";

  return `class-${teacherSlug}-${branchSlug}-${classSlug}`;
}

export function getTeacherBranchNames(teacher: {
  branch?: string | null;
  branches?: string[] | null;
}) {
  return Array.from(
    new Set(
      [teacher.branch, ...(teacher.branches ?? [])]
        .map((branch) => normalizeIdentityText(branch))
        .filter(Boolean),
    ),
  );
}
